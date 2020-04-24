from flask import Blueprint, jsonify, request, send_file
from flask_login import current_user
from werkzeug.utils import secure_filename
from server import db
from server.auth import able_view_course
from server.decorators import teacher_only, login_required
from server.models import Assignment, Image, Lesson
from config import BUCKET_NAME
from google.cloud import storage
import tempfile

FileUploadRoutes = Blueprint('ImageRoutes', __name__)
PREFIX = f'gs://{BUCKET_NAME}/'


@FileUploadRoutes.route('/assignment/<filename>')
@login_required
def assignment(filename):
    a = Assignment.query\
        .join(Lesson, Lesson.LESSON == Assignment.LESSON)\
        .filter(Assignment.name == filename).first()
    # check if the user is the student who submitted the assignment or the teacher who made the assignment
    if current_user.USER != a.USER or current_user.USER != a.LESSON_RELATION.USER:
        return jsonify(error='User does not own assignment')
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(a.name)
    if blob.exists(storage_client):
        fp = tempfile.TemporaryFile()
        blob.download_to_file(fp)
        fp.seek(0)
        return send_file(fp, mimetype='application/octet-stream')
    return jsonify(error='assignment not found')


@FileUploadRoutes.route('/image/<filename>')
@login_required
def image(filename):
    i: Image = Image.query.filter(Image.name == filename).first()
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(i.name)  # TODO: Figure out how we want to deal with security for images
    if blob.exists(storage_client):
        fp = tempfile.TemporaryFile()
        blob.download_to_file(fp)
        fp.seek(0)
        return send_file(fp, mimetype='application/octet-stream')
    return jsonify({'error': 'image not found'})


@FileUploadRoutes.route('/getImages')
@teacher_only
def get_images():
    images = Image.query.filter(
        (Image.USER == current_user.USER)
    ).all()
    return jsonify({'images': {i.IMAGE: i.name for i in images}})


@FileUploadRoutes.route('/upload/image', methods=['POST'])
@teacher_only
def image_upload():
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = f'{current_user.USER}__{secure_filename(file.filename)}'
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_file(file)
    except Exception as e:
        return jsonify(error=f'Error could not save file: {e}')

    url = f'{PREFIX}{filename}'
    i: Image = Image.query.filter(
        (Image.name == secure_filename(file.filename)) &
        (Image.USER == current_user.USER)
    ).first()
    if i is None:
        img = Image(name=secure_filename(filename), url=url, user_id=current_user.USER)
        db.session.add(img)
    else:
        i.url = url
    db.session.commit()
    return url


@FileUploadRoutes.route('/upload/assignment/<lesson_id>', methods=['POST'])
@login_required
def assignment_upload(lesson_id: int):
    lesson = Lesson.query.get(lesson_id)
    if lesson is None:
        return jsonify(error='Lesson not found')
    if not able_view_course(lesson.COURSE):
        return jsonify(error='User not able to view course')
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = f'{lesson.LESSON}__{current_user.USER}__{secure_filename(file.filename)}'

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_file(file)
    except Exception as e:
        return jsonify(error=f'Error could not save file: {e}')
    url = f'{PREFIX}{filename}'
    assignment = Assignment.query.filter((Assignment.name == secure_filename(file.filename)) &
                                         (Assignment.USER == current_user.USER)).first()
    if assignment is None:
        assignment = Assignment(lesson=lesson_id, name=secure_filename(filename), user=current_user.USER, url=url)
        db.session.add(assignment)
    else:
        assignment.url = url
    db.session.commit()
    return url
