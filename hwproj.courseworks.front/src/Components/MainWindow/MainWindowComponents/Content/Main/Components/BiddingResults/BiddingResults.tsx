import React, { Component } from "react";
import Typography from "@material-ui/core/Typography";
import { Button, Gapped } from "@skbkontur/react-ui";

import "./BiddingResults.css";

interface Idata {
  title?: string;
  id?: number;
}

interface Props {
  newChangePage(newPage: string): void;
  role?: string;
  data: Idata[];
}

interface State {}

class Notifications extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private renderButton(id?: number) {
    return (
      <Button
        onClick={(e) => this.props.newChangePage("bidding_" + id!.toString())}
        use="success"
      >
        Подробнее
      </Button>
    );
  }

  private renderNotification(item: Idata) {
    return (
      <div className="notificationItem">
        <div className="bidding">
          <Gapped>
            <div style={{ minWidth: "30vw" }}>
              <Typography variant="h5">{item.title}</Typography>
            </div>
            {this.renderButton(item.id)}
          </Gapped>
        </div>
      </div>
    );
  }

  private renderList() {
    return (
      <div className="notifications">
        <div
          style={{
            marginLeft: "10px",
            textDecoration: "underline",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h5">Результаты биддинга</Typography>
        </div>
        {this.props.data.map((item) => this.renderNotification(item))}
      </div>
    );
  }

  private renderEmptyList() {
    return (
      <div className="notifications">
        <div
          style={{
            marginLeft: "10px",
            textDecoration: "underline",
            marginBottom: "10px",
          }}
        >
          <Typography variant="h5">Уведомления</Typography>
        </div>
        <div style={{ marginLeft: "2vw" }}>
          <Typography variant="h6">Результатов биддинга нет</Typography>
        </div>
      </div>
    );
  }

  private isEmpty(obj: Idata[]) {
    return Object.keys(obj[0]).length === 0;
  }

  render() {
    console.log(this.isEmpty(this.props.data));

    return !this.isEmpty(this.props.data)
      ? this.renderList()
      : this.renderEmptyList();
  }
}

export default Notifications;
