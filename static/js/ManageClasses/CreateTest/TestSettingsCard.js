import {Card, CardHeader, Collapse, List, ListItem, ListItemText, Paper, TextField} from "@material-ui/core";
import {Folder, FolderOpen} from "@material-ui/icons";
import React from "react";
import {InlineDateTimePicker} from "material-ui-pickers";

export function TestSettingsCard(open, addQuestion, sets){
	 /*
    * input open: a binded function
    * addQuestion: a binded function
    * sets: list of set data*/
	 return (

	 		            <Card key = 'Test-Setting-Card-Create-Test' style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
                        <CardHeader title={'Test Settings'} action={this.submitTest()}/>
                        <TextField
                            margin='normal'
                            label='Name'
                            style={{width: '46%', margin: '2%'}}
                            onChange={e => this.setState({name: e.target.value})}
                        />
                        <TextField
                            margin='normal' label='Time Limit in Minutes (-1 for unlimited)' type='number'
                            style={{width: '46%', margin: '2%'}}
                            onChange={e => this.setState({timeLimit: e.target.value})}/>
                        <br/>
                        <TextField margin='normal' label='Attempts (-1 for unlimited)' type='number'
                                   style={{width: '46%', margin: '2%'}}
                                   onChange={e => this.setState({attempts: e.target.value})}/>
                        <InlineDateTimePicker
                            margin='normal'
                            style={{width: '46%', margin: '2%'}}
                            label="Deadline"
                            value={this.state._deadline}
                            onChange={this.handleDateChange.bind(this)}
                        />
                        <InlineDateTimePicker
                            margin='normal'
                            style={{width: '46%', margin: '2%'}}
                            label="Test Auto Open Time"
                            value={this.state._openTime}
                            onChange={this.handleOpenChange.bind(this)}
                        />
                    </Card>
	 )

}