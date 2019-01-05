import React, {Component, Fragment} from 'react';
import {
	Popper, Card, Grid, List, Divider, Tooltip, Paper, MenuItem, TextField, Button, Collapse, ListItem,
	CardHeader, IconButton, Typography, ListItemText, ListSubheader, ListItemSecondaryAction, Tabs, Tab, Select,
	Input, InputLabel, FormControl
} from '@material-ui/core';
import {
	Stop, PlayArrow, ExpandLess, ExpandMore, RemoveRedEyeOutlined, EditOutlined, AddBoxOutlined,
	DeleteOutlined, GetAppOutlined, PeopleOutlined, NoteAddOutlined, AssignmentLate, AssignmentTurnedIn,
	AssessmentOutlined, Done
} from '@material-ui/icons';
import Http from './Http';
import {copy, getDateString} from './Utilities';
import AVOModal from './AVOMatComps/AVOMatModal';
import Chart from 'react-apexcharts';
import {uniqueKey} from './helpers';
import {convertListFloatToAnalytics} from './helpers';
import {InlineDateTimePicker} from "material-ui-pickers";

const cardStyle = {marginBottom: '10%', padding: '10px', flex: 1, display: 'flex', flexDirection: 'column'};
const CONST_TAB_OVERALL_ANALYTICS = 0;
const CONST_TAB_PER_QUESTION = 1;
const CONST_TAB_MY_ATTEMPTS = 2;

export default class ManageClasses extends Component {

	// this.props.showSnackBar("success", "it worked", 9000);
	// Defining fields to make the inspections happy
	tests;
	classSize;
	classMedian;
	classAverage;
	standardDeviation;
	topMarkPerStudent;
	testMean;
	testMedian;
	testSTDEV;
	totalMark;
	submitted;
	grade;
	topMarksPerStudent;

	constructor(props) {
		super(props);
		this.state = {
			classes: [],
			c: null, // Selected class
			t: null, // Selected test
			createTest: this.props.createTest,
			studentNameSearchLabels: [],
			anchorEl: null,
			createClassErrorMessage: '',
			apexChartEl: undefined,
			results: undefined,
			deleteTestPopperOpen: false,
			activeTab: 0,
			testStats: null,
			testStatsIdx: undefined,
			testStatsDataSelectIdx: 3,
			testStatsDataQuestionIdx: 0,
			resultsIndexArray: [],

			// Edit Test Settings: Let teacher modify test after it's made
			editTestPopperOpen: false,
			editTest_attempts: null,
			editTest_time: null,
			editTest_date: null,
			editTest_name: null,
		};
	}

	componentDidMount() {
		this.loadClasses();
	};

	loadClasses(snackBarString) {
		// this gets the class results
		Http.getClasses(result => this.setState(result), result => console.log(result));
		if (snackBarString !== undefined)
			this.props.showSnackBar('success', snackBarString);
	}

	render() {
		return (
				<div style={{width: '100%', flex: 1, display: 'flex'}}>
					<Grid container spacing={8} style={{flex: 1, display: 'flex', paddingBottom: 0}}>
						<Grid item xs={3} style={{flex: 1, display: 'flex'}}>
							{this.sideBar()}
						</Grid>
						<Grid item xs={1}/> {/* Spacing in the middle */}
						<Grid item xs={7} style={{display: 'flex'}}>
							<Card classes={{root: 'avo-card'}} style={cardStyle}>
								{this.detailsCard() /* This is the card on the right hand side */}
							</Card>
						</Grid>
					</Grid>
					{this.createClassModal()} {/* This governs the pop up modal that lets profs make a class */}
				</div>
		);
	}

	sideBar() {
		// this renders the side bar for manage classes
		return (
				<Paper classes={{root: 'avo-sidebar'}} square style={{width: '100%', flex: 1, display: 'flex'}}>
					<List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
						<Typography component={'span'} variant='subheading' color='textPrimary' align='center'>
							Manage My Classes
						</Typography>
						<br/>
						<Divider/>
						<ListSubheader style={{position: 'relative'}}>Class Creation</ListSubheader>
						<ListItem button id='avo-manageclasses__create-button'>
							<AddBoxOutlined color='action'/>
							<ListItemText inset primary='Create Class'/>
						</ListItem>
						<Divider/>
						<ListSubheader style={{position: 'relative'}}>My Classes</ListSubheader>
						{this.sideBar_loadClasses() /* For each Class create a menu option */}
					</List>
				</Paper>
		)
	}

