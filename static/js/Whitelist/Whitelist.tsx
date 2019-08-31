import React, {Component, Fragment} from 'react';
import {
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
} from '@material-ui/core';
import * as Http from '../Http';
import {copy} from '../HelperFunctions/Utilities';

interface WhitelistProps {
    color: {
        '500': string;
    };
}

interface WhitelistState {
    highlighted: boolean;
    currentClassId: string;
    showStudents: boolean;
    showResponse: boolean;
    selectedClassStudents: string[]; // email addresses
    loadingClass: boolean;
    selected: string[];

    jsonObjects: {[key: string]: any}; // todo
    availableClasses: {[key: string]: Http.GetClasses_Class};
    responseMap: {[key: string]: string}; // maps users to outcomes when trying to add them
}

export default class Whitelist extends Component<WhitelistProps, WhitelistState> {
    constructor(props: WhitelistProps) {
        super(props);
        this.state = {
            highlighted: false,
            // Dictionary of all class names for the user with keys as IDs
            availableClasses: {},
            currentClassId: '-1',
            // Holds the objects that have been converted to JSON
            jsonObjects: {},
            loadingClass: false,
            // The classIDs of the selected list items
            selected: [],
            showResponse: false,
            responseMap: {},
            showStudents: false,
            selectedClassStudents: [],
        };
    }

