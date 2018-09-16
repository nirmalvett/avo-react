import React from 'react';
import Typography from '@material-ui/core/Typography/Typography';
import Grid from "@material-ui/core/Grid/Grid";
import Card from "@material-ui/core/Card/Card";
import MathJax from "react-mathjax2";
import AvoHttp from "./Http";

export default class TakeTest extends React.Component {
    constructor(props) {
        super(props);
        AvoHttp.getTest(this.props.testID, (result) => {
            console.log(result);
            this.setState(result);
            }, (result) => alert(result.error));
        this.state = {
            testID: this.props.testID
        };
    }


    render() {
        return (
            <Grid container spacing={8}>
                <Grid xs={1}/>
                <Grid xs={10} style={{marginTop: '20px', marginBottom: '20px', overflowY: 'auto'}}>
                    <Card style={{margin: '10px', padding: '10px'}}>
                        <Typography variant='display1' color='textPrimary'>Welcome to AVO!</Typography>
                    </Card>
                </Grid>
                <Grid xs={1}/>
            </Grid>
        );
    }

    // noinspection JSMethodCanBeStatic
    getMathJax(text, variant) {
        let strings = text.split(/\\[()\[\]]]/).map((x, y) => y % 2 === 0 ? x :
            <MathJax.Node inline>{x}</MathJax.Node>);
        return <MathJax.Context input='tex'><Typography variant={variant}>{strings}</Typography></MathJax.Context>
    }
}