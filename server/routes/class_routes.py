from typing import List

from flask import Blueprint, jsonify, make_response
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.sql import text
from datetime import datetime, timedelta
from server.auth import teaches_class, enrolled_in_class
from server.decorators import login_required, teacher_only, student_only, admin_only, validate
from server.models import db, Class, Test, Takes, User, Transaction, TransactionProcessing, Message
import paypalrestsdk
import config

ClassRoutes = Blueprint('ClassRoutes', __name__)

# Load sql queries from file
with open('server/SQL/student_classes.sql', 'r') as sql:
    student_classes = sql.read()
with open('server/SQL/teacher_classes.sql', 'r') as sql:
    teacher_classes = sql.read()
with open('server/SQL/student_tests.sql', 'r') as sql:
    student_tests = sql.read()
with open('server/SQL/teacher_tests.sql', 'r') as sql:
    teacher_tests = sql.read()
with open('server/SQL/student_test_stats.sql', 'r') as sql:
    student_test_stats = sql.read()
with open('server/SQL/teacher_test_stats.sql', 'r') as sql:
    teacher_test_stats = sql.read()
with open('server/SQL/student_takes.sql', 'r') as sql:
    student_takes = sql.read()
with open('server/SQL/student_tests_medians.sql', 'r') as sql:
    student_tests_medians = sql.read()
with open('server/SQL/teacher_tests_medians.sql', 'r') as sql:
    teacher_tests_medians = sql.read()
with open('server/SQL/student_messages.sql', 'r') as sql:
    student_messages = sql.read()
with open('server/SQL/teacher_messages.sql', 'r') as sql:
    teacher_messages = sql.read()
with open('server/SQL/student_due_dates.sql', 'r') as sql:
    student_due_dates = sql.read()
with open('server/SQL/teacher_due_dates.sql', 'r') as sql:
    teacher_due_dates = sql.read()

# Routes for managing classes


@ClassRoutes.route('/createClass', methods=['POST'])
@teacher_only
@validate(name=str)
def create_class(name: str):
    """
    Creates a class with the current user as the teacher
    :return: Confirmation that the class was created
    """
    db.session.add(Class(current_user.USER, name))
    db.session.commit()
    return jsonify({})


@ClassRoutes.route('/home')
@login_required
def home():
    # get list of due dates objects

    due_dates = []  # Result of the due date SQL calls

    due_dates += db.session.execute(text(student_due_dates),
                                    params={'user': current_user.USER}).fetchall()

    if current_user.is_teacher:
        # If the user is a teacher run a teacher due dates SQL call
        due_dates += db.session.execute(text(teacher_due_dates),
                                        params={'user': current_user.USER}).fetchall()

    return_due_dates = []  # Return data for due dates
    current_list_due_dates = []  # Due dates of current indexed class
    current_class_data = {"name": due_dates[0].name, "id": due_dates[0].CLASS}
    current_class = due_dates[0].CLASS  # Current class of indexed due dates

    for due_date in due_dates:
        # For each due date index to list
        if current_class != due_date.CLASS:
            # If the its a new class then move the messages in
            return_due_dates.append({"class": current_class_data, "dueDates": current_list_due_dates})
            current_class_data = {"name": due_date.name, "id": due_date.CLASS}
            current_list_due_dates = []
            current_class = due_date.CLASS

        current_list_due_dates.append({'name': due_date.name, 'dueDate': due_date.deadline,
                                      'id': due_date.TEST})
    return_due_dates.append({"class": current_class_data, "messages": current_list_due_dates})

    messages = []  # Messages returned by the SQL query

    messages += db.session.execute(text(student_messages),
                                   params={'user': current_user.USER}).fetchall()

    if current_user.is_teacher:
        # If the current user is a teacher add the teacher result
        messages += db.session.execute(text(teacher_messages),
                                       params={'user': current_user.USER}).fetchall()
    # Get list of messages
    return_messages = []  # Messages to return to the client
    current_list_messages = []  # Current messages from the class
    current_class_data = {"name": messages[0].name, "id": messages[0].CLASS}
    current_class = messages[0].CLASS  # Current class info

    for message in messages:
        # For each message result add it to the JSON
        if current_class != message.CLASS:
            # If the its a new class then move the messages in
            return_messages.append({"class": current_class_data, "messages": current_list_messages})
            current_class_data = {"name": message.name, "id": message.CLASS}
            current_list_messages = []
            current_class = message.CLASS

        current_list_messages.append({'title': message.title, 'body': message.body,
                                      'date': message.date_created})
    return_messages.append({"class": current_class_data, "messages": current_list_messages})

    return jsonify(messages=return_messages, dueDates=return_due_dates)


