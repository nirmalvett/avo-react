import React, {Component} from 'react';
import {Typography, Input} from '@material-ui/core';
import Http from '../HelperFunctions/Http';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Message from './Message';
import {Class} from '../Models';
import {Notification} from '../Models';

export interface NotifyClassState {
    classes: Class[];
    selectedClassName: string;
    addMessageInput: string;
    messageBodyInput: string;
    messages: Notification[];
    classNames: string[];
    editTitle: string;
    editBody: string;
    selectedMessage: Notification | null;
    showEdit: boolean;
}

export default class NotifyClass extends Component<{}, NotifyClassState> {
    state: NotifyClassState = {
        classes: [],
        selectedClassName: 'Select class...',
        addMessageInput: '',
        messageBodyInput: '',
        messages: [],
        classNames: [],
        editTitle: '',
        editBody: '',
        selectedMessage: null,
        showEdit: false,
    };

    componentDidMount() {
        Http.getClasses(
            response => {
                // console.log(response)
                this.setState({
                    classes: response.classes,
                    selectedClassName: response.classes[0].name,
                    classNames: response.classes.map(c => c.name),
                });
                this.getMessages();
            },
            err => {
                console.log(err);
            },
        );
    }

    render() {
        return (
            <div
                style={{
                    width: '70vw',
                    height: '90vh',
                    padding: 25,
                    overflow: 'auto',
                    marginTop: 0,
                }}
            >
                <Card style={{width: '100%', overflow: 'auto', marginBottom: 20}}>
                    <CardContent>
                        <div style={{minHeight: 500}}>
                            <FormControl style={{minWidth: 120, paddingBottom: 20}}>
                                <Select
                                    value={this.state.selectedClassName}
                                    input={<Input name='data' id='select-class' />}
                                    onChange={e =>
                                        this.setState(
                                            {selectedClassName: e.target.value as string},
                                            () => this.getMessages(),
                                        )
                                    }
                                >
                                    {this.state.classNames.map((c, i) => (
                                        <MenuItem key={i} value={c}>
                                            {c}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <br />
                            {this.state.messages.map(this.message)}
                        </div>
                    </CardContent>
                    <CardActions style={{padding: 0, paddingTop: 'auto'}}>
                        <Grid
                            container
                            direction='row'
                            justify='flex-start'
                            alignItems='flex-start'
                            style={{margin: 15}}
                        >
                            <TextField
                                style={{
                                    margin: 0,
                                    width: 200,
                                    marginTop: -12,
                                    marginLeft: 10,
                                    marginRight: 10,
                                }}
                                id='message-title'
                                label='New message title...'
                                value={this.state.addMessageInput}
                                onChange={e => this.setState({addMessageInput: e.target.value})}
                                margin='normal'
                            />
                            <TextField
                                style={{
                                    margin: 0,
                                    minWidth: 200,
                                    marginTop: -12,
                                    marginLeft: 10,
                                    marginRight: 10,
                                }}
                                multiline
                                id='message-body'
                                label='New message body...'
                                value={this.state.messageBodyInput}
                                onChange={e => this.setState({messageBodyInput: e.target.value})}
                                margin='normal'
                            />
                            <div style={{marginLeft: 'auto'}}>
                                <Button variant='contained' onClick={() => this.addMessage()}>
                                    Add new message
                                </Button>
                            </div>

                            <div style={{padding: 5}} />

                            <Button variant='contained' onClick={() => this.deleteMessages()}>
                                Delete selected messages
                            </Button>
                        </Grid>
                    </CardActions>
                </Card>
            </div>
        );
    }

    addMessage() {
        const classID = this.state.classes.find(
            c => c.name === this.state.selectedClassName,
        ) as Class;
        Http.addMessage(
            classID.id,
            this.state.addMessageInput,
            this.state.messageBodyInput,
            () => {
                this.setState({addMessageInput: '', messageBodyInput: ''});
                this.getMessages();
            },
            err => {
                console.log(err);
            },
        );
    }

    deleteMessages() {
        const deleteMessageIDs = this.state.messages.filter(message => message.selected);
        deleteMessageIDs.forEach(message => {
            Http.deleteMessage(message.MESSAGE, () => undefined, () => undefined);
        });
        let filtered = this.state.messages;
        deleteMessageIDs.forEach(message => {
            filtered = filtered.filter(m => m.MESSAGE !== message.MESSAGE);
        });
        this.setState({
            messages: filtered,
        });
    }

    saveMessage(message: Notification) {
        Http.editMessage(
            message.MESSAGE,
            this.state.editTitle,
            this.state.editBody,
            () => {
                const msg = this.state.messages.findIndex(m => m.MESSAGE === message.MESSAGE);
                const messages = this.state.messages;
                messages[msg].showEdit = false;
                messages[msg].title = this.state.editTitle;
                messages[msg].body = this.state.editBody;
                this.setState({messages, showEdit: false, selectedMessage: null});
                // console.log(res);
            },
            err => {
                console.log(err);
            },
        );
    }

    getMessages() {
        const selectedClass = this.state.classes.find(
            c => c.name === this.state.selectedClassName,
        ) as Class;
        Http.getMessages(
            selectedClass.id,
            res => {
                this.setState({
                    messages: res.messages.map(m => ({...m, selected: false, showEdit: false})),
                });
            },
            err => {
                console.log(err);
            },
        );
    }

    message = (message: Notification, i: number) => {
        if (message.showEdit) {
            return this.messageShowEdit(message, i);
        } else {
            return this.messageHideEdit(message, i);
        }
    };

    messageShowEdit(message: Notification, i: number) {
        return (
            <Card key={i} style={{display: 'inline-block', paddingBottom: 20}}>
                <CardContent />
                <CardActions>
                    <div
                        style={{
                            display: 'inherit',
                            marginRight: 'auto',
                        }}
                    >
                        <TextField
                            style={{
                                paddingTop: 20,
                                margin: 0,
                                width: 200,
                                marginTop: -12,
                                marginLeft: 0,
                                marginRight: 10,
                            }}
                            id='edit-title'
                            label='New message title...'
                            value={this.state.editTitle}
                            onChange={e =>
                                this.setState({
                                    editTitle: e.target.value,
                                })
                            }
                            margin='normal'
                        />
                        <TextField
                            style={{
                                paddingTop: 20,
                                margin: 0,
                                minWidth: 200,
                                marginTop: -12,
                                marginLeft: 10,
                                marginRight: 10,
                            }}
                            multiline
                            id='edit-body'
                            label='New message body...'
                            value={this.state.editBody}
                            onChange={e =>
                                this.setState({
                                    editBody: e.target.value,
                                })
                            }
                            margin='normal'
                        />
                    </div>
                    <span style={{display: 'hidden'}} />
                    <div style={{display: 'inherit'}}>
                        <Button
                            variant='contained'
                            onClick={() =>
                                this.saveMessage(this.state.selectedMessage as Notification)
                            }
                        >
                            Save message
                        </Button>
                    </div>
                </CardActions>
            </Card>
        );
    }

    messageHideEdit(message: Notification, i: number) {
        return (
            <div key={JSON.stringify(message) + i + 'hideEdit'}>
                <div
                    onClick={() => {
                        const messageIndex = this.state.messages.findIndex(
                            m => m.MESSAGE === message.MESSAGE,
                        );
                        let newMessages = this.state.messages;
                        newMessages[messageIndex].selected = !newMessages[messageIndex].selected;
                        this.setState({messages: newMessages});
                    }}
                >
                    <Message message={message} />
                </div>
                <div
                    style={{clear: 'both'}}
                    onClick={() => {
                        const messageIndex = this.state.messages.findIndex(
                            m => m.MESSAGE === message.MESSAGE,
                        );
                        const messages = this.state.messages;
                        messages.forEach(m => (m.showEdit = false));
                        messages[messageIndex].showEdit = true;
                        this.setState({
                            editTitle: message.title,
                            editBody: message.body,
                            selectedMessage: message,
                            messages,
                        });
                    }}
                >
                    <Typography
                        id='edit-message-button'
                        style={{float: 'right'}}
                        variant='caption'
                        color='textPrimary'
                    >
                        Edit
                    </Typography>
                </div>
                <br />
                <hr />
            </div>
        );
    }
}
