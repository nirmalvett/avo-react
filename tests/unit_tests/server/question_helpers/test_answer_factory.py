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
                'correct_answer': [1, 5, 2, 3, 4],
                'word_input_mode': 'word'
            },
            iter(['~~'.join(['44', '44', '1', '5', '2', '3', '4'])]),
            [False, False, True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 2, 3, 4, 5],
                'word_input_mode': 'word'
            },
            iter(['~~'.join(['1', '2', '3', '4', '5'])]),
            [True, True, True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 2, 3, 4, 5],
                'word_input_mode': 'word'
            },
            iter(['~~'.join(['1', '2', '3', '123', '5'])]),
            [True, True, True, False, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 2, 3],
                'word_input_mode': 'sentence'
            },
            iter(['~~'.join(['1', '2', '3'])]),
            [True, True, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 45, 3],
                'word_input_mode': 'sentence'
            },
            iter(['~~'.join(['1', '2', '3'])]),
            [True, False, True]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 2, 3],
                'word_input_mode': 'sentence'
            },
            iter(['~~'.join(['23', '34', '12'])]),
            [False, False, False]
    ),
    (
            {
                'type': 'word input',
                'correct_answer': [1, 2, 3],
                'word_input_mode': 'sentence'
            },
            iter(['~~'.join(['1'])]),
            [True, False, False]
    ),
])
def test_word_input_answer_question(question_config, answers, expected_result):
    assert set(answer_question(question_config, answers)) == set(expected_result)


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
