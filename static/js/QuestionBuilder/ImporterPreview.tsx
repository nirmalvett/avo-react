import {Card, CardHeader, Typography, CardContent, Grid} from '@material-ui/core';
import React from 'react';
import {PreviewTFQuestion} from './types';

export interface ImporterPreviewProps {
    question: PreviewTFQuestion;
}

const ImporterPreview: React.SFC<ImporterPreviewProps> = (props: ImporterPreviewProps) => {
    return (
        <Card style={{width: '100%'}}>
            <CardHeader title={props.question.name} />
            <CardContent>
                <Grid container>
                    <Grid item xs={12} md={6} lg={4}>
                        <Typography variant='h6'>Prompt</Typography>
                        <Typography>{props.question.prompt}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                    <Typography variant='h6'>Answer</Typography>
                        <Typography>{props.question.answer}</Typography>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                    <Typography variant='h6'>Explanation</Typography>
                        <Typography>{props.question.explanation}</Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default ImporterPreview;
