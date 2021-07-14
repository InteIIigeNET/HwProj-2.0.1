import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Center, Spinner } from "@skbkontur/react-ui";

import CourseWork from "../CourseWork/CourseWork";
import "./WorksList.css";

type WorkType = "current" | "completed" | "free" | "request" | "foreign";

interface Props {
  newChangePage?(newPage: string): void;
  role?: string;
  type?: WorkType;
  curatorSelect?: string;
  //userId?: number,
  token: string;
}

interface State {
  data: {}[];
  isLoading?: boolean;
  type?: WorkType;
}

class WorksList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [{}],
      isLoading: false,
      type: this.props.type,
    };
  }

  componentDidUpdate = (prevProps: Props) => {
    if (this.props.type !== prevProps.type) {
      this.setState({ data: [{}] });
      this.componentDidMount();
    }
    if (this.props.curatorSelect !== prevProps.curatorSelect) this.whichData();
  };

  componentDidMount() {
    this.setState({ isLoading: true });
    this.whichData();
    this.setState({ isLoading: false });
  }

  private whichData = () => {
    switch (this.props.role) {
      case "student": {
        switch (this.props.type) {
          case "completed": {
            const axios = require("axios").default;
            axios
              .get("../api/course_works/my/completed", this.props.token)
              .then((response: {}[]) => {
                this.setState({ data: response, type: "current" });
              });
            break;

            //----------------------------------------------------------------
            //return (this.setState({data : completedWorks, type : 'current'}))
            //-----------------------------------------------------------------
          }
          case "free": {
            const axios = require("axios").default;
            axios
              .get("../api/course_works/available")
              .then((response: {}[]) => {
                this.setState({ data: response, type: "free" });
              });
            break;

            //-------------------------------------------------------
            //return (this.setState({data : freeWorks, type : 'free'}))
            //-------------------------------------------------------
          }
        }
        break;
      }
      case "teacher": {
        switch (this.props.type) {
          case "current": {
            const axios = require("axios").default;
            axios
              .get("../api/course_works/my/active", this.props.token)
              .then((response: {}[]) => {
                this.setState({ data: response, type: "current" });
              });
            break;

            //----------------------------------------------------------------------
            //return (this.setState({data : teacherCurrentWorks, type : 'current'}))
            //----------------------------------------------------------------------
          }
          case "free": {
            //--------------------------------
            //Свободные курсовые конкретного препода
            //--------------------------------
            //return (this.setState({data : teacherMyFreeWorks, type : 'free'}))
          }
          case "completed": {
            const axios = require("axios").default;
            axios
              .get("../api/course_works/my/completed", this.props.token)
              .then((response: {}[]) => {
                this.setState({ data: response, type: "completed" });
              });
            break;

            //--------------------------------------------------------------------------
            //return (this.setState({data : teacherCompletedWorks, type : 'completed'}))
            //--------------------------------------------------------------------------
          }
          case "foreign": {
            const axios = require("axios").default;
            axios
              .get("../api/course_works/available")
              .then((response: {}[]) => {
                this.setState({ data: response, type: "foreign" });
              });
            break;

            //----------------------------------------------------------------
            //return (this.setState({data : teacherFreeWorks, type : 'foreign'}))
            //-----------------------------------------------------------------
          }
        }
        break;
      }
      case "curator": {
        if (this.props.curatorSelect === "Занятые темы") {
          const axios = require("axios").default;
          axios
            .get("../api/course_works/my/active", this.props.token)
            .then((response: {}[]) => {
              this.setState({ data: response, type: "current" });
            });
          break;

          //------------------------------------------------------------------------
          //return (this.setState({data : curatorMyCurrentWorks, type : 'current'}))
          //------------------------------------------------------------------------
        } else if (this.props.curatorSelect === "Свободные темы") {
          //--------------------------------
          //Свободные курсовые конкретного куратора
          //--------------------------------
          //return (this.setState({data : curatorMyFreeWorks, type : 'free'}))
        } else if (this.props.type === "current") {
          //--------------------------------
          //Список всех активных работ
          //--------------------------------
          //this.setState({data : curatorCurrentWorks, type : 'current'})
        }
      }
    }
  };

  private renderCourseWork(work: {}) {
    return (
      <div className="workItem">
        <CourseWork
          newChangePage={this.props.newChangePage}
          data={work}
          role={this.props.role}
          type={this.props.type}
          curatorSelect={
            this.props.curatorSelect === "Занятые темы" ||
            this.props.curatorSelect === "Свободные темы"
              ? this.props.curatorSelect
              : ""
          }
        />
      </div>
    );
  }

  private renderList() {
    return (
      <div className={this.needMarginTop()}>
        {this.state.data.map((work) => this.renderCourseWork(work))}
      </div>
    );
  }

  private renderEmptyList() {
    if (this.props.role === "curator") {
      return (
        <div style={{ textAlign: "center", marginTop: "10vh" }}>
          <Typography variant="h5">
            {this.props.curatorSelect === "Занятые темы"
              ? "Нет занятых работ"
              : "Нет свободных работ"}
          </Typography>
        </div>
      );
    } else
      return (
        <div style={{ textAlign: "center", marginTop: "10vh" }}>
          <Typography variant="h5">Нет курсовых работ</Typography>
        </div>
      );
  }

  private isEmpty(obj: {}) {
    return Object.keys(obj).length === 0;
  }

  private needMarginTop() {
    return this.props.type === "foreign" ? "mt" : "";
  }

  render() {
    return !this.state.isLoading ? (
      !this.isEmpty(this.state.data[0]) ? (
        this.renderList()
      ) : (
        this.renderEmptyList()
      )
    ) : (
      <div style={{ height: "60vh" }}>
        <Center>
          <Spinner type="big" caption="Загрузка" />
        </Center>
      </div>
    );
  }
}

export default WorksList;