	sideBar_loadClasses() {
		return (this.state.classes.map((cls, cIndex) =>
				<Fragment key={'ManageClasses' + cls.id + '-' + cIndex}>
					<ListItem button onClick={() => {
						this.selectClass(cIndex);
						this.handleClassListItemClick();
					}}>
						<PeopleOutlined color='action'/>
						<ListItemText inset primary={cls.name}/>
						{cls.open
								? <ExpandLess color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
								: <ExpandMore color={cls.tests.length === 0 ? 'disabled' : 'action'}/>
						}
					</ListItem>
					<Collapse in={cls.open} timeout='auto' unmountOnExit><List>{
						// For each test create a menu option
						cls.tests.map((test, tIndex) =>
								<ListItem key={'ManageClasses' + cls.id + '-' + cIndex + '-' + test.id + '-' + tIndex}
								          button onClick={() => this.getTestStats(test.id, cIndex, tIndex)}>
									<AssessmentOutlined color={test.open ? 'primary' : 'disabled'}
									                    style={{marginLeft: '10px'}}/>
									<ListItemText inset primary={test.name}/>
								</ListItem>
						)
					}</List></Collapse>
				</Fragment>
		))
	}

	createClassModal() {
		return (
				<AVOModal
						title='Create a class'
						target='avo-manageclasses__create-button'
						acceptText='Create'
						declineText='Never mind'
						noDefaultClose={true}
						onAccept={(closeFunc) => {
							// get the name given
							const name = document.getElementById('avo-manageclasses__creation-textfield').value;
							if (name !== null && name !== '') {
								Http.createClass(
										name,
										() => {
											this.loadClasses('Class Successfully Created!');
											this.setState({createClassErrorMessage: ''});
											closeFunc();
										},
										() => this.setState({createClassErrorMessage: 'Something went wrong :( try again later.'})
								);
							} else {
								this.setState({
									createClassErrorMessage: "Your class must have a name, if it doesn't how is anyone going to find it?"
								});
							}
						}}
						onDecline={() => {
						}}
				>
					<br/>
					<Typography component={'span'} variant='body1' color='textPrimary' classes={{root: 'avo-padding__16px'}}>
						Please enter the desired name of the class you wish to create!
					</Typography>
					<TextField
							id='avo-manageclasses__creation-textfield'
							margin='normal'
							style={{width: '60%'}}
							label='Class name'
							helperText={this.state.createClassErrorMessage + ' '}
							error={this.state.createClassErrorMessage !== ''}
					/>
					<br/>
				</AVOModal>
		)
	}

	detailsCard() {
		// This is the rendering logic for what goes inside the card on the right
		let selectedClass = this.state.classes[this.state.c];
		const uniqueKey1 = uniqueKey();
		if (this.state.t !== null) { // If a test is selected
			let {topMarkPerStudent, totalMark} = this.state.testStats;
			const analyticsDataObj = convertListFloatToAnalytics(topMarkPerStudent, totalMark);
			let selectedTest = selectedClass.tests[this.state.t];
			return this.detailsCard_selectedTest(analyticsDataObj, selectedTest, uniqueKey1)
		}
		if (this.state.c !== null) // If a class is selected
			return this.detailsCard_selectedClass(selectedClass, uniqueKey1);
		else // Otherwise display the card that says they haven't selected anything
			return this.detailsCard_nothingSelected();
	}

	detailsCard_nothingSelected() {
		return (
				<Fragment>
					<CardHeader classes={{root: 'avo-card__header'}} title={'Hey there!'}/>
					<Typography component={'span'} variant='body1' color='textPrimary' classes={{root: 'avo-padding__16px'}}>
						Looks like you haven't selected a Class or Test yet!
					</Typography>
					<br/>
				</Fragment>
		)
	}

	detailsCard_selectedClass(selectedClass, uniqueKey1) {
		return (
				<Fragment>
					<CardHeader
							title={selectedClass.name}
							classes={{root: 'avo-card__header'}}
							subheader={'Enroll Key: ' + selectedClass.enrollKey}
							action={<Fragment key={`Action-:${uniqueKey1}`}>
								<Tooltip title='Create a new Test'>
									<IconButton onClick={() => this.state.createTest(selectedClass.id)}>
										<NoteAddOutlined/>
									</IconButton>
								</Tooltip>
								<Tooltip title='Download CSV'>
									<IconButton onClick={() => window.location.href = (`/CSV/ClassMarks/${selectedClass.id}`)}>
										<GetAppOutlined/>
									</IconButton>
								</Tooltip>
							</Fragment>}
					/>
					<div className='mixed-chart' id='avo-apex__chart-container'>
						{selectedClass.tests.length !== 0 // if there is at least one test then display data
								? <Fragment>
									{this.state.apexChartEl}
									<Typography component={'span'} variant='body1'
									            color='textPrimary' classes={{root: 'avo-padding__16px'}}>
										Average: Based on the average of the best attempts of each student who took the test or assignment.
									</Typography>
									<Typography component={'span'} variant='body1'
									            color='textPrimary' classes={{root: 'avo-padding__16px'}}>
										Size: The number of students who has taken the test or assignment.
									</Typography>
								</Fragment>
								: <Typography component={'span'} variant='body1'
								              color='textPrimary' classes={{root: 'avo-padding__16px'}}>
									This class doesn't have any tests or assignments yet!
								</Typography>
						}
					</div>
				</Fragment>
		)
	}

