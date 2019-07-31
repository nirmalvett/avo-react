import React, { Component } from "react";
import { Typography } from "@material-ui/core";

import LearnExplanationCard from "./LearnExplanationCard";
export default class LearnExplanationContainer extends Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {
      explanationIndex: 0,
      skills: [
        { name: "Vectors I", rating: 0.82 },
        { name: "Vectors II", rating: 0.13 },
        { name: "Vectors III", rating: 0.52 },
        { name: "Vectors IV", rating: 0.23 }
      ]
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
        <p>skill graph goes here</p>
        {this.state.skills.map(skill => (
          <p>{`${skill.name}: ${skill.rating}`}</p>
        ))}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-evenly"
          }}
        >
          <div
            dangerouslySetInnerHTML={{ __html: "" }}
            onClick={this.handleLeftArrow}
            style={{
              visibility:
                this.props.explanations.length > 1 &&
                this.state.explanationIndex > 0
                  ? "visible"
                  : "hidden",
              flex: 1,
              width: 100,
              height: 50,
              padding: 10,
              margin: "auto",
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
