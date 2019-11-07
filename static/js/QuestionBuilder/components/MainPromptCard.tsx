import React, {Fragment, PureComponent} from 'react';
import {IconButton, TextField, Typography} from '@material-ui/core';
import {Cancel, Done, Edit} from '@material-ui/icons';
import {formatString, validateString} from '../mathCodeUtils';
import {EditorPrompt, QuestionBuilderMode} from '../QuestionBuilder.models';
import {editText} from '../editText';
import {Content} from '../../HelperFunctions/Content';

interface MainPromptCardProps {
    mode: QuestionBuilderMode;
    cancelEdit: () => void;
    startEdit: () => void;
    save: () => void;
    editorPrompt: EditorPrompt;
    onChange: (v: string) => void;
}

export class MainPromptCard extends PureComponent<MainPromptCardProps> {
    render() {
        const {mode, cancelEdit, startEdit, save, editorPrompt} = this.props;
        if (mode.name === 'mainPrompt') {
            let errors = validateString(mode.content);
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'>Main Prompt</Typography>
                        <div>
                            <IconButton onClick={cancelEdit}>
                                <Cancel />
                            </IconButton>
                            <IconButton disabled={errors.length > 0} onClick={save}>
                                <Done />
                            </IconButton>
                        </div>
                    </div>
                    <div>
                        <TextField
                            multiline
                            value={mode.content}
                            style={{width: '100%'}}
                            inputProps={{onKeyDown: editText}}
                            onChange={v => this.props.onChange(v.target.value)}
                        />
                    </div>
                    {errors}
                </Fragment>
            );
        } else {
            if (editorPrompt.strings) {
                return (
                    <Fragment>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant='h6'>Main Prompt</Typography>
                            <IconButton onClick={startEdit}>
                                <Edit />
                            </IconButton>
                        </div>
                        <Content>{formatString(editorPrompt.prompt, editorPrompt.strings)}</Content>
                    </Fragment>
                );
            } else {
                return (
                    <Fragment>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Typography variant='h6'>Main Prompt</Typography>
                            <IconButton onClick={startEdit}>
                                <Edit />
                            </IconButton>
                        </div>
                        <Content>{editorPrompt.prompt}</Content>
                        {/*<Typography>{editorPrompt.errors}</Typography> todo*/}
                    </Fragment>
                );
            }
        }
    }
}