	detailsCard_selectedTest(analyticsDataObj, selectedTest, uniqueKey1) {
		return (
				<Fragment key={`detailsCard-${uniqueKey1}`}>
					<CardHeader
							title={selectedTest.name}
							action={this.detailsCard_selectedTest_cardHeader(selectedTest, uniqueKey1)}
					/>
					{this.deleteTestPopper(selectedTest)} {/* Logic for deleting a test popup*/}
					{this.editTestPopper(selectedTest)} {/* Logic for editing a test popup*/}

					{/* Deadline: July 01 at 9:30am  Time Limit: 100 minutes  Attempts: Unlimited */}
					<center>
						<Typography component={'span'} variant='body1' color='textPrimary'>
                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Deadline:</b> {getDateString(selectedTest.deadline)}
                        </span>
							<span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Time Limit:</b> {selectedTest.timer === -1 ? ' None' : ' ' + selectedTest.timer + ' minutes'}
                        </span>
							<span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
                            <b>Attempts:</b> {selectedTest.attempts === -1 ? ' Unlimited' : ' ' + selectedTest.attempts}
                        </span>
						</Typography>
					</center>
					<br/>
					<Tabs
							value={this.state.activeTab}
							onChange={this.handleTabViewChange.bind(this)}
							indicatorColor='primary'
							textColor='primary'
							fullWidth
					>
						<Tab label='Overall Analytics'/>
						<Tab label='Per Question Analytics'/>
						<Tab label='Test Submissions'/>
					</Tabs>

					{/* These are the three tabs with their data */}
					{this.detailsCard_selectedTest_overallAnalytics(analyticsDataObj)} {/* Shows analytics for the entire test */}
					{this.detailsCard_selectedTest_perQuestion(analyticsDataObj)} {/* Shows analytics for a single question */}
					{this.detailsCard_selectedTest_attempts(analyticsDataObj, selectedTest, uniqueKey1)} {/* Shows the attempts per student */}


				</Fragment>
		);
	}

	deleteTestPopper(selectedTest) {
		return (<React.Fragment>
			<List style={{flex: 1, overflowY: 'auto'}} dense>
				<Popper
						placement='left-start'
						open={this.state.deleteTestPopperOpen}
						anchorEl={(() => {
							return document.getElementById('avo-manageclasses__delete-button')
						})}
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
					<Paper style={{padding: '10px', height: '6em'}}>
						<Typography
								component={'span'} variant='body1' color='textPrimary' classes={{root: 'avo-padding__16px'}}
						>
							Are you sure you want to delete {selectedTest.name}?<br/>
							Once a test has been deleted it can not be recovered!
						</Typography>
						<br/>
						<div style={{float: 'right', position: 'relative'}}>
							<Button
									classes={{root: 'avo-button'}}
									onClick={() => this.setState({deleteTestPopperOpen: false})}
									color='primary'
							>Never mind</Button>
							<Button
									classes={{root: 'avo-button'}}
									onClick={() => {
										this.setState({deleteTestPopperOpen: false});
										this.deleteTest();
									}}
									color='primary'
							>Delete</Button>
						</div>
					</Paper>
				</Popper>
			</List>
		</React.Fragment>)
	}

	editTestPopper(selectedTest) {
		if (this.state.editTest_name === null) {
			const currentDate = serverToJSDate(selectedTest.deadline);
			this.setState({
				editTest_name: selectedTest.name,
				editTest_time: selectedTest.timer,
				editTest_attempts: selectedTest.attempts,
				_editTest_date: currentDate.toISOString(),
				editTest_date: currentDate
			});
			console.log("date from server", selectedTest.deadline);
			console.log("new Date(selectedTest.deadline).toISOString()", new Date(selectedTest.deadline).toISOString())
		}
		return (<React.Fragment>
			<List style={{flex: 1, overflowY: 'auto'}} dense>
				<Popper
						placement='left-start'
						open={this.state.editTestPopperOpen}
						anchorEl={(() => {
							return document.getElementById('avo-manageclasses__delete-button')
						})}
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

					<Card style={{marginTop: '5%', marginBottom: '5%', padding: '10px', flex: 1}}>
						<CardHeader title={`Adjust ${selectedTest.name} Settings`}/>
						<TextField
								margin='normal'
								label='Name'
								style={{width: '46%', margin: '2%'}}
								value={this.state.editTest_name}
								onChange={e => this.setState({editTest_name: e.target.value})}
						/>
						<TextField
								margin='normal'
								label='Time Limit in Minutes'
								type='number'
								style={{width: '46%', margin: '2%'}}
								value={this.state.editTest_time}
								onChange={e => this.setState({editTest_time: e.target.value})}
						/>
						<br/>
						<TextField margin='normal' label='Attempts' type='number'
						           style={{width: '46%', margin: '2%'}}
						           value={this.state.editTest_attempts}
						           onChange={e => this.setState({editTest_attempts: e.target.value})}
						/>
						<InlineDateTimePicker
								margin='normal'
								style={{width: '46%', margin: '2%'}}
								label="Deadline"
								value={this.state._editTest_date}
								onChange={this.handleDateChange.bind(this)}
						/>
						<br/>
						<div style={{float: 'right', position: 'relative'}}>
							<Button
									classes={{root: 'avo-button'}}
									onClick={() => this.setState({editTestPopperOpen: false})}
									color='primary'>
								Close
							</Button>
							<Button
									classes={{root: 'avo-button'}}
									onClick={() => {
										this.setState({deleteTestPopperOpen: false});
										Http.changeTest(
												selectedTest.id,
												parseInt(this.state.editTest_time),
												this.state.editTest_name,
												dateForServer(this.state._editTest_date),
												this.state.editTest_attempts,
												() => {
													this.setState({deleteTestPopperOpen: false});
													this.loadClasses();
													this.props.showSnackBar("success", "Change successful!");

												},
												(e) => this.props.showSnackBar("error", e.error)
										)

									}}
									color='primary'>
								Confirm Change
							</Button>
						</div>
					</Card>

				</Popper>
			</List>
		</React.Fragment>)
	}

