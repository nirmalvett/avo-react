import {
	Card,
	CardHeader,
	Collapse,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Paper,
	TextField
} from "@material-ui/core";
import {Delete, Folder, FolderOpen, Lock, LockOpen, Refresh} from "@material-ui/icons";
import React from "react";
import {InlineDateTimePicker} from "material-ui-pickers";
import {getMathJax} from "../../HelperFunctions/Utilities";
import AnswerInput from "./CreateTest";


export function QuestionCard(question, questionIndex, totalQuestions){
	 /*
    * input open: a binded function
    * addQuestion: a binded function
    * sets: list of set data*/
	 return (
	 		<Card
				  key={`Create-Test-Question-Card-index:${questionIndex}-id:${question.id}-seed:${question.seed}`}
				  style={{marginTop: '5%', marginBottom: '5%', padding: '10px'}}
		  >
	      <CardHeader
	          title={question.name}
	          subheader={'Question ' + (questionIndex + 1) + '/' + totalQuestions }
	          action={
	          	<div>
	              <IconButton onClick={() => this.refresh(questionIndex)}>
	                  <Refresh/>
	              </IconButton>
	              <IconButton onClick={() => this.lock(questionIndex)}>
	                  {question.locked ? <Lock/> : <LockOpen/>}
	              </IconButton>
	              <IconButton onClick={() => this.deleteQ(questionIndex)}>
	                  <Delete/>
	              </IconButton>
	            </div>
            }
	      />
	      { getMathJax(question.prompt, 'subheading') }
	      {
	      	question.prompts.map(
	      			(a, b) =>
						      <AnswerInput
								      key = { `Create-Test-Answer-index:${questionIndex}-${b}-` }
								      value=''
								      disabled prompt={a}
								      type={question.types[b]}/>
		      )
	      }
      </Card>
	 )
}

