import React, { Component } from "react";
import { Center, Spinner } from "@skbkontur/react-ui";
import { Typography } from "@material-ui/core";

import Description from "./Components/Description";
import AttachedFiles from "./Components/AttachedFiles";

interface Idata {
  title?: string;
  teacher?: string;
  deadline?: string;
  scienceArea?: string;
  description?: string;
  reportFile?: string;
  presentationFile?: string;
  consultantReportFile?: string;
  link?: string;
  teacherContacts?: string;
  consultant?: string;
  consultantContacts?: string;
  critic?: string;
  status?: string;
  teacherReview?: string;
  student?: string;
  course?: number;
  id?: number;
}

interface Props {
  role: string;
  page?: string;
}

interface State {
  isLoading?: boolean;
  data: Idata;
}

class CourseWorkDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: {},
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
        if (this.props.page!.indexOf("completed") + 1) {
          const id = Number(this.props.page!.substr(10));
          const axios = require("axios").default;
          axios
            .get("../api/course_works/" + id.toString())
            .then((response: Idata) => {
              this.setState({ data: response });
            });
          break;

          //----------------------------------------------------------
          //eslint-disable-next-line
          // completedWorks.map(item => {
          //     if(item.id === id) return(this.setState({data : item}))
          // })
          //----------------------------------------------------------
        }
        break;
      }
      case "teacher": {
        if (this.props.page!.indexOf("completed") + 1) {
          const id = Number(this.props.page!.substr(10));
          const axios = require("axios").default;
          axios
            .get("../api/course_works/" + id.toString())
            .then((response: Idata) => {
              this.setState({ data: response });
            });
          break;

          //----------------------------------------------------------
          // eslint-disable-next-line
          // teacherCompletedWorks.map(item => {
          //     if (item.id === id) return(this.setState({data : item}))
          // })
          //----------------------------------------------------------
        }
        break;
      }
    }
  };

  private renderCourseWorkDetail() {
    return (
      <div className="informationWindow">
        <div className="workTitle">
          <Typography variant="h4">{this.state.data.title}</Typography>
        </div>
        <Description data={this.state.data} role={this.props.role} />
        <AttachedFiles data={this.state.data} role={this.props.role} />
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderCourseWorkDetail()
    ) : (
      <div style={{ height: "60vh" }}>
        <Center>
          <Spinner type="big" caption="Загрузка" />
        </Center>
      </div>
    );
  }
}

export default CourseWorkDetail;
