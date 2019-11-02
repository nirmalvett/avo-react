import React, {Component, DragEvent} from 'react';
import {
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Paper,
    Select,
    Typography,
    Popover,
} from '@material-ui/core';
import * as Http from '../Http';
import {Add, Cancel, CheckCircle, Delete, HelpOutline} from '@material-ui/icons';
import {sortFunc} from '../HelperFunctions/Utilities';
import {green, red} from '@material-ui/core/colors';

interface WhitelistProps {
    color: {
        '500': string;
    };
}

interface WhitelistState {
    sections: {
        classID: number;
        name: string;
        whitelist: {
            name: string;
            added: boolean;
        }[];
    }[];
    selectedClass: number;
    highlighted: boolean;
    files: {
        name: string;
        students: string[];
    }[];
    helpOpen: boolean;
    helpAnchorEl: null | Element;
}

export default class Whitelist extends Component<WhitelistProps, WhitelistState> {
    constructor(props: WhitelistProps) {
        super(props);
        this.state = {
            sections: [],
            selectedClass: -1,
            highlighted: false,
            files: [],
            helpOpen: false,
            helpAnchorEl: null,
        };
    }

    componentDidMount() {
        Http.getSections(
            response => {
                this.setState(
                    {
                        sections: response.sections
                            .filter(section => section.role === 'teacher')
                            .map(x => ({
                                classID: x.sectionID,
                                name: x.name,
                                whitelist: [],
                            })),
                    },
                    this.loadWhiteLists,
                );
            },
            () => console.warn('Failed to get available classes'),
        );
    }

    loadWhiteLists = () => {
        this.state.sections.forEach((cls, index) => {
            Http.getSectionWhitelist(
                cls.classID,
                whitelist => this.onReceiveWhitelist(whitelist, index),
                console.warn,
            );
        });
    };

    onReceiveWhitelist = (res: Http.GetSectionWhitelist, index: number) => {
        const whitelist = res.whitelist.sort().map(x => ({name: x, added: true}));
        const sections = [...this.state.sections];
        sections[index] = {...sections[index], whitelist};
        this.setState({sections});
    };

