import {Collapse, List, ListItem, ListItemText, Paper} from "@material-ui/core";
import {Folder, FolderOpen} from "@material-ui/icons";
import React from "react";
import {connect} from "react-redux";
import {HashLoader} from 'react-spinners';
import {createTestQuestion, createTestOpenQuestionSet} from "../../Redux/Actions/actionsMakeTest";


class QuestionSidebar extends React.Component {
  /*
   * Expects the following props
   * input open: a binded function
   * addQuestion: a binded function
   * sets: list of set data*/
  render() {
	const {isLoading} = this.props;
	/* If it's still loading */
	if (isLoading){
	  return this.loading();
	}
	else {
	  return (
		<div style={{flex: 1, display: 'flex'}}>
		  <Paper square style={{width: '100%', flex: 1, display: 'flex'}}>
			<List style={{flex: 1, overflowY: 'auto', marginTop: '5px', marginBottom: '5px'}}>
			  { this.questionSets() }  /* This is the question sets */
			</List>
		  </Paper>
		</div>
	)
	}

  }

  questionSets() {
	/* Method is mapping question sets */
	const {sets} = this.props;
	return (
		<React.Fragment>
		  {
			Object.keys(sets).map((key, setIndex) => {
				  const set = sets[key];
				  return (
					  <div>
						<ListItem
							key={"CreateTest-Set-List-Item" + setIndex}
							button
							onClick={() => this.open(setIndex)}
							disabled={set.questions.length === 0}>
						  {handleFolderOpen(set.open, set.questions.length)} {/* User clicks on open folder */}
						  <ListItemText inset primary={set.name}/>
						</ListItem>
						<Collapse in={set.open} timeout='auto' unmountOnExit>
						  <List>
							{
							  set.questions.map((question, questionIndex, setIndex) =>
								  <ListItem
									  key={"CreateTest-Per-Set" + setIndex + "-" + questionIndex}
									  button onClick={() => this.addQuestion(question)}>
									<ListItemText secondary={question.name}/>
								  </ListItem>
							  )
							}
						  </List>
						</Collapse>
					  </div>
				  )
				}
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
						  key={"CreateTest-Item" + setIndex + "-" + questionIndex}
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

  open(questionIndex) {
	this.props.dispatch(createTestOpenQuestionSet(questionIndex))
  }

  addQuestion(questionObj) {
	this.props.dispatch(createTestQuestion(questionObj));
  }

  loading() {
	const {isLoading} = this.props;
	return (
		<React.Fragment>
		  {
			isLoading
				? <div className="center-div">
				  	<HashLoader size={150} color={'#399103'}/>
				  </div>
				: null
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

function mapStateToProps({createTest}) {
  return {
	sets: createTest.sets,
	isLoading: createTest.sets.length === 0
  }
}

export default connect(mapStateToProps)(QuestionSidebar);