    render() {
        return (
            <div
                id='export-container'
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    flexDirection: 'column',
                }}
            >
                <form
                    autoComplete='off'
                    style={{
                        width: '600px',
                        alignSelf: 'center',
                        padding: '15px',
                        flexShrink: 0,
                    }}
                >
                    <FormControl
                        style={{width: '600px', flexShrink: 0}}
                        className='export-form-control'
                    >
                        <InputLabel htmlFor='export-form-control'>Course</InputLabel>
                        <Select
                            value={this.state.currentClassId}
                            onChange={this.handleChange}
                            //   align="center"
                            inputProps={{
                                name: 'course',
                                id: 'course-select',
                            }}
                        >
                            {this.getMenuItems()}
                        </Select>
                    </FormControl>
                </form>
                <Paper
                    className='drop-area'
                    id='drop-area'
                    style={{
                        width: '600px',
                        height: '480px',
                        margin: '50px auto',
                        padding: '20px',
                        flexShrink: 0,
                        overflowY: 'auto',
                        backgroundColor: this.state.highlighted
                            ? this.props.color['500']
                            : undefined,
                    }}
                >
                    <Typography
                        variant='h6'
                        align='center'
                        style={{marginLeft: -15, padding: '15px', width: '100%'}}
                    >
                        {this.state.currentClassId === '-1'
                            ? "Select a class to add student's to with OWL export"
                            : 'Drag and drop your CSVs to add students to a class!'}
                    </Typography>
                    <div style={{width: '100%'}}>
                        {/*Display a spinner while loading class data*/}
                        {this.displaySpinner()}
                        {/*Display the export button and file names only after there is a file to export*/}
                        {this.displayExport()}
                        {this.displayDelete()}
                        {this.displayFiles()}
                    </div>
                </Paper>
            </div>
        );
    }

    getStudentsInWhitelist = (CLASS: string) => {
        console.log(CLASS);
        Http.getClassWhitelist(
            parseInt(CLASS),
            res => {
                console.log(res);
                this.setState({showStudents: true, selectedClassStudents: res.whitelist});
            },
            err => {
                console.log(err);
            },
        );
    };

    handleChange = (e: any) => {
        console.log(e.target.value);
        this.setState({currentClassId: e.target.value, showResponse: false});
        this.getStudentsInWhitelist(e.target.value);
    };

    getMenuItems() {
        const {availableClasses} = this.state;
        // Create the default value
        let items = [
            <MenuItem key={-1} value={-1}>
                --Please select a course--
            </MenuItem>,
        ];
        // Dynamically add the other courses as options from the list of class objects
        items = items.concat(
            Object.keys(availableClasses).map(classId => {
                return (
                    <MenuItem key={classId} value={classId}>
                        {availableClasses[classId]['name']}
                    </MenuItem>
                );
            }),
        );
        return items;
    }

    // Responsible for displaying the spinner if we are loading class data
    displaySpinner() {
        if (this.state.loadingClass) {
            return (
                <Fragment>
                    <CircularProgress color='primary' />
                    <Typography style={{padding: '5px'}}>
                        This may take a little while for larger classes...
                    </Typography>
                </Fragment>
            );
        }
    }

    // Responsible for displaying the export button if there are files that have been dropped
    displayExport() {
        if (!isEmpty(this.state.jsonObjects) && !this.state.loadingClass) {
            return (
                <Button color='primary' variant='contained' onClick={this.downloadFiles}>
                    Add to class
                </Button>
            );
        }
    }

    displayDelete() {
        if (!this.state.loadingClass && this.state.selected.length > 0) {
            return (
                <Button
                    color='primary'
                    variant='contained'
                    style={{display: 'inline', marginLeft: '5px'}}
                    onClick={this.deleteToggled}
                >
                    Delete
                </Button>
            );
        }
    }

    // Responsible for displaying the names of the dropped files
    displayFiles() {
        const {jsonObjects} = this.state;
        // if (!isEmpty(jsonObjects)) {
        let selected = [...this.state.selected];
        let fileList = Object.keys(jsonObjects).map(classId => this.getListItem(classId, selected));

        return (
            <div style={{overflowY: 'auto'}}>
                {fileList}
                <div style={{overflowX: 'hidden'}}>
                    {this.state.showStudents &&
                        this.state.selectedClassStudents.map((student, i) =>
                            i !== 0 ? (
                                <Typography
                                    variant='subtitle1'
                                    align='left'
                                    style={{margin: '15px', width: '100%'}}
                                >
                                    {`${i + 1}. ${student}`}
                                </Typography>
                            ) : (
                                <div>
                                    <Typography variant='h6' align='left'>
                                        Student's allowed to enroll in this class
                                    </Typography>
                                    <Typography
                                        variant='subtitle1'
                                        align='left'
                                        style={{margin: '15px', width: '100%'}}
                                    >
                                        {`${i + 1}. ${student} `}
                                    </Typography>
                                </div>
                            ),
                        )}
                    {this.state.showResponse &&
                        Object.keys(this.state.responseMap).map((key, i) =>
                            i !== 0 ? (
                                <Typography
                                    variant='subtitle1'
                                    align='left'
                                    style={{margin: '15px', width: '100%'}}
                                >
                                    {`${key}: ${this.state.responseMap[key]}`}
                                </Typography>
                            ) : (
                                <div>
                                    <Typography variant='h6' align='left'>
                                        Upload report
                                    </Typography>
                                    <Typography
                                        variant='subtitle1'
                                        align='left'
                                        style={{margin: '15px', width: '100%'}}
                                    >
                                        {`${key}: ${this.state.responseMap[key]}`}
                                    </Typography>
                                </div>
                            ),
                        )}
                </div>
            </div>
        );
    }

    getListItem(classId: string, selected: string[]) {
        let style = selected.includes(classId)
            ? {padding: '5px', paddingLeft: '0px', textDecoration: 'line-through'}
            : {padding: '5px', paddingLeft: '0px'};
        return (
            <Typography
                key={classId}
                style={style}
                onClick={() => this.toggleSelected(classId)}
                variant='subtitle1'
            >
                {this.state.jsonObjects[classId]['name']}
            </Typography>
        );
    }

    toggleSelected(classId: string) {
        const selected = [...this.state.selected];
        if (this.state.selected.includes(classId)) {
            selected.splice(selected.indexOf(classId), 1);
            this.setState({selected: selected});
        } else {
            selected.push(classId);
            this.setState({selected: selected});
        }
    }

    deleteToggled = () => {
        const {selected} = this.state;
        selected.forEach(classId => {
            delete this.state.jsonObjects[classId];
        });
        this.setState({selected: []});
    };

    // Set up event handlers on the drop box that take care of highlighting
    // when a file is dragged over
    componentDidMount() {
        // Get the available classes for the teacher so they can select which classes they will be uploading a CSV for
        Http.getClasses(
            response => {
                // Create a dictionary of class objects with the id as the key
                const classes: {[key: string]: Http.GetClasses_Class} = {};
                response.classes.forEach(classObject => {
                    classes[classObject.classID] = classObject;
                });
                this.setState({availableClasses: classes});
            },
            () => console.warn('Failed to get available classes'),
        );

        let dropArea = document.getElementById('drop-area') as HTMLElement;
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event =>
            dropArea.addEventListener(event, preventDefaults, false),
        );
        dropArea.addEventListener('drop', this.handleDrop, false);
        ['dragenter', 'dragover'].forEach(event =>
            dropArea.addEventListener(event, this.highlight, false),
        );
        ['dragleave', 'drop'].forEach(event =>
            dropArea.addEventListener(event, this.unhighlight, false),
        );
    }

    highlight = () => this.setState({highlighted: true});

    unhighlight = () => this.setState({highlighted: false});

    // Get each file that was dropped and process them
    handleDrop = (e: any) => {
        const {currentClassId} = this.state;
        if (currentClassId !== '-1' && !this.state.loadingClass) {
            let files = e.dataTransfer.files;
            [...files].forEach(file => this.processFile(file, currentClassId));
        }
    };

    // Add the filename to this list and read its contents in to a JSON object
    processFile(file: any, classId: string) {
        let reader = new FileReader();
        reader.onload = e => {
            this.fileToJSON(e, classId);
            let objectsCopy = copy(this.state.jsonObjects);
            const filename = this.state.availableClasses[classId]['name'] + ': ' + file.name;
            const copyOfJsonObjectsClassID = copy(this.state.jsonObjects[classId]);
            copyOfJsonObjectsClassID.name = filename;
            objectsCopy[classId] = copyOfJsonObjectsClassID;
            this.setState({jsonObjects: objectsCopy, showResponse: false});
        };
        reader.readAsText(file);
    }

    // Turns the file into a JSON object and adds that object into the list
    fileToJSON(e: any, classId: string) {
        let contents = e.target.result;
        let json = csvToJSON(contents);
        let jsonObjects = copy(this.state.jsonObjects);
        jsonObjects[classId] = json;
        this.setState({jsonObjects});
    }

    // Starts the conversion of all the new files that have been dropped in, then starts the download of all the converted files
    downloadFiles = () => {
        const {jsonObjects} = this.state;
        Object.keys(jsonObjects).forEach(classID => {
            const studentsToAdd = jsonObjects[classID]['Student ID'];
            const responseMap: {[user: string]: string} = {};
            Object.keys(studentsToAdd).forEach(student => {
                Http.addStudentsToWhitelist(
                    Number(this.state.currentClassId),
                    student,
                    () => {
                        responseMap[student] = 'User added to class!';
                        if (Object.keys(responseMap).length === Object.keys(studentsToAdd).length) {
                            this.setState({responseMap, showResponse: true}, () =>
                                this.getStudentsInWhitelist(this.state.currentClassId),
                            );
                        }
                    },
                    ({error}) => {
                        responseMap[student] = error;
                        if (Object.keys(responseMap).length === Object.keys(studentsToAdd).length) {
                            this.setState({responseMap, showResponse: true}, () =>
                                this.getStudentsInWhitelist(this.state.currentClassId),
                            );
                        }
                    },
                );
            });
        });
    };
}

function isEmpty(object: object) {
    return object.constructor === Object && Object.keys(object).length === 0;
}

function preventDefaults(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

function csvToJSON(csv: string): string[] {
    const body = csv.split('\n').slice(1); // exclude the header
    const emails = body.map(x => x.split(',')[0].trim()); // get the first cell of each row
    return emails.filter(x => x !== ''); // only use non-empty lines
}
