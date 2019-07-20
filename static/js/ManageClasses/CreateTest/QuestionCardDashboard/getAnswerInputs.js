import React from "react";
import AnswerInput from "../../../AnswerInput/AnswerInput";

export function getAnswerInputs (question, promptList, questionIndex) {
  /* question.prompts array of questionPromptList*/
  return (
	  <React.Fragment>
		{
		  promptList.map (
			  (a, b) =>
				  <AnswerInput
					  key={`Create-Test-Answer-index:${questionIndex}-${b}-`}
					  value=''
					  disabled prompt={a}
					  type={question.types[b]}/>
		  )
		}
	  </React.Fragment>
  )
}