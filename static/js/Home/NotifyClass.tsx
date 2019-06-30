import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import Http from "../HelperFunctions/Http";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid/Grid";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

export default class NotifyClass extends Component {
  state: any = {
    classes: [],
    selectedClass: { name: "Select class..." },
    selectedClassName: "Select class...",
    addMessageInput: "",
    messageBodyInput: "",
    messages: [],
    deleteMessageIDs: []
  };
  constructor(props) {
    super(props);
    this.getClasses();
  }

  render() {
    console.log(this.state.selectedClass);

    return (
      <div
        style={{
          width: 1000,
          height: 600,
          padding: 25,
          overflow: "hidden",
          marginTop: 0
        }}
      >
        <Card style={{ height: "100%", width: "100%" }}>
          <CardContent>
            <div style={{ height: 500 }}>
              <FormControl style={{ minWidth: 120 }}>
                <InputLabel htmlFor="select-class">Class</InputLabel>
                <Select
                  value={this.state.selectedClass}
                  onChange={e => {
                    this.setState({
                      selectedClass: e.target.value
                    });
                    this.getMessages();
                  }}
                  inputProps={{
                    name: "name",
                    id: "select-class"
                  }}
                >
                  {this.state.classes.map((c, i) => (
                    <MenuItem key={i} value={c}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </CardContent>
          <CardActions style={{ padding: 0 }}>
            <Grid
              container
              direction="row"
              justify="flex-start"
              alignItems="flex-start"
              style={{ margin: 15 }}
            >
              <TextField
                style={{
                  margin: 0,
                  width: 200,
                  marginTop: -12,
                  marginLeft: 10,
                  marginRight: 10
                }}
                id="tag-input"
                label="New message title..."
                value={this.state.addMessageInput}
                onChange={e =>
                  this.setState({ addMessageInput: e.target.value })
                }
                margin="normal"
              />
              <TextField
                style={{
                  margin: 0,
                  width: 200,
                  marginTop: -12,
                  marginLeft: 10,
                  marginRight: 10
                }}
                id="tag-input"
                label="New message body..."
                value={this.state.messageBodyInput}
                onChange={e =>
                  this.setState({ messageBodyInput: e.target.value })
                }
                margin="normal"
              />
              <Button variant="contained" onClick={() => this.addMessage()}>
                Add new message
              </Button>
              <div style={{ padding: 5 }} />

              <div style={{ marginLeft: "auto" }}>
                <Button variant="contained" onClick={() => this.deleteMessages()}>
                  Delete selected messages
                </Button>
              </div>
            </Grid>
          </CardActions>
        </Card>
      </div>
    );
  }
  addMessage() {
    Http.addMessage(
      this.state.selectedClass.id,
      this.state.addMessageInput,
      this.state.messageBodyInput,
      res => {
        console.log(res);
      },
      err => {
        console.log(err);
      }
    );
  }
  deleteMessages() {
    this.state.deleteMessageIDs.forEach(message => {
      Http.deleteMessage(
        message,
        res => {
          console.log(res);
        },
        err => {
          console.log(err);
        }
      );
      const filtered = this.state.messages.filter(m => m.id !== message);
      this.setState({
        messages: filtered
      });
    });
  }
  getClasses() {
    Http.getClasses(
      response => {
        console.log(response);
        this.setState({
          classes: response.classes,
          selectedClass: response.classes[0]
        });
        this.getMessages();
      },
      err => {
        console.log(err);
      }
    );
  }
  getMessages() {
    Http.getMessages(
      this.state.selectedClass.id,
      res => {
        console.log(res);
        this.setState({
          messages: res.messages
        });
      },
      err => {
        console.log(err);
      }
    );
  }
}
