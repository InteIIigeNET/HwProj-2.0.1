import React, { Component } from "react";
import {
  Button,
  Center,
  DatePicker,
  Gapped,
  Modal,
  Spinner,
  Toast,
} from "@skbkontur/react-ui";
import Typography from "@material-ui/core/Typography";
import { Clock, Delete, Ok, OkDouble } from "@skbkontur/react-icons";

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
  switcher?: string;
  student?: string;
  course?: number;
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
  criticReview?: string;
  data: Idata;
  modalOpened?: boolean;
  deadline?: string;
  confirmationOpened?: boolean;
}

class BiddingDetailed extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      criticReview: "",
      data: {},
      modalOpened: false,
      deadline: "",
      confirmationOpened: false,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.whichData();
    this.setState({ isLoading: false });
  }

  private whichData = () => {
    const id = Number(this.props.page!.substr(8));
    const axios = require("axios").default;
    axios
      .get("../api/course_works/" + id.toString())
      .then((response: Idata) => {
        this.setState({ data: response });
      });

    //------------------------------------------------
    // let data : Idata = {} // eslint-disable-next-line
    // currentWorks.map(item => {
    //     if(item.id === id) data = item
    // })
    // this.setState({data : data})
    //------------------------------------------------
  };

  private modalClose = () => {
    this.setState({ modalOpened: false });
  };

  private modalOpen = () => {
    this.setState({ modalOpened: true });
  };

  private openConfirmation = () => {
    return this.setState({ confirmationOpened: true });
  };

  private closeConfirmation = () => {
    return this.setState({ confirmationOpened: false });
  };

  private handleDeadline = (e: { target: { value: string } }) => {
    return this.setState({ deadline: e.target.value });
  };

  private setDeadline = () => {
    if (this.state.deadline === "") Toast.push("Выберите дату");
    else {
      const axios = require("axios").default;
      axios.post("url", this.props.token, this.state.deadline);
      //---------------------------------------------------------------
      //запрос на установку дедлайна (передаю id и this.state.deadline)
      //---------------------------------------------------------------

      Toast.push("Дедлайн назначен");
      return this.setState({ modalOpened: false });
    }
  };

  private confirmTheProtection = () => {
    const axios = require("axios").default;
    axios.post("url", this.props.token, this.state.data.id);
    //---------------------------------------------------------
    //запрос по id о подтверждении защиты курсовой (передаю id)
    //---------------------------------------------------------

    Toast.push("Защита курсовой работы подтверждена");
    return this.setState({ confirmationOpened: false });
  };

  private renderModal() {
    const day = new Date().getDate();
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    let curMonth: string;
    month < 10 ? (curMonth = "0" + month) : (curMonth = String(month));

    return (
      <Modal onClose={this.modalClose}>
        <Modal.Header>Выберите дату</Modal.Header>

        <Modal.Body>
          <div style={{ marginTop: "5px", marginLeft: "5px" }}>
            {/*<DatePicker*/}
            {/*  value={this.state.deadline}*/}
            {/*  minDate={day + "." + curMonth + "." + year}*/}
            {/*  maxDate="30.12.2050"*/}
            {/*  onChange={this.handleDeadline}*/}
            {/*/>*/}
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Gapped>
            <Button icon={<Ok />} use="success" onClick={this.setDeadline}>
              Выбрать
            </Button>
            <Button icon={<Delete />} onClick={this.modalClose}>
              Отмена
            </Button>
          </Gapped>
        </Modal.Footer>
      </Modal>
    );
  }

  private renderConfirmation() {
    return (
      <Modal onClose={this.closeConfirmation}>
        <Modal.Header>Подтвердить защиту</Modal.Header>

        <Modal.Body></Modal.Body>

        <Modal.Footer>
          <Gapped>
            <Button
              icon={<OkDouble />}
              use="success"
              onClick={this.confirmTheProtection}
            >
              Подтвердить
            </Button>
            <Button icon={<Delete />} onClick={this.closeConfirmation}>
              Отмена
            </Button>
          </Gapped>
        </Modal.Footer>
      </Modal>
    );
  }

  private renderBiddingDetailed() {
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
        {this.state.modalOpened && this.renderModal()}
        {this.state.confirmationOpened && this.renderConfirmation()}
        <div style={{ marginLeft: "30px" }}>
          <Gapped>
            <Button icon={<Clock />} use="primary" onClick={this.modalOpen}>
              Назначить дедлайн
            </Button>
            <Button icon={<Ok />} use="success" onClick={this.openConfirmation}>
              Подтвердить защиту
            </Button>
          </Gapped>
        </div>
      </div>
    );
  }

  render() {
    return !this.state.isLoading ? (
      this.renderBiddingDetailed()
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