	handleDateChange(date) {
		var d = new Date(date);
		let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
				("00" + d.getDate()).slice(-2) + "" +
				("00" + d.getHours()).slice(-2) + "" +
				("00" + d.getMinutes()).slice(-2) + "";
		_date = d.getFullYear() + "" + _date;
		this.setState({
			editTest_date: _date,
			_editTest_date: date
		});
	};

	detailsCard_selectedTest_cardHeader(selectedTest, uniqueKey1) {
		return (
				<Fragment>
					{/* Edit Test Button */}
					<Tooltip key={`editTest-:${uniqueKey1}`} title='Edit Test Settings'>
						<IconButton
								onClick={() => this.setState({editTestPopperOpen: true})}
								id='avo-manageclasses__delete-button'>
							<EditOutlined/>
						</IconButton>
					</Tooltip>
					{/* Start/Stop Test Button*/}
					{selectedTest.open
							? <Tooltip key={`stopTestToolTip-:${uniqueKey1}`} title='Stop the test'>
								<IconButton onClick={() => this.closeTest()}><Stop/></IconButton>
							</Tooltip>
							: <Tooltip key={`playArrow-:${uniqueKey1}`} title='Start the test'>
								<IconButton onClick={() => this.openTest()}><PlayArrow/></IconButton>
							</Tooltip>
					}
					{/* Delete Test button*/}
					<Tooltip key={`deleteTest-:${uniqueKey1}`} title='Delete the test(This cannot be undone)'>
						<IconButton onClick={() => this.setState({deleteTestPopperOpen: true})}
						            id='avo-manageclasses__delete-button'>
							<DeleteOutlined/>
						</IconButton>
					</Tooltip>
				</Fragment>

		)
	}

	detailsCard_selectedTest_overallAnalytics(analyticsDataObj) {
		return (
				<React.Fragment>
					{this.state.activeTab === CONST_TAB_OVERALL_ANALYTICS && (
							<Fragment>
								<div style={{overflowY: 'auto', overflowX: 'hidden'}}>
									<br/>
									<center>
										<Typography component={'span'} variant='body1' color='textPrimary'>
	                                    <span>
	                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
	                                            <b>Students:</b>
		                                        {analyticsDataObj.studentSizeWhoTookIt}
	                                        </span>
	                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
	                                            <b>Median Scores:</b>
		                                        {this.state.testStats.testMedian}
	                                        </span>
	                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
	                                            <b>Mean Scores:</b>
		                                        {this.state.testStats.testMean}
	                                        </span>
	                                        <span style={{marginLeft: '0.75em', marginRight: '0.75em'}}>
	                                            <b>Std. Dev:</b>
		                                        {this.state.testStats.testSTDEV}%
	                                        </span>
	                                    </span>
										</Typography>
									</center>
									<Chart
											options={this.getTestCardGraphOptions()}
											series={this.getTestCardGraphSeries()}
											type='line'
											width='100%'
									/>
								</div>
							</Fragment>
					)}
				</React.Fragment>
		)
	}

