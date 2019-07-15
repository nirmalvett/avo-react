import React, { Component } from "react";
import Typography from "@material-ui/core/es/Typography/Typography";
import { Button, Paper } from "@material-ui/core/es";
import Http from "../HelperFunctions/Http";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";

class ExportTools extends Component {
  constructor(props) {
    super(props);
    this.styles = {
      dropArea: {
        width: "600px",
        height: "480px",
        margin: "50px auto",
        padding: "20px"
      },
      highlighted: {
        width: "600px",
        height: "480px",
        margin: "50px auto",
        padding: "20px",
        backgroundColor: props.theme.color["500"]
      }
    };

    this.state = {
      fileNames: [],
      convertedFiles: [],
      jsonObjects: [],
      style: this.styles.dropArea,
      availableClasses: [],
      currentClassId: -1,
      classData: {},
      convertedFiles2: {},
      jsonObjects2: {}
    };

    // Bindings
    this.setState = this.setState.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.processFile = this.processFile.bind(this);
    this.highlight = this.highlight.bind(this);
    this.unhighlight = this.unhighlight.bind(this);
    this.csvToJSON = this.csvToJSON.bind(this);
    this.fileToJSON = this.fileToJSON.bind(this);
    this.downloadFiles = this.downloadFiles.bind(this);
    this.exportFiles = this.exportFiles.bind(this);
    this.getMenuItems = this.getMenuItems.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.fetchClassData = this.fetchClassData.bind(this);
  }

  render() {
    return (
      <div id="export-container" style={{ width: "100%", height: "100%" }}>
        <form autoComplete="off">
          <FormControl
            style={{ width: "600px" }}
            className="export-form-control"
          >
            <InputLabel htmlFor="export-form-control">Course</InputLabel>
            <Select
              value={this.state.currentClassId}
              onChange={this.handleChange}
              align="center"
              inputProps={{
                name: "course",
                id: "course-select"
              }}
            >
              {this.getMenuItems()}
            </Select>
          </FormControl>
        </form>
        <Paper className="drop-area" id="drop-area" style={this.state.style}>
          <Typography
            variant="title"
            align="center"
            style={{ margin: "15px", width: "100%" }}
          >
            Drag and drop your CSVs here to be processed
          </Typography>
          <div style={{ width: "200px", padding: "20px" }}>
            {/*Display the export button and file names only after there is a file to export*/}
            {this.displayExport()}
            {this.displayFiles()}
          </div>
        </Paper>
      </div>
    );
  }

  // Uses XHR to return the marks from our system (in CSV format) and returns a JSON object with that data
  fetchClassData(classid) {
    let url = "/CSV/ClassMarks/" + classid;
    console.log(url);
    const http = new XMLHttpRequest();
    http.open("GET", url, true);
    http.onreadystatechange = () => {
      if (http.readyState === 4 && http.status === 200) {
        try {
          // Update the dictionary with an entry for this class (using the ID) whose value is a JSON
          // representation of the class data
          console.log("Getting class data");
          this.state.classData[classid] = this.csvToJSON(http.responseText);
        } catch (e) {
          console.warn(`Error on ${url}: ${e}`);
        }
      }
    };
    http.send();
  }

  handleChange(event) {
    this.setState({ currentClassId: event.target.value });
  }

  getMenuItems() {
    const { availableClasses } = this.state;
    // Create the default value
    let items = [<MenuItem value={-1}>--Please select a course--</MenuItem>];
    // Dynamically add the other courses as options from the list of class objects
    items = items.concat(
      availableClasses.map(classObj => {
        return <MenuItem value={classObj.id}>{classObj.name}</MenuItem>;
      })
    );
    return items;
  }

  // Responsible for displaying the export button if there are files that have been dropped
  displayExport() {
    //if (this.state.jsonObjects[0]) {
    if (!this.isEmpty(this.state.jsonObjects2)) {
      return (
        <Button color="primary" variant="contained" onClick={this.exportFiles}>
          Export
        </Button>
      );
    }
  }

