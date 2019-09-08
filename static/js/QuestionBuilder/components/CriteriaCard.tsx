import React, {Fragment, PureComponent} from 'react';
import {IconButton, TextField, Typography} from '@material-ui/core';
import {Cancel, Delete, Done, Edit} from '@material-ui/icons';
import {buildMathCode, formatString, validateString} from '../mathCodeUtils';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {EditorCriteria, QuestionBuilderMode} from '../QuestionBuilder.models';
import {editText} from '../editText';

interface CriteriaCardProps {
    mode: QuestionBuilderMode;
    index: number;
    cancelEdit: () => void;
    startEdit: () => void;
    save: () => void;
    editorCriteria: EditorCriteria;
    onChange: (v: {points: string; criteria: string; explanation: string}) => void;
    deleteCriteria: () => void;
}

export class CriteriaCard extends PureComponent<CriteriaCardProps> {
    render() {
        const {
            mode,
            index,
            editorCriteria,
            deleteCriteria,
            cancelEdit,
            startEdit,
            save,
            onChange,
        } = this.props;
        if (mode.name === 'criteria' && mode.index === index) {
            let {points, criteria, explanation} = mode.content;
            const _error = buildMathCode(criteria);
            const error = !_error.success ? _error.error : undefined;
            let errors = validateString(explanation);
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'>Criteria {index + 1}</Typography>
                        <div>
                            <IconButton onClick={deleteCriteria}>
                                <Delete />
                            </IconButton>
                            <IconButton onClick={cancelEdit}>
                                <Cancel />
                            </IconButton>
                            <IconButton disabled={!!error || errors.length > 0} onClick={save}>
                                <Done />
                            </IconButton>
                        </div>
                    </div>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <TextField
                            value={points}
                            style={{width: '8%'}}
                            label='Points'
                            onChange={v =>
                                onChange({points: v.target.value, criteria, explanation})
                            }
                        />
                        <TextField
                            value={criteria}
                            style={{width: '90%'}}
                            label='Expression'
                            onChange={v =>
                                onChange({points, criteria: v.target.value, explanation})
                            }
                            helperText={error}
                        />
                    </div>
                    <div style={{marginTop: 10}}>
                        <TextField
                            multiline
                            value={explanation}
                            style={{width: '100%'}}
                            label='Explanation'
                            inputProps={{onKeyDown: editText}}
                            onChange={v =>
                                onChange({points, criteria, explanation: v.target.value})
                            }
                        />
                    </div>
                    {errors}
                </Fragment>
            );
        } else
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'>
                            Criteria {index + 1} ({editorCriteria.points} points)
                        </Typography>
                        <IconButton onClick={startEdit}>
                            <Edit />
                        </IconButton>
                    </div>
                    {getMathJax('\\(' + editorCriteria.LaTeX + '\\)')}
                    {getMathJax(formatString(editorCriteria.explanation, editorCriteria.strings))}
                </Fragment>
            );
    }
}
