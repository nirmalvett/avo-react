import React, { Component } from "react";
import { Typography, ListItem, List } from "@material-ui/core";
import { isChrome } from "../HelperFunctions/Helpers";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Grid from "@material-ui/core/Grid/Grid";
import Http from "../HelperFunctions/Http";
import InfiniteCalendar from "react-infinite-calendar";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import "react-infinite-calendar/styles.css"; // Make sure to import the default stylesheet
import * as uniqid from "uniqid";
import * as moment from "moment";
import {
  DueDate,
  DueDatesResponse,
  GetHomeResponse,
  HomescreenProps,
  HomescreenState,
  MessagesResponse,
  Notfication
} from '../Models';
// Or import the input component
let today = new Date();
function TabContainer(props): any {
  return (
    <Typography component="div" style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

export default class HomePage extends Component<HomescreenProps, HomescreenState> {
  state: HomescreenState = {
    selectedDate: new Date(),
    notifications: [],
    dueDates: [],
    value: 0,
    calendarTheme: {
      accentColor: this.props.color["500"],
      floatingNav: {
        background: this.props.color["500"],
        chevron: "#FFA726",
        color: "#FFF"
      },
      headerColor: this.props.color["500"],
      selectionColor: this.props.color["500"],
      textColor: {
        active: "#FFF",
        default: "#333"
      },
      todayColor: this.props.color["200"],
      weekdayColor: this.props.color["200"]
    }
  };
  constructor(props: HomescreenProps) {
    super(props);
    console.log(this.props.color);
  }
  componentWillMount() {
    Http.getHome(
      (response: GetHomeResponse) => {
        console.log(response);
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

  render() {
    const { value } = this.state;
    const notifications = this.state.notifications.map((notification: MessagesResponse) => {
      return (
        <div>
          <ListItem
            button
            onClick={() => this.props.jumpToClass(notification.class.id)}
          >
            <Typography variant="h4" color="textPrimary">
              {notification.class.name + ":"}
            </Typography>
          </ListItem>

          <br />
          {notification.messages.map((notificationMsg: Notfication) => (
            <div
              key={uniqid()}
              onClick={() => this.props.jumpToClass(notification.class.id)}
            >
              <ListItem button>
                <Typography variant="h4" color="textPrimary">
                  {notificationMsg.title}
                </Typography>
              </ListItem>
              <ListItem button>
                <Typography variant="body1" color="textPrimary">
                  {notificationMsg.body}
                </Typography>
              </ListItem>
              <br />
            </div>
          ))}
          <br />
        </div>
      );
    });
    const dueDates = this.state.dueDates.map((dd: DueDatesResponse, i) => {
      let datesToShow: DueDate[] = [];
      if (dd.dueDates !== undefined) {
        datesToShow = dd.dueDates.filter((dueDate: DueDate) =>
          moment(new Date(dueDate.dueDate.substring(0, 16)))
            .endOf("day")
            .isSame(moment(this.state.selectedDate).endOf("day"))
        );
      }
      return (
        <List key={i}>
          <ListItem button onClick={() => this.props.jumpToClass(dd.class.id)}>
            <Typography variant="h4" color="textPrimary">
              {dd.class.name + ":"}
            </Typography>
          </ListItem>
          <br />
          {datesToShow.length > 0 ? (
            datesToShow.map((dueDate: DueDate) => (
              <ListItem
                key={uniqid()}
                button
                onClick={() => this.props.jumpToSet(dd.class.id, dueDate.id)}
              >
                <Typography variant="body1" color="textPrimary">
                  {dueDate.name + " - " + dueDate.dueDate}
                </Typography>
              </ListItem>
            ))
          ) : (
            <ListItem
              button
              onClick={() => this.props.jumpToClass(dd.class.id)}
            >
              <Typography variant="body1" color="textPrimary">
                {"No due dates today"}
              </Typography>
            </ListItem>
          )}
        </List>
      );
    });
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
                  margin: "5px",
                  padding: "5px"
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
                                  onSelect={e => this.handleDateChange(e)}
                                  width={600}
                                  height={400}
                                  selected={today}
                                  minDate={today}
                                  theme={this.state.calendarTheme}
                                />
                              </Grid>
                              <Grid item xs={12} sm={12} md={12} lg={12} xl={6}>
                                {dueDates}
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
                                <List>{notifications}</List>
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
  handleDateChange(date) {
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
