import React from "react";
import { Link, Toast } from "@skbkontur/react-ui";
import "typeface-roboto";

interface Props {
  data: {
    title?: string;
    teacher?: string;
    deadline?: string;
    scienceArea?: string;
    description?: string;
    reportFile?: string;
    presentationFile?: string;
    consultantReportFile?: string;
    link?: string;
    criticRiview?: string;
    id?: number;
  };
  //  userId?: number
}

class AttachedFiles extends React.Component<Props> {
  private downloadReport = () => {
    //-------------------------------------------
    // Запрос по id на скачивание отчета студента
    //-------------------------------------------

    Toast.push("Скачивание отчета");
  };

  private downloadPresentation = () => {
    //-------------------------------------------
    // Запрос по id на скачивание презентации студента
    //-------------------------------------------

    Toast.push("Скачивание презентации");
  };

  private downloadConsultantReport = () => {
    //-------------------------------------------
    // Запрос по id на скачивание отзыва консультанта
    //-------------------------------------------

    Toast.push("Скачивание отзыва консультанта");
  };

  private downloadCriticReport = () => {
    //-------------------------------------------
    // Запрос по id на скачивание рецензии
    //-------------------------------------------

    Toast.push("Скачивание рецензии");
  };

  private getHref() {
    let link = this.props.data.link;
    if (link?.substr(0, 4) !== "http") link = "http://" + link;
    return link;
  }

  render() {
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
        {this.props.data.criticRiview !== "" ? (
          <div>
            <span>Рецензия: </span>
            <Link use="success" onClick={this.downloadCriticReport}>
              {this.props.data.criticRiview}
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default AttachedFiles;
