import React, {Component} from 'react';
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
import * as ExcelJS from 'exceljs/dist/exceljs.js';
import {saveAs} from 'file-saver';

export default class ExportTools extends Component {
    constructor(props) {
        super(props);
        this.styles = {
            dropArea: {
                width: '600px',
                height: '480px',
                margin: '50px auto',
                padding: '20px',
                flexShrink: '0',
            },
            highlighted: {
                width: '600px',
                height: '480px',
                margin: '50px auto',
                padding: '20px',
                flexShrink: '0',
                backgroundColor: props.theme.color['500'],
            },
        };

        this.state = {
            style: this.styles.dropArea,
            // Dictionary of all class names for the user with keys as IDs
            availableClasses: {},
            currentClassId: -1,
            // Dictionary that holds objects that represent classes
            classData: {},
            // Holds the files ready for export
            csvObjects: {},
            //Holds the XLSX objects
            xlsxObjects: {},
            // Holds the objects that have been converted to JSON
            jsonObjects: {},
            loadingClass: false,
            // The classIDs of the selected list items
            selected: [],
            // Can be csv or xlsx
            filetype: 'csv',
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
                        flexShrink: '0',
                    }}
                >
                    <FormControl
                        style={{width: '600px', flexShrink: '0'}}
                        className='export-form-control'
                    >
                        <InputLabel htmlFor='export-form-control'>Course</InputLabel>
                        <Select
                            value={this.state.currentClassId}
                            onChange={this.handleCourseChange}
                            align='center'
                            inputProps={{
                                name: 'course',
                                id: 'course-select',
                            }}
                        >
                            {this.getMenuItems()}
                        </Select>
                    </FormControl>
                    <FormControl
                        style={{width: '600px', flexShrink: '0'}}
                        className='filetype-control'
                    >
                        <InputLabel htmlFor='filetype-control'>File Type</InputLabel>
                        <Select
                            value={this.state.filetype}
                            onChange={this.handleFiletypeChange}
                            align='center'
                            inputProps={{
                                name: 'filetype',
                                id: 'filetype-select',
                            }}
                        >
                            <MenuItem key='csv' value='csv'>
                                CSV
                            </MenuItem>
                            <MenuItem key='xlsx' value='xlsx'>
                                XLSX
                            </MenuItem>
                        </Select>
                    </FormControl>
                </form>
                <Paper className='drop-area' id='drop-area' style={this.state.style}>
                    <Typography
                        variant='title'
                        align='center'
                        style={{margin: '15px', width: '100%'}}
                    >
                        Drag and drop your CSVs here to be processed
                    </Typography>
                    <div style={{width: '300px', padding: '20px'}}>
                        {/*Display a spinner while loading class data*/}
                        {this.displaySpinner()}
                        {/*Display the export button and file names only after there is a file to export*/}
                        {this.displayExport()}
                        {this.displayDelete()}
                        {this.displayFiles()}
                    </div>
                </Paper>
                {this.displayLegend()}
            </div>
        );
    }

    // Uses XHR to return the marks from our system (in CSV format) and returns a JSON object with that data
    fetchClassData = classid => {
        let url = '/CSV/ClassMarks/' + classid;
        console.log(url);
        const http = new XMLHttpRequest();
        http.open('GET', url, true);
        http.onreadystatechange = () => {
            if (http.readyState === 4 && http.status === 200) {
                try {
                    // Update the dictionary with an entry for this class (using the ID) whose value is a JSON
                    // representation of the class data
                    this.state.classData[classid] = this.csvToJSON(http.responseText);
                    this.setState({loadingClass: false});
                } catch (e) {
                    console.warn(`Error on ${url}: ${e}`);
                }
            }
        };
        http.send();
        this.setState({loadingClass: true});
    };

    handleCourseChange = event => {
        this.setState({currentClassId: event.target.value});
    };

    handleFiletypeChange = event => {
        this.setState({filetype: event.target.value});
    };

    getMenuItems = () => {
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
    };

    // Responsible for displaying the spinner if we are loading class data
    displaySpinner = () => {
        if (this.state.loadingClass) {
            return (
                <React.Fragment>
                    <CircularProgress color='primary' />
                    <Typography style={{padding: '5px'}}>
                        This may take a little while for larger classes...
                    </Typography>
                </React.Fragment>
            );
        }
    };

    // Responsible for displaying the export button if there are files that have been dropped
    displayExport = () => {
        if (!this.isEmpty(this.state.jsonObjects) && !this.state.loadingClass) {
            return (
                <Button color='primary' variant='contained' onClick={this.exportFiles}>
                    Export
                </Button>
            );
        }
    };

    displayDelete = () => {
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
    };

    // Responsible for displaying the names of the dropped files
    displayFiles = () => {
        const {jsonObjects} = this.state;
        if (!this.isEmpty(jsonObjects)) {
            let selected = [...this.state.selected];
            let fileList = Object.keys(jsonObjects).map(classId =>
                this.getListItem(classId, selected),
            );

            return <div style={{overflow: 'auto', height: '400px'}}>{fileList}</div>;
        }
    };

    getListItem = (classId, selected) => {
        let style = selected.includes(classId)
            ? {padding: '5px', paddingLeft: '0px', textDecoration: 'line-through'}
            : {padding: '5px', paddingLeft: '0px'};
        return (
            <Typography
                key={classId}
                style={style}
                onClick={() => this.toggleSelected(classId)}
                variant='subheading'
            >
                {this.state.jsonObjects[classId]['name']}
            </Typography>
        );
    };

    displayLegend = () => {
        if (this.state.filetype === 'xlsx') {
            return (
                <div
                    style={{
                        display: 'flex',
                        alignSelf: 'right',
                        alignContent: 'center',
                        margin: 'auto',
                    }}
                >
                    <span
                        style={{
                            backgroundColor: '#399103',
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                        }}
                    />
                    <Typography style={{display: 'block', padding: '5px'}}>
                        Student in AVO and in OWL
                    </Typography>
                    <span
                        style={{
                            backgroundColor: '#FFFF00',
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                        }}
                    />
                    <Typography style={{display: 'block', padding: '5px'}}>
                        Student in AVO and in OWL but has not taken AVO tests
                    </Typography>
                    <span
                        style={{
                            backgroundColor: '#FF1A1A',
                            display: 'inline-block',
                            width: '20px',
                            height: '20px',
                        }}
                    />
                    <Typography style={{display: 'block', padding: '5px'}}>
                        Student not in AVO
                    </Typography>
                </div>
            );
        }
    };

    toggleSelected = classId => {
        let copy = [...this.state.selected];
        if (this.state.selected.includes(classId)) {
            copy.splice(copy.indexOf(classId), 1);
            this.setState({selected: copy});
        } else {
            copy.push(classId);
            this.setState({selected: copy});
        }
    };

    deleteToggled = () => {
        const {selected} = this.state;
        selected.forEach(classId => {
            delete this.state.jsonObjects[classId];
            delete this.state.csvObjects[classId];
        });
        this.setState({selected: []});
    };

    // Set up event handlers on the drop box that take care of highlighting
    // when a file is dragged over
    componentDidMount = () => {
        // Get the available classes for the teacher so they can select which classes they will be uploading a CSV for
        Http.getClasses(
            response => {
                // Create a dictionary of class objects with the id as the key
                let classes = {};
                response.classes.forEach(classObject => {
                    classes[classObject.id] = classObject;
                });
                this.setState({availableClasses: classes});
            },
            () => console.warn('Failed to get available classes'),
        );

        let dropArea = document.getElementById('drop-area');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event =>
            dropArea.addEventListener(event, this.preventDefaults, false),
        );
        dropArea.addEventListener('drop', this.handleDrop, false);
        ['dragenter', 'dragover'].forEach(event =>
            dropArea.addEventListener(event, this.highlight, false),
        );
        ['dragleave', 'drop'].forEach(event =>
            dropArea.addEventListener(event, this.unhighlight, false),
        );
    };

    preventDefaults = e => {
        e.preventDefault();
        e.stopPropagation();
    };

    highlight = e => {
        this.setState({style: this.styles.highlighted});
    };

    unhighlight = e => {
        this.setState({style: this.styles.dropArea});
    };

    // Get each file that was dropped and process them
    handleDrop = e => {
        const {currentClassId, classData} = this.state;
        if (currentClassId !== -1 && !this.state.loadingClass) {
            let files = e.dataTransfer.files;
            [...files].forEach(file => this.processFile(file, currentClassId));
            // Fetch the class data from the server if it is not cached locally
            if (!(currentClassId in classData)) {
                this.fetchClassData(currentClassId);
            }
        }
    };

    // Add the filename to this list and read its contents in to a JSON object
    processFile = (file, classId) => {
        let reader = new FileReader();
        reader.onload = e => {
            this.fileToJSON(e, classId);
            let objectsCopy = JSON.parse(JSON.stringify(this.state.jsonObjects));
            const filename = this.state.availableClasses[classId]['name'] + ': ' + file.name;
            let copy = JSON.parse(JSON.stringify(this.state.jsonObjects[classId]));
            copy.name = filename;
            objectsCopy[classId] = copy;
            this.setState({jsonObjects: objectsCopy});
        };
        reader.readAsText(file);
    };

    // Turns the file into a JSON object and adds that object into the list
    fileToJSON = (e, classId) => {
        let contents = e.target.result;
        let json = this.csvToJSON(contents);
        // this.setState({ jsonObjects: [...this.state.jsonObjects, json] });
        let copy = JSON.parse(JSON.stringify(this.state.jsonObjects));
        copy[classId] = json;
        this.setState({jsonObjects: copy});
    };

    // The logic for processing a CSV in the browser and turning it into a
    // JSON object
    csvToJSON = csv => {
        let lines = csv.split('\n');
        let headers = lines[0].split(',').map(header => header.trim());
        let json = {};
        // Headers stored for easy reference
        json.headers = headers;
        // This will be the object where the student data is stored
        let listName = headers[0];
        // assessment start index is a variable used to dynamically find where the assessment grades
        // start. This is needed due to the way OWL exports CSVs with the second column blank
        let assessmentStartIndex = 1;
        if (headers[1] === '') {
            assessmentStartIndex++;
        }
        let assessments = headers.slice(assessmentStartIndex, headers.length);
        // Eliminate empty elements
        if (lines[lines.length - 1] === '') {
            lines.pop();
        }
        json[listName] = {};
        for (let i = 1; i < lines.length; i++) {
            // Trim each value
            let line = lines[i].split(',').map(value => value.trim());
            let name = line.shift();
            // Remove blank column added by OWL
            line.shift();
            // Create a new object within the outer object to represent a student
            json[listName][name] = {};
            for (let j = 0; j < assessments.length; j++) {
                // Add the student's marks for each course
                json[listName][name][assessments[j]] = line[j];
            }
        }
        console.log(JSON.stringify(json));
        return json;
    };

    // The logic for taking a JSON object and converting back into a CSV in the browser
    jsonToCSV = json => {
        let headers = json.headers;
        // If there are no headers, then don't bother making a file
        if (headers.length === 0) {
            return '';
        }
        // Everything after the first 2 columns is an assessment value
        let courses = headers.slice(2, headers.length);
        let students = json[headers[0]];

        // Headers of the CSV
        let file = headers.toString() + '\n';

        for (const student in students) {
            // Add the student's name and a blank space for OWL
            file += student + ',';
            courses.forEach(course => {
                // The first comma completes the blank and seperates the rest of the values

                // Check that the course has a corresponding value
                if (
                    students[student].hasOwnProperty(course) &&
                    students[student][course] !== null &&
                    students[student][course] !== undefined
                ) {
                    file += ',' + students[student][course];
                } else {
                    file += ',';
                }
            });
            file += '\n';
        }
        return file;
    };

    createXLSX = json => {
        let workbook = new ExcelJS.Workbook();
        workbook.creator = 'AVO';
        workbook.created = new Date();
        workbook.modified = new Date();

        let sheet = workbook.addWorksheet('Marks');
        sheet.addRow(json.headers);

        let rowNum = 2;
        for (const student in json['Student ID']) {
            let row = [];
            row.push(student);
            row.push('');
            for (const test in json['Student ID'][student]) {
                row.push(json['Student ID'][student][test]);
            }
            sheet.addRow(row);
            sheet.getRow(rowNum).eachCell((cell, _) => {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: this.getColour(json['Student ID'][student]['Status']),
                };
            });
            rowNum++;
        }
        return workbook;
    };

    // Returns the background colour for the excel file based off of the student's status
    // The colour format is A(lpha)RGB
    getColour = id => {
        switch (id) {
            case 0:
                return {argb: 'FFFFFF00'};
            case 1:
                return {argb: 'FF399103'};
            case 2:
                return {argb: 'FFFF1A1A'};
            default:
                return {argb: 'FFB30000'};
        }
    };

    // Starts the conversion of all the new files that have been dropped in, then
    // then starts the download of all the converted files
    exportFiles = () => {
        const {csvObjects, jsonObjects, classData, xlsxObjects} = this.state;

        for (const file in jsonObjects) {
            if (!(file in csvObjects)) {
                let merged = this.merge(jsonObjects[file], classData[file]);
                csvObjects[file] = this.jsonToCSV(merged);
                xlsxObjects[file] = this.createXLSX(merged);
            }
        }
        this.downloadFiles();
    };

    downloadFiles = () => {
        const {csvObjects, jsonObjects, xlsxObjects} = this.state;

        if (this.state.filetype === 'csv') {
            for (const classId in csvObjects) {
                // Dowload the file with the naming convention, coursename - csv name
                saveAs(
                    new Blob([csvObjects[classId]]),
                    this.removeFileExtension(jsonObjects[classId]['name']).replace(':', ' -') +
                        '.csv',
                );
            }
        } else {
            for (const classId in xlsxObjects) {
                xlsxObjects[classId].xlsx.writeBuffer().then(buffer => {
                    saveAs(
                        new Blob([buffer]),
                        this.removeFileExtension(jsonObjects[classId]['name']).replace(':', ' -') +
                            '.xlsx',
                    );
                });
            }
        }
    };

    // We use the OWL data as the master and append everything to it from the avoObject
    // We also set a status for the student as follows:
    // 0 - Student is in AVO/OWL and has not taken any tests
    // 1 - Student is in AVO/OWL and has taken tests
    // 2 - Student is in OWL but not in AVO
    merge = (owlObject, avoObject) => {
        let merge = JSON.parse(JSON.stringify(owlObject));
        merge.headers = merge.headers.concat(
            avoObject.headers.slice(1, avoObject['headers'].length),
        );
        //for (const email in avoObject['"Email"']) {
        for (const studentId in owlObject['Student ID']) {
            // Start from 1 to get rid of the quotes in the email address
            //const studentId = email.substr(1, email.indexOf("@") - 1);
            const email = '"' + studentId + '@uwo.ca"';
            // If the studentId is in the corresponding OWL object
            if (email in avoObject['"Email"']) {
                // Student is in OWL and AVO
                let status = 0;
                // Check every assessment on the AVO side
                for (const assessment in avoObject['"Email"'][email]) {
                    let assessmentGrade = avoObject['"Email"'][email][assessment];
                    if (assessmentGrade === undefined || assessmentGrade === 'Test Not Taken')
                        assessmentGrade = '0';
                    else {
                        const score = assessmentGrade.substring(
                            0,
                            assessmentGrade.indexOf('/') - 1,
                        );
                        const divisor = assessmentGrade.substring(
                            assessmentGrade.indexOf('/') + 2,
                            assessmentGrade.length,
                        );
                        assessmentGrade =
                            Math.round((parseFloat(score) / parseFloat(divisor)) * 10000) / 100;
                        // Update their status as they have taken at least one test
                        status = 1;
                    }

                    // Update their status as they are in AVO and OWL
                    // Do this after so as to not increase the loop size
                    merge['Student ID'][studentId]['Status'] = status;
                    merge['Student ID'][studentId][assessment] = assessmentGrade;
                }
            } else {
                // The student is in OWL but not in AVO
                merge['Student ID'][studentId]['Status'] = 2;
            }
        }
        return merge;
    };

    isEmpty = object => {
        return Object.keys(object).length === 0 && object.constructor === Object;
    };

    removeFileExtension = filename => {
        let reversed = filename.split('');
        reversed = reversed.reverse();
        let period = reversed.indexOf('.');
        let trimmed = reversed.splice(0, period + 1, '');
        return reversed.reverse().join('');
    };
}
