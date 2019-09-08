import React, {Fragment, PureComponent} from 'react';
import {IconButton, MenuItem, Select, TextField, Typography} from '@material-ui/core';
import {Cancel, Delete, Done, Edit} from '@material-ui/icons';
import {formatString, validateString} from '../mathCodeUtils';
import {AnswerInput} from '../../AnswerInput';
import {EditorSubPrompt, QuestionBuilderMode} from '../QuestionBuilder.models';
import {editText} from '../editText';

interface SubPromptCardProps {
    mode: QuestionBuilderMode;
    index: number;
    editorPrompt: EditorSubPrompt;
    deletePrompt: () => void;
    cancelEdit: () => void;
    startEdit: () => void;
    save: () => void;
    onChange: (v: {prompt: string; type: string}) => void;
}

export class SubPromptCard extends PureComponent<SubPromptCardProps> {
    render() {
        const {
            mode,
            index,
            editorPrompt,
            deletePrompt,
            cancelEdit,
            startEdit,
            save,
            onChange,
        } = this.props;
        if (mode.name === 'prompt' && mode.index === index) {
            const errors = validateString(mode.content.prompt);
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'>Prompt {index + 1}</Typography>
                        <div>
                            <IconButton onClick={deletePrompt}>
                                <Delete />
                            </IconButton>
                            <IconButton onClick={cancelEdit}>
                                <Cancel />
                            </IconButton>
                            <IconButton disabled={errors.length > 0} onClick={save}>
                                <Done />
                            </IconButton>
                        </div>
                    </div>
                    <div>
                        <Select
                            value={mode.content.type}
                            style={{width: '100%'}}
                            onChange={v =>
                                onChange({
                                    type: v.target.value as string,
                                    prompt: mode.content.prompt,
                                })
                            }
                        >
                            <MenuItem value='0'>True/false</MenuItem>
                            <MenuItem value='1'>Multiple choice</MenuItem>
                            <MenuItem value='2'>Number</MenuItem>
                            <MenuItem value='3'>Calculus Expression</MenuItem>
                            {/*<MenuItem value='5' disabled>Polynomial</MenuItem>*/}
                            <MenuItem value='6'>Vector</MenuItem>
                            <MenuItem value='5'>Vector (Horizontal Input)</MenuItem>
                            <MenuItem value='7'>Vector with free variables</MenuItem>
                            <MenuItem value='8'>Matrix</MenuItem>
                            <MenuItem value='9'>Basis</MenuItem>
                        </Select>
                    </div>
                    <div>
                        <TextField
                            multiline
                            value={mode.content.prompt}
                            style={{width: '100%'}}
                            inputProps={{onKeyDown: editText}}
                            onChange={v =>
                                onChange({type: mode.content.type, prompt: v.target.value})
                            }
                        />
                    </div>
                    {errors}
                </Fragment>
            );
        } else {
            if (editorPrompt.strings) {
                let prompt = formatString(editorPrompt.prompt, editorPrompt.strings);
                return (
                    <Fragment>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant='h6'>Prompt {index + 1}</Typography>
                            <IconButton onClick={startEdit}>
                                <Edit />
                            </IconButton>
                        </div>
                        <AnswerInput disabled type={editorPrompt.type} prompt={prompt} />
                    </Fragment>
                );
            } else {
                let prompt = editorPrompt.prompt;
                return (
                    <Fragment>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant='h6'>Prompt {index + 1}</Typography>
                            <IconButton onClick={startEdit}>
                                <Edit />
                            </IconButton>
                        </div>
                        <AnswerInput disabled type={editorPrompt.type} prompt={prompt} />
                    </Fragment>
                );
            }
        }
    }
}
