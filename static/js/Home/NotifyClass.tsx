import React, {Component} from 'react';
import {Typography, Input} from '@material-ui/core';
import * as Http from '../Http';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Announcement from './Announcement';
import {GetSections_Section} from '../Http';
import {Notification} from '../Models';

export interface NotifyClassState {
    classes: GetSections_Section[];
    selectedClassName: string;
    addAnnouncementInput: string;
    announcementBodyInput: string;
    announcements: Notification[];
    classNames: string[];
    editTitle: string;
    editBody: string;
    selectedAnnouncement: Notification | null;
    showEdit: boolean;
}

export default class NotifyClass extends Component<{}, NotifyClassState> {
    state: NotifyClassState = {
        classes: [],
        selectedClassName: 'Select class...',
        addAnnouncementInput: '',
        announcementBodyInput: '',
        announcements: [],
        classNames: [],
        editTitle: '',
        editBody: '',
        selectedAnnouncement: null,
        showEdit: false,
    };

    componentDidMount() {
        Http.getSections(
            response => {
                // console.log(response)
                const classes = response.sections.filter(section => section.role === 'teacher');
                if (classes && classes.length > 0) {
                    this.setState(
                        {
                            classes,
                            selectedClassName: classes[0].name,
                            classNames: classes.map(c => c.name),
                        },
                        this.getAnnouncements,
                    );
                }
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
                    width: '100%',
                    height: '90vh',
                    padding: 25,
                    overflow: 'auto',
                    marginTop: 0,
                }}
            >
                <Card style={{width: '100%', overflow: 'auto', marginBottom: 20}}>
                    <CardContent>
                        <div style={{maxHeight: 500}}>
                            <FormControl style={{minWidth: 120, paddingBottom: 20}}>
                                <Select
                                    value={this.state.selectedClassName}
                                    input={<Input name='data' id='select-class' />}
                                    onChange={e =>
                                        this.setState(
                                            {selectedClassName: e.target.value as string},
                                            this.getAnnouncements,
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
                            {this.state.announcements.map(this.announcement)}
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
                                id='announcement-title'
                                label='New announcement title...'
                                value={this.state.addAnnouncementInput}
                                onChange={e =>
                                    this.setState({addAnnouncementInput: e.target.value})
                                }
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
                                id='announcement-body'
                                label='New announcement body...'
                                value={this.state.announcementBodyInput}
                                onChange={e =>
                                    this.setState({announcementBodyInput: e.target.value})
                                }
                                margin='normal'
                            />
                            <div style={{marginLeft: 'auto'}}>
                                <Button
                                    style={{borderRadius: '2.5em'}}
                                    variant='outlined'
                                    onClick={() => this.addAnnouncement()}
                                >
                                    Add new announcement
                                </Button>
                            </div>

                            <div style={{padding: 5}} />

                            <Button
                                style={{borderRadius: '2.5em'}}
                                variant='outlined'
                                onClick={() => this.deleteAnnouncements()}
                            >
                                Delete selected announcements
                            </Button>
                        </Grid>
                    </CardActions>
                </Card>
            </div>
        );
    }

    addAnnouncement() {
        const _class = this.state.classes.find(
            c => c.name === this.state.selectedClassName,
        ) as GetSections_Section;
        Http.addAnnouncement(
            _class.sectionID,
            this.state.addAnnouncementInput,
            this.state.announcementBodyInput,
            () => {
                this.setState({addAnnouncementInput: '', announcementBodyInput: ''});
                this.getAnnouncements();
            },
            err => {
                console.log(err);
            },
        );
    }

    deleteAnnouncements() {
        const deleteAnnouncementIDs = this.state.announcements.filter(
            announcement => announcement.selected,
        );
        deleteAnnouncementIDs.forEach(announcement => {
            Http.deleteAnnouncement(announcement.announcementID, () => undefined, () => undefined);
        });
        let filtered = this.state.announcements;
        deleteAnnouncementIDs.forEach(announcement => {
            filtered = filtered.filter(m => m.announcementID !== announcement.announcementID);
        });
        this.setState({
            announcements: filtered,
        });
    }

    saveAnnouncement(announcement: Notification) {
        Http.editAnnouncement(
            announcement.announcementID,
            this.state.editTitle,
            this.state.editBody,
            () => {
                const msg = this.state.announcements.findIndex(
                    m => m.announcementID === announcement.announcementID,
                );
                const announcements = this.state.announcements;
                announcements[msg].showEdit = false;
                announcements[msg].header = this.state.editTitle;
                announcements[msg].body = this.state.editBody;
                this.setState({announcements, showEdit: false, selectedAnnouncement: null});
                // console.log(res);
            },
            err => {
                console.log(err);
            },
        );
    }

    getAnnouncements = () => {
        const selectedClass = this.state.classes.find(
            c => c.name === this.state.selectedClassName,
        ) as GetSections_Section;
        Http.getAnnouncements(
            selectedClass.sectionID,
            res => {
                this.setState({
                    announcements: res.announcements.map(m => ({
                        ...m,
                        selected: false,
                        showEdit: false,
                    })),
                });
            },
            err => {
                console.log(err);
            },
        );
    };

    announcement = (announcement: Notification, i: number) => {
        if (announcement.showEdit) {
            return this.announcementShowEdit(announcement, i);
        } else {
            return this.announcementHideEdit(announcement, i);
        }
    };

    announcementShowEdit(announcement: Notification, i: number) {
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
                            label='New announcement title...'
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
                            label='New announcement body...'
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
                            style={{borderRadius: '2.5em'}}
                            variant='outlined'
                            onClick={() =>
                                this.saveAnnouncement(this.state
                                    .selectedAnnouncement as Notification)
                            }
                        >
                            Save announcement
                        </Button>
                    </div>
                </CardActions>
            </Card>
        );
    }

    announcementHideEdit(announcement: Notification, i: number) {
        return (
            <div style={{cursor: 'pointer'}} key={JSON.stringify(announcement) + i + 'hideEdit'}>
                <div
                    onClick={() => {
                        const announcementIndex = this.state.announcements.findIndex(
                            m => m.announcementID === announcement.announcementID,
                        );
                        let newAnnouncements = this.state.announcements;
                        newAnnouncements[announcementIndex].selected = !newAnnouncements[
                            announcementIndex
                        ].selected;
                        this.setState({announcements: newAnnouncements});
                    }}
                >
                    <Announcement announcement={announcement} />
                </div>
                <div
                    style={{clear: 'both'}}
                    onClick={() => {
                        const announcementIndex = this.state.announcements.findIndex(
                            m => m.announcementID === announcement.announcementID,
                        );
                        const announcements = this.state.announcements;
                        announcements.forEach(m => (m.showEdit = false));
                        announcements[announcementIndex].showEdit = true;
                        this.setState({
                            editTitle: announcement.header,
                            editBody: announcement.body,
                            selectedAnnouncement: announcement,
                            announcements,
                        });
                    }}
                >
                    <Typography
                        id='edit-announcement-button'
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
