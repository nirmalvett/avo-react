import React, {Fragment, PureComponent, ReactElement} from 'react';
import {IconButton, TextField, Typography} from '@material-ui/core';
import {Cancel, Done, Edit} from '@material-ui/icons';
import {buildMathCode} from '../mathCodeUtils';
import {getMathJax} from '../../HelperFunctions/Utilities';
import {CompileSuccess, EditorMath, QuestionBuilderMode} from '../QuestionBuilder.models';

interface MathCardProps {
    mode: QuestionBuilderMode;
    startEdit: () => void;
    cancelEdit: () => void;
    save: () => void;
    editorMath: EditorMath[];
    onChange: (v: string) => void;
    edit: (event: any) => void;
    generateHints: (event: any) => void;
    hints: ReactElement;
}

export class MathCard extends PureComponent<MathCardProps> {
    render() {
        const {mode, startEdit, cancelEdit, save, editorMath, onChange} = this.props;
        const filteredMath = editorMath.filter(x => x.success) as (EditorMath & CompileSuccess)[];
        if (mode.name === 'math') {
            let errors: [number, ReactElement][] = [];
            let lines = mode.content.split('\n').filter(x => x.trim().length !== 0);
            for (let i = 0; i < lines.length; i++) {
                let match = /^([^=]+)=([^#]+)(?:#(.*))?$/.exec(lines[i]);
                if (match === null)
                    errors.push([i, <Typography color='error'>Line isn't an equation</Typography>]);
                else {
                    let varNames = match[1].split(',').map(x => x.trim());
                    let invalidVarNames = varNames.filter(x => !/^\$\w+$/.test(x));
                    if (invalidVarNames.length > 0)
                        errors.push([
                            i,
                            <Typography color='error'>
                                The following variable names are invalid:{' '}
                                {invalidVarNames.map(x => "'" + x + "'").join(', ')}
                            </Typography>,
                        ]);
                    let mc = buildMathCode(match[2]);
                    if (!mc.success) {
                        errors.push([i, mc.error]);
                    }
                }
            }
            return (
                <Fragment>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant='h6'>Math</Typography>
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
                            inputProps={{
                                onKeyDown: this.props.edit,
                                onClick: this.props.generateHints,
                                onKeyUp: this.props.generateHints,
                            }}
                            onChange={event => onChange(event.target.value)}
                        />
                    </div>
                    <table>
                        <tbody>
                            {errors.map((error, index) => (
                                <tr key={'error' + error[0] + index}>
                                    <td style={{padding: 2}}>
                                        <Typography>Line {error[0] + 1}</Typography>
                                    </td>
                                    <td style={{padding: 2}}>{error[1]}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <Typography>{this.props.hints}</Typography>
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
                        <Typography variant='h6'>Math</Typography>
                        <IconButton onClick={startEdit}>
                            <Edit />
                        </IconButton>
                    </div>
                    {filteredMath.map((x, y) =>
                        x.comment.length === 0
                            ? getMathJax(
                                  '\\(\\small ' + x.varNames.join(', ') + '=' + x.LaTeX + '\\)',
                                  undefined,
                                  y.toString(),
                              )
                            : getMathJax(
                                  '\\(\\small ' +
                                      x.varNames.join(', ') +
                                      '=' +
                                      x.LaTeX +
                                      '\\) # ' +
                                      x.comment,
                                  undefined,
                                  y.toString(),
                              ),
                    )}
                </Fragment>
            );
        }
    }
}
