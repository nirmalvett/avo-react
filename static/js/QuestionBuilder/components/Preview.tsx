import React, {CSSProperties, Fragment} from 'react';
import {Card, Divider, Typography} from '@material-ui/core';
import {AnswerInput} from '../../AnswerInput';
import {
    CompileSuccess,
    EditorCriteria,
    EditorMath,
    EditorSubPrompt,
} from '../QuestionBuilder.models';
import * as Http from '../../Http';
import {Content} from '../../HelperFunctions/Content';

const cardStyle: CSSProperties = {
    margin: 8,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 10,
    paddingBottom: 10,
};

const dividerStyle: CSSProperties = {
    marginTop: 15,
    marginBottom: 15,
};

interface PreviewProps {
    editorMath: EditorMath[];
    editorPrompts: EditorSubPrompt[];
    editorCriteria: EditorCriteria[];
    preview: Http.SampleQuestion;
}

export function Preview(props: PreviewProps) {
    const varList: [string, string][] = [];
    for (let v in props.preview.variables) {
        if (props.preview.variables.hasOwnProperty(v)) {
            varList.push([v, props.preview.variables[v]]);
        }
    }

    const editorMath = props.editorMath.filter(x => x.success) as (EditorMath & CompileSuccess)[];

    return (
        <div style={{flex: 1, display: 'flex', flexDirection: 'row'}}>
            <div style={{flex: 8, paddingTop: 10, paddingBottom: 10, overflowY: 'auto'}}>
                <Card style={cardStyle}>
                    <Typography variant='h6' style={{marginTop: 10, marginBottom: 10}}>
                        Math
                    </Typography>
                    {editorMath.map(x =>
                        x.comment === '' ? (
                            <Content>{'\\(\\small ' + x.LaTeX + '\\'}</Content>
                        ) : (
                            <Content>
                                {'\\(\\small ' +
                                    x.LaTeX +
                                    '\\color{grey}{\\text{ # ' +
                                    x.comment +
                                    '}}\\)'}
                            </Content>
                        ),
                    )}
                    <Divider style={dividerStyle} />
                    {varList.map(x => (
                        <Content>{`\\(${x[0]}=${x[1]}\\)`}</Content>
                    ))}
                </Card>
                <Card style={cardStyle}>
                    <Content>{props.preview.prompt}</Content>
                    {props.editorPrompts.map((x, y) => (
                        <Fragment>
                            <Divider style={dividerStyle} />
                            <AnswerInput type={x.type} disabled prompt={props.preview.prompts[y]} />
                        </Fragment>
                    ))}
                </Card>
                <Card style={cardStyle}>
                    {props.editorCriteria.map((x, y) => (
                        <Fragment>
                            {y > 0 ? <Divider style={dividerStyle} /> : null}
                            <Content>{props.preview.explanation[y]}</Content>
                        </Fragment>
                    ))}
                </Card>
            </div>
            <div style={{flex: 4, display: 'flex', paddingBottom: 0, overflowY: 'auto'}}>
                <Card style={{flex: 1, margin: '8%', padding: 20}}>
                    <Typography>
                        This is preview mode! It lets you see the contents of all the variables you
                        set, as well as what all the prompts and explanations will look like when
                        students see them. If you ever get lost using the question builder, just
                        click the preview button to come back here and see what your changes are
                        doing!
                    </Typography>
                </Card>
            </div>
        </div>
    );
}
