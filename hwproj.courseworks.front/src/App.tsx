import React, { Component } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import axios from "axios";
import decode from "jwt-decode";
import { Toast, Button } from "@skbkontur/react-ui";

import { IUser, Role } from "types";
import { API_ROOT } from "config";

import Profile from "pages/Profile";
import Login from "pages/Login";
import Register from "pages/Register";

import ModalRoot from "./ModalRoot";
import Footer from "parts/Footer";

type Props = {};

interface ModalState {
  type: "INVITE_LECTURER" | "COURSE_WORK_CREATE" | "";
  props: any;
}

interface State {
  user: IUser;
  page?: string;
  logged?: boolean;
  token: string;
  modal: ModalState;
}

interface IModalContext {
  state: ModalState;
  openModal: (type: ModalState["type"], props?: ModalState["props"]) => void;
  closeModal: () => void;
}

export const ModalContext = React.createContext<IModalContext>(
  {} as IModalContext
);

class App extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      page: "Главная",
      user: {} as IUser,
      logged: false,
      token: localStorage.getItem("id_token") ?? "",
      modal: { type: "", props: {} },
    };

    this.fetchUserData = this.fetchUserData.bind(this);
  }

  changePage = (event: React.MouseEvent<HTMLButtonElement>) => {
    const newPage = event.currentTarget.value;
    switch (this.state.user.role) {
      case Role.Student:
        if (newPage === "Мои курсовые") {
          this.setState({ page: "Активные" });
        }
        break;
      case Role.Lecturer:
        if (newPage === "Мои курсовые") {
          this.setState({ page: "Занятые" });
        }
        break;
      case Role.Curator:
        if (newPage === "Рецензенты") {
          this.setState({ page: "Новые рецензенты" });
        } else if (newPage === "Курсовые") {
          this.setState({ page: "Занятые темы" });
        }
        break;
    }
    this.setState({ page: newPage });
  };

  private newChangePage = (newPage: string) => {
    return this.setState({ page: newPage });
  };

  handleCritic = () => {
    //-----------------------------------------------
    // Запрос на становление рецензентом или наоборот
    //-----------------------------------------------

    //-----------------------------------------
    let newUserData = this.state.user;
    newUserData.isCritic = !newUserData.isCritic;
    this.setState({ user: newUserData });
    //------------------------------------------

    this.state.user.isCritic
      ? Toast.push("Теперь Вы - рецензент")
      : Toast.push("Вы больше не рецензент");
  };

  decodeUserFromToken = (token: string) => {
    const user: IUser = decode(token);
    return {
      userId: (user as any)._id as number,
      role: (user as any)._role as Role,
      firstName: "",
      lastName: "",
      isCritic: false,
    };
  };

  auth = (user: IUser, token: string) => {
    this.setState({
      user: this.decodeUserFromToken(token),
      logged: true,
      token: token,
    });
  };

  logout = () => {
    this.setState({ user: {} as IUser, logged: false, token: "" });
    localStorage.removeItem("id_token");
  };

  componentDidMount() {
    if (this.state.token) {
      this.setState({
        user: this.decodeUserFromToken(this.state.token),
        logged: true,
      });
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.logged !== this.state.logged) {
      if (this.state.logged) {
        this.fetchUserData();
      }
    }
  }

  private async fetchUserData() {
    try {
      const res = await axios.get(
        `${API_ROOT}/account/getUserData/${this.state.user.userId}`
      );
      if (res.status === 200) {
        this.setState({
          user: {
            ...this.state.user,
            firstName: res.data.name,
            lastName: res.data.surname,
            middleName: res.data.middleName,
          },
        });
      }
    } catch (err) {
      console.error(err.response);
      // if token has expired:
      //     show 'expired message'
      //     redirect to login page.
    }
  }

  handleInviteLecturer = (email: string) => {
    return axios.post(
      `${API_ROOT}/account/invitenewlecturer`,
      { email },
      {
        headers: { Authorization: `Bearer ${this.state.token}` },
      }
    );
  };

  render() {
    const modalContextValue: IModalContext = {
      state: this.state.modal,
      openModal: (type, props = {}) =>
        this.setState({ modal: { type, props } }),
      closeModal: () => this.setState({ modal: { type: "", props: {} } }),
    };

    return (
      <div className="page">
        <ModalContext.Provider value={modalContextValue}>
          <Switch>
            <Route path="/register" component={Register} />
            <Route
              path="/login"
              render={(props) => <Login {...props} auth={this.auth} />}
            />
            <Route
              path="/profile"
              render={(props) => (
                <Profile
                  {...props}
                  user={this.state.user}
                  token={this.state.token}
                  page={this.state.page ?? ""}
                  changePage={this.changePage}
                  newChangePage={this.newChangePage}
                  handleCritic={this.handleCritic}
                  logout={this.logout}
                />
              )}
            />
            <Redirect to="/login" />
          </Switch>
          <ModalRoot />
        </ModalContext.Provider>
        <Footer>
          {this.state.logged && this.state.user.role !== Role.Student && (
            <Button
              use="primary"
              onClick={() =>
                modalContextValue.openModal("INVITE_LECTURER", {
                  onSubmit: this.handleInviteLecturer,
                })
              }
            >
              Пригласить
            </Button>
          )}
        </Footer>
      </div>
    );
  }
}

export default App;