@ClassRoutes.route('/getClasses')
@login_required
def get_classes():
    """
    Get the current users classes available to them
    :return: A list of class data
    """

    now = datetime.now()

    # Get data for courses that the user is enrolled in
    users_classes = db.session.execute(text(student_classes), params={'user': current_user.USER}).fetchall()
    users_tests = db.session.execute(text(student_tests), params={'user': current_user.USER}).fetchall()
    users_test_stats = db.session.execute(text(student_test_stats), params={'user': current_user.USER}).fetchall()
    users_takes = db.session.execute(text(student_takes), params={'user': current_user.USER}).fetchall()
    users_medians = db.session.execute(text(student_tests_medians), params={'user': current_user.USER}).fetchall()

    # Get data for courses that the user teaches
    if current_user.is_teacher:
        users_classes += db.session.execute(text(teacher_classes), params={'user': current_user.USER}).fetchall()
        users_tests += db.session.execute(text(teacher_tests), params={'user': current_user.USER}).fetchall()
        users_test_stats += db.session.execute(text(teacher_test_stats), params={'user': current_user.USER}).fetchall()
        users_medians += db.session.execute(text(teacher_tests_medians), params={'user': current_user.USER}).fetchall()

    classes = {}
    for c in users_classes:
        classes[c.CLASS] = {
            'classID': c.CLASS,
            'enrollKey': c.enroll_key,
            'name': c.name,
            'tests': {}
        }

    for t in users_tests:
        if t.open_time is not None:
            # If the test has an open time check if it should auto open
            if t.open_time is not None and not t.is_open and t.open_time <= now < t.deadline:
                # If the test is withing the open time and deadline open the test and disable the open time
                test_update = Test.query.get(t.TEST)
                test_update.open_time = None
                test_update.is_open = True
                db.session.commit()
        if t.is_open and t.deadline < now:
            # If the test does not have an open time check the deadline param
            test_update = Test.query.get(t.TEST)
            test_update.is_open = False
            db.session.commit()

        classes[t.CLASS]['tests'][t.TEST] = {
            'testID': t.TEST,
            'name': t.name,
            'open': bool(((t.open_time is not None and t.open_time >= now) or t.is_open) and t.deadline > now),
            'openTime': t.open_time.timestamp(),
            'deadline': t.deadline.timestamp()*1000,
            'timer': t.timer,
            'attempts': t.attempts,
            'total': t.total,
            'submitted': [],
            'current': None,
            'classAverage': 0,
            'classMedian': 0,
            'classSize': 0,
            'standardDeviation': 0,
        }

    for t in users_takes:
        if t.CLASS in classes and t.TEST in classes[t.CLASS]['tests']:
            test = classes[t.CLASS]['tests'][t.TEST]
            if t.time_submitted < now:
                test['submitted'].append({
                    'takesID': t.TAKES,
                    'timeSubmitted': t.time_submitted.timestamp()*1000,
                    'grade': t.grade
                })
                if test['attempts'] >= len(test['submitted']):
                    test['open'] = False
            else:
                test['current'] = {
                    'timeStarted': t.time_started.timestamp()*1000,
                    'timeSubmitted': t.time_submitted.timestamp()*1000
                }

    for s in users_test_stats:
        if s.CLASS in classes and s.TEST in classes[s.CLASS]['tests']:
            test = classes[s.CLASS]['tests'][s.TEST]
            test['classAverage'] = float(s.average)
            test['classSize'] = int(s.student_count)
            test['standardDeviation'] = float(s.stdev)

    for m in users_medians:
        if m.CLASS in classes and m.TEST in classes[m.CLASS]['tests']:
            classes[m.CLASS]['tests'][m.TEST]['classMedian'] = float(m.median)

    for c in classes:
        classes[c]['tests'] = list(classes[c]['tests'].values())

    classes = list(classes.values())
    return jsonify(classes=classes)


@ClassRoutes.route('/getClassTestResults', methods=['POST'])
@teacher_only
@validate(test=int)
def get_class_test_results(test: int):
    """
    Get test results for a test for teacher
    :return: test results data
    """
    current_test = Test.query.get(test)
    if not teaches_class(current_test.CLASS):
        return jsonify(error="User doesn't teach class")
    # All users in class
    users = User.query.filter((User.USER == Transaction.USER) & (current_test.CLASS == Transaction.CLASS)).all()
    results = []
    for user in users:
        # For each user get user data and best takes instance and present append to list then return
        takes = Takes.query.filter((Takes.USER == user.USER) & (Takes.TEST == test)).order_by(Takes.grade).all()
        results.append({
            'userID': user.USER,
            'firstName': user.first_name,
            'lastName': user.last_name,
            'tests': [] if len(takes) == 0 else [{
                'takesID': takes[-1].TAKES,
                'timeSubmitted': takes[-1].time_submitted.timestamp()*1000,
                'grade': takes[-1].grade
            }]
        })
    return jsonify(results=results)


