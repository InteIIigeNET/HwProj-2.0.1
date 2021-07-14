import React, { Component } from "react";
import { Center, Spinner } from "@skbkontur/react-ui";
import { Typography } from "@material-ui/core";

import RequireCriticItem from "./RequireCriticItem";
import "./RequireCriticList.css";

interface Idata {
  title?: string;
  teacher?: string;
  teacherContacts?: string;
  description?: string;
  reportFile?: string;
  presentationFile?: string;
  consultantReportFile?: string;
  link?: string;
  consultant?: string;
  consultantContacts?: string;
  status?: string;
  switcher?: string;
  id?: number;
}

interface Props {
  role?: string;
  newChagnePage(newPage: string): void;
  userId?: number;
}

interface State {
  data?: Idata[];
  isLoading?: boolean;
}

class RequireCriticList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [{}],
      isLoading: false,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.whichData();
    this.setState({ isLoading: false });
  }

  private whichData = () => {
    switch (this.props.role) {
      case "student": {
        //---------------------------------------------------
        // Запрос списка работ, требующих рецензии, по userId
        //---------------------------------------------------
        //return (this.setState({data : requireData}))
      }
      case "teacher": {
        //---------------------------------------------------
        // Запрос списка работ, требующих рецензии, по userId
        //---------------------------------------------------
        //return (this.setState({data : teacherRequireCritic}))
      }
    }
  };

  private renderRequireCriticList() {
    return (
      <div>
        {this.state.data?.map((item) => {
          return (
            <RequireCriticItem
              userId={this.props.userId}
              data={item}
              newChangePage={this.props.newChagnePage}
            />
          );
        })}
        <hr />
      </div>
    );
  }

  private renderEmptyList() {
    return (
      <div style={{ textAlign: "center", marginTop: "10vh" }}>
        <Typography variant="h5">Нет работ, требующих рецензии</Typography>
      </div>
    );
  }

  private isEmpty(obj?: Idata[]) {
    return Object.keys(obj![0]).length === 0;
  }

  render() {
    return !this.isEmpty(this.state.data) ? (
      !this.state.isLoading ? (
        this.renderRequireCriticList()
      ) : (
        <div style={{ height: "60vh" }}>
          <Center>
            <Spinner type="big" caption="Загрузка" />
          </Center>
        </div>
      )
    ) : (
      this.renderEmptyList()
    );
  }
}

export default RequireCriticList;
