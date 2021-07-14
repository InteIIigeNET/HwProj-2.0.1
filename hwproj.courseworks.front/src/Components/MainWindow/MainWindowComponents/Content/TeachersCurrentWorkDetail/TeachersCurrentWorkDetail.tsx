import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Center, Gapped, Link, Spinner, Toast } from "@skbkontur/react-ui";

import Description from "./Components/Description";
import AttachedFiles from "./Components/AttachedFiles";

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
  student?: string;
  course?: number;
  review?: string;
  criticReview?: string;
  id?: number;
}

interface Props {
  page?: string;
  role?: string;
  token: string;
}

interface State {
  isLoading?: boolean;
  data: Idata;
}

class BiddingDetailed extends Component<Props, State> {
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
      case "teacher": {
        const id = Number(this.props.page!.substr(8));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });
        break;

        //-------------------------------------------------
        // let data : Idata = {} // eslint-disable-next-line
        // teacherCurrentWorks.map(item => {
        //     if(item.id === id) return (data = item)
        // })
        // this.setState({data : data})
        //--------------------------------------------------
      }
      case "curator": {
        const id = Number(this.props.page!.substr(12));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });
        break;

        //-------------------------------------------------
        // let data : Idata = {} // eslint-disable-next-line
        // curatorCurrentWorks.map(item => {
        //     if(item.id === id) return (data = item)
        // })
        // this.setState({data : data})
        //-------------------------------------------------
      }
    }
  };

  private attachFile = (fileList: FileList) => {
    const axios = require("axios").default;
    let f = new FormData();
    f.append("File", fileList[0]);
    axios.post("url", f);

    //----------------------------------
    // const newReview = fileList[0].name;
    // this.setState({review : newReview})
    //----------------------------------

    Toast.push("Отзыв прикреплен");
  };

  private downloadFile() {
    //------------------------------------------------------------
    // Запрос по id на скачивание отзыва научника по userId? и id
    //------------------------------------------------------------

    Toast.push("Скачивание...");
  }

  private deleteFile = () => {
    //----------------------------------------------------
    //  Запрос на удаление отзыва научника по userId? и id
    //----------------------------------------------------

    //--------------------------
    // this.setState({review : ''})
    //--------------------------

    Toast.push("Отзыв удален");
  };

  private renderCurrentWorkDetail() {
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
        {this.state.data.review !== "" ? (
          <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
            <Gapped>
              <Typography variant="h5">
                Отзыв:{" "}
                {
                  <Link onClick={this.downloadFile} use="success">
                    {this.state.data.review}
                  </Link>
                }
              </Typography>
              <Link use="grayed" onClick={this.deleteFile}>
                Удалить
              </Link>
            </Gapped>
          </div>
        ) : null}
        <div style={{ marginLeft: "20px" }}>
          <Gapped>
            <Typography variant="h5">Прикрепить отзыв:</Typography>
            <input
              className="inputAttach"
              type="file"
              onChange={(e) => this.attachFile(e.target.files!)}
            />
          </Gapped>
        </div>
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderCurrentWorkDetail()
    ) : (
      <div style={{ height: "60vh" }}>
        <Center>
          <Spinner type="big" caption="Загрузка" />
        </Center>
      </div>
    );
  }
}

export default BiddingDetailed;
