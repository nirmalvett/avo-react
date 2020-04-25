from flask import Blueprint, jsonify, request, send_file
from flask_login import current_user
from werkzeug.utils import secure_filename
from server import db
from server.auth import able_view_course, able_edit_course
from server.decorators import teacher_only, login_required
from server.models import Assignment, File, Lesson, FileType
from config import BUCKET_NAME
from google.cloud import storage
import tempfile

FileUploadRoutes = Blueprint('ImageRoutes', __name__)
PREFIX = f'gs://{BUCKET_NAME}/'


@FileUploadRoutes.route('/assignment/<filename>')
@login_required
def assignment(filename):
    a = Assignment.query \
        .join(File, File.FILE == Assignment.FILE) \
        .join(Lesson, Lesson.LESSON == Assignment.LESSON) \
        .filter(File.file_name == filename)\
        .first()
    if not able_edit_course(a.LESSON_RELATION.COURSE):
        return jsonify(error='User does not own course')
    storage_client = storage.Client()
    bucket = storage_client.bucket(a.FILE_RELATION.bucket)
    blob = bucket.blob(a.FILE_RELATION.file_name)
    if blob.exists(storage_client):
        fp = tempfile.TemporaryFile()
        blob.download_to_file(fp)
        fp.seek(0)
        return send_file(fp, mimetype='application/octet-stream')
    return jsonify(error='assignment not found')


@FileUploadRoutes.route('/image/<filename>')
@login_required
def image(filename):
    image = File.query \
        .join(FileType, FileType.FILE_TYPE == File.FILE_TYPE) \
        .filter((FileType.name == 'image') & (File.file_name == filename)) \
        .first()
    if image is None:
        return jsonify(error=f'Could not find image {filename}')
    storage_client = storage.Client()
    bucket = storage_client.bucket(image.bucket)
    blob = bucket.blob(image.file_name)  # TODO: Figure out how we want to deal with security for images
    if blob.exists(storage_client):
        fp = tempfile.TemporaryFile()
        blob.download_to_file(fp)
        fp.seek(0)
        return send_file(fp, mimetype='application/octet-stream')
    return jsonify({'error': 'image not found'})


@FileUploadRoutes.route('/getImages')
@teacher_only
def get_images():
    images = File.query \
        .join(FileType, FileType.FILE_TYPE == File.FILE_TYPE) \
        .filter((FileType.name == 'image') & (File.USER == current_user.USER)) \
        .all()
    return jsonify({'images': {i.FILE: i.file_name for i in images}})


@FileUploadRoutes.route('/upload/image', methods=['POST'])
@teacher_only
def image_upload():
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = f'images__{current_user.USER}__{secure_filename(file.filename)}'
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_file(file)
    except Exception as e:
        return jsonify(error=f'Error could not save file: {e}')

    file = File.query.filter(
        (File.file_name == filename) &
        (File.USER == current_user.USER)
    ).first()
    if file is None:
        file_type = FileType.query.filter(FileType.name == 'image').first()
        file = File(
            file_name=filename,
            user_id=current_user.USER,
            file_type=file_type.FILE_TYPE,
            bucket=BUCKET_NAME,
        )
        db.session.add(file)
        db.session.commit()
    return jsonify(file_name=filename)


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
    filename = f'assignments__{lesson.LESSON}__{current_user.USER}__{secure_filename(file.filename)}'

    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(BUCKET_NAME)
        blob = bucket.blob(filename)
        blob.upload_from_file(file)
    except Exception as e:
        return jsonify(error=f'Error could not save file: {e}')
    assignment = Assignment.query \
        .join(File, File.FILE == Assignment.FILE) \
        .filter((File.file_name == filename) & (Assignment.USER == current_user.USER))\
        .first()
    if assignment is None:
        file_type = FileType.query.filter(FileType.name == 'assignment').first()
        file = File(
            file_name=filename,
            user_id=current_user.USER,
            file_type=file_type.FILE_TYPE,
            bucket=BUCKET_NAME,
        )
        db.session.add(file)
        db.session.flush()
        assignment = Assignment(lesson=lesson_id, file=file.FILE, user=current_user.USER)
        db.session.add(assignment)
        db.session.commit()
    return jsonify(file_name=filename)
