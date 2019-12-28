from typing import Dict, Iterator, List

from server.models import Question


def answer_question(question_config: Dict, answers: Iterator) -> List[bool]:
    """
    Takes in a question config from the QUESTION table, and an iterator of answers for the question,
    and returns a list of what was right and wrong.

    Valid question types:
    - 'multiple choice'
    - 'true/false'
    - 'word input'

    :param question_config: config from a row in the QUESTION table
    :param answers: iterator of answers for the question
    :return: list of boolean values to represent what was right and wrong at each index
    :raises StopIteration if no answer is proved for certain types (true/false, multiple choice),
    ValueError when an invalid question type is passed in, KeyError if the 'type' field is missing
    from the question_config, and KeyError when a question is missing the key it needs to generate the answer
    array (e.g. if multiple choice is missing 'correct_answer').
    """
    question_type = question_config['type']
    if question_type == 'multiple choice' or question_type == 'true/false':
        answer = next(answers)
        correct_answer = question_config['correct_answer']
        return [answer == correct_answer]
    elif question_type == 'word input':
        answers = next(answers)
        answers = answers.split('~~')
        correct_answer: List = question_config['correct_answer']
        while len(answers) < len(correct_answer):
            answers.append('')
        return [
            answer == correct or answer in correct_answer
            for answer, correct in zip(answers, correct_answer)
        ]
    else:
        raise ValueError('Invalid question type')


def get_prompt_prompts_types(question: Question):
    return question.string, question.config['prompts'], question.config['types']


def get_explanations(question_config: Dict):
    question_type = question_config['type']
    if question_type == 'multiple choice' or question_type == 'true/false':
        return [question_config['explanation']]
    if question_type == 'word input':
        return [question_config['explanation']]
    raise ValueError('Invalid question type')
