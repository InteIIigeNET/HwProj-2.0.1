import React, { Component } from "react";
import { Center, Spinner } from "@skbkontur/react-ui";
import { Typography } from "@material-ui/core";

import Description from "./Components/Description";
import AttachedFiles from "./Components/AttachedFiles";
import Buttons from "./Components/Buttons";

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
  student?: string;
  course?: number;
  id?: number;
}

interface Props {
  page?: string;
  role?: string;
  userId?: number;
}

interface State {
  isLoading?: boolean;
  data: Idata;
}

class RequireCriticDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      data: {},
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
        const id = Number(this.props.page!.substr(14));
        //---------------------------------------------------------
        // Запрос данных о работе требующей рецензирования по id
        //---------------------------------------------------------

        //-------------------------------------------------
        // let data : Idata = {} // eslint-disable-next-line
        // requireData.map(item => {
        //     if(item.id === id) data = item
        // })
        // this.setState({data : data})
        // break
        //-------------------------------------------------
      }
      case "teacher": {
        const id = Number(this.props.page!.substr(14));
        //-------------------------------------------------------
        // Запрос данных о работе требующей рецензирования по id
        //-------------------------------------------------------

        //-------------------------------------------------
        // let data : Idata = {} // eslint-disable-next-line
        // teacherRequireCritic.map(item => {
        //     if(item.id === id) data = item
        // })
        // this.setState({data : data})
        // break
        //-------------------------------------------------
      }
    }
  };

  private renderRequireCriticDetail() {
    return (
      <div>
        <div className="workTitle">
          <Typography variant="h4">{this.state.data.title}</Typography>
        </div>
        <div style={{ marginLeft: "20px", marginTop: "1vh" }}>
          <Typography variant="h6">
            {this.state.data.student}, {this.state.data.course} курс
          </Typography>
        </div>
        <Description data={this.state.data} />
        <AttachedFiles data={this.state.data} />
        <hr />
        <Buttons userId={this.props.userId} id={this.state.data.id} />
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderRequireCriticDetail()
    ) : (
      <div style={{ height: "60vh" }}>
        <Center>
          <Spinner type="big" caption="Загрузка" />
        </Center>
      </div>
    );
  }
}

export default RequireCriticDetail;
