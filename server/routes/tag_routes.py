from typing import List
from flask import Blueprint, jsonify
from flask_login import current_user
from server.MathCode.question import AvoQuestion
from random import randint
from server.decorators import login_required, teacher_only, validate
from server.models import db, Question, Tag, TagUser, Lesson, TagQuestion, TagClass, Class, Transaction
from server.helpers import get_tree
from datetime import datetime
from math import log
import json

TagRoutes = Blueprint('TagRoutes', __name__)


@TagRoutes.route('/getLessonsToEdit', methods=['POST'])
@teacher_only
@validate(class_id=int)
def get_lessons_to_edit(class_id: int):
    lessons = Lesson.query.join(Class).filter(Lesson.CLASS == class_id).all()
    lessons = list(filter(lambda lesson: lesson.CLASS_RELATION.USER == current_user.USER, lessons))
    tag_questions = TagQuestion.query.join(Question).join(Tag).all()
    lessons_ret = []
    for lesson in lessons:
        questions = list(filter(lambda tag: tag.TAG == lesson.TAG, tag_questions))
        questions = list(map(lambda  question: {'QUESTION': question.QUESTION, 'name': question.QUESTION_RELATION.name}, questions))
        lessons_ret.append({
            'lesson': {
                'LESSON': lesson.LESSON,
                'CLASS': lesson.CLASS,
                'TAG': lesson.TAG,
                'lessonString': lesson.lesson_string,
                'questionList': lesson.question_list,
            },
            'questions': questions,
        })
    return jsonify(lessons=lessons_ret)


@TagRoutes.route('/addLesson', methods=['POST'])
@teacher_only
@validate(class_id=int, tag_id=int, question_list=str, lesson_string=str)
def add_lesson(class_id: int, tag_id: int, question_list: str, lesson_string: str):
    lesson = Lesson(class_id, tag_id, lesson_string, question_list)
    db.session.add(lesson)
    db.session.flush()
    db.session.commit()
    question_list = json.loads(question_list)
    question_list = list(map(lambda question: {'QUESTION': question}, question_list))
    return jsonify({
        'lesson': {
            'LESSON': lesson.LESSON,
            'CLASS': class_id,
            'TAG': tag_id,
            'lessonString': lesson_string,
            'questionList': question_list,
        }
    })


@TagRoutes.route('/editLesson', methods=['POST'])
@teacher_only
@validate(lesson_id=int, tag_id=int, question_list=str, lesson_string=str)
def edit_lesson(lesson_id:int, class_id: int, tag_id: int, question_list: str, lesson_string: str):
    lesson = Lesson.query.filter(Lesson.LESSON == lesson_id).first()
    lesson.TAG = tag_id
    lesson.question_list = question_list
    lesson.lesson_string = lesson_string
    db.session.add(lesson)
    db.session.commit()
    question_list = json.loads(question_list)
    question_list = list(map(lambda question: {'QUESTION': question}, question_list))
    return jsonify({
        'lesson': {
            'LESSON': lesson.LESSON,
            'CLASS': class_id,
            'TAG': tag_id,
            'lessonString': lesson_string,
            'questionList': question_list,
        }
    })


@TagRoutes.route('/deleteLesson', methods=['POST'])
@teacher_only
@validate(lesson_id=int)
def delete_lesson(lesson_id:int):
    lesson = Lesson.query.filter(Lesson.LESSON == lesson_id).first()
    class_id = lesson.CLASS
    tag_id = lesson.TAG
    lesson_string = lesson.lesson_string
    question_list = lesson.question_list
    db.session.delete(lesson)
    db.session.commit()
    question_list = json.loads(question_list)
    question_list = list(map(lambda question: {'QUESTION': question}, question_list))
    return jsonify({
        'lesson': {
            'LESSON': lesson.LESSON,
            'CLASS': class_id,
            'TAG': tag_id,
            'lessonString': lesson_string,
            'questionList': question_list,
        }
    })


@TagRoutes.route('/getTags', methods=['POST'])
@validate(class_id=int)
def get_tags(class_id: int):
    """
    For now this route will return all tags from the database
    :return: The list of tags
    """
    ret_tags = []
    list_of_tags = []
    all_tags = Tag.query.all()
    tag_class = TagClass.query.filter(TagClass.CLASS == class_id).first()
    if tag_class is None:
        return jsonify(error="Class has no tags")
    list_of_tags.extend(get_tree(tag_class.TAG, all_tags))
    for tag in list_of_tags:
        ret_tags.append({
            'tagID': tag.TAG,
            'parent': tag.parent,
            'tagName': tag.tagName,
            'childOrder': tag.childOrder,
        })
    return jsonify(tags=ret_tags)


