from flask import Blueprint, abort, redirect, jsonify, request
from flask_login import current_user
from werkzeug.utils import secure_filename
import boto3
from server import db
from server.auth import able_view_course
from server.decorators import teacher_only, login_required, validate
from server.models import Assignment, Image, Lesson
from config import S3_BUCKET, S3_LOCATION

FileUploadRoutes = Blueprint('ImageRoutes', __name__)


@FileUploadRoutes.route('/image/<filename>')
@login_required
def image(filename):
    i: Image = Image.query.filter(Image.name == filename).first()
    if i is None:
        return abort(404)
    else:
        return redirect(i.url, code=302)


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
        # need to run `aws configure` to link account so this works
        client = boto3.client('s3', region_name='ca-central-1')

        client.upload_fileobj(
            file,
            S3_BUCKET,
            filename,
            ExtraArgs={
                "ACL": 'public-read',
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        print(e)
        return 'Error: could not upload'
    url = "{}{}".format(S3_LOCATION, filename)
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


@FileUploadRoutes.route('upload/assignment', methods=['POST'])
@login_required
@validate(lessonID=int)
def assignment_upload(lesson_ID: int):
    lesson = Lesson.query.get(lesson_ID)
    if lesson is  None:
        return jsonify(error='Lesson not found')
    if not able_view_course(lesson.COURSE):
        return jsonify(error='User not able to view course')
    file = request.files.get('file')
    if file is None:
        return 'Error: please send a file'
    filename = f'{lesson.LESSON}__{current_user.USER}__{secure_filename(file.filename)}'

    try:
        # need to run `aws configure` to link account so this works
        client = boto3.client('s3', region_name='ca-central-1')

        client.upload_fileobj(
            file,
            S3_BUCKET,
            filename,
            ExtraArgs={
                "ACL": 'public-read',
                "ContentType": file.content_type
            }
        )

    except Exception as e:
        print(e)
        return 'Error: could not upload'
    url = "{}{}".format(S3_LOCATION, filename)
    assignment = Assignment.query.filter((Assignment.name == secure_filename(file.filename)) &
                                         (Assignment.USER == current_user.USER)).first()
    if assignment is None:
        assignment = Assignment(lesson=lesson_ID, name=secure_filename(filename), user=current_user.USER, url=url)
        db.session.add(assignment)
    else:
        assignment.url = url
    db.session.commit()
    return url

