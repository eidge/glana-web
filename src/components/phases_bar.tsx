import { Component } from "react";
import SavedFlight from "glana/src/saved_flight";
import { minutes } from "glana/src/units/duration";
import Phase from "glana/src/analysis/phase";

interface Props {
  flight: SavedFlight;
}

interface State {}

export default class PhasesBar extends Component<Props, State> {
  render() {
    return (
      <div className="phase-bar">
        {this.renderPhases()}
        <style jsx>{`
          .phase-bar {
            width: 100%;
            position: relative;
            overflow: hidden;
          }
        `}</style>
      </div>
    );
  }

  private renderPhases() {
    return this.props.flight.getPhases().map((phase, idx) => {
      const relativeDuration = phase
        .duration()
        .convertTo(minutes)
        .divide(this.totalDuration().convertTo(minutes).value)
        .multiply(100).value;

      return (
        <div
          key={`phase-bar-${idx}`}
          className={this.phaseClassName(phase)}
          style={{ width: `${relativeDuration}%` }}
        >
          <style jsx>{`
            .phase {
              display: inline-block;
              height: 15px;
              background-color: grey;
            }

            .phase-thermalling {
              background-color: red;
            }

            .phase-gliding {
              background-color: green;
            }
          `}</style>
        </div>
      );
    });
  }

  private phaseClassName(phase: Phase) {
    switch (phase.type) {
      case "gliding":
        return "phase phase-gliding";
      case "thermalling":
        return "phase phase-thermalling";
    }
    return "phase";
  }

  private totalDuration() {
    return this.props.flight.getPhases().reduce((duration, phase) => {
      return duration.add(phase.duration());
    }, minutes(0));
  }
}