@TagRoutes.route('/putTags', methods=['POST'])
@teacher_only
@validate(tags=list)
def put_tags(tags: list):
    """
        We will expect the following from the web
        {
            tags: [....]
        }

        Where each object in the lists will contain information for a given concept. Here is an example
        {'tagName': 'Linear Algebra', 'TAG': 0, 'parent': null, 'childOrder': 0}
    """
    input_tags = tags
    tag_ids = list(map(lambda t: t['tagID'], input_tags))

    if len(set(tag_ids)) != len(tag_ids):
        return jsonify(error="Duplicate tag")

    # Now loop through each object from the list
    # so first we'll get a list of all the tag objects
    tag_list = Tag.query.filter(Tag.TAG.in_(tag_ids)).all()
    if len(tag_list) != len(tag_ids):
        return jsonify(error="One or more tags not found")

    for tag in tag_list:
        tag_new_data = list(
            filter(lambda t: tag.TAG == t['tagID'], input_tags))[0]
        tag.parent = tag_new_data['parent']
        tag.tagName = tag_new_data['tagName']
        tag.childOrder = tag_new_data['childOrder']
    db.session.commit()

    return jsonify({})


@TagRoutes.route('/addTag', methods=['POST'])
@teacher_only
@validate(name=str, class_id=int)
def add_tag(name, class_id):
    parent_tag = TagClass.query.join(Tag, TagClass.CLASS == class_id).first()
    tag_obj = Tag(parent_tag.TAG_RELATION.TAG, name, 0)
    db.session.add(tag_obj)
    db.session.commit()
    return jsonify(tagID=tag_obj.TAG)


@TagRoutes.route("/deleteTag", methods=['POST'])
@teacher_only
@validate(tagID=None)
def delete_tag(tag_id):
    tag = Tag.query.get(tag_id)
    if tag is None:
        return jsonify(error="Tag does not exist")
    # Get all child tags of current tag
    child_tags = Tag.query.filter(Tag.parent == tag.TAG).all()
    for child in child_tags:
        # For each child tag set its parent equal to the parent of the current tag
        child.parent = tag.parent
        db.session.add(child)
    db.session.delete(tag)
    db.session.commit()
    return jsonify({})


@TagRoutes.route("/tagMastery", methods=["POST"])
@login_required
@validate(tagNames=[list])
def tag_mastery(tag_names: list):
    """
    Given a array of tag IDs give the tag IDs names and mastery to client
    :return: array of tag mastery names and Ids to client
    """
    """
    return jsonify(mastery=[{"ID": 2, "name": "Inverse", "mastery": 0.5},
                            {"ID": 5, "name": "Test input for tag value extra long to test the lengths of tag length",
                             "mastery": 1.0},
                            {"ID": 7, "name": "Inverse", "mastery": 0.0}])
    """
    master_list = TagUser.query.filter(current_user.USER == TagUser.USER).all()
    tag_list = Tag.query.filter(Tag.TAG.in_([tag.TAG for tag in master_list])).all()
    return_list = []
    for i in range(len(master_list)):
        if not master_list[i].TAG == tag_list[i].TAG:
            return jsonify(error="Tag not found")
        return_list.append(
            {"ID": tag_list[i].TAG, "name": tag_list[i].tagName, "mastery": master_list[i].mastery})
    return jsonify(mastery=return_list)


@TagRoutes.route("/getLessons", methods=["GET"])
@login_required
@validate()
def get_lessons():
    """
    Get list of lessons for client with the tags associated with them and the lesson string and ID
    :return: Array of lessons with the ID tag associated with lesson and lesson string
    """
    """
    return jsonify(lessons=[
        {"ID": 1, "Tag": "Vectors", "mastery": 0.5, "string": "this is a test string"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {"ID": 5, "Tag": "Matrix", "mastery" : 0.8, "string": "this is also a testing of text"},
        {
            "ID": 15,
            "Tag": "Addition of negative square roots to the power of the square root of 27.mp4",
            "mastery": 0.76,
            "string": "this is a test string"
        }
    ])
    """
    teacher_classes = Class.query.filter(current_user.USER == Class.USER).all()
    enrolled_classes = Transaction.query.filter(current_user.USER == Transaction.USER).all()

    classes = []
    classes.extend(teacher_classes)
    classes.extend(enrolled_classes)
    classes = list(dict.fromkeys(list(map(lambda c: c.CLASS, classes))))

    lesson_list = Lesson.query.join(Class).all()
    lesson_list = list(filter(lambda lesson: lesson.CLASS in classes, lesson_list))
    tag_list = []
    all_tags = Tag.query.all()
    for tag in all_tags:
        for lesson in lesson_list:
            if lesson.TAG == tag.TAG:
                tag_list.append(tag)
    all_mastery = TagUser.query.all()
    mastery_list = []
    for mastery in all_mastery:
        for tag in tag_list:
            if tag.TAG == mastery.TAG:
                mastery_list.append(mastery)
    lessons = []
    for lesson in lesson_list:
        for i in range(len(tag_list)):
            if lesson.TAG == tag_list[i].TAG:
                for j in range(len(mastery_list)):
                    if tag_list[i].TAG == mastery_list[j].TAG:
                        lessons.append({"ID": lesson.LESSON, "Tag": tag_list[i].tagName,
                                        "mastery": mastery_list[j].mastery, "string": lesson.lesson_string})
    return jsonify(lessons=lessons)