@ClassRoutes.route('/CSV/ClassMarks/<class_id>')
@teacher_only
def csv_class_marks(class_id):
    """
    Generate a CSV file of the class marks
    :param class_id: The ID of the class to generate marks
    :return: A CSV file of the class marks
    """

    if not teaches_class(class_id):
        # If the teacher is not in the class return a 400 error page
        return "User does not teach the class", 400
    # Query the database for data on the test class and students data
    output_class = Class.query.get(class_id)
    student_array = User.query.filter((Transaction.CLASS == class_id) & (Transaction.USER == User.USER)).all()
    test_array = Test.query.filter(Test.CLASS == class_id).all()
    test_name_list = []  # An array of the test names
    output_string = '\"Email\" '  # The output for the file

    for i in range(len(test_array)):
        # For each test add the names to the array and update the file string
        test_name_list.append(test_array[i].name)
        output_string = output_string + ', \"' + str(test_array[i].name) + '\" '
    for i in range(len(student_array)):
        # For each student get there best mark on each test and add it to the array
        current_string = '\n' + '\"' + str(student_array[i].email) + '\"'  # A string for each line of the file

        for j in range(len(test_array)):
            # For each test get the best mark and add it to the array
            mark = Takes.query.filter((Takes.TEST == test_array[j].TEST) & (student_array[i].USER == Takes.USER)).all()
            # Get the best mark if they haven't taken the test add a value as such
            top_mark = 0  # The top mark got on the test
            if len(mark) != 0:
                for k in range(len(mark)):
                    # For each mark compare the grade and if its greater add it to the string
                    if mark[k].grade >= top_mark:
                        top_mark = mark[k].grade
                current_string = current_string + ', ' + str(top_mark) + ' / ' + str(
                    test_array[j].total)
            else:
                current_string = current_string + ', ' + 'Test Not Taken'
        output_string = output_string + current_string

    response = make_response(output_string)
    response.headers["Content-Disposition"] = "attachment; filename=" + output_class.name + ".csv"
    return response  # Return the file to the user


# Routes for joining/leaving classes


@ClassRoutes.route('/enroll', methods=['POST'])
@login_required
@validate(key=str)
def enroll(key: str):
    """
    Enroll the current user in a class
    :return: Confirmation
    """
    try:
        # Find class with said enroll key if no class found return error json
        current_class = Class.query.filter(Class.enroll_key == key).first()
    except NoResultFound:
        return jsonify(error='Invalid enroll key')
    if current_class is None:
        # If no class is found return error JSON
        return jsonify(error='Invalid enroll key')
    if current_user.is_teacher:
        # If the user is a teacher enroll them into the class
        if not teaches_class(current_class.CLASS):
            # If the teacher does not teach the class return JSON of success
            db.session.add(Transaction(
                f"TEACHER-{current_user.USER}-{current_class.CLASS}", current_user.USER, current_class.CLASS, None
            ))
            db.session.commit()
        return jsonify(message='Enrolled')
    if current_class.price_discount == 0:
        # Append current user to the class
        db.session.add(Transaction(
            f"FREECLASS-{current_user.USER}-{current_class.CLASS}", current_user.USER, current_class.CLASS, None
        ))
        db.session.commit()
        return jsonify(message='Enrolled')  # this message cannot be changed as the frontend relies on it
    else:
        # Checks if the user has a free trial left
        transactions = Transaction.query.filter((Transaction.USER == current_user.USER) &
                                                (Transaction.CLASS == current_class.CLASS)).all()
        free_trial = not any(map(lambda t: t.TRANSACTION.startswith("FREETRIAL-"), transactions))
        return jsonify(
            classID=current_class.CLASS,
            price=current_class.price,
            discount=current_class.price_discount,
            tax=round(current_class.price_discount * 0.13, 2),
            totalPrice=round(current_class.price_discount * 1.13, 2),
            freeTrial=free_trial
        )


