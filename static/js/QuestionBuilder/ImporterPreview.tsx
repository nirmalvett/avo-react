import {Card, CardHeader, Typography, CardContent} from '@material-ui/core';
import React from 'react';
import {PreviewQuestion} from './types';

export interface ImporterPreviewProps {
    question: PreviewQuestion;
}

const ImporterPreview: React.SFC<ImporterPreviewProps> = (props: ImporterPreviewProps) => {
    return (
        <Card style={{width: '100%'}}>
            <CardHeader title={props.question.name} />
            <CardContent>
                <Typography>{props.question.prompt}</Typography>
                <Typography>{props.question.answer}</Typography>
                <Typography>{props.question.explanation}</Typography>
            </CardContent>
        </Card>
    );
};

export default ImporterPreview;