@TagRoutes.route("/getLessonQuestionResult", methods=['POST'])
@login_required
@validate(questionID=int, answers=list, seed=int)
def get_lesson_question_result(question_id: int, answers: list, seed: int):
    question = Question.query.get(question_id)
    if question is None:
        return jsonify(error="question not found")
    q = AvoQuestion(question.string, seed, answers)
    tag = Tag.query.join(TagQuestion).filter(TagQuestion.QUESTION == question_id).first()
    current_mastery = TagUser.query.filter(
        (TagUser.TAG == tag.TAG) & (TagUser.USER == current_user.USER)
    ).order_by(TagUser.time_created.desc()).first()
    if current_mastery is None:
        mastery_val = current_mastery.mastery
    else:
        mastery_val = 0
    new_mastery = TagUser(current_user.USER, tag.TAG)
    new_mastery.time_created = datetime.now()
    if q.score == question.total:
        new_mastery.mastery = mastery_val + max(log(100 - (mastery_val * 100), 4) / 10, 0.1)
    else:
        new_mastery.mastery = mastery_val - max((mastery_val * 0.3), 0.05)
    # clamp the value between 0 <= x <= 1
    new_mastery.mastery = max(0, min(new_mastery.mastery, 1))
    db.session.add(new_mastery)
    db.session.commit()
    return jsonify(explanation=q.explanation, mastery=new_mastery.mastery)


@TagRoutes.route("/getLessonData", methods=["POST"])
@login_required
@validate(lessonID=int)
def get_lesson_data(lesson_id: int):
    """
    Given a Lesson ID return Lesson string and questions
    :return: Lesson string and question Ids a strings
    return jsonify(String="This is the lesson string yaw yeet boys", questions=[{"ID": 5, "prompt":"If \\(\\vec u=\\left(-2, 2\\right)\\) and \\(\\vec v=\\left(4, 5\\right)\\), find \\(2\\vec u-3\\vec v\\).","prompts":[""],"types":["6"],"seed":1},
    """
    lesson = Lesson.query.get(lesson_id)
    if lesson is None:
        return jsonify(error="Lesson not found")
    print(lesson.question_list)
    question_list = eval(lesson.question_list)
    if not isinstance(question_list, list):
        return jsonify(error="Lesson question list encountered an error")
    questions = Question.query.filter(
        Question.QUESTION.in_(question_list)).all()
    gened_questions = []
    for question in questions:
        seed = randint(0, 65535)
        q = AvoQuestion(question.string, seed=seed)
        gened_questions.append({"ID": question.QUESTION, "prompt": q.prompt,
                                "prompts": q.prompts, "types": q.types, "seed": seed})
    return jsonify(String=lesson.lesson_string, questions=gened_questions)


@TagRoutes.route("/getMastery", methods=['POST'])
@login_required
@validate(classID=int)
def get_mastery(class_id: int):
    """
    Gets the mastery levels over time (1 daily) of the users mastery level
    :param class_id: class the user is mastering
    :return: array of mastery w/ timestamps of when they achieved it
    """
    all_tags = Tag.query.all()
    tag_class = TagClass.query.filter(TagClass.CLASS == class_id).first()
    if tag_class is None:
        return jsonify(error="Class has no tags")
    list_of_tags = get_tree(tag_class.TAG, all_tags)
    user_tags: List[TagUser] = TagUser.query.filter(TagUser.USER == current_user.USER) \
        .filter(TagUser.TAG.in_([tag.TAG for tag in list_of_tags])) \
        .order_by(TagUser.time_created.asc()) \
        .all()
    if len(user_tags) == 0:
        return jsonify({'masteryTimestamps': []})
    timestamps = {user_tags[0].TAG: [{'timestamp': user_tags[0].time_created, 'mastery': 0}]}
    for tag in user_tags:
        if tag.TAG not in timestamps:
            timestamps[tag.TAG] = []
        tag_timestamp = tag.time_created
        if len(timestamps[tag.TAG]) > 0 and tag_timestamp.date() == timestamps[tag.TAG][-1]['timestamp'].date():
            timestamps[tag.TAG][-1]['mastery'] = tag.mastery
        else:
            timestamps[tag.TAG].append({'timestamp': tag_timestamp, 'mastery': tag.mastery})
    for tag in timestamps.keys():
        for timestamp in timestamps[tag]:
            timestamp['timestamp'] = timestamp['timestamp'].timestamp()
    return jsonify({'masteryTimestamps': timestamps})


@TagRoutes.route("/getRecommendedLessons", methods=['POST'])
@login_required
@validate(classID=int)
def get_recommended(class_id: int):
    """
    Gets the next 2 recommended lessons for a class
    :param class_id: class to recommend for
    :return: array of lessons to recommend
    """
    ret_tags = []
    all_tags = Tag.query.all()
    tag_class = TagClass.query.filter(TagClass.CLASS == class_id).first()
    if tag_class is None:
        return jsonify(error="Class has no tags")
    list_of_tags = get_tree(tag_class.TAG, all_tags)
    for tag in list_of_tags:
        ret_tags.append({
            'tagID': tag.TAG,
            'parent': tag.parent,
            'tagName': tag.tagName,
            'childOrder': tag.childOrder,
        })
    return jsonify(tags=ret_tags)