@ClassRoutes.route('/freeTrial', methods=['POST'])
@student_only
@validate(classID=int)
def start_free_trial(class_id: int):
    """
    Generate free trial for class
    :return:  Confirmation of free trial
    """
    try:
        # See if current class exists
        current_class = Class.query.get(class_id)
    except Exception:
        return jsonify(error="No class found")
    if current_class is None:
        return jsonify(error="No class found")
    transaction = Transaction.query.filter((current_user.USER == Transaction.USER) &
                                           (current_class.CLASS == Transaction.CLASS)).all()  # Get transaction
    if len(transaction) > 0:
        # If transaction not found return error JSON
        return jsonify(error="Free Trial Already Taken")
    free_trial_string = "FREETRIAL-" + str(current_class.CLASS) \
                        + "-" + str(current_user.USER)  # Generate free trial string
    time = datetime.now() + timedelta(weeks=2)
    new_transaction = Transaction(free_trial_string, current_user.USER,
                                  current_class.CLASS, time)  # create new transaction in database
    # Commit to database and enroll student
    db.session.add(new_transaction)
    db.session.commit()
    return jsonify({})


@ClassRoutes.route('/pay', methods=['POST'])
@student_only
@validate(classID=int)
def create_payment(class_id: int):
    """
    Creates PayPal payment in the database for enrolling user in class
    :return: Transaction ID to the client side PayPal
    """

    existing_tid = TransactionProcessing.query.filter((class_id == TransactionProcessing.CLASS) &
                                                      (current_user.USER == TransactionProcessing.USER)).first()
    if existing_tid is not None:
        # If the user has already tried the payment find payment and return
        try:
            # Try to find payment from PayPal
            payment = paypalrestsdk.Payment.find(existing_tid.TRANSACTIONPROCESSING)
            if payment.state == 'created':
                # iF payment is found return Transaction ID
                return jsonify({'tid': existing_tid.TRANSACTIONPROCESSING})
            else:
                # Else remove payment from database
                db.session.delete(existing_tid)
                db.session.commit()
        except paypalrestsdk.ResourceNotFound:
            # If error is found remove from database
            db.session.delete(existing_tid)
            db.session.commit()

    current_class = Class.query.filter(class_id == Class.CLASS).all()  # Get class

    if len(current_class) == 0:
        # If class is not found return error JSON
        return jsonify(error="No class found")

    if enrolled_in_class(current_class[0].CLASS):
        # If user is already enrolled check if those enrolled are still not expired
        # List of all transactions of that class and user
        transaction_list = Transaction.query.filter((Transaction.USER == current_user.USER) &
                                                    (Transaction.CLASS == current_class[0].CLASS)).all()
        time = datetime.now()  # Current time
        for i in range(len(transaction_list)):
            # Check if all transactions have expired
            if transaction_list[i].expiration is None:
                # There is no expiration
                return jsonify(error="User Still has active payment")
            if transaction_list[i].expiration > time:
                # The timer is still valid
                return jsonify(error="User Still has active payment")

    # Create Payment with PayPal
    payment = paypalrestsdk.Payment(
        {
            'intent': 'sale',
            'payer': {
                'payment_method': 'paypal'
            },
            'redirect_urls': {
                # todo have to enable auto return in the paypal account
                'return_url': f'http://' + config.HOSTNAME + '/',
                # todo when cancelled remove tid from mapping table
                'cancel_url': f'http://' + config.HOSTNAME + '/'
            },
            'transactions': [
                {
                    'amount': {
                        'total': "{:4.2f}".format(round(current_class[0].price_discount * 1.13, 2)),
                        'currency': 'CAD'
                    },
                    'description': "32 Week Subscription to " + str(current_class[0].name) + " Through AVO",
                    'item_list': {
                        'items': [
                            {
                                'name': 'Avo ' + current_class[0].name,
                                'price': "{:4.2f}".format(round(current_class[0].price_discount * 1.13, 2)),
                                'currency': 'CAD',
                                'quantity': 1
                            }
                        ]
                    }
                }
            ]
        }
    )

    if payment.create():
        # If Payment created create new transaction in database and return Transaction ID
        new_transaction = TransactionProcessing(payment.id, current_class[0].CLASS, current_user.USER)
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify(tid=payment.id)
    else:
        # If PayPal encounters error return error JSON
        return jsonify(error='Unable to create payment')