    render() {
        return (
            <div
                id='export-container'
                style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    className='drop-area'
                    id='drop-area'
                    style={{
                        width: '80%',
                        height: '80%',
                        maxWidth: '60ch',
                        flex: 1,
                        padding: '20px',
                        overflowY: 'auto',
                        backgroundColor: this.state.highlighted
                            ? this.props.color['500']
                            : undefined,
                        justifySelf: 'center',
                        alignSelf: 'center',
                    }}
                    onDragEnter={this.highlight}
                    onDragOver={this.highlight}
                    onDragLeave={this.unhighlight}
                    onDrop={this.onDrop}
                >
                    {this.renderClassSelector()}
                    <Typography
                        variant='h6'
                        align='center'
                        style={{marginLeft: -15, padding: '15px', width: '100%'}}
                    >
                        {this.state.selectedClass === -1
                            ? 'Select a class to add students to with OWL export'
                            : 'Drag and drop your CSVs to add students to a class!'}
                    </Typography>
                    {this.displayFiles()}
                    {this.displayWhitelist()}
                </Paper>
                <HelpOutline
                    style={{margin: '5px'}}
                    onMouseEnter={(event: React.MouseEvent<Element, MouseEvent>) =>
                        this.handleShowHelp(event)
                    }
                />
                <Popover
                    open={this.state.helpOpen}
                    anchorEl={this.state.helpAnchorEl}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        onMouseLeave: () => this.handleHideHelp(),
                        style: {padding: '10px', width: '30%'},
                    }}
                >
                    <Typography variant='h5'>Adding students to a class</Typography>
                    <Typography variant='body1'>
                        To add students, select a class, then drag and drop a CSV file onto the drop
                        area. The CSV file's first column should contain the student IDs of the
                        students you wish to add. Please note that the first row is ignored as a
                        header, as well as all other columns, allowing you to directly upload OWL
                        exports.
                    </Typography>
                </Popover>
            </div>
        );
    }

    renderClassSelector() {
        return (
            <FormControl className='export-form-control' fullWidth>
                <InputLabel htmlFor='export-form-control'>Course</InputLabel>
                <Select
                    value={this.state.selectedClass}
                    onChange={this.handleChange}
                    inputProps={{
                        name: 'course',
                        id: 'course-select',
                    }}
                >
                    <MenuItem value={-1}>--Please select a course--</MenuItem>
                    {this.state.sections.map((x, y) => (
                        <MenuItem value={y}>{x.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        );
    }

    handleChange = (e: any) => this.setState({selectedClass: e.target.value});

    displayFiles() {
        const {files} = this.state;
        return (
            <List>
                {files.map((file, index) => (
                    <ListItem key={`file ${file.name} ${index}`}>
                        <ListItemText
                            primary={file.name}
                            secondary={file.students.length + ' students'}
                        />
                        <ListItemSecondaryAction>
                            <IconButton onClick={this.add(index)}>
                                <Add />
                            </IconButton>
                            <IconButton onClick={this.delete(index)}>
                                <Delete />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>
        );
    }

    displayWhitelist() {
        if (this.state.selectedClass === -1) {
            return undefined;
        }
        const whitelist = this.state.sections[this.state.selectedClass].whitelist;
        return (
            <List>
                {whitelist.map((student, index) => (
                    <ListItem key={`whitelist ${student.name} ${index}`}>
                        <ListItemIcon>
                            {student.added ? (
                                <CheckCircle style={{color: green['500']}} />
                            ) : (
                                <Cancel style={{color: red['500']}} />
                            )}
                        </ListItemIcon>
                        <ListItemText primary={student.name} />
                    </ListItem>
                ))}
            </List>
        );
    }

    add = (index: number) => () => {
        // todo: the complexity of this function is too high
        const {selectedClass} = this.state;
        const files = [...this.state.files];
        const deletedFile = files.splice(index, 1)[0];
        const students = deletedFile.students;
        this.setState({files});
        Http.addToWhitelist(
            this.state.sections[selectedClass].classID,
            students,
            () => {
                const sections = [...this.state.sections];
                const cls = (sections[selectedClass] = {...sections[selectedClass]});
                cls.whitelist = [...cls.whitelist];
                for (let i = 0; i < students.length; i++) {
                    const name = students[i] + '@uwo.ca';
                    if (!cls.whitelist.some(c => c.name === name)) {
                        cls.whitelist.push({name, added: true});
                    }
                }
                cls.whitelist.sort(sortFunc(x => x.name));
                this.setState({sections});
            },
            () => {
                this.setState({files: [...this.state.files, deletedFile]});
            },
        );
    };

    delete = (index: number) => () => {
        const files = [...this.state.files];
        files.splice(index, 1);
        this.setState({files});
    };

    highlight = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({highlighted: true});
    };

    onDrop = (e: DragEvent<HTMLDivElement>) => {
        this.handleDrop(e);
        this.unhighlight(e);
    };

    unhighlight = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        this.setState({highlighted: false});
    };

    handleDrop = (e: DragEvent<HTMLDivElement>) => {
        [...e.dataTransfer.files].forEach(file => this.processFile(file));
    };

    processFile(file: any) {
        let reader = new FileReader();
        reader.onload = (e: any) => this.handleFile(file.name, e.target.result);
        reader.readAsText(file);
    }

    handleFile(name: string, contents: string) {
        const students = csvToJSON(contents);
        this.setState({files: [...this.state.files, {name, students}]});
    }

    handleShowHelp = (event: React.MouseEvent<Element, MouseEvent>) => {
        event.stopPropagation();
        event.preventDefault();
        this.setState({helpOpen: true, helpAnchorEl: event.currentTarget});
    };

    handleHideHelp = () => {
        this.setState({helpOpen: false, helpAnchorEl: null});
    };
}

function csvToJSON(csv: string): string[] {
    const body = csv.split('\n').slice(1); // exclude the header
    const emails = body.map(x => x.split(',')[0].trim()); // get the first cell of each row
    return emails.filter(x => x !== ''); // only use non-empty lines
}
