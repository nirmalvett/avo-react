import React, {Fragment} from 'react';
import Http from './Http';
import Menu from '@material-ui/core/Menu';
import Popper from '@material-ui/core/Popper';
import Card from '@material-ui/core/Card/Card';
import Grid from '@material-ui/core/Grid/Grid';
import List from '@material-ui/core/List/List';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button/Button';
import Collapse from '@material-ui/core/Collapse/Collapse';
import ListItem from '@material-ui/core/ListItem/ListItem';
import CardHeader from '@material-ui/core/CardHeader/CardHeader';
import IconButton from '@material-ui/core/IconButton/IconButton';
import Typography from '@material-ui/core/Typography/Typography';
import ListItemText from '@material-ui/core/ListItemText/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader';
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import Stop from '@material-ui/icons/Stop';
import MoreVert from '@material-ui/icons/MoreVert';
import PlayArrow from '@material-ui/icons/PlayArrow';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import AddBoxOutlinedIcon from '@material-ui/icons/AddBoxOutlined';
import DeleteOutlinedIcon from '@material-ui/icons/DeleteOutlined';
import GetAppOutlinedIcon from '@material-ui/icons/GetAppOutlined';
import PeopleOutlinedIcon from '@material-ui/icons/PeopleOutlined';
import NoteAddOutlinedIcon from '@material-ui/icons/NoteAddOutlined';
import AssignmentNotTurnedIn from "@material-ui/icons/AssignmentLate";
import AssignmentTurnedIn from "@material-ui/icons/AssignmentTurnedIn";
import AssessmentOutlinedIcon from '@material-ui/icons/AssessmentOutlined';
import { copy } from "./Utilities";
import AVOModal from './AVOMatComps/AVOMatModal';
import Chart from "react-apexcharts";
import { uniqueKey } from "./helpers";

export default class ManageClasses extends React.Component {
    constructor(props) {
        super(props);
        this.loadClasses();
        this.state = {
            classes: [],
            c: null, // Selected class
            t: null, // Selected test
            createTest: this.props.createTest,
            studentNameSearchLabels : [],
            anchorEl: null,
            createClassErrorMessage : '',
            apexChartEl: undefined,            
            deleteTestPopperOpen : false
        };
    }

    loadClasses() {
        Http.getClasses(result => this.setState(result), result => console.log(result));
    }

