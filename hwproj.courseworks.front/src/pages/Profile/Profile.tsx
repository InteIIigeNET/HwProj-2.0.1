import React from "react";
import { Redirect, RouteComponentProps } from "react-router-dom";
import { Fab } from "@material-ui/core";
import MainWindow from "../../Components/MainWindow/MainWindow";
import { IUser } from "types";
import Menu from "./Menu/Menu";
import TopBar from "./TopBar/TopBar";
import { ModalContext } from "App";

interface ProfileProps extends RouteComponentProps {
  user: IUser;
  token: string;
  logout: () => void;
}

export default function Profile(props: ProfileProps) {
  const { user, token, logout } = props;

  if (!token) {
    return <Redirect to="/login" />;
  }

  return (
    <ModalContext.Consumer>
      {({ openModal }) => (
        <>
          <div className="topBar">
            <TopBar user={user} logout={logout} />
          </div>
          <Menu
            role={user.role}
            page=""
            changePage={() => {}}
            isCritic={user.isCritic}
          />
          <div style={{ position: "relative", left: "17vw", top: "16vh" }}>
            <div style={{}}>
              <Fab
                color="primary"
                aria-label="add"
                size="small"
                style={{ fontSize: "1.75rem" }}
                onClick={() => openModal("COURSE_WORK_CREATE")}
              >
                +
              </Fab>
            </div>
            <MainWindow
              newChangePage={() => {}}
              token={token}
              role={user.role}
              page=""
              changePage={() => {}}
              handleCritic={() => {}}
              isCritic={user.isCritic}
              userId={user.userId}
            />
          </div>
          <button onClick={() => openModal("INVITE_LECTURER")}>Click me</button>
        </>
      )}
    </ModalContext.Consumer>
  );
}
