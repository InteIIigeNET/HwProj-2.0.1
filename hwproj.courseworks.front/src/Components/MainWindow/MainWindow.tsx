import React from "react";
import Title from "./MainWindowComponents/Title/Title";
import Content from "./MainWindowComponents/Content/Content";

import "./MainWindow.css";

interface Props {
  page?: string;
  changePage(event: React.MouseEvent<HTMLButtonElement>): void;
  newChangePage(newPage: string): void;
  handleCritic(): void;
  isCritic?: boolean;
  role?: string;
  userId?: number;
  token: string;
}

function MainWindow(props: Props) {
  return (
    <div className="mainWindow">
      <Title page={props.page} role={props.role} />
      <Content
        newChangePage={props.newChangePage}
        token={props.token}
        role={props.role}
        page={props.page}
        changePage={props.changePage}
        handleCritic={props.handleCritic}
        isCritic={props.isCritic}
        userId={props.userId}
      />
    </div>
  );
}

export default MainWindow;