@ClassRoutes.route('/postPay', methods=['POST'])
@student_only
@validate(tid=str, payerID=str)
def confirm_payment(tid: str, payer_id: str):
    """
    If user pays then enroll them in class
    :return: confirmation of payment being processed
    """
    transaction = Transaction.query.get(tid)  # Attempt to get transaction from the Transaction ID
    if transaction is not None:
        # If transaction not found return error JSON
        return jsonify("User Already Enrolled")
    payment = paypalrestsdk.Payment.find(tid)  # Find payment from PayPal
    if not payment.execute({'payer_id': payer_id}):
        # If payment cant be processed return error JSON
        return jsonify(error=payment.error)
    transaction_processing = TransactionProcessing.query.get(tid)  # find transaction in transaction processing table
    if transaction_processing is None:
        # If not found return error JSON
        return jsonify(error="No Trans Id Found")
    time = datetime.now() + timedelta(weeks=32)  # Create expiration of enrolling
    transaction = Transaction(tid, current_user.USER,
                              transaction_processing.CLASS, time)  # Create new transaction in table
    # commit changes to database
    db.session.add(transaction)
    db.session.delete(transaction_processing)
    db.session.commit()
    return jsonify(code="Processed")


@ClassRoutes.route('/cancel', methods=['POST'])
@student_only
@validate(tid=str)
def cancel_order(tid: str):
    """
    Cancel Payment by removing from Transaction Processing Table
    :return: Confirmation
    """
    transaction_processing = TransactionProcessing.query.get(tid)
    if transaction_processing is None:
        # If transaction is not in database return error json
        return jsonify(error="Transaction not found")

    # Remove data from database
    db.session.delete(transaction_processing)
    db.session.commit()
    return jsonify(code="Cancelled")


@ClassRoutes.route('/unenroll', methods=['POST'])
@admin_only
@validate(userID=int, classID=int)
def unenroll(user_id: int, class_id: int):
    """
    Unenroll student from class
    :return: Confirmation of the unenroll
    """
    user = User.query.get(user_id)
    current_class = Class.query.filter((Class.CLASS == Transaction.CLASS) &
                                       (user_id == Transaction.USER)).all()
    if user is None or len(current_class) == 0:
        # If there is no user found return error JSON
        return jsonify("No User Found")
    for i in range(len(current_class)):
        # For each class check if it is the correct class
        if current_class[i].CLASS == class_id:
            user.CLASS_ENROLLED_RELATION.remove(current_class[i])
            db.session.commit()
            return jsonify(code="User was removed")
    return jsonify(error="user is not enrolled in class")


@ClassRoutes.route('/getMessages', methods=['POST'])
@teacher_only
@validate(classID=int)
def get_messages(class_id: int):
    """
    Get list of all messages for a given class
    :return: List of messages given the class ID
    """
    if not teaches_class(class_id):
        # If the teacher does not teach the class return error JSON
        return jsonify(error="user does not teach class")

    messages: List[Message] = Message.query.filter(Message.CLASS == class_id).all()  # All messages of the class
    return jsonify(messages=list(map(lambda m: {
        'messageID': m.MESSAGE,
        'classID': m.CLASS,
        'title': m.title,
        'body': m.body,
        'dateCreated': m.date_created.timestamp()*1000
    }, messages)))


@ClassRoutes.route('/addMessage', methods=['POST'])
@teacher_only
@validate(classID=int, title=str, body=str)
def add_message(class_id: int, title: str, body: str):
    """
    Add message to the class
    :return: Confirmation that message has been created
    """

    if not teaches_class(class_id):
        # if class does not exist or class is not taught return error JSON
        return jsonify(error="User does not teach class")
    new_message = Message(class_id, title, body, datetime.now())  # New message to add to database
    # Commit to database
    db.session.add(new_message)
    db.session.commit()
    return jsonify({})


@ClassRoutes.route("/deleteMessage", methods=["POST"])
@teacher_only
@validate(messageID=int)
def delete_message(message_id: int):
    current_message = Message.query.get(message_id)  # Message to remove
    if message_id is None:
        # If no message is found return error JSON
        return jsonify(error="Message not found")
    if not teaches_class(current_message.CLASS):
        # If user does not teach class return error JSON
        return jsonify(error="User does not teach class")
    # Remove message from database
    db.session.delete(current_message)
    db.session.commit()
    return jsonify({})


@ClassRoutes.route("/editMessage", methods=['POST'])
@teacher_only
@validate(messageID=int, title=str, body=str)
def edit_message(message_id: int, title: str, body: str):
    """
    Edit an already existing message
    :return: Confirmation that the message has been changed
    """

    message = Message.query.get(message_id)  # Message to updated

    if message is None:
        # No message was found return error JSON
        return jsonify(error="No Message was found")

    # Update the message and update on database
    message.title = title
    message.body = body
    db.session.commit()

    return jsonify({})
