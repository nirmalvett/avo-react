import {Collapse, List, ListItem, ListItemText, Paper} from "@material-ui/core";
import {Folder, FolderOpen} from "@material-ui/icons";
import React from "react";

export function QuestionSidebar(open, addQuestion, sets){
	 /*
    * input open: a binded function
    * addQuestion: a binded function
    * sets: list of set data*/
	 return (
             <div style={{flex: 1, display: 'flex'}}>
                    <Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
                        <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                            {sets.map((set, setIndex) =>
                                <div>
                                    <ListItem key={"CreateTest" + setIndex} button onClick={() => open(setIndex)}
                                              disabled={sets[setIndex].questions.length === 0}>
                                        {set.open
                                            ? <FolderOpen color={set.questions.length === 0 ? 'disabled' : 'action'}/>
                                            : <Folder color={set.questions.length === 0 ? 'disabled' : 'action'}/>
                                        }
                                        <ListItemText inset primary={set.name}/>
                                    </ListItem>
                                    <Collapse in={set.open} timeout='auto' unmountOnExit><List>{
                                        set.questions.map((question, questionIndex) =>
                                            <ListItem key={"CreateTest" + setIndex + "-" + questionIndex}
                                                      button onClick={() => addQuestion(question)}>
                                                <ListItemText secondary={question.name}/>
                                            </ListItem>)
                                    }</List></Collapse>
                                </div>
                            )}
                        </List>
                    </Paper>
                </div>
        )
}