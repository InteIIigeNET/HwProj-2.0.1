import React, { Component } from "react";
import { Button, Gapped } from "@skbkontur/react-ui";
import { Add, Briefcase, Delete } from "@skbkontur/react-icons";

import BiddingResults from "./Components/BiddingResults/BiddingResults";
import AddWork from "./Components/AddNewTopic/AddNewTopic";
import "./Main.css";

interface Props {
  isCritic?: boolean;
  handleCritic(): void;
  newChangePage(newPage: string): void;
  role?: string;
  token: string;
}

interface State {
  opened?: boolean;
}

class Main extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      opened: false,
    };
  }

  private whichData() {
    switch (this.props.role) {
      case "student": {
        const axios = require("axios").default;
        axios.get("url", this.props.token);
        //---------------------------------
        // Запрос результатов биддинга
        //---------------------------------
        return [{}];
        //return biddingData
      }
      case "teacher": {
        const axios = require("axios").default;
        axios.get("url", this.props.token);
        //---------------------------------
        // Запрос результатов биддинга
        //---------------------------------

        return [{}];
        //return teacherBiddingData
      }
    }
  }

  private changeCriticStatus = () => {
    this.props.handleCritic();
  };

  private openSidePage = () => {
    this.setState({ opened: true });
  };

  private closeSidePage = () => {
    this.setState({ opened: false });
  };

  private needSidePage() {
    return this.props.role === "teacher" || this.props.role === "curator" ? (
      <div>
        {this.state.opened ? (
          <AddWork
            token={this.props.token}
            closeSidePage={this.closeSidePage}
          />
        ) : null}
        <Button width="auto" onClick={this.openSidePage} icon={<Add />}>
          Предложить тему курсовой работы
        </Button>
      </div>
    ) : null;
  }

  private criticButton() {
    return !this.props.isCritic ? (
      <Button
        icon={<Briefcase />}
        onClick={this.changeCriticStatus}
        use="success"
      >
        Стать рецензентом
      </Button>
    ) : (
      <Button icon={<Delete />} onClick={this.changeCriticStatus} use="danger">
        Перестать быть рецензентом
      </Button>
    );
  }

  private renderMain() {
    return (
      <div>
        {this.props.isCritic ? (
          <BiddingResults
            newChangePage={this.props.newChangePage}
            role={this.props.role}
            data={this.whichData()!}
          />
        ) : null}
        <div className="ml20">
          <Gapped>
            {this.props.role !== "curator" ? this.criticButton() : null}
            {this.needSidePage()}
          </Gapped>
        </div>
      </div>
    );
  }

  render() {
    return this.renderMain();
  }
}

export default Main;
