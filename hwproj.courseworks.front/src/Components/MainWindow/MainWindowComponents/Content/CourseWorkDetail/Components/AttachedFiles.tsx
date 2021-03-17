import React from "react";
import { Link, Toast } from "@skbkontur/react-ui";
import "typeface-roboto";

interface Props {
  data: {
    reportFile?: string;
    presentationFile?: string;
    consultantReportFile?: string;
    link?: string;
    teacherReview?: string;
    criticReview?: string;
    id?: number;
  };
  role?: string;
}

class AttachedFiles extends React.Component<Props> {
  private downloadReport = () => {
    //запрос на скачивание отчета студента по id
    Toast.push("Скачивание отчета");
  };

  private downloadTeacherReview = () => {
    //запрос на скачивание отзыва научника по id
    Toast.push("Скачивание отзыва научника");
  };

  private downloadPresentation = () => {
    //запрос на скачивание презентации по id
    Toast.push("Скачивание презентации");
  };

  private downloadConsultantReport = () => {
    //запрос на скачивание отзыва консультанта по id
    Toast.push("Скачивание отзыва консультанта");
  };

  private downloadCriticReport = () => {
    //запрос на скачивание рецензее по id
    Toast.push("Скачивание рецензии");
  };

  private getHref() {
    let link = this.props.data.link;
    if (link?.substr(0, 4) !== "http") link = "http://" + link;
    return link;
  }

  render() {
    switch (this.props.role) {
      case "student":
        return (
          <div className="attached">
            {this.props.data.reportFile !== "" ? (
              <div>
                <span>Отчет: </span>
                <Link use="success" onClick={this.downloadReport}>
                  {this.props.data.reportFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.teacherReview !== "" ? (
              <div>
                <span>Отзыв научного руководителя: </span>
                <Link use="success" onClick={this.downloadTeacherReview}>
                  {this.props.data.teacherReview}
                </Link>
              </div>
            ) : null}
            {this.props.data.presentationFile !== "" ? (
              <div>
                <span>Презентация: </span>{" "}
                <Link use="success" onClick={this.downloadPresentation}>
                  {this.props.data.presentationFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.consultantReportFile !== "" ? (
              <div>
                <span>Отзыв консультанта: </span>
                <Link use="success" onClick={this.downloadConsultantReport}>
                  {this.props.data.consultantReportFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.link !== "" ? (
              <div>
                <span>Ссылка: </span>
                <Link use="success" href={this.getHref()}>
                  {this.props.data.link}
                </Link>
              </div>
            ) : null}
            {this.props.data.criticReview !== "" ? (
              <div>
                <span>Рецензия: </span>
                <Link use="success" onClick={this.downloadCriticReport}>
                  {this.props.data.criticReview}
                </Link>
              </div>
            ) : null}
          </div>
        );
      case "teacher":
        return (
          <div className="attached">
            {this.props.data.reportFile !== "" ? (
              <div>
                <span>Отчет студента: </span>
                <Link use="success" onClick={this.downloadReport}>
                  {this.props.data.reportFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.presentationFile !== "" ? (
              <div>
                <span>Презентация: </span>{" "}
                <Link use="success" onClick={this.downloadPresentation}>
                  {this.props.data.presentationFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.link !== "" ? (
              <div>
                <span>Ссылка: </span>
                <Link use="success" href={this.getHref()}>
                  {this.props.data.link}
                </Link>
              </div>
            ) : null}
            <br />
            {this.props.data.teacherReview !== "" ? (
              <div>
                <span>Отзыв научного руководителя: </span>
                <Link use="success" onClick={this.downloadTeacherReview}>
                  {this.props.data.teacherReview}
                </Link>
              </div>
            ) : null}
            {this.props.data.consultantReportFile !== "" ? (
              <div>
                <span>Отзыв консультанта: </span>
                <Link use="success" onClick={this.downloadConsultantReport}>
                  {this.props.data.consultantReportFile}
                </Link>
              </div>
            ) : null}
            {this.props.data.criticReview !== "" ? (
              <div>
                <span>Рецензия: </span>
                <Link use="success" onClick={this.downloadCriticReport}>
                  {this.props.data.criticReview}
                </Link>
              </div>
            ) : null}
          </div>
        );
    }
  }
}

export default AttachedFiles;
