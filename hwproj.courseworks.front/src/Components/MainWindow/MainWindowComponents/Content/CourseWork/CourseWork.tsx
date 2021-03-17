import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Button, Gapped } from "@skbkontur/react-ui";
import { Info } from "@skbkontur/react-icons";

import "./CourseWork.css";

type WorkType = "current" | "completed" | "free" | "request" | "foreign";

interface Idata {
  title?: string;
  teacher?: string;
  deadline?: string;
  description?: string;
  id?: number;
  student?: string;
  course?: number;
}

interface Props {
  newChangePage?(newPage: string): void;
  data: Idata;
  role?: string;
  type?: WorkType;
  curatorSelect?: string;
}

interface State {}

class CourseWork extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private courseWorkTitle() {
    switch (this.props.role) {
      case "teacher": {
        switch (this.props.type) {
          case "current":
            return (
              <p className="courseWorkTitle">
                <b>{this.props.data.title}</b> {", " + this.props.data.student},{" "}
                {this.props.data.course} курс
              </p>
            );
          case "free":
            return (
              <p className="courseWorkTitle">
                <b>{this.props.data.title}</b>, {this.props.data.course} курс
              </p>
            );
          case "completed":
            return (
              <p className="courseWorkTitle">
                <b>{this.props.data.title}</b> {", " + this.props.data.student},{" "}
                {this.props.data.course} курс
              </p>
            );
          case "foreign":
            return (
              <p className="courseWorkTitle">
                <b>{this.props.data.title}</b>, {this.props.data.course} курс
              </p>
            );
        }
        break;
      }
      case "student": {
        return (
          <p className="courseWorkTitle">
            <b>{this.props.data.title}</b> {", " + this.props.data.teacher}
          </p>
        );
      }
      case "curator": {
        return (
          <p className="courseWorkTitle">
            <b>{this.props.data.title}</b>, преподаватель{" "}
            {this.props.data.teacher}
          </p>
        );
      }
    }
  }

  private renderDeadline() {
    return this.props.data.deadline !== "" && this.props.type !== "free" ? (
      <div style={{ marginLeft: "30px" }}>
        <Typography variant="overline">
          Дедлайн: {this.props.data.deadline}
        </Typography>
      </div>
    ) : null;
  }

  private renderButton() {
    return (
      <div style={{ marginLeft: "2vw", marginBottom: "2vh" }}>
        <Button
          icon={<Info />}
          use="success"
          onClick={(e) => this.props.newChangePage!(this.buttonValue())}
        >
          Подробнее
        </Button>
      </div>
    );
  }

  private buttonValue(): string {
    const id = this.props.data.id;
    switch (this.props.role) {
      case "student": {
        if (this.props.type === "current") return "Моя курсовая детально";
        else return this.props.type + "_" + id?.toString();
      }
      case "teacher":
        return this.props.type + "_" + id?.toString();
      case "curator": {
        if (this.props.curatorSelect === "Занятые темы")
          return "curatorBusy_" + id!.toString();
        else if (this.props.curatorSelect === "Свободные темы")
          return "curatorFree_" + id!.toString();
        else return this.props.type + "_" + id?.toString();
      }
    }
    return "null";
  }

  private renderDescription() {
    return (
      <p className="courseWorkDescription">
        <div style={{ marginLeft: "1vw" }}>{this.props.data.description}</div>
        {this.props.curatorSelect === "Занятые темы" ? (
          <div
            style={{
              marginLeft: "1vw",
              marginTop: "1vh",
              textDecoration: "underline",
            }}
          >
            <Typography variant="button">
              Студент: {this.props.data.student}
            </Typography>
          </div>
        ) : null}
      </p>
    );
  }

  private isEmpty(obj: Idata) {
    return Object.keys(obj).length === 0;
  }

  private renderCourseWork() {
    return !this.isEmpty(this.props.data) ? (
      <div className="courseWork">
        {this.courseWorkTitle()}
        {this.renderDescription()}
        <Gapped gap={10}>
          {this.renderButton()}
          {this.renderDeadline()}
        </Gapped>
      </div>
    ) : (
      <div style={{ textAlign: "center", marginTop: "10vh" }}>
        <Typography variant="h5">Нет курсовой работы</Typography>
      </div>
    );
  }

  render() {
    return this.renderCourseWork();
  }
}

export default CourseWork;
