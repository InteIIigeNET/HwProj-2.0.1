import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Button, Center, Spinner } from "@skbkontur/react-ui";

import "./RequestsList.css";

interface Idata {
  title?: string;
  //student?: string,
  //course?: number,
  //teacher?: string,
  //description?: string,
  id?: number;
  //studentId?: number
  date?: string;
  courseWorkId?: number;
}

interface Props {
  newChangePage(newPage: string): void;
  role?: string;
  token: string;
}

interface State {
  data: Idata[];
  isLoading?: boolean;
}

class RequestsList extends Component<Props, State> {
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
        const axios = require("axios").default;
        axios
          .get("../api/course_works/applications/active", this.props.token)
          .then((response: Idata[]) => {
            this.setState({ data: response });
          });
        break;

        //return (this.setState({data : requestsData}))
      }
      case "teacher": {
        const axios = require("axios").default;
        axios
          .get("../api/course_works/applications/active", this.props.token)
          .then((response: Idata[]) => {
            this.setState({ data: response });
          });
        break;

        //return (this.setState({data : teacherRequests}))
      }
      case "curator": {
        const axios = require("axios").default;
        axios
          .get("../api/course_works/applications/active", this.props.token)
          .then((response: Idata[]) => {
            this.setState({ data: response });
          });
        break;

        //return (this.setState({data : curatorRequests}))
      }
    }
  };

  private renderTitle(item: Idata) {
    switch (this.props.role) {
      case "student":
        return (
          <div className="inline req_title">
            <Typography variant="h6">{item.title}</Typography>
          </div>
        );
      case "teacher": {
        //return <div className='inline req_title'><Typography variant='h6'>{item.title}, {item.student}, {item.course} курс</Typography></div>
        return (
          <div className="inline req_title">
            <Typography variant="h6">{item.title}</Typography>
          </div>
        );
      }

      case "curator": {
        //return <div className='inline req_title'><Typography variant='h6'>{item.title}, {item.student}, {item.course} курс</Typography></div>
        return (
          <div className="inline req_title">
            <Typography variant="h6">{item.title}</Typography>
          </div>
        );
      }
    }
  }

  private renderButton(id?: number) {
    return (
      <Button
        use="success"
        onClick={(e) => this.props.newChangePage("request_" + id?.toString())}
      >
        Подробнее
      </Button>
    );
  }

  // private buttonValue(id?: number){
  //     switch(this.props.role){
  //         case 'student':
  //             return 'request_' + id?.toString()
  //         case 'teacher':{
  //             //return 'st' + item.studentId?.toString() + '_request' + item.id!.toString()
  //             return 'request' + id!.toString()
  //         }
  //         case 'curator':
  //             return 'request' + id!.toString()
  //     }
  // }

  private renderItem(item: Idata) {
    return (
      <div className="requestItem">
        {this.renderTitle(item)}
        {this.renderButton(item.id)}
      </div>
    );
  }

  private renderRequestsList() {
    return <div>{this.state.data.map((item) => this.renderItem(item))}</div>;
  }

  private renderEmptyList() {
    return (
      <div style={{ textAlign: "center", marginTop: "10vh" }}>
        <Typography variant="h5">Нет заявок</Typography>
      </div>
    );
  }

  private isEmpty(obj: Idata[]) {
    return Object.keys(obj[0]).length === 0;
  }

  render() {
    return !this.state.isLoading ? (
      !this.isEmpty(this.state.data) ? (
        this.renderRequestsList()
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

export default RequestsList;
