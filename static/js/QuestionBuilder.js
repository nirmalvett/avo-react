import React from 'react';
import Grid from '@material-ui/core/Grid/Grid';
import Paper from "@material-ui/core/Paper/Paper";
import List from "@material-ui/core/List/List";
import ListItem from "@material-ui/core/ListItem/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Http from "./Http";
import Folder from '@material-ui/icons/Folder';
import CreateNewFolder from '@material-ui/icons/CreateNewFolder';
import TextFormat from '@material-ui/icons/TextFormat';
import DeleteSweep from '@material-ui/icons/DeleteSweep';
import Subject from '@material-ui/icons/Subject';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import FileCopy from '@material-ui/icons/FileCopy';
import Delete from '@material-ui/icons/Delete';
import IconButton from "@material-ui/core/IconButton/IconButton";

export default class QuestionBuilder extends React.Component {
    constructor(props) {
        super(props);
        Http.getSets(
            result => this.setState({sets: result.sets}),
            () => alert("Something went wrong when retrieving your question list")
        );
        this.state = {
            selectedS: null, // Selected Set
            selectedQ: null, // Selected Question
            sets: [
            ],
        };
    }

    render() {
        return (
            <Grid container spacing={8}>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '5px', paddingBottom: '5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton onClick={() => this.newSet()}><CreateNewFolder/></IconButton>
                            <IconButton onClick={() => this.renameSet()}><TextFormat/></IconButton>
                            <IconButton onClick={() => this.deleteSet()}><DeleteSweep/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.state.sets.map((set, index) =>
                                <ListItem key = {set.id + '-' + index} button
                                          onClick={() => this.selectSet(index)}>
                                    <Folder color={this.state.selectedS === index ? 'primary' : 'action'}/>
                                    <ListItemText inset primary={set.name}/>
                                </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={3} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '5px', paddingBottom: '5px'}}>
                        <div style={{display: 'flex', justifyContent: 'space-evenly'}}>
                            <IconButton onClick={() => this.newQuestion()}><Add/></IconButton>
                            <IconButton onClick={() => this.renameQuestion()}><TextFormat/></IconButton>
                            <IconButton onClick={() => this.editQuestion()}><Edit/></IconButton>
                            <IconButton onClick={() => this.copyQuestion()}><FileCopy/></IconButton>
                            <IconButton onClick={() => this.deleteQuestion()}><Delete/></IconButton>
                        </div>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {this.state.selectedS === null
                                ? undefined
                                : this.state.sets[this.state.selectedS].questions.map((question, index) =>
                                    <ListItem key = {question.id + '-' + index} button
                                              onClick={() => this.selectQuestion(index)}>
                                        <Subject color={this.state.selectedQ === index ? 'primary' : 'action'}/>
                                        <ListItemText inset secondary={question.name}/>
                                    </ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
                <Grid item xs={6} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex', flexDirection: 'column', paddingTop: '5px', paddingBottom: '5px'}}/>
                </Grid>
            </Grid>
        );
    }

    selectSet(index) {
        this.setState({selectedS: index, selectedQ: null})
    }

    selectQuestion(index) {
        this.setState({selectedQ: index})
    }

    newSet() {
        alert("New set");
    }

    renameSet() {
        alert("Rename set");
    }

    deleteSet() {
        alert("Delete set");
    }

    newQuestion() {
        alert("New question");
    }

    renameQuestion() {
        alert("Rename question");
    }

    editQuestion() {
        alert("Edit question");
    }

    copyQuestion() {
        alert("Copy question");
    }

    deleteQuestion() {
        alert("Delete question");
    }
}