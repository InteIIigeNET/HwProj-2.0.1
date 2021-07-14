import React, { Component } from "react";
import {
  Switch,
  Route,
  Redirect,
  RouteComponentProps,
  withRouter,
} from "react-router-dom";
import decode from "jwt-decode";
import { Button } from "@skbkontur/react-ui";

import { IUser, Role } from "types";
import { API_ROOT } from "config";

import Profile from "pages/Profile";
import Login from "pages/Login";
import Register from "pages/Register";

import ModalRoot from "./ModalRoot";
import Footer from "parts/Footer";
import ApiSingleton from "./api/ApiSingleton";

type Props = RouteComponentProps;

interface ModalState {
  type: "INVITE_LECTURER" | "COURSE_WORK_CREATE" | "";
  props: any;
}

interface State {
  user: IUser;
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
      user: {} as IUser,
      logged: false,
      token: localStorage.getItem("id_token") ?? "",
      modal: { type: "", props: {} },
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.decodeUserFromToken = this.decodeUserFromToken.bind(this);
    this.fetchUserData = this.fetchUserData.bind(this);
  }

  decodeUserFromToken(token: string) {
    const user: IUser = decode(token);
    return {
      userId: (user as any)._id as number,
      role: (user as any)._role as Role,
      firstName: "",
      lastName: "",
      isCritic: false,
    };
  }

  login(token: string) {
    this.setState({
      user: this.decodeUserFromToken(token),
      logged: true,
      token: token,
    });
  }

  logout() {
    this.setState({ user: {} as IUser, logged: false, token: "" });
    localStorage.removeItem("id_token");
    this.props.history.push("/login");
  }

  componentDidMount() {
    if (this.state.token) {
      if (ApiSingleton.authService.isTokenExpired(this.state.token)) {
        this.logout();
      } else {
        this.login(this.state.token);
        this.props.history.push("/profile");
      }
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.logged !== this.state.logged) {
      if (this.state.logged) {
        this.fetchUserData();
      }
    }
  }

  async fetchUserData() {
    try {
      /*const res = await axios.get(
        `${API_ROOT}/account/getUserData/${this.state.user.userId}`
      );*/
      
      const res = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(this.state.user.userId.toString());
      /*if (res. status === 200) {
        this.setState({
          user: {
            ...this.state.user,
            firstName: res.data.name,
            lastName: res.data.surname,
            middleName: res.data.middleName,
          },
        });
      }*/
    } catch (err) {
      console.error(err.response);
      // if token has expired:
      //     show 'expired message'
      //     redirect to login page.
    }
  }

  handleInviteLecturer = (email: string) => {    
    return ApiSingleton.accountApi.apiAccountInvitenewlecturerPost({email})
  };

  render() {
    const modalContextValue: IModalContext = {
      state: this.state.modal,
      openModal: (type, props = {}) =>
        this.setState({ modal: { type, props } }),
      closeModal: () => this.setState({ modal: { type: "", props: {} } }),
    };

    if (this.state.token && !this.state.logged) {
      return null;
    }

    return (
      <div className="page">
        <ModalContext.Provider value={modalContextValue}>
          <Switch>
            <Route path="/register" component={Register} />
            <Route
              path="/login"
              render={(props) => <Login {...props} auth={this.login} />}
            />
            <Route
              path="/profile"
              render={(props) => (
                <Profile
                  {...props}
                  user={this.state.user}
                  token={this.state.token}
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

export default withRouter(App);