	detailsCard_selectedTest_perQuestion(analyticsDataObj) {
		return (
				<React.Fragment>
					{this.state.activeTab === CONST_TAB_PER_QUESTION && (
							<div style={{overflowY: 'auto', overflowX: 'hidden'}}>
								<br/>
								<center>
									<Typography component={'span'} variant='body1' color='textPrimary'>
	                                <span>
	                                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
	                                        <FormControl>
	                                            {/*<InputLabel htmlFor='test-stats__data-display'>Question to display</InputLabel>*/}
		                                        <Select
				                                        value={this.state.testStatsDataQuestionIdx}
				                                        onChange={(evt) =>
						                                        this.setState({testStatsDataQuestionIdx: evt.target.value})
				                                        }
				                                        input={<Input name='dataSelected' id='test-stats__data-display'/>}
		                                        >
	                                                {this.state.testStats.questions.map((obj, idx) => (
			                                                <MenuItem value={idx}>{`Question ${idx + 1}`}</MenuItem>
	                                                ))}
	                                            </Select>
		                                        {/*<FormHelperText>Select the data to be displayed</FormHelperText>*/}
	                                        </FormControl>
	                                    </span>
	                                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
	                                        <b>Students:</b> {analyticsDataObj.studentSizeWhoTookIt}</span>
	                                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
	                                        <b>Median Score:</b>
		                                    {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionMedian}
	                                    </span>
	                                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
	                                        <b>Mean Score:</b>
		                                    {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionMean}
	                                    </span>
	                                    <span style={{marginLeft: '1.0em', marginRight: '1.0em'}}>
	                                        <b>Std. Dev:</b>
		                                    {this.state.testStats.questions[this.state.testStatsDataQuestionIdx].questionSTDEV
				                                    .toFixed(2)}%
	                                    </span>
	                                </span>
									</Typography>
								</center>
								<Chart
										options={this.getPerQuestionGraphOptions()}
										series={this.getPerQuestionGraphData()}
										type='line'
										width='100%'
								/>
							</div>
					)}
				</React.Fragment>
		)

	}

