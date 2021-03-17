import React, { Component } from "react";
import {
  Center,
  Gapped,
  Spinner,
  Textarea as TextArea,
  Toast,
} from "@skbkontur/react-ui";
import { Typography } from "@material-ui/core";

import Description from "./Components/Description";
import "./FreeWorkDetail.css";

interface Idata {
  title?: string;
  teacher?: string;
  teacherContacts?: string;
  description?: string;
  deadline?: string;
  id?: number;
}

interface CreateApplicationViewModel {
  message?: string;
  courseWorkId?: number;
}

interface Props {
  role?: string;
  page?: string;
  token: string;
}

interface State {
  isLoading?: boolean;
  aboutMe?: string;
  data: Idata;
}

class FreeWorkDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      aboutMe: "",
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
        const id = Number(this.props.page!.substr(5));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });
        break;

        // let data : Idata = {} // eslint-disable-next-line
        // freeWorks.map(item =>{
        //     if(item.id === id) return (data = item)
        // })
        // this.setState({data : data})
      }
      case "teacher": {
        const id = Number(this.props.page!.substr(8));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });
        break;

        // let data : Idata = {} // eslint-disable-next-line
        // teacherFreeWorks.map(item => {
        //     if(item.id === id) data = item
        // })
        // this.setState({data : data})
      }
    }
  };

  private handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ aboutMe: event.target.value });
  };

  private submit = () => {
    let body: CreateApplicationViewModel = {
      message: this.state.aboutMe,
      courseWorkId: this.state.data.id,
    };
    const axios = require("axios").default;
    axios.post(
      "../api/student/course_works/" +
        this.state.data.id?.toString() +
        "/apply",
      this.props.token,
      body,
      this.state.data.id
    );

    Toast.push("Заявка отправлена");
  };

  private needCV() {
    if (this.props.role === "student")
      return (
        <div style={{ marginLeft: "30px" }}>
          <Typography variant="h6">Рассказать о себе</Typography>
          <Gapped gap={5}>
            <TextArea
              autoResize={true}
              width="40vw"
              value={this.state.aboutMe}
              onChange={this.handleChange}
              placeholder="Резюме"
            />
            <button id="submit" onClick={this.submit}>
              <Typography variant="button">Подать заявку</Typography>
            </button>
          </Gapped>
        </div>
      );
  }

  private renderFreeWork() {
    return (
      <div>
        <div className="workTitle">
          <Typography variant="h4">{this.state.data.title}</Typography>
        </div>
        <Description data={this.state.data} />
        <hr />
        {this.needCV()}
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderFreeWork()
    ) : (
      <div style={{ height: "60vh" }}>
        <Center>
          <Spinner type="big" caption="Загрузка" />
        </Center>
      </div>
    );
  }
}

export default FreeWorkDetail;
