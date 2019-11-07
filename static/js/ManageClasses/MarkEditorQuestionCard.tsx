import React, {Fragment} from 'react';
import {Card, CardHeader, Divider, IconButton, Tooltip, Typography} from '@material-ui/core';
import {Check, Close} from '@material-ui/icons';
import {AnswerInput} from '../AnswerInput';
import * as Http from '../Http';
import {Content} from '../HelperFunctions/Content';

interface MarkEditorQuestionCardProps {
    question: Http.PostTest_Question;
    index: number;
    update: (questionIndex: number, partIndex: number) => () => void;
}

export default function MarkEditorQuestionCard(props: MarkEditorQuestionCardProps) {
    const score = props.question.scores.reduce((acc, val) => acc + val, 0);
    const total = props.question.totals.reduce((acc, val) => acc + val, 0);
    return (
        <Card
            style={{
                marginLeft: '10px',
                marginRight: '10px',
                marginTop: '20px',
                marginBottom: '20px',
                padding: '20px',
                position: 'relative',
            }}
        >
            <CardHeader
                title={
                    <Content>{`(Question ${props.index + 1}): ${props.question.prompt}`}</Content>
                }
                style={{position: 'relative'}}
                action={
                    <Typography variant='h5' color='primary'>
                        {score}/{total}
                    </Typography>
                }
            />
            <br />
            {props.question.prompts.map((prompt, index) => (
                <Fragment key={`Fragment1-Explanation-QIndex:${props.index}-Index:${index}`}>
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}} />
                    <AnswerInput
                        disabled
                        type={props.question.types[index]}
                        value={props.question.answers[index]}
                        prompt={prompt}
                    />
                </Fragment>
            ))}
            {props.question.explanation.map((explanation, index) => (
                <Fragment key={`Divider2-Explanation-QIndex:${props.index}-Index:${index}`}>
                    <Divider style={{marginTop: '10px', marginBottom: '10px'}} />
                    <div style={{position: 'relative'}}>
                        <div style={{position: 'absolute', right: '8px', top: '8px'}}>
                            <Tooltip
                                title={
                                    props.question.scores[index] ? 'Remove a point' : 'Give a point'
                                }
                            >
                                <IconButton onClick={props.update(props.index, index)}>
                                    {props.question.scores[index] ? <Check /> : <Close />}
                                </IconButton>
                            </Tooltip>
                        </div>
                    </div>
                    <div>
                        <br />
                        <Content>{explanation}</Content>
                        <br />
                    </div>
                </Fragment>
            ))}
        </Card>
    );
}
