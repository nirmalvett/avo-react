import React, { Component } from "react";
import LearnExplanationCard from "./LearnExplanationCard";
import * as Models from "../Models";
export default class LearnExplanationContainer extends Component<
  Models.LearnExplanationContainerProps,
  Models.LearnExplanationContainerState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      explanationIndex: 0
    };
  }
  handleLeftArrow = () => {
    if (this.state.explanationIndex > 0) {
      this.setState({ explanationIndex: this.state.explanationIndex - 1 });
    }
  };
  handleRightArrow = () => {
    if (this.state.explanationIndex < this.props.explanations.length - 1) {
      this.setState({ explanationIndex: this.state.explanationIndex + 1 });
    }
  };
  render() {
    return (
      <div>
        {/* replace this chunk with the cool looking chart  */}
        <p>skill graph goes here</p>
        {this.props.skills.map(skill => (
          <p>{`${skill.name}: ${skill.rating}`}</p>
        ))}
        {/* replace this chunk with the cool looking chart  */}

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly"
          }}
        >
          {/* get rid of the following things if you want to put something different for transitional buttons             */}
          <div
            //   this
            dangerouslySetInnerHTML={{ __html: "" }}
            onClick={this.handleLeftArrow}
            style={{
              //this
              visibility:
                this.props.explanations.length > 1 &&
                this.state.explanationIndex > 0
                  ? "visible"
                  : "hidden",
              flex: 1,
              // I'm sure you'll set the width and height to whatever you want lmao
              width: 100,
              height: 50,
              padding: 10,
              margin: "auto",
              // this makes the arrow shape so get rid of all this
              clipPath:
                "polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%)",
              backgroundColor: "black",
              cursor: "pointer"
            }}
          />
          <div style={{ flex: 8, margin: 10 }}>
            <LearnExplanationCard
              explanation={this.props.explanations[this.state.explanationIndex]}
            />
          </div>

          <div
            // same stuff as above
            dangerouslySetInnerHTML={{ __html: "" }}
            onClick={this.handleRightArrow}
            style={{
              visibility:
                this.props.explanations.length > 1 &&
                this.state.explanationIndex < this.props.explanations.length - 1
                  ? "visible"
                  : "hidden",
              flex: 1,
              width: 100,
              height: 50,
              padding: 10,
              margin: "auto",
              clipPath:
                "polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%)",
              backgroundColor: "black",
              cursor: "pointer"
            }}
          />
        </div>
      </div>
    );
  }
}
