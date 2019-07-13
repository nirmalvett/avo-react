import React, { Component } from "react";
import Typography from "@material-ui/core/es/Typography/Typography";
import { Button, Paper } from "@material-ui/core/es";

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
      style: this.styles.dropArea
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
  }

  render() {
    return (
      // Creates a drop box area where a professor can drag and drop CSV files for processing
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
    );
  }

  // Responsible for displaying the export button if there are files that have been dropped
  displayExport() {
    if (this.state.jsonObjects[0]) {
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
      let fileList = this.state.fileNames.map(name => {
        return <Typography style={{ padding: "5px" }}>{name}</Typography>;
      });
      return (
        <div style={{ overflow: "auto", height: "400px" }}>{fileList}</div>
      );
    }
  }

  // Set up event handlers on the drop box that take care of highlighting
  // when a file is dragged over
  componentDidMount() {
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
    let files = e.dataTransfer.files;
    [...files].forEach(this.processFile);
  }

  // Add the filename to this list and read its contents in to a JSON object
  processFile(file) {
    this.state.fileNames.push(file.name);
    let reader = new FileReader();
    reader.onload = this.fileToJSON;
    reader.readAsText(file);
  }

  // Turns the file into a JSON object and adds that object into the list
  fileToJSON(e) {
    let contents = e.target.result;
    let json = this.csvToJSON(contents);
    this.setState({ jsonObjects: [...this.state.jsonObjects, json] });
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
    let courses = headers.slice(2, headers.length);
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
      for (let j = 0; j < courses.length; j++) {
        // Add the student's marks for each course
        json[listName][name][courses[j]] = line[j];
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
    // Everything after the first 2 columns is a course value
    let courses = headers.slice(2, headers.length);
    let students = json[headers[0]];

    headers[0] = "Jack is the bees knees!!!";
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
    const { convertedFiles, jsonObjects } = this.state;
    let converted = [];
    // Only convert files that have not yet been converted
    for (let i = convertedFiles.length; i < jsonObjects.length; i++) {
      let json = jsonObjects[i];
      let file = this.jsonToCSV(json);
      converted.push(file);
    }
    this.downloadFiles(converted);
    this.setState({ convertedFiles: [...convertedFiles, ...converted] });
  }

  // Causes the browser to start a download by creating a hidden button
  // and clicking it
  downloadFiles(newFiles) {
    const { convertedFiles } = this.state;
    // Create an anchor
    let hiddenDownload = document.createElement("a");
    hiddenDownload.target = "_blank";
    let i = 1;
    // For each file, change the anchor's dowload property and click it
    [...convertedFiles, ...newFiles].forEach(file => {
      hiddenDownload.href = "data:attachment/text," + encodeURI(file);
      hiddenDownload.download = "CSV - Converted " + i + ".csv";
      document.body.appendChild(hiddenDownload);
      hiddenDownload.click();
      document.body.removeChild(hiddenDownload);
      i++;
    });
  }
}

export default ExportTools;
