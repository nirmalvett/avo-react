import {Collapse, List, ListItem, ListItemText, Paper} from "@material-ui/core";
import {Folder, FolderOpen} from "@material-ui/icons";
import React from "react";
import {connect} from "react-redux";

class QuestionSidebar extends React.Component {
	/*
	 * Expects the following props
	 * input open: a binded function
	 * addQuestion: a binded function
	 * sets: list of set data*/
	render() {
		return (
				<div style={{flex: 1, display: 'flex'}}>
					<Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
						<List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
							{this.questionSets()} {/* This is the question sets */}
						</List>
					</Paper>
				</div>
		)
	}

	questionSets() {
		/* Method is mapping question sets */
		const {sets, addQuestion, open} = this.props;
		return (
				<React.Fragment>
					{
						sets.map((set, setIndex) =>
								<div>
									<ListItem key={"CreateTest" + setIndex} button onClick={() => open(setIndex)}
									          disabled={sets[setIndex].questions.length === 0}>
										{handleFolderOpen(set.open, set.questions.length)} {/* User clicks on open folder */}
										<ListItemText inset primary={set.name}/>
									</ListItem>
									<Collapse in={set.open} timeout='auto' unmountOnExit>
										<List>
											{
												set.questions.map((question, questionIndex) =>
														<ListItem
																key={"CreateTest" + setIndex + "-" + questionIndex}
																button onClick={() => addQuestion(question)}>
															<ListItemText secondary={question.name}/>
														</ListItem>
												)
											}
										</List>
									</Collapse>
								</div>
						)
					}
				</React.Fragment>
		)
	}

	questions(set, setIndex) {
		/* method gets each question*/
		const {addQuestion} = this.props;
		return (
				<React.Fragment>
					{
						set.questions.map((question, questionIndex) => {
									return (
											<ListItem
													key={"CreateTest" + setIndex + "-" + questionIndex}
													button onClick={() => addQuestion(question)}>
												<ListItemText secondary={question.name}/>
											</ListItem>
									)
								}
						)
					}
				</React.Fragment>
		)
	}


}

/* Function returns an open folder if true and not open folder icon otherwise
*
* @param {boolean} openBoolean a boolean of whetehr or not the test is openBoolean
* @param {int} questionLength an integer with the number of questions there are
*
* @return {ReactElement} returns the ReactElement icon for test question
*/
function handleFolderOpen(openBoolean, questionLength) {
	// this decides if the folder should be disabled or not
	const folderHasQuestionsColor = questionLength ? 'disabled' : 'action';

	// This is the open folder icon
	if (openBoolean) {
		return (<FolderOpen color={folderHasQuestionsColor}/>)

	}
	// this is the closed folder icon
	else {
		return (<Folder color={folderHasQuestionsColor}/>)
	}

}


export default connect()(QuestionSidebar);
