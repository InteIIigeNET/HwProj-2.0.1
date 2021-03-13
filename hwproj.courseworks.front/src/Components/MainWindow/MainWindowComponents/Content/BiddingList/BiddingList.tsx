import React from "react";
import { Typography } from "@material-ui/core";
import { Button, Gapped, SidePage, Toast } from "@skbkontur/react-ui";
import { Edit, Ok } from "@skbkontur/react-icons";

import "./BiddingList.css";

interface Idata {
  title?: string;
  id?: number;
  critic?: string;
  criticId?: number;
}

interface ICritic {
  name?: string;
  id?: number;
  course?: number;
  department?: string;
}

interface Props {
  token: string;
}

interface State {
  data: Idata[];
  critics: ICritic[];
  isSidePageOpen?: boolean;
  whichSidePage?: number;
  isLoading?: boolean;
}

class BiddingList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      data: [{}],
      critics: [{}],
      isSidePageOpen: false,
      whichSidePage: 0,
      isLoading: false,
    };
  }

  componentDidMount() {
    this.setState({ isLoading: true });
    this.loadingData();
    this.setState({ isLoading: false });
  }

  private loadingData() {
    //Результат биддинга (token)
    //this.setState({data : biddingList, critics : myCritics})
  }

  private openSidePage = (courseWorkId: number) => {
    this.setState({ isSidePageOpen: true, whichSidePage: courseWorkId });
  };

  private closeSidePage = () => {
    this.setState({ isSidePageOpen: false });
  };

  private complete() {
    // Завершение биддинга (token)

    Toast.push("Рецензенты назначены");
  }

  private editBidding = (event: React.MouseEvent<HTMLButtonElement>) => {
    const value = event.currentTarget.value;
    const courseWorkId = Number(value.substr(11, value.indexOf("critic") - 12));
    const criticId = value.substr(value.indexOf("critic") + 6);

    //запрос по courseWorkId и criticId на назначение рецензента на курсовую

    //-------------------------------------------------------------------------
    Toast.push("Курсовой " + courseWorkId + " назначен рецензент " + criticId);
    //-------------------------------------------------------------------------

    this.closeSidePage();
    this.loadingData();
  };

  private renderSidePage(courseWorkId: number) {
    let courseWorkTitle: string = ""; // eslint-disable-next-line
    this.state.data.map((item) => {
      if (item.id === courseWorkId) courseWorkTitle = item.title!;
    });

    return (
      <SidePage onClose={this.closeSidePage} blockBackground>
        <div className="sideTitle">
          <SidePage.Header>
            <Typography variant="h4">{courseWorkTitle}</Typography>
          </SidePage.Header>
        </div>
        <SidePage.Body>
          <div
            style={{ marginLeft: "1vw", marginTop: "1vh", marginBottom: "2vh" }}
          >
            <Typography variant="h5">
              Выберите рецензента на эту курсовую
            </Typography>
          </div>
          {this.state.critics.map((item) => {
            return (
              <div
                style={{
                  marginLeft: "3vw",
                  marginTop: "3vh",
                  borderBottom: "rgb(199, 180, 180) 1px solid",
                }}
              >
                <Gapped>
                  <div style={{ minWidth: "10vw" }}>
                    <Typography variant="h6">
                      {item.name}, кафедра {item.department}
                    </Typography>
                  </div>
                  <button
                    className="buttonMore"
                    onClick={this.editBidding}
                    value={"editBidding" + courseWorkId + "_critic" + item.id}
                  >
                    <Typography variant="button">Назначить</Typography>
                  </button>
                </Gapped>
              </div>
            );
          })}
        </SidePage.Body>
        <SidePage.Footer panel>
          <Button onClick={this.closeSidePage}>Отмена</Button>
        </SidePage.Footer>
      </SidePage>
    );
  }

  private renderRejectButton = (courseWorkId: number) => {
    return (
      <div>
        <Button
          onClick={() => {
            this.openSidePage(courseWorkId);
          }}
          icon={<Edit />}
        >
          Переназначить
        </Button>
      </div>
    );
  };

  private renderItem(item: Idata) {
    return (
      <div className="biddingItem">
        <Gapped>
          <div className="biddingTitle">
            <Typography variant="h6">{item.title}</Typography>
          </div>
          <Typography variant="h6">--</Typography>
          <div className="biddingCritic">
            <Typography variant="h6">{item.critic}</Typography>
          </div>
          {this.renderRejectButton(item.id!)}
        </Gapped>
      </div>
    );
  }

  private renderList() {
    return (
      <div>
        {this.state.data.map((item) => this.renderItem(item))}
        {this.state.isSidePageOpen &&
          this.renderSidePage(this.state.whichSidePage!)}
        <div style={{ marginTop: "3vh", marginLeft: "1vw" }}>
          <Button onClick={this.complete} use="success" icon={<Ok />}>
            Назначить рецензентов
          </Button>
        </div>
      </div>
    );
  }

  private isEmpty(obj: Idata[]) {
    return Object.keys(obj[0]).length === 0;
  }

  private renderEmptyList() {
    return (
      <div style={{ textAlign: "center", marginTop: "10vh" }}>
        <Typography variant="h5">Нет результатов биддинга</Typography>
      </div>
    );
  }

  render() {
    return !this.isEmpty(this.state.data)
      ? this.renderList()
      : this.renderEmptyList();
  }
}

export default BiddingList;
