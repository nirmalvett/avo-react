from datetime import datetime, timedelta

from flask import Blueprint, jsonify
from flask_login import current_user

from server import paypal
from server.auth import SectionRelations, get_url, send_email
from server.decorators import login_required, student_only, teacher_only, validate
from server.models import db, Discount, Payment, Section, User, UserSection, UserSectionType

UserSectionRoutes = Blueprint('UserSectionRoutes', __name__)


@UserSectionRoutes.route('/addToWhitelist', methods=['POST'])
@teacher_only
@validate(sectionID=int, uwoUsers=list)
def add_to_whitelist(section_id: int, uwo_users: list):
    """
    Adds a list of users to a section's whitelist for enrolment
    :return: Confirmation that the users were added to the whitelist
    """
    # todo: security
    section: Section = Section.query.get(section_id)
    if section.price > 0:
        enroll_type = UserSectionType.WHITELIST
    else:
        enroll_type = UserSectionType.ENROLLED
    for uwo_user in uwo_users:
        user_email = uwo_user + '@uwo.ca'
        user = User.query.filter((User.email == user_email)).first()
        if user is None:
            user = User(user_email, uwo_user, '', '')
            user.password = user.salt = ''
            user.confirmed = True
            db.session.add(user)
            # Create user
            url = get_url(user_email, 'UserRoutes.setup')
            send_email(
                user_email,
                'Confirm your AvocadoCore Account',
                f'<html><body>Hi {uwo_user},<br/><br/>'
                f'Your instructor ({current_user.email}) has signed you up to join a course. '
                f'Please click <a href="{url}">here</a> to set your password for the first time. If you have any '
                f'questions or suggestions, please send us an email at contact@avocadocore.com.'
                f'<br/><br/>Best wishes,<br/>The AvocadoCore Team</body></html>'
            )
        if not UserSection.query.filter((user.USER == UserSection.USER) & (UserSection.SECTION == section_id)).all():
            db.session.add(UserSection(user.USER, section_id, enroll_type))
    db.session.commit()
    return jsonify({})


@UserSectionRoutes.route('/getSectionWhitelist', methods=['POST'])
@teacher_only
@validate(sectionID=int)
def get_section_whitelist(section_id):
    whitelist = User.query.join(UserSection, User.USER == UserSection.USER).filter(
        (UserSection.SECTION == section_id)
    ).all()
    return jsonify(whitelist=list(map(lambda x: x.email, whitelist)))


@UserSectionRoutes.route('/enroll', methods=['POST'])
@login_required
@validate(key=str)
def enroll(key: str):
    """
    Enroll the current user in a section
    :return: Confirmation
    """
    discount = Discount.query.get(key)
    if discount is None:
        section = Section.query.filter(Section.enroll_key == key).first()
        if section is None:
            return jsonify(error='Invalid enroll key')
        price = section.price
    else:
        section = Section.query.get(discount.SECTION)
        price = discount.price

    relations = SectionRelations(section.SECTION)

    if relations.active:
        return jsonify(error='You already have access to this section')

    if not relations.all and section.enroll_key is None:
        return jsonify(error="You are not on the section's whitelist")

    if current_user.is_teacher or price == 0:
        db.session.add(UserSection(current_user.USER, section.SECTION, UserSectionType.ENROLLED))
        db.session.commit()
        return jsonify(message='enrolled')

    return jsonify(
        sectionID=section.SECTION,
        price=section.price,
        discount=price,
        tax=round(price * 0.13, 2),
        totalPrice=round(price * 1.13, 2),
        freeTrial=UserSectionType.TRIAL not in relations
    )


@UserSectionRoutes.route('/freeTrial', methods=['POST'])
@student_only
@validate(sectionID=int)
def start_free_trial(section_id: int):
    """
    Generate free trial for section
    :return:  Confirmation of free trial
    """
    section = Section.query.get(section_id)
    if section is None:
        return jsonify(error="No section found")
    if UserSectionType.TRIAL in SectionRelations(section_id).all:
        return jsonify(error="Trial already taken")
    expiry = datetime.now() + timedelta(weeks=2)
    db.session.add(UserSection(current_user.USER, section.SECTION, UserSectionType.TRIAL, None, expiry))
    db.session.commit()
    return jsonify({})


@UserSectionRoutes.route('/pay', methods=['POST'])
@student_only
@validate(sectionID=int)
def pay(section_id: int):
    """
    Creates PayPal payment in the database for enrolling user in section
    :return: Transaction ID to the client side PayPal
    """

    existing_tid: Payment = Payment.query.filter(
        (section_id == Payment.SECTION) & (current_user.USER == Payment.USER)
    ).first()
    if existing_tid is not None:  # If the user has already tried the payment find payment and return
        if paypal.check_if_created(existing_tid.PAYMENT):
            return jsonify({'tid': existing_tid.PAYMENT})
        else:
            db.session.delete(existing_tid)
            db.session.commit()

    section = Section.query.get(section_id)

    if section is None:
        return jsonify(error="No section found")

    if SectionRelations(section_id).active:
        return jsonify(error="User Still has active payment")

    payment, successful = paypal.create_payment(section.name, section.price)

    if successful:
        db.session.add(Payment(payment.id, current_user.USER, section_id))
        db.session.commit()
        return jsonify(tid=payment.id)
    else:
        return jsonify(error='Unable to create payment')


@UserSectionRoutes.route('/postPay', methods=['POST'])
@student_only
@validate(tid=str, payerID=str)
def confirm_payment(tid: str, payer_id: str):
    """
    If user pays then enroll them in section
    :return: confirmation of payment being processed
    """
    if UserSection.query.filter(UserSection.transaction_id == tid).all():
        return jsonify("User Already Enrolled")
    error = paypal.execute_payment(tid, payer_id)
    if error is not None:
        return jsonify(error=error)  # If payment can't be processed return error
    payment = Payment.query.get(tid)
    if payment is None:
        return jsonify(error="No Transaction id Found")
    db.session.add(UserSection(current_user.USER, payment.SECTION, UserSectionType.ENROLLED, tid, None))
    db.session.delete(payment)
    db.session.commit()
    return jsonify(code="Processed")


@UserSectionRoutes.route('/cancel', methods=['POST'])
@student_only
@validate(tid=str)
def cancel_order(tid: str):
    payment = Payment.query.get(tid)
    if payment is None:
        return jsonify(error="Transaction not found")
    db.session.delete(payment)
    db.session.commit()
    return jsonify(code="Cancelled")
