from flask import Blueprint, jsonify, request, make_response, abort
from flask_login import current_user
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.sql import text
from datetime import datetime, timedelta
from server.auth import teaches_class, enrolled_in_class
from server.decorators import login_required, teacher_only, student_only, admin_only
from server.models import db, Class, Test, Takes, User, Transaction, TransactionProcessing
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
def create_class():
    """
    Creates a class with the current user as the teacher
    :return: Confirmation that the class was created
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    name = request.json['name']  # Name of the new class
    if not isinstance(name, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    new_class = Class(current_user.USER, name)  # Class to be created
    # Add to database and commit
    db.session.add(new_class)
    db.session.commit()
    return jsonify(message='Created!')


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
            'id': c.CLASS,
            'enrollKey': c.enroll_key,
            'name': c.name,
            'tests': {}
        }

    for t in users_tests:
        if t.is_open and t.deadline < now:
            test_update = Test.query.get(t.TEST)
            test_update.is_open = False
            db.session.commit()

        classes[t.CLASS]['tests'][t.TEST] = {
            'id': t.TEST,
            'name': t.name,
            'open': t.is_open and t.deadline > now,
            'deadline': time_stamp(t.deadline),
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
                    'takes': t.TAKES,
                    'timeSubmitted': time_stamp(t.time_submitted),
                    'grade': t.grade
                })
                if test['attempts'] == len(test['submitted']):
                    test['open'] = 0
            else:
                test['current'] = {
                    'timeStarted': time_stamp(t.time_started),
                    'timeSubmitted': time_stamp(t.time_submitted)
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
def get_class_test_results():
    """
    Get test results for a test for teacher
    :return: test results data
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    data = request.json
    test = data['test']  # Data from client
    if not isinstance(test, int):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
    current_test = Test.query.get(test)
    if not teaches_class(current_test.CLASS):
        return jsonify(error="User doesn't teach class")
    # All users in class
    users = User.query.filter((User.USER == Transaction.USER) & (current_test.CLASS == Transaction.CLASS)).all()
    for i in range(len(users)):
        # For each user get user data and best takes instance and present append to list then return
        first_name, last_name = users[i].first_name, users[i].last_name
        takes = Takes.query.filter((Takes.USER == users[i].USER) & (Takes.TEST == test)).order_by(Takes.grade).all()
        if len(takes) == 0:
            # If the student hasn't taken the test then return default values else return the marks
            users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                        'tests': []}
        else:
            users[i] = {'user': users[i].USER, 'firstName': first_name, 'lastName': last_name,
                        'tests': [{'takes': takes[len(takes) - 1].TAKES,
                                   'timeSubmitted': time_stamp(takes[-1].time_submitted),
                                   'grade': takes[len(takes) - 1].grade}]}
    return jsonify(results=users)


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
        return abort(400)
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
def enroll():
    """
    Enroll the current user in a class
    :return: Confirmation
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)
    key = request.json['key']  # Data sent from user

    if not isinstance(key, str):
        # Checks if all data given is of correct type if not return error JSON
        return jsonify(error="One or more data is not correct")
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
            id=current_class.CLASS,
            price=current_class.price,
            discount=current_class.price_discount,
            tax=round(current_class.price_discount * 0.13, 2),
            totalprice=round(current_class.price_discount * 1.13, 2),
            freeTrial=free_trial
        )


@ClassRoutes.route('/freeTrial', methods=['POST'])
@student_only
def start_free_trial():
    """
    Generate free trial for class
    :return:  Confirmation of free trial
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from client
    data = request.json
    class_id = data['classID']
    if not isinstance(class_id, int):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")
    try:
        # See if current class exists
        current_class = Class.query.get(class_id)
    except:
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
    return jsonify(code="Success")


@ClassRoutes.route('/pay', methods=['POST'])
@student_only
def create_payment():
    """
    Creates PayPal payment in the database for enrolling user in class
    :return: Transaction ID to the client side PayPal
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from the client
    data = request.json
    class_id = data['classID']
    if not isinstance(class_id, int):
        # If data is not correct formatting return error JSON
        return jsonify(error="One or more data is not correct")

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
        return jsonify({'tid': payment.id})
    else:
        # If PayPal encounters error return error JSON
        return jsonify(error='Unable to create payment')


@ClassRoutes.route('/postPay', methods=['POST'])
@student_only
def confirm_payment():
    """
    If user pays then enroll them in class
    :return: confirmation of payment being processed
    """
    if not request.json:
        # If the request isn't JSON then return a 400 error
        return abort(400)

    # Data from client
    data = request.json
    tid, payer = data['tid'], data['payerID']
    if not isinstance(tid, str) or not isinstance(payer, str):
        # If data isn't correct return error JSON
        return jsonify(error="One or more data is not correct")

    transaction = Transaction.query.get(tid)  # Attempt to get transaction from the Transaction ID
    if transaction is not None:
        # If transaction not found return error JSON
        return jsonify("User Already Enrolled")
    payment = paypalrestsdk.Payment.find(tid)  # Find payment from PayPal
    if not payment.execute({'payer_id': payer}):
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
def cancel_order():
    """
    Cancel Payment by removing from Transaction Processing Table
    :return: Confirmation
    """
    if not request.json:
        # If the request is not JSON return a 400 error
        return abort(400)

    tid = request.json['tid']  # Data from client
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
def unenroll():
    """
    Unenroll student from class
    :return: Confirmation of the unenroll
    """
    if not request.json:
        return abort(400)
    data = request.json
    user_id, class_id = data['userID'], data['classID']

    if not isinstance(user_id, int) or not isinstance(class_id, int):
        return jsonify(error="One or more data type is invalid")

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


# Helper methods


def time_stamp(t):
    """
    Casts DateTime object to int
    :param t: DateTime
    :return: int representation of DateTime
    """
    return int(f'{t.year:04d}{t.month:02d}{t.day:02d}{t.hour:02d}{t.minute:02d}{t.second:02d}')
