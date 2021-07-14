import React, { Component } from "react";
import { Button, Gapped, SidePage, Toast, Spinner } from "@skbkontur/react-ui";
import { TextField, Typography } from "@material-ui/core";
import { Ok, Delete } from "@skbkontur/react-icons";

import "./AddNewTopic.css";

interface Props {
  closeSidePage(): void;
  token: string;
}

interface State {
  title: string;
  description: string;
  course: number;
  isSending: boolean;
  requirements: string;
  teacherName: string;
  teacherContacts: string;
  consultantName: string;
  consultantContacts: string;
  titleError: boolean;
  descriptionError: boolean;
  teacherNameError: boolean;
  teacherContactsError: boolean;
  courseError: boolean;
}

interface CreateCourseWorkViewMode {
  title: string;
  overview: string;
  description: string;
  type: string;
  requirements: string;
  consultantName: string;
  consultantContact: string;
  supervisorName: string;
  supervisorContact: string;
}

class AddWork extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      title: "",
      description: "",
      course: 0,
      isSending: false,
      requirements: "",
      teacherName: "",
      teacherContacts: "",
      consultantName: "",
      consultantContacts: "",
      titleError: false,
      descriptionError: false,
      teacherNameError: false,
      teacherContactsError: false,
      courseError: false,
    };
  }

  private setCourse = (newAttachSelect: { target: { value: {} } }) => {
    this.setState({ course: Number(newAttachSelect.target.value) });
  };

  private clickButton = () => {
    if (this.state.title === "") return this.setState({ titleError: true });

    if (this.state.description === "")
      return this.setState({ descriptionError: true });

    if (this.state.teacherName === "")
      return this.setState({ teacherNameError: true });

    if (this.state.teacherContacts === "")
      return this.setState({ teacherContactsError: true });

    if (this.state.course === 0) {
      alert("Выберите курс");
      return;
    }

    this.setState({ isSending: true });

    const axios = require("axios").default;
    let body: CreateCourseWorkViewMode = {
      title: this.state.title,
      description: this.state.description,
      overview: this.state.description,
      type: "",
      requirements: this.state.requirements,
      consultantName: this.state.consultantName,
      consultantContact: this.state.consultantContacts,
      supervisorName: this.state.teacherName,
      supervisorContact: this.state.teacherContacts,
    };
    axios.post("../api/lecturer/course_works/add", this.props.token, body);

    Toast.push("Тема добавлена");
    this.props.closeSidePage();

    this.setState({ isSending: false });
  };

  private renderSidePage() {
    // let items = ["1", "2", "3", "4", "5", "6"];
    return (
      <SidePage onClose={this.props.closeSidePage} blockBackground>
        <div className="sideTitle">
          <SidePage.Header>Предложить тему курсовой работы</SidePage.Header>
        </div>
        <SidePage.Body>
          <SidePage.Container>
            <br />
            <div style={{ width: "75%" }}>
              <TextField
                autoFocus={true}
                size="medium"
                fullWidth
                required
                variant="outlined"
                label="Название темы"
                error={this.state.titleError}
                value={this.state.title}
                onChange={(item) =>
                  this.setState({ title: item.currentTarget.value })
                }
              />
            </div>
            <br />
            <br />
            <TextField
              fullWidth
              multiline
              required
              error={this.state.descriptionError}
              rowsMax={10}
              color="secondary"
              variant="outlined"
              label="Описание работы"
              value={this.state.description}
              onChange={(item) =>
                this.setState({ description: item.currentTarget.value })
              }
            />
            <br />
            <br />
            <div className="course">
              <Gapped>
                <Typography variant="subtitle1">Курс: </Typography>
                {/*<Select items={items} onChange={this.setCourse} />*/}
              </Gapped>
            </div>
            <br />
            <TextField
              fullWidth
              multiline
              rowsMax={10}
              color="secondary"
              variant="outlined"
              label="Требования к работе"
              value={this.state.requirements}
              onChange={(item) =>
                this.setState({ requirements: item.currentTarget.value })
              }
            />

            <div style={{ marginTop: "4vh", width: "50%" }}>
              <TextField
                label="Имя преподавателя"
                fullWidth
                required
                error={this.state.teacherNameError}
                value={this.state.teacherName}
                onChange={(item) =>
                  this.setState({ teacherName: item.currentTarget.value })
                }
              />
              <br />
              <br />
              <TextField
                fullWidth
                required
                error={this.state.teacherContactsError}
                label="Контакты"
                value={this.state.teacherContacts}
                onChange={(item) =>
                  this.setState({ teacherContacts: item.currentTarget.value })
                }
              />
            </div>

            <div
              style={{ marginBottom: "1vh", marginTop: "4vh", width: "50%" }}
            >
              <Typography variant="h6">Консультант (если есть)</Typography>
              <TextField
                fullWidth
                label="Имя консультанта"
                value={this.state.consultantName}
                onChange={(item) =>
                  this.setState({ consultantName: item.currentTarget.value })
                }
              />
              <br />
              <br />
              <TextField
                fullWidth
                label="Контакты консультанта"
                value={this.state.consultantContacts}
                onChange={(item) =>
                  this.setState({
                    consultantContacts: item.currentTarget.value,
                  })
                }
              />
            </div>

            <br />
          </SidePage.Container>
        </SidePage.Body>
        <SidePage.Footer panel>
          <Gapped>
            <Button
              icon={<Ok />}
              use="success"
              size="large"
              onClick={this.clickButton}
            >
              Отправить
            </Button>
            <Button
              icon={<Delete />}
              onClick={this.props.closeSidePage}
              size="large"
            >
              Отмена
            </Button>
            {this.state.isSending && <Spinner type="mini" />}
          </Gapped>
        </SidePage.Footer>
      </SidePage>
    );
  }

  render() {
    return this.renderSidePage();
  }
}

export default AddWork;
