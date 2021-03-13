import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Button, Center, Spinner, Toast } from "@skbkontur/react-ui";

import Description from "./Components/Description";
import RequestsList from "./Components/RequestsList";

interface Idata {
  title?: string;
  teacher?: string;
  teacherContacts?: string;
  description?: string;
  course?: number;
  id?: number;
  studentId?: number;
}

interface Irequest {
  //title?: string,
  student?: string;
  //course?: number,
  group?: string;
  //description?: string,
  id?: number;
}

interface Props {
  page?: string;
  role?: string;
  newChangePage(newPage: string): void;
  token: string;
}

interface State {
  data: Idata;
  requests?: Irequest[];
  isLoading?: boolean;
}

class FreeWorkDetail extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: {},
      requests: [{}],
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
      case "teacher": {
        const id = Number(this.props.page!.substr(5));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });

        axios
          .get(
            "../api/lecturer/course_works/" + id.toString() + "/applications",
            this.props.token
          )
          .then((response: Irequest[]) => {
            this.setState({ requests: response });
          });
        break;

        //---------------------------------------------
        // let validRequests : Irequest[]
        // validRequests = [] // eslint-disable-next-line
        // teacherRequest.map(item =>{
        //     if(item.id === id)
        //         validRequests.push(item)
        // })
        // let data : Idata = {} // eslint-disable-next-line
        // teacherMyFreeWorks.map(item => {
        //     if(item.id === id) return (data = item)
        // })
        // this.setState({data : data, requests : validRequests})
        //---------------------------------------------
      }
      case "curator": {
        const id = Number(this.props.page!.substr(12));
        const axios = require("axios").default;
        axios
          .get("../api/course_works/" + id.toString())
          .then((response: Idata) => {
            this.setState({ data: response });
          });

        axios
          .get(
            "../api/lecturer/course_works/" + id.toString() + "/applications",
            this.props.token
          )
          .then((response: Irequest[]) => {
            this.setState({ requests: response });
          });
        break;

        //-------------------------------------------------
        // let validRequests : Irequest[]
        // validRequests = [] // eslint-disable-next-line
        // curatorRequest.map(item => {
        //     if(item.id === id)
        //         validRequests.push(item)
        // })
        // let data : Idata = {} // eslint-disable-next-line
        // curatorMyFreeWorks.map(item => {
        //     if(item.id === id) return (data = item)
        // })
        // this.setState({data : data, requests : validRequests})
        //-------------------------------------------------
      }
    }
  };

  private deleteWork = () => {
    const axios = require("axios").default;
    axios.delete(
      "../api/lecturer/course_works/" +
        this.state.data.id?.toString() +
        "/delete",
      this.props.token
    );
    //.then(...)

    Toast.push("Курсовая работа удалена");
  };

  private renderFreeWorkDetail() {
    return (
      <div>
        <div className="workTitle">
          <Typography variant="h4">{this.state.data.title}</Typography>
        </div>
        <Description data={this.state.data} />
        <RequestsList
          data={this.state.requests}
          newChangePage={this.props.newChangePage}
          role={this.props.role}
        />
        <hr />
        <div className="ml30">
          <Button use="danger" onClick={this.deleteWork}>
            <Typography variant="button">Удалить курсовую</Typography>
          </Button>
        </div>
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderFreeWorkDetail()
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