    render() {
        let cardStyle = {marginBottom: '10%', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column'};
        console.log(this.state.classes);
        return (
            <div style={{width: '100%', flex: 1, display: 'flex'}}>
                <Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
                    <Grid item xs={3} style={{flex: 1, display: 'flex'}}>
                        <Paper classes={{root: 'avo-sidebar'}} square style={{width: '100%', flex: 1, display: 'flex'}}>
                            <List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
                                <Typography variant='subheading' color="textPrimary" align='center'>
                                    Manage My Classes
                                </Typography>
                                <br/>
                                <Divider/>
                                <ListSubheader style={{position: 'relative'}}>Class Creation</ListSubheader>
                                <ListItem button id='avo-manageclasses__create-button'>
                                    <AddBoxOutlinedIcon color='action'/>
                                    <ListItemText inset primary='Create Class'/>
                                </ListItem>
                                <Divider/>
                                <ListSubheader style={{position: 'relative'}}>My Classes</ListSubheader>
                                {/* For each Class create a menu option */}
                                {this.state.classes.map((cls, cIndex) =>
                                    <Fragment key = {"ManageClasses" + cls.id + "-" + cIndex}>
                                        <ListItem button onClick={() => {
                                                this.selectClass(cIndex);
                                                this.handleClassListItemClick();
                                        }}>
                                            <PeopleOutlinedIcon color='action'/>
                                            <ListItemText inset primary={cls.name}/>
                                            {cls.open
                                                ? <ExpandLess color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                                : <ExpandMore color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
                                            }
                                        </ListItem>
                                        <Collapse in={cls.open} timeout='auto' unmountOnExit><List>{
                                            // For each test create a menu option
                                            cls.tests.map((test, tIndex) =>
                                                <ListItem key={'ManageClasses'+cls.id+'-'+cIndex+'-'+test.id+'-'+tIndex}
                                                          button onClick={() => this.selectTest(cIndex, tIndex)}>
                                                    <AssessmentOutlinedIcon color={test.open ? 'primary' : 'disabled'}
                                                                            style={{ marginLeft: '10px' }}/>
                                                    <ListItemText inset primary={test.name}/>
                                                </ListItem>
                                            )
                                        }</List></Collapse>
                                    </Fragment>
                                )}
                            </List>
                        </Paper>
                    </Grid>
                    <Grid item xs={1}/>
                    <Grid item xs={7} style={{display: 'flex'}}>
                        <Card classes={{root: 'avo-card'}} style={cardStyle}>{this.detailsCard()}</Card>
                    </Grid>
                </Grid>
                <AVOModal
                    title='Create a class'
                    target="avo-manageclasses__create-button"
                    acceptText='Create'
                    declineText='Never mind'
                    noDefaultClose={true}
                    onAccept={(closeFunc) => {
                        const name = document.getElementById('avo-manageclasses__creation-textfield').value;
                        if (name !== null && name !== '') {
                            Http.createClass(
                                name,
                                () => {
                                    this.loadClasses();
                                    this.setState({createClassErrorMessage : ''});
                                    closeFunc();
                                },
                                () => this.setState({createClassErrorMessage: 'Something went wrong :( try again later.'})
                            );
                        }else{
                            this.setState({
                                createClassErrorMessage : "Your class must have a name, if it doesn't how is anyone going to find it?"
                            });
                        }
                    }}
                    onDecline={() => {}}
                >
                    <Fragment>
                        <br/>
                        <Typography variant='body1' color="textPrimary" classes={{ root : "avo-padding__16px" }}>
                            Please enter the desired name of the class you wish to create!
                        </Typography>
                        <TextField
                            id='avo-manageclasses__creation-textfield'
                            margin='normal'
                            style={{width: '60%'}}
                            label="Class name"
                            helperText={this.state.createClassErrorMessage + ' '}
                            error={this.state.createClassErrorMessage !== ''}
                        />
                        <br/>
                    </Fragment>
                </AVOModal>
            </div>
        );
    }

    detailsCard() {
        let selectedClass = this.state.classes[this.state.c];
        const uniqueKey1 = uniqueKey();
        if (this.state.t !== null) {
            const { anchorEl } = this.state;
            let selectedTest = selectedClass.tests[this.state.t];
            return (
                <Fragment key = {`detailsCard-${uniqueKey1}`}>
                    <CardHeader
                        classes={{root: 'avo-card__header'}}
                        title={selectedTest.name}
                        action={
                            <Fragment>
                                {
                                    selectedTest.open
                                    ? <Tooltip key = {`stopTestToolTip-:${uniqueKey1}`} title="Stop the test">
                                        <IconButton onClick={() => this.closeTest()}><Stop/></IconButton>
                                    </Tooltip>
                                    : <Tooltip key = {`playArrow-:${uniqueKey1}`} title="Start the test">
                                        <IconButton onClick={() => this.openTest()}><PlayArrow/></IconButton>
                                    </Tooltip>
                                }
                                <Tooltip key = {`deleteTest-:${uniqueKey1}`} title="Delete the test(This cannot be undone)">
                                    <IconButton onClick={() => this.setState({deleteTestPopperOpen: true})}
                                                id="avo-manageclasses__delete-button">
                                        <DeleteOutlinedIcon/>
                                    </IconButton>
                                </Tooltip>
                            </Fragment>
                        }
                    />
                    <List style={{ flex: 1, overflowY: 'auto' }} dense>
                        { /* Show all the students that are in the class*/
                            this.state.results.map((x, idx) =>
                                <Fragment key = {`Student-Card-index:${idx}-${uniqueKey1}`}>
                                    <ListItem disabled={x.tests.length === 0}>
                                        {x.tests.length === 0
                                            ? <AssignmentNotTurnedIn color='action'/>
                                            : <AssignmentTurnedIn color='action'/>
                                        }
                                        <ListItemText
                                            primary={`${x.firstName} ${x.lastName}`}
                                            secondary={x.tests[x.tests.length - 1]
                                                ? x.tests[x.tests.length - 1].grade + '/' + selectedTest.total
                                                : 'This user has not taken any tests yet.'
                                            }
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                aria-owns={anchorEl ? 'simple-menu' : null}
                                                aria-haspopup="true"
                                                student-index={`${idx}`}
                                                disabled={x.tests.length === 0}
                                                onClick={(event) => this.setState({ anchorEl: event.currentTarget })}
                                            >
                                                <MoreVert/>
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </Fragment>)
                        }
                        <Menu
                              id="simple-menu"
                              anchorEl={anchorEl}
                              open={Boolean(anchorEl)}
                              onClose={() => this.handleVertClose()}
                        >
                            {/* <MenuItem disabled={true} value={10}>View all submissions</MenuItem> */}
                            <MenuItem
                                value={20}
                                onClick={() => {
                                    this.props.postTest(
                                        this.state.results[anchorEl.getAttribute('student-index')].tests[
                                            this.state.results[anchorEl.getAttribute('student-index')].tests.length - 1
                                        ].takes
                                    );
                                }}
                            >
                                 View Most Recent Submission
                            </MenuItem>
                        </Menu>
                        <Popper
                            placement="left-start"
                            open={this.state.deleteTestPopperOpen}
                            anchorEl={document.getElementById('avo-manageclasses__delete-button')}
                            disablePortal={false}
                            modifiers={{
                                flip: {
                                    enabled: true,
                                },
                                preventOverflow: {
                                    enabled: true,
                                    boundariesElement: 'scrollParent',
                                },
                            }}
                        >
                            <Paper style={{ padding : '10px', height : '6em' }}>
                                <Typography variant='body1' color="textPrimary" classes={{root : "avo-padding__16px"}}>
                                    Are you sure you want to delete {selectedTest.name}?<br/>
                                    Once a test has been deleted it can not be recovered!
                                </Typography>
                                <br/>
                                <div style={{ float : 'right', position : 'relative' }}>
                                    <Button
                                        classes={{ root : 'avo-button' }}
                                        onClick={() => this.setState({ deleteTestPopperOpen : false }) }
                                        color="primary"
                                    >Never mind</Button>
                                    <Button
                                        classes={{ root : 'avo-button' }}
                                        onClick={() => {
                                            this.setState({ deleteTestPopperOpen : false });
                                            this.deleteTest();
                                        }}
                                        color="primary"
                                    >Delete</Button>
                                </div>
                            </Paper>
                        </Popper>
                    </List>
                </Fragment>
            );
        }
        if (this.state.c !== null) {
            return (
                <Fragment>
                    <CardHeader
                        title={selectedClass.name}
                        classes={{root: 'avo-card__header'}}
                        subheader={'Enroll Key: ' + selectedClass.enrollKey}
                        action={[
                            <Tooltip key = {`newTestToolTip-:${uniqueKey1}`} title="Create a new Test">
                                <IconButton onClick={() => this.state.createTest(selectedClass.id)}>
                                    <NoteAddOutlinedIcon/>
                                </IconButton>
                            </Tooltip>,
                            <Tooltip key = {`CSVToolTip-:${uniqueKey1}`} title="Download CSV">
                                <IconButton onClick={() => alert('CSV download coming soon!')}>
                                    <GetAppOutlinedIcon/>
                                </IconButton>
                            </Tooltip>
                        ]}
                    />
                    <div className="mixed-chart" id='avo-apex__chart-container'>
                       { // if there is at least one test then display data
                            selectedClass.tests.length !== 0
                                ? this.state.apexChartEl // render the graph
                                : // give message that there's no tests yet
                                    <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                                        This class doesn't have any tests yet!
                                    </Typography>
                        }
                    </div>
                </Fragment>
            )
        }
        return (
            <Fragment>
                <CardHeader
                    classes={{root: 'avo-card__header'}}
                    title={'Hey there!'}
                />
                <Typography variant='body1' color="textPrimary" classes={{root: "avo-padding__16px"}}>
                    Looks like you haven't selected a Class or Test yet!
                </Typography>
                <br/>
            </Fragment>
        );
    }

    selectClass(index) {
        let newClassList = copy(this.state.classes);
        if (newClassList[index].tests.length > 0)
            newClassList[index].open = !newClassList[index].open;
        this.setState({classes: newClassList, c: index, t: null});
    }

    selectTest(cIndex, tIndex) {
        Http.getClassTestResults(this.state.classes[cIndex].tests[tIndex].id,
            (result) => this.setState({ c: cIndex, t: tIndex, results: result.results }),
            () => this.setState({ c: cIndex, t: tIndex, results: [] })
        );
    }

    createClass() {
        let name = prompt('Class Name:');
        if (name !== null && name !== '') {
            Http.createClass(name,
                () => this.loadClasses(),
                () => alert("Something went wrong :'("));
        }
    }

    openTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.openTest(selectedTest.id, () => {
            newClasses[this.state.c].tests[this.state.t].open = true;
            this.setState({
                classes: newClasses,
                studentNameSearchLabels : this.genStudentNameSearchLabels()
            });
        }, () => { });
    }

    closeTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.closeTest(selectedTest.id, () => {
            newClasses[this.state.c].tests[this.state.t].open = false;
            this.setState({ classes: newClasses });
        }, () => { });
    }

    deleteTest() {
        let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
        let newClasses = copy(this.state.classes);
        Http.deleteTest(selectedTest.id, () => {
            newClasses[this.state.c].tests.splice(this.state.t, 1);
            if (newClasses[this.state.c].tests.length === 0)
                newClasses[this.state.c].open = false;
            this.setState({ classes: newClasses, t: null });
        }, () => { });
    }

    genStudentNameSearchLabels() {
        let outArray = [];
        for(let i = 0; i < this.state.results.length; i++)
            outArray.push({label: `${this.state.results[i].firstName} ${this.state.results[i].lastName}`});
        return outArray;
    };

    renderSuggestion({ suggestion, index, itemProps, highlightedIndex, selectedItem }) {
        const isHighlighted = highlightedIndex === index;
        const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

        return (
            <MenuItem
                {...itemProps}
                key={suggestion.label}
                selected={isHighlighted}
                component="div"
                style={{fontWeight: isSelected ? 500 : 400}}
            >{suggestion.label}</MenuItem>
        );
    }

    getSuggestion(value) {
        const inputVal = value.toLowerCase();
        const inputLen = value.length;
        return inputLen === 0 ? [] : this.state.studentNameSearchLabels.filter(() => {

        });
    };

    handleVertClick(event) {
        this.setState({ anchorEl: event.currentTarget });
    };

    handleVertClose() {
        this.setState({ anchorEl: null });
    };

    handleClassListItemClick() {
        this.setState({ apexChartEl : undefined });
        setTimeout(() => {
            let apexContainerWidth = parseInt(document.getElementById('avo-apex__chart-container').clientWidth);
            this.setState({ apexChartEl : (
                <Chart
                    options={this.generateChartOptions()}
                    series={this.processClassChartData()}
                    type="line"
                    width={apexContainerWidth}
                />
            ) });
            window.onresize = this.handleResize.bind(this);
        }, 50);
    };

    handleResize() {
        this.setState({ apexChartEl : 'loading...' });
        let apexContainerWidth = parseInt(document.getElementById('avo-apex__chart-container').clientWidth);
        this.setState({ apexChartEl : (
            <Chart
                options={this.generateChartOptions()}
                series={this.processClassChartData()}
                type="line"
                width={apexContainerWidth}
            />
        ) });
    }

    processClassChartData() {
        let selectedClass = this.state.classes[this.state.c];
        let classAvg = [];
        let classMed = [];
        let classDev = [];
        for(let i = 0; i < selectedClass.tests.length; i++) {
            const testObj = selectedClass.tests[i];
            classMed.push(parseFloat(testObj.classMedian)      .toFixed(2));
            classAvg.push(parseFloat(testObj.classAverage)     .toFixed(2));
            classDev.push(parseFloat(testObj.standardDeviation).toFixed(2));
        }
        return [{
            name : 'Class Median (%)',
            type : 'column',
            data : classMed
        }, {
            name : 'Class Average (%)',
            type : 'column',
            data : classAvg
        }, {
            name : 'SD for Class Avg (%)',
            type : 'column',
            data : classDev
        }]
    }

    generateChartOptions() {
        let selectedClass = this.state.classes[this.state.c];
        let xCategories = [];
        for(let i = 0; i < selectedClass.tests.length; i++) {
            xCategories.push(selectedClass.tests[i].name);
        }
        return {
            chart: {
                fontFamily : 'Roboto',
                foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                id: "basic-bar",
                type: 'line',
            },
            colors: [
                `${this.props.theme.color['500']}`,
                `${this.props.theme.color['200']}`,
                `${this.props.theme.color['100']}`,
            ],

            xaxis: {
                labels: {
                    formatter: (val) => {
                        for(let i = 0; i < selectedClass.tests.length; i++) {
                            if(selectedClass.tests[i].name == val) {
                                return val + ` (size : ${selectedClass.tests[i].classSize})`;   
                            }
                        }
                    }
                },
                categories: xCategories,
            },
            yaxis: {
                min: 0,
                max: 100,
                tickAmount: 10,
                catagories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            },
            fill: {
                opacity: 1.0,
                type: 'solid',
                colors: [
                    `${this.props.theme.color['500']}`,
                    `${this.props.theme.color['200']}`,
                    `${this.props.theme.color['100']}`,
                ]
            },
            legend: {
                markers: {
                    size: 6,
                    strokeColor: "#fff",
                    strokeWidth: 0,
                    offsetX: 0,
                    offsetY: 0,
                    radius: 4,
                    shape: "circle",
                },
                itemMargin: {
                    horizontal: 20,
                    vertical: 5
                },
                containerMargin: {
                    left: 5,
                    top: 12,
                },
                onItemClick: {
                    toggleDataSeries: true
                },
                onItemHover: {
                    highlightDataSeries: true
                },
            },
            dataLabels: {
                enabled: false,
                formatter: function (val) {
                    return val
                },
                textAnchor: 'middle',
                offsetX: 0,
                offsetY: 0,
                style: {
                    fontSize: '14px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    colors: [
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
                        `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,                        
                    ]
                },
                dropShadow: {
                    enabled: false,
                    top: 1,
                    left: 1,
                    blur: 1,
                    opacity: 0.45
                }
            },
            tooltip: {
                theme : this.props.theme.theme
            }
        }
    }
}