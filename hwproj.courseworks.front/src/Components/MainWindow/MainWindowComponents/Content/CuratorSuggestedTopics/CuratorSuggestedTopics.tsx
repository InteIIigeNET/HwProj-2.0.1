import React from "react";

import WorkList from "../WorksList/WorksList";

interface Props {
  newChangePage(newPage: string): void;
  //userId?: number,
  token: string;
}

interface selectType {
  target?: { value?: string };
}

interface State {
  whichTopics?: selectType;
}

class CuratorSuggestedTopics extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      whichTopics: { target: { value: "Занятые темы" } },
    };
  }

  private handleSelectChange = (newItem: {}) => {
    return this.setState({ whichTopics: newItem });
  };

  private renderSelect() {
    return (
      <div style={{ marginTop: "-0.5vh" }}>
        <div style={{ marginBottom: "2vh" }}>
          {/*<Select*/}
          {/*  items={["Занятые темы", "Свободные темы"]}*/}
          {/*  value={this.state.whichTopics!.target!.value}*/}
          {/*  onChange={this.handleSelectChange}*/}
          {/*/>*/}
        </div>

        <WorkList
          token={this.props.token}
          curatorSelect={this.state.whichTopics?.target?.value}
          role="curator"
          newChangePage={this.props.newChangePage}
          type={
            this.state.whichTopics?.target?.value === "Занятые темы"
              ? "current"
              : "free"
          }
        />
      </div>
    );
  }

  render() {
    return <div style={{ marginLeft: "1vw" }}>{this.renderSelect()}</div>;
  }
}

export default CuratorSuggestedTopics;