  // Responsible for displaying the names of the dropped files
  displayFiles() {
    if (this.state.fileNames[0]) {
      let fileList = this.state.fileNames.map((name, i) => {
        return (
          <Typography key={i} style={{ padding: "5px" }}>
            {name}
          </Typography>
        );
      });
      return (
        <div style={{ overflow: "auto", height: "400px" }}>{fileList}</div>
      );
    }
  }

  // Set up event handlers on the drop box that take care of highlighting
  // when a file is dragged over
  componentDidMount() {
    // Get the available classes for the teacher so they can select which classes they will be uploading a CSV for
    Http.getClasses(
      response => this.setState({ availableClasses: response.classes }),
      this.setState({ availableClasses: [] })
    );

    let dropArea = document.getElementById("drop-area");
    ["dragenter", "dragover", "dragleave", "drop"].forEach(event =>
      dropArea.addEventListener(event, this.preventDefaults, false)
    );
    dropArea.addEventListener("drop", this.handleDrop, false);
    ["dragenter", "dragover"].forEach(event =>
      dropArea.addEventListener(event, this.highlight, false)
    );
    ["dragleave", "drop"].forEach(event =>
      dropArea.addEventListener(event, this.unhighlight, false)
    );
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(e) {
    this.setState({ style: this.styles.highlighted });
  }

  unhighlight(e) {
    this.setState({ style: this.styles.dropArea });
  }

  // Get each file that was dropped and process them
  handleDrop(e) {
    const { currentClassId, classData } = this.state;
    if (currentClassId !== -1) {
      let files = e.dataTransfer.files;
      [...files].forEach(file => this.processFile(file, currentClassId));
      if (!(currentClassId in classData)) {
        this.fetchClassData(currentClassId);
      }
    }
  }

  // Add the filename to this list and read its contents in to a JSON object
  processFile(file, classId) {
    let reader = new FileReader();
    reader.onload = e => this.fileToJSON(e, classId);
    reader.readAsText(file);
    this.setState({ fileNames: [...this.state.fileNames, file.name] });
  }

  // Turns the file into a JSON object and adds that object into the list
  fileToJSON(e, classId) {
    let contents = e.target.result;
    let json = this.csvToJSON(contents);
    // this.setState({ jsonObjects: [...this.state.jsonObjects, json] });
    let copy = { ...this.state.jsonObjects2 };
    copy[classId] = json;
    this.setState({ jsonObjects2: copy });
  }

  // The logic for processing a CSV in the browser and turning it into a
  // JSON object
  csvToJSON(csv) {
    let lines = csv.split("\n");
    let headers = lines[0].split(",").map(header => header.trim());
    let json = {};
    // Headers stored for easy reference
    json.headers = headers;
    // This will be the object where the student data is stored
    let listName = headers[0];
    // assessment start index is a variable used to dynamically find where the assessment grades
    // start. This is needed due to the way OWL exports CSVs with the second column blank
    let assessmentStartIndex = 1;
    if (headers[1] === "") {
      assessmentStartIndex++;
    }
    let assessments = headers.slice(assessmentStartIndex, headers.length);
    // Eliminate empty elements
    if (lines[lines.length - 1] === "") {
      lines.pop();
    }
    json[listName] = {};
    for (let i = 1; i < lines.length; i++) {
      // Trim each value
      let line = lines[i].split(",").map(value => value.trim());
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
    return json;
  }

  // The logic for taking a JSON object and converting back into a CSV in the browser
  jsonToCSV(json) {
    let headers = json.headers;
    // If there are no headers, then don't bother making a file
    if (headers.length === 0) {
      return "";
    }
    // Everything after the first 2 columns is an assessment value
    let courses = headers.slice(2, headers.length);
    let students = json[headers[0]];

    // Headers of the CSV
    let file = headers.toString() + "\n";

    for (const student in students) {
      // Add the student's name and a blank space for OWL
      file += student + ",";
      courses.forEach(course => {
        // The first comma completes the blank and seperates the rest of the values

        // Check that the course has a corresponding value
        if (
          students[student].hasOwnProperty(course) &&
          students[student][course] !== null &&
          students[student][course] !== undefined
        ) {
          file += "," + students[student][course];
        } else {
          file += ",";
        }
      });
      file += "\n";
    }
    return file;
  }

  // Starts the conversion of all the new files that have been dropped in, then
  // then starts the download of all the converted files
  exportFiles() {
    const { convertedFiles2, jsonObjects2, classData } = this.state;
    // let converted = [];
    // Only convert files that have not yet been converted
    // for (let i = convertedFiles.length; i < jsonObjects.length; i++) {
    //   let json = jsonObjects[i];
    //   let file = this.jsonToCSV(json);
    //   converted.push(file);
    // }

    // this.downloadFiles(converted);
    // this.setState({ convertedFiles: [...convertedFiles, ...converted] });

    for (let file in jsonObjects2) {
      if (jsonObjects2.hasOwnProperty(file)) {
        if (!(file in convertedFiles2)) {
          let merged = this.merge(jsonObjects2[file], classData[file]);
          let convertedFile = this.jsonToCSV(merged);
          convertedFiles2[file] = convertedFile;
        }
      }
    }
    this.downloadFiles();
  }

  // Causes the browser to start a download by creating a hidden button
  // and clicking it
  // downloadFiles(newFiles) {
  //   const { convertedFiles } = this.state;
  //   // Create an anchor
  // let hiddenDownload = document.createElement("a");
  // hiddenDownload.target = "_blank";
  //   let i = 1;
  //   // For each file, change the anchor's dowload property and click it
  //   [...convertedFiles, ...newFiles].forEach(file => {
  // hiddenDownload.href = "data:attachment/text," + encodeURI(file);
  // hiddenDownload.download = "CSV - Converted " + i + ".csv";
  // document.body.appendChild(hiddenDownload);
  // hiddenDownload.click();
  // document.body.removeChild(hiddenDownload);
  //   i++;
  // });
  // }

  downloadFiles() {
    const { convertedFiles2 } = this.state;

    let hiddenDownload = document.createElement("a");
    hiddenDownload.target = "_blank";

    let i = 1;
    for (let file in convertedFiles2) {
      hiddenDownload.href =
        "data:attachment/text," + encodeURI(convertedFiles2[file]);
      hiddenDownload.download = "CSV - Converted " + i + ".csv";
      document.body.appendChild(hiddenDownload);
      hiddenDownload.click();
      document.body.removeChild(hiddenDownload);
      i++;
    }
  }

  // We use the OWL data as the master and append everything to it from the avoObject
  merge(owlObject, avoObject) {
    let merge = JSON.parse(JSON.stringify(owlObject));
    merge.headers = merge.headers.concat(avoObject.headers.slice(1, avoObject["headers"].length));
    for (let email in avoObject['"Email"']) {
      // Start from 1 to get rid of the quotes in the email address
      let studentId = email.substr(1, email.indexOf("@") - 1);
      // If the studentId is in the corresponding OWL object
      if (studentId in owlObject["Student ID"]) {
        // Check every assessment on the AVO side
        for (let assessment in avoObject['"Email"'][email]) {
          let assessmentGrade = avoObject['"Email"'][email][assessment];
          if (assessmentGrade === undefined || assessmentGrade === "Test Not Taken") assessmentGrade = "0";
          else {
            let score = assessmentGrade.substring(0, assessmentGrade.indexOf('/') - 1);
            let divisor = assessmentGrade.substring(assessmentGrade.indexOf('/') + 2, assessmentGrade.length);
            assessmentGrade = Math.round((parseFloat(score) / parseFloat(divisor) * 10000)) / 100;
          }
          merge["Student ID"][studentId][assessment] = assessmentGrade;
        }
      }
    }
    return merge;
  }

  isEmpty(object) {
    return Object.keys(object).length === 0 && object.constructor === Object;
  }
}

export default ExportTools;
