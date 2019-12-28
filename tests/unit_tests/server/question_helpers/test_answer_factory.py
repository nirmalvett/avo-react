from server.question_helpers.answer_factory import answer_question
import pytest


@pytest.mark.parametrize(('question_config', 'answers', 'expected_result'), [
    (
            {
                'type': 'multiple choice',
                'correct_answer': 'test'
            },
            iter(['test']),
            [True]
    ),
    (
            {
                'type': 'true/false',
                'correct_answer': 'true'
            },
            iter(['false']),
            [False]
    )
])
def test_multiple_choice_true_false_answer_question(question_config, answers, expected_result):
    assert answer_question(question_config, answers) == expected_result


@pytest.mark.parametrize(('question_config', 'answers', 'expected_result'), [
    (
            {
                'type': 'word input',
                'correct_answer': ['the', 'five', 'tennis', ',', 'french']
            },
            iter(['~~'.join(['space', 'lol', 'the', 'five', 'tennis', ',', 'french'])]),
            [False, False, True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': ['the', 'five', 'tennis', ',', 'french']
            },
            iter(['~~'.join(['the', 'five', 'tennis', ',', 'french'])]),
            [True, True, True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': ['the', 'five', 'tennis', '+', 'french']
            },
            iter(['~~'.join(['the', 'five', 'tennis', ',', 'french'])]),
            [True, True, True, False, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [
                    'this is a sentence',
                    'another sentence',
                    'and yet another sentence'
                ]
            },
            iter(['~~'.join([
                'this is a sentence',
                'another sentence',
                'and yet another sentence'
            ])]),
            [True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [
                    'this is a sentence',
                    'another sentence',
                    'and yet another sentence'
                ]
            },
            iter(['~~'.join([
                'this is a sentence',
                'another sentence2',
                'and yet another sentence'
            ])]),
            [True, False, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [
                    'this is a sentence',
                    'another sentence',
                    'and yet another sentence'
                ]
            },
            iter(['~~'.join([
                'this is a sentenc1e',
                'another sentence2',
                'and yet another se43ntence'
            ])]),
            [False, False, False]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [
                    'this is a sentence',
                    'another sentence',
                    'and yet another sentence'
                ]
            },
            iter(['~~'.join([
                'this is a sentence',
            ])]),
            [True, False, False]
    ),
])
def test_word_input_answer_question(question_config, answers, expected_result):
    assert answer_question(question_config, answers) == expected_result


@pytest.mark.parametrize(('question_config', 'answers', 'expected_result'), [
    (
            {
                'correct_answer': 'test'
            },
            iter(['test']),
            [True]
    ),
    (
            {
                'type': 'true/false'
            },
            iter(['test']),
            [True]
    ),
])
def test_invalid_question_config_answer_question(question_config, answers, expected_result):
    with pytest.raises(KeyError):
        assert answer_question(question_config, answers) == expected_result


@pytest.mark.parametrize(('question_config', 'answers', 'expected_result'), [
    (
            {
                'type': 'true/false',
                'correct_answer': 'test'
            },
            iter([]),
            [True]
    ),
    (
            {
                'type': 'multiple choice',
                'correct_answer': 'test'
            },
            iter([]),
            [True]
    ),
])
def test_stop_iteration_answer_question(question_config, answers, expected_result):
    with pytest.raises(StopIteration):
        assert answer_question(question_config, answers) == expected_result


@pytest.mark.parametrize(('question_config', 'answers', 'expected_result'), [
    (
            {
                'type': 'true/falsea',
                'correct_answer': 'test'
            },
            iter(['test']),
            [True]
    ),
    (
            {
                'type': 'asd',
                'correct_answer': 'test'
            },
            iter(['test']),
            [True]
    ),
])
def test_invalid_question_type_answer_question(question_config, answers, expected_result):
    with pytest.raises(ValueError):
        assert answer_question(question_config, answers) == expected_result
