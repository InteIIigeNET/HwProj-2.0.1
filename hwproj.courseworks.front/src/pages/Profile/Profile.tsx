import { Redirect, RouteComponentProps } from "react-router-dom";
import { Fab } from "@material-ui/core";
import MainWindow from "../../Components/MainWindow/MainWindow";
import React from "react";
import { IUser } from "types";
import Menu from "./Menu/Menu";
import TopBar from "./TopBar/TopBar";
import { ModalContext } from "App";

interface ProfileProps extends RouteComponentProps {
  user: IUser;
  page: string;
  token: string;
  logout: () => void;
  changePage: (e: React.MouseEvent<HTMLButtonElement>) => void;
  newChangePage: (newPage: string) => void;
  handleCritic: () => void;
}

export default function Profile(props: ProfileProps) {
  const {
    user,
    page,
    token,
    logout,
    changePage,
    newChangePage,
    handleCritic,
  } = props;

  if (!token) {
    return <Redirect to="/login" />;
  }

  return (
    <ModalContext.Consumer>
      {({ openModal }) => (
        <>
          <div className="topBar">
            <TopBar
              logout={() => {
                logout();
                props.history.push("/login");
              }}
              firstName={user.firstName}
              lastName={user.lastName}
            />
          </div>
          <Menu
            role={user.role}
            page={page}
            changePage={changePage}
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
              newChangePage={newChangePage}
              token={token}
              role={user.role}
              page={page}
              changePage={changePage}
              handleCritic={handleCritic}
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
