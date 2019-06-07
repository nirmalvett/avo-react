import { Card, CardHeader, IconButton, } from "@material-ui/core";
import { Delete, Lock, LockOpen, Refresh } from "@material-ui/icons";
import React from "react";
import { getMathJax } from "../../HelperFunctions/Utilities";
import AnswerInput from "../../AnswerInput/AnswerInput";


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
	      { getAnswerInputs(question, question.prompts, questionIndex) }
      </Card>
	 )
}

function getAnswerInputs(question, promptList, questionIndex){
  /* question.prompts array of questionPromptList*/
	return (
			<React.Fragment>
				 {
	      	promptList.map(
	      			(a, b) =>
						      <AnswerInput
								      key = { `Create-Test-Answer-index:${questionIndex}-${b}-` }
								      value=''
								      disabled prompt={a}
								      type={question.types[b]}/>
		      )
	      }
			</React.Fragment>
	)
}

