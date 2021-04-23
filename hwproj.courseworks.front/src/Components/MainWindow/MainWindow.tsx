import React from "react";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';

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

interface CourseWork {
  title: string;
  supervisor: string;
  overview: string;
}

interface State {
  courseworks: Array<CourseWork>;
}

export const getRandomString = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; ++i) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

const defaultColDef = {
  resizable: true,
  filter: true,
  sortable: true,
}

class MainWindow extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      courseworks: [
        { title: getRandomString(128), supervisor: "Иванов А. А.", overview: "" },
        { title: getRandomString(96), supervisor: "Петров В. И.", overview: "" },
        { title: getRandomString(64), supervisor: "Сидоров И. Я.", overview: "" },
        { title: getRandomString(32), supervisor: "Сидоров И. Я.", overview: "" },
      ]
    }
  }
  
  render() {
    return (
        // <div className="mainWindow">
        <div>
          {/*<Title page={this.props.page} role={this.props.role} />*/}
          <div className="ag-theme-alpine" style={{ height: 400, width: 1025 }}>
            <AgGridReact
                defaultColDef={defaultColDef}
                onGridReady={(params) => {
                  params.api.sizeColumnsToFit()
                }}
                rowData={this.state.courseworks}>
              <AgGridColumn field="title" headerName="Название" ></AgGridColumn>
              <AgGridColumn field="supervisor" headerName="Научный руководитель" ></AgGridColumn>
              <AgGridColumn field="overview" headerName="Обзор" ></AgGridColumn>
            </AgGridReact>
          </div>
          {/*<Content*/}
          {/*  newChangePage={props.newChangePage}*/}
          {/*  token={props.token}*/}
          {/*  role={props.role}*/}
          {/*  page={props.page}*/}
          {/*  changePage={props.changePage}*/}
          {/*  handleCritic={props.handleCritic}*/}
          {/*  isCritic={props.isCritic}*/}
          {/*  userId={props.userId}*/}
          {/*/>*/}
        </div>);
  }
}



export default MainWindow;
