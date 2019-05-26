import React, { Component, Fragment } from "react";
import { Typography, ListItem, List } from "@material-ui/core";
import { isChrome } from "./helpers";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid/Grid";
import Http from "./Http";
import InfiniteCalendar from "react-infinite-calendar";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";

import "react-infinite-calendar/styles.css"; // Make sure to import the default stylesheet
// Or import the input component

var uniqid = require("uniqid");
var today = new Date();
var lastWeek = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() - 7
);
function TabContainer(props) {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}
export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: new Date(),
      notifications: [],
      dueDates: [],
      value: 0
    };
    this.getHome();
  }

  render() {
    const { value } = this.state;
    return (
      <div style={{ margin: "20px", flex: 1, overflowY: "auto" }}>
        <Grid
          container
          direction="column"
          justify="flex-start"
          alignItems="flex-start"
        >
          <Grid container>
            <Grid
              container
              direction="row"
              justify="center"
              alignItems="center"
            >
              <Grid
                item
                xs={12}
                sm={12}
                md={8}
                lg={8}
                style={{
                  maxWidth: "100%",
                  flexBasis: "100%",
                  margin: '5px',
                  padding: '5px'
                }}
              >
                <Grid
                  container
                  direction="column"
                  justify="flex-start"
                  alignItems="flex-start"
                >
                  <Card
                    style={{
                      width: "100%",
                      maxWidth: "100%"
                    }}
                  >
                    <CardContent>
                      <div>
                        <AppBar position="static" color="default">
                          <Tabs
                            value={value}
                            onChange={(value, event) =>
                              this.changeTab(value, event)
                            }
                            indicatorColor="primary"
                            textColor="primary"
                            variant="scrollable"
                            scrollButtons="auto"
                          >
                            <Tab label="Due dates" />
                            <Tab label="Messages" />
                          </Tabs>
                        </AppBar>
                        {value === 0 && (
                          <TabContainer>
                            <Grid
                              container
                              direction="row"
                              justify="flex-start"
                              alignItems="flex-start"
                            >
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                                <InfiniteCalendar
                                  item
                                  onSelect={e => this.handleDateChange(e)}
                                  width={600}
                                  height={400}
                                  selected={today}
                                  minDate={today}
                                  displayOptions={{
                                    // layout: "landscape",
                                    // showOverlay: false,
                                    // showHeader: false,
                                    // shouldHeaderAnimate: false
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                                {this.state.dueDates.map(dd => {
                                  let datesToShow = dd.dueDates.filter(
                                    dueDate => {
                                      let parts = dueDate.dueDate.split(" ");
                                      let month = new Date(
                                        Date.parse(parts[2] + " 1, 2018")
                                      ).getMonth();
                                      let newDate = new Date(
                                        parts[3],
                                        month,
                                        parts[1]
                                      );
                                      return (
                                        newDate.getDate() ===
                                          this.state.selectedDate.getDate() &&
                                        newDate.getMonth() ===
                                          this.state.selectedDate.getMonth() &&
                                        newDate.getFullYear() ===
                                          this.state.selectedDate.getFullYear()
                                      );
                                    }
                                  );
                                  return (
                                    <div key={uniqid()}>
                                      <List>
                                        <ListItem button>
                                          <Typography
                                            variant="display1"
                                            color="textPrimary"
                                          >
                                            {dd.class.name + ":"}
                                          </Typography>
                                        </ListItem>
                                        <br />
                                        {datesToShow.length > 0 ? (
                                          datesToShow.map(dueDate => (
                                            <ListItem key={uniqid()} button>
                                              <Typography
                                                key={uniqid()}
                                                variant="subheading"
                                                color="textPrimary"
                                              >
                                                {dueDate.name +
                                                  " - " +
                                                  dueDate.dueDate}
                                              </Typography>
                                            </ListItem>
                                          ))
                                        ) : (
                                          <ListItem button>
                                            <Typography
                                              key={uniqid()}
                                              variant="subheading"
                                              color="textPrimary"
                                            >
                                              {"No due dates today"}
                                            </Typography>
                                          </ListItem>
                                        )}
                                      </List>

                                      <br />
                                    </div>
                                  );
                                })}
                              </Grid>
                            </Grid>
                          </TabContainer>
                        )}
                        {value === 1 && (
                          <TabContainer>
                            <Grid item xs={12} sm={12} md={12} lg={12}>
                              <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="flex-start"
                              >
                                <List>
                                  {this.state.notifications.map(
                                    (notification, i) => {
                                      return (
                                        <div key={uniqid()}>
                                          <ListItem button>
                                            <Typography
                                              variant="display1"
                                              color="textPrimary"
                                            >
                                              {notification.class.name + ":"}
                                            </Typography>
                                          </ListItem>

                                          <br />
                                          {notification.messages.map(
                                            notification => (
                                              <div key={uniqid()}>
                                                <ListItem button>
                                                  <Typography
                                                    variant="title"
                                                    color="textPrimary"
                                                  >
                                                    {notification.title}
                                                  </Typography>
                                                </ListItem>
                                                <ListItem button>
                                                  <Typography
                                                    variant="subheading"
                                                    color="textPrimary"
                                                  >
                                                    {notification.body}
                                                  </Typography>
                                                </ListItem>
                                                <br />
                                              </div>
                                            )
                                          )}
                                          <br />
                                        </div>
                                      );
                                    }
                                  )}
                                </List>
                              </Grid>
                            </Grid>
                          </TabContainer>
                        )}
                      </div>
                    </CardContent>
                    <CardActions />
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
  changeTab(event, value) {
    this.setState({ value: value });
  }
  getHome() {
    Http.getHome(
      response => {
        this.setState({
          dueDates: response.dueDates,
          notifications: response.messages
        });
      },
      error => {
        console.log(error);
      }
    );
  }
  handleDateChange(date) {
    console.log(date);
    this.setState({ selectedDate: new Date(date) });
  }
  componentDidMount() {
    if (!isChrome()) {
      this.props.showSnackBar(
        "warning",
        "We have detected that you are currently not using " +
          "Google Chrome Browser. This is not recommended as AVO has not been properly tested in your current " +
          "browser and many of the basic functionality may not work.",
        10000000000000
      );
    }
  }
}
