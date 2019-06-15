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
      <Paper className="drop-area" id="drop-area" style={this.state.style}>
        <Typography
          variant="title"
          align="center"
          style={{ margin: "15px", width: "100%" }}
        >
          Drag and drop your CSVs here to be processed
        </Typography>
        <div style={{ width: "200px", padding: "20px" }}>
          {this.displayExport()}
          {this.displayFiles()}
        </div>
      </Paper>
    );
  }

  displayExport() {
    if (this.state.jsonObjects[0]) {
      return (
        <Button color="primary" variant="contained" onClick={this.exportFiles}>
          Export
        </Button>
      );
    }
  }

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

  handleDrop(e) {
    let files = e.dataTransfer.files;
    [...files].forEach(this.processFile);
  }

  processFile(file) {
    this.state.fileNames.push(file.name);
    let reader = new FileReader();
    reader.onload = this.fileToJSON;
    reader.readAsText(file);
  }

  fileToJSON(e) {
    let contents = e.target.result;
    let json = this.csvToJSON(contents);
    this.setState({ jsonObjects: [...this.state.jsonObjects, json] });
  }

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
      let line = lines[i].split(",").map(value => value.trim());
      let name = line.shift();
      // Remove blank column added by OWL
      line.shift();
      json[listName][name] = {};
      for (let j = 0; j < courses.length; j++) {
        json[listName][name][courses[j]] = line[j];
      }
    }
    return json;
  }

  jsonToCSV(json) {
    let headers = json.headers;
    // If there are no headers, then don't bother making a file
    if (headers.length === 0) {
      return "";
    }
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

  downloadFiles(newFiles) {
    const { convertedFiles } = this.state;
    let hiddenDownload = document.createElement("a");
    hiddenDownload.target = "_blank";
    let i = 1;
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
