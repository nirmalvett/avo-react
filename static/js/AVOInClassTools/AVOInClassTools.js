import React from 'react';

const CONST_AVORREF = 1;
const CONST_SYNTHESIS = 2;

export default class AVOInClassTools extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      selectedMode: null
    } // this is the state, if any state is changed from this.setState then any components that rely on it will change
  }

  render(){
    const exampleBoolean = false;
    return (
      <div className='avo-user__background' style={{width: '100%', flex: 1, display: 'flex'}}>
        AVOInClassTools: This is where things are rendered
        { // curly braces mean that you are running js code
          exampleBoolean
              ? this.exampleHelperMethod() // if the given boolean is true
              : null
        }
      </div>
    )

  }

  handleModeChange(newModeConst){
    this.setState({
      selectedMode: newModeConst
    })
  }

  exampleHelperMethod(){
    return (
        <div>Here's something that will only be displayed if the turnary operator is working</div>
    )
  }

}