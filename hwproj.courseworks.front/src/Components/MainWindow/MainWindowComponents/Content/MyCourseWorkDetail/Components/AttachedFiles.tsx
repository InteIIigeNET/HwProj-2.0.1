import React from "react";
import { Link, Toast } from "@skbkontur/react-ui";
import "typeface-roboto";

interface Props {
  data: {
    reportFile?: string;
    presentationFile?: string;
    consultantReportFile?: string;
    link?: string;
    userId?: number;
  };
}

class AttachedFiles extends React.Component<Props> {
  private downloadReport = () => {
    //-------------------------------------
    //запрос по userId на скачивание отчета
    //-------------------------------------

    Toast.push("Скачивание отчета");
  };

  private downloadPresentation = () => {
    //-------------------------------------------
    //запрос по userId на скачивание презентации
    //-------------------------------------------

    Toast.push("Скачивание презентации");
  };

  private downloadConsultantReport = () => {
    //--------------------------------------------------
    //запрос по userId на скачивание отзыва консультанта
    //--------------------------------------------------

    Toast.push("Скачивание отзыва консультанта");
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
      </div>
    );
  }
}

export default AttachedFiles;