	detailsCard_selectedTest_attempts(analyticsDataObj, selectedTest, uniqueKey1) {
		return (
				<React.Fragment>
					{this.state.activeTab === CONST_TAB_MY_ATTEMPTS && (
							<Fragment>
								<br/>
								<List style={{flex: 1, overflowY: 'auto', overflowX: 'hidden'}}>
									{/* Show all the students that are in the class*/}
									{this.state.results.map((x, idx) =>
											<ListItem key={`Student-Card-index:${idx}-${uniqueKey1}`} disabled={x.tests.length === 0}>
												{x.tests.length === 0
														? <AssignmentLate color='action'/>
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
													<FormControl>
														<InputLabel htmlFor='test-stats__data-display'>Attempt</InputLabel>
														<Select
																classes={{disabled: 'disabled'}}
																disabled={x.tests.length === 0}
																value={this.state.resultsIndexArray[idx]}
																onChange={(evt) => {
																	let temptResults = this.state.resultsIndexArray;
																	temptResults[idx] = evt.target.value;
																	this.setState({resultsIndexArray: tempResults})
																}
																}
																input={<Input name='dataSelected' id='test-stats__data-display'/>}
														>
															{this.state.results[idx].tests.map((obj, idx) => (
																	<MenuItem value={idx}>
																		{x.tests.length > 1 ? `Attempt ${idx + 1}` : 'Best Attempt'}
																	</MenuItem>
															))}
														</Select>
													</FormControl>
													<Tooltip title='View Submission for selected attempt'>
	                                            <span> {/* All icons that can be disabled need this to prevent warning*/}
		                                            <IconButton
				                                            classes={{disabled: 'disabled'}}
				                                            disabled={x.tests.length === 0}
				                                            onClick={() => {
					                                            this.props.postTest(
							                                            this.state.results[idx].tests[
									                                            this.state.resultsIndexArray[idx]
									                                            ].takes
					                                            );
				                                            }}
		                                            >
	                                                <RemoveRedEyeOutlined/>
	                                                </IconButton>
	                                            </span>
													</Tooltip>
													{/* Edit Marks Button */}
													<Tooltip title="Edit marks for selected attempt">
														<IconButton
																classes={{
																	disabled: 'disabled'
																}}
																disabled={x.tests.length === 0}
																onClick={() => {
																	this.props.markEditor(
																			this.state.results[idx].tests[
																					this.state.resultsIndexArray[idx]
																					].takes
																	);
																}}
														><EditOutlined/></IconButton>
													</Tooltip>
												</ListItemSecondaryAction>
											</ListItem>
									)}
								</List>
							</Fragment>
					)}
				</React.Fragment>
		)
	}

	markEditor() {
		return (
				<Tooltip title="Edit marks for selected attempt">
					<IconButton
							classes={{
								disabled: 'disabled'
							}}
							disabled={x.tests.length === 0}
							onClick={() => {
								this.props.markEditor(
										this.state.results[idx].tests[
												this.state.resultsIndexArray[idx]
												].takes
								);
							}}
					>
						<EditOutlined/>
					</IconButton>
				</Tooltip>
		)
	}

	selectClass(index) {
		let newClassList = copy(this.state.classes);
		if (newClassList[index].tests.length > 0)
			newClassList[index].open = !newClassList[index].open;
		this.setState({classes: newClassList, c: index, t: null});
	}

	selectTest(cIndex, tIndex) {
		Http.getClassTestResults(this.state.classes[cIndex].tests[tIndex].id,
				(result) => this.setState({c: cIndex, t: tIndex, results: result.results}),
				() => this.setState({c: cIndex, t: tIndex, results: []})
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
				studentNameSearchLabels: this.genStudentNameSearchLabels()
			});
		}, () => {
		});
	}

	closeTest() {
		let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
		let newClasses = copy(this.state.classes);
		Http.closeTest(selectedTest.id, () => {
			newClasses[this.state.c].tests[this.state.t].open = false;
			this.setState({classes: newClasses});
		}, () => {
		});
	}

	deleteTest() {
		let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
		let newClasses = copy(this.state.classes);
		Http.deleteTest(selectedTest.id, () => {
			newClasses[this.state.c].tests.splice(this.state.t, 1);
			if (newClasses[this.state.c].tests.length === 0)
				newClasses[this.state.c].open = false;
			this.setState({classes: newClasses, t: null});
		}, () => {
		});
	}

	genStudentNameSearchLabels() {
		let outArray = [];
		for (let i = 0; i < this.state.results.length; i++)
			outArray.push({label: `${this.state.results[i].firstName} ${this.state.results[i].lastName}`});
		return outArray;
	};

	renderSuggestion({suggestion, index, itemProps, highlightedIndex, selectedItem}) {
		const isHighlighted = highlightedIndex === index;
		const isSelected = (selectedItem || '').indexOf(suggestion.label) > -1;

		return (
				<MenuItem
						{...itemProps}
						key={suggestion.label}
						selected={isHighlighted}
						component='div'
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
		this.setState({anchorEl: event.currentTarget});
	};

	handleVertClose() {
		this.setState({anchorEl: null});
	};

	handleClassListItemClick() {
		this.setState({apexChartEl: undefined});
		setTimeout(() => {
			let apexContainerWidth = document.getElementById('avo-apex__chart-container').clientWidth;
			this.setState({
				apexChartEl: (
						<Chart
								options={this.generateChartOptions()}
								series={this.processClassChartData()}
								type='line'
								width={apexContainerWidth}
						/>
				)
			});
			window.onresize = this.handleResize.bind(this);
		}, 50);
	};

	handleResize() {
		this.setState({apexChartEl: 'loading...'});
		let apexContainerWidth = document.getElementById('avo-apex__chart-container').clientWidth;
		this.setState({
			apexChartEl: (
					<Chart
							options={this.generateChartOptions()}
							series={this.processClassChartData()}
							type='line'
							width={apexContainerWidth}
					/>
			)
		});
	}

	getPerQuestionGraphOptions() {
		let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
		let dataObj = convertListFloatToAnalytics(
				this.state.testStats.questions[this.state.testStatsDataQuestionIdx].topMarksPerStudent,
				this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark
		);
		console.log(dataObj);
		return {
			chart: {
				fontFamily: 'Roboto',
				foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
				id: 'basic-bar',
				type: 'line',
			},
			colors: [
				`${this.props.theme.color['500']}`,
				`${this.props.theme.color['200']}`,
				`${this.props.theme.color['100']}`,
			],
			stroke: {
				curve: 'smooth'
			},
			labels: (() => {
				const dataOutArray = [];
				for (let key in dataObj)
					if (dataObj.hasOwnProperty(key))
						if (key !== 'studentSizeWhoTookIt')
							dataOutArray.push(key);
				return dataOutArray;
			})(),
			xaxis: {
				title: {
					text: this.state.testStatsDataSelectIdx === 3 ? 'Marks Scored' : ''
				},
			},
			yaxis: {
				title: {
					text: this.state.testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)'
				},
				min: 0,
				max: (() => {
					return dataObj.studentSizeWhoTookIt;
				})(),
				tickAmount: (() => {
					return dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt;
				})(),
			},
			fill: {
				opacity: 1,
				type: 'solid',
				colors: [
					`${this.props.theme.color['500']}`,
					`${this.props.theme.color['200']}`,
					`${this.props.theme.color['100']}`,
				]
			},
			legend: {
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
				theme: this.props.theme.theme,
			}
		}
	}

	getPerQuestionGraphData() {
		let dataObj = convertListFloatToAnalytics(
				this.state.testStats.questions[this.state.testStatsDataQuestionIdx].topMarksPerStudent,
				this.state.testStats.questions[this.state.testStatsDataQuestionIdx].totalMark
		);
		delete dataObj['studentSizeWhoTookIt'];
		const dataOutArray = [];
		for (let key in dataObj)
			if (dataObj.hasOwnProperty(key))
				dataOutArray.push(dataObj[key].numberOfStudents);
		return [{
			name: 'Number of Students',
			type: 'column',
			data: dataOutArray
		}];
	}

	getTestCardGraphOptions() {
		let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
		console.log(selectedTest);
		return {
			chart: {
				fontFamily: 'Roboto',
				foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
				id: 'basic-bar',
				type: 'line',
			},
			colors: [
				`${this.props.theme.color['500']}`,
				`${this.props.theme.color['200']}`,
				`${this.props.theme.color['100']}`,
			],
			stroke: {
				curve: 'smooth'
			},
			labels: this.state.testStatsDataSelectIdx === 2 && selectedTest.submitted.length > 0 ? (() => {
				let attemptArray = [];
				selectedTest.submitted.forEach((obj, idx) => {
					attemptArray.push('Attempt ' + (parseInt(idx) + 1));
				});
				return attemptArray;
			})() : this.state.testStatsDataSelectIdx === 3 ? (() => {
				const dataObj = convertListFloatToAnalytics(
						this.state.testStats.topMarkPerStudent,
						this.state.testStats.totalMark
				);
				delete dataObj['studentSizeWhoTookIt'];
				const dataOutArray = [];
				for (let key in dataObj)
					if (dataObj.hasOwnProperty(key))
						dataOutArray.push(key);
				return dataOutArray;
			})() : ['', selectedTest.name, ''],
			xaxis: {
				title: {
					text: this.state.testStatsDataSelectIdx === 3 ? 'Marks Scored' : ''
				},
			},
			yaxis: {
				title: {
					text: this.state.testStatsDataSelectIdx === 3 ? 'Number of Students' : 'Mark(%)'
				},
				min: 0,
				max: this.state.testStatsDataSelectIdx === 3 ? (() => {
					const dataObj = convertListFloatToAnalytics(
							this.state.testStats.topMarkPerStudent,
							this.state.testStats.totalMark
					);
					return dataObj.studentSizeWhoTookIt;
				})() : 100,
				tickAmount: (() => {
					const dataObj = convertListFloatToAnalytics(
							this.state.testStats.topMarkPerStudent,
							this.state.testStats.totalMark
					);
					return dataObj.studentSizeWhoTookIt >= 10 ? 10 : dataObj.studentSizeWhoTookIt;
				})(),
			},
			fill: {
				opacity: 1,
				type: 'solid',
				colors: [
					`${this.props.theme.color['500']}`,
					`${this.props.theme.color['200']}`,
					`${this.props.theme.color['100']}`,
				]
			},
			legend: {
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
				theme: this.props.theme.theme,
			}
		}
	};

	getTestCardGraphSeries() {
		let selectedTest = this.state.classes[this.state.c].tests[this.state.t];
		if (this.state.testStatsDataSelectIdx === 0) {
			let testAverage = 0;
			selectedTest.submitted.forEach((obj) => {
				testAverage += obj.grade;
			});
			if (testAverage !== 0) {
				testAverage = (testAverage / (selectedTest.total * selectedTest.submitted.length)) * 100
			}
			return [{
				name: 'Test Mean',
				type: 'column',
				data: ['', this.state.testStats.testMean, '']
			}, {
				name: 'Test Median',
				type: 'column',
				data: ['', this.state.testStats.testMedian, '']
			}, {
				name: 'My Average',
				type: 'column',
				data: ['', testAverage, '']
			}, {
				name: 'Test SD',
				type: 'line',
				data: ['', this.state.testStats.testSTDEV, '']
			},]
		} else if (this.state.testStatsDataSelectIdx === 1) {
			let myBestMark = 0;
			selectedTest.submitted.forEach((obj) => {
				myBestMark = obj.grade > myBestMark ? obj.grade : myBestMark;
			});
			myBestMark = (myBestMark / selectedTest.total) * 100;
			return [{
				name: 'Test Mean',
				type: 'column',
				data: ['', this.state.testStats.testMean, '']
			}, {
				name: 'Test Median',
				type: 'column',
				data: ['', this.state.testStats.testMedian, '']
			}, {
				name: 'My Best Attempt',
				type: 'column',
				data: ['', myBestMark, '']
			}, {
				name: 'Test SD',
				type: 'line',
				data: ['', this.state.testStats.testSTDEV, '']
			},]
		} else if (this.state.testStatsDataSelectIdx === 2) {
			let attemptArray = [];
			let meanArray = []; // It isn't a very nice array :\
			let medianArray = [];
			let sdArray = [];
			if (selectedTest.submitted.length > 0) {
				selectedTest.submitted.forEach((obj) => {
					attemptArray.push((obj.grade / selectedTest.total) * 100);
					meanArray.push(this.state.testStats.testMean);
					medianArray.push(this.state.testStats.testMedian);
					sdArray.push(this.state.testStats.testSTDEV);
				});
			} else {
				attemptArray = ['', 'No Attempts Available', ''];
				meanArray = ['', this.state.testStats.testMean, ''];
				medianArray = ['', this.state.testStats.testMedian, ''];
				sdArray = ['', this.state.testStats.testSTDEV, ''];
			}
			return [{
				name: 'Test Mean',
				type: 'column',
				data: meanArray
			}, {
				name: 'Test Median',
				type: 'column',
				data: medianArray
			}, {
				name: 'Test Attempt',
				type: 'column',
				data: attemptArray
			}, {
				name: 'Test SD',
				type: 'line',
				data: sdArray
			},]
		} else if (this.state.testStatsDataSelectIdx === 3) {
			const dataObj = convertListFloatToAnalytics(
					this.state.testStats.topMarkPerStudent,
					this.state.testStats.totalMark
			);
			delete dataObj['studentSizeWhoTookIt'];
			const dataOutArray = [];
			for (let key in dataObj)
				if (dataObj.hasOwnProperty(key))
					dataOutArray.push(dataObj[key].numberOfStudents);
			return [{
				name: 'Number of Students',
				type: 'column',
				data: dataOutArray
			}]
		}
		return [{
			name: 'TEAM A',
			type: 'column',
			data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30]
		}, {
			name: 'TEAM B',
			type: 'column',
			data: [44, 55, 41, 67, 22, 43, 21, 41, 56, 27, 43]
		}, {
			name: 'TEAM C',
			type: 'line',
			data: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39]
		}]
	};

	handleTabViewChange(event, value) {
		this.setState({activeTab: value});
	};

	getTestStats(testID, cIndex, tIndex) {
		Http.getTestStats(
				testID,
				(result) => {
					console.log(result);
					Http.getClassTestResults(this.state.classes[cIndex].tests[tIndex].id,
							(_result) => {
								let resultsIndexArray = [];
								for (let i = 0; i < _result.results.length; i++)
									resultsIndexArray.push(0);
								this.setState({
									c: cIndex,
									t: tIndex,
									results: _result.results,
									testStats: result,
									resultsIndexArray: resultsIndexArray
								});
							},
							() => this.setState({c: cIndex, t: tIndex, results: [], testStats: result})
					);
				},
				(err) => {
					console.log(err);
				}
		)
	};

	processClassChartData() {
		let selectedClass = this.state.classes[this.state.c];
		let classAvg = [];
		let classMed = [];
		let classDev = [];
		for (let i = 0; i < selectedClass.tests.length; i++) {
			const testObj = selectedClass.tests[i];
			classMed.push(parseFloat(testObj.classMedian).toFixed(2));
			classAvg.push(parseFloat(testObj.classAverage).toFixed(2));
			classDev.push(parseFloat(testObj.standardDeviation).toFixed(2));
		}
		return [{
			name: 'Class Median (%)',
			type: 'column',
			data: classMed
		}, {
			name: 'Class Average (%)',
			type: 'column',
			data: classAvg
		}, {
			name: 'SD for Class Avg (%)',
			type: 'column',
			data: classDev
		}]
	}

	generateChartOptions() {
		let selectedClass = this.state.classes[this.state.c];
		let xCategories = [];
		for (let i = 0; i < selectedClass.tests.length; i++) {
			xCategories.push(selectedClass.tests[i].name);
		}
		return {
			chart: {
				fontFamily: 'Roboto',
				foreColor: `${this.props.theme.theme === 'light' ? '#000000' : '#ffffff'}`,
				id: 'basic-bar',
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
						for (let i = 0; i < selectedClass.tests.length; i++)
							if (selectedClass.tests[i].name === val)
								return val + ` (size: ${selectedClass.tests[i].classSize})`;
					}
				},
				categories: xCategories,
			},
			yaxis: {
				min: 0,
				max: 100,
				tickAmount: 10,
				categories: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
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
					strokeColor: '#fff',
					strokeWidth: 0,
					offsetX: 0,
					offsetY: 0,
					radius: 4,
					shape: 'circle',
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
				theme: this.props.theme.theme
			}
		}
	}

}

function dateForServer(date) {
	/* takes the date from MUI picker and converts it for the server*/
	console.log("date in dateForServer()", date);
	const d = new Date(date);
	let _date = ("00" + (d.getMonth() + 1)).slice(-2) + "" +
			("00" + d.getDate()).slice(-2) + "" +
			("00" + d.getHours()).slice(-2) + "" +
			("00" + d.getMinutes()).slice(-2) + "";
	_date = d.getFullYear() + "" + _date;
	return _date;
}

function serverToJSDate(inputInt) {
	// take the int given by the server and return a valid Date object
	// new Date(year, month, day, hours, minutes, seconds, milliseconds)
	// 20190112003100
	const strValue = inputInt.toString();
	const year = parseInt(strValue.substring(0, 4));
	const month = parseInt(strValue.substring(4, 6)) - 1; // Date() is index based.....
	const day = parseInt(strValue.substring(6, 8));
	const hours = parseInt(strValue.substring(8, 10));
	const minutes = parseInt(strValue.substring(10, 12));
	const seconds = parseInt(strValue.substring(12, 14));
	const miliseconds = 0;
	const date = new Date(year, month, day, hours, minutes, seconds, miliseconds);
	return date;
}