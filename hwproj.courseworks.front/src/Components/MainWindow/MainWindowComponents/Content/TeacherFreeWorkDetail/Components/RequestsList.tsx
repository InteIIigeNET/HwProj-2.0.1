import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Button, Gapped } from "@skbkontur/react-ui";

interface Idata {
  student?: string;
  //course?: number,
  group?: string;
  id?: number;
  //studentId?: number
}

interface Props {
  data?: Idata[];
  newChangePage(newPage: string): void;
  role?: string;
}

interface State {}

class RequestsList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private buttonValue(id?: number) {
    return "request" + id!.toString();
  }

  private renderButton(id?: number) {
    return (
      <Button
        use="success"
        onClick={(e) => this.props.newChangePage(this.buttonValue(id))}
      >
        Подробнее
      </Button>
    );
  }

  private renderItem(item: Idata) {
    return (
      <div style={{ marginBottom: "10px" }}>
        <Gapped>
          <div
            style={{
              width: "auto",
              minWidth: "20vw",
              textDecoration: "underline",
            }}
          >
            <Typography>
              {item.student}, {item.group} группа
            </Typography>
          </div>
          {this.renderButton(item.id)}
        </Gapped>
      </div>
    );
  }

  private renderRequestsList() {
    return (
      <div>
        <div className="ml20">
          <Typography variant="h5">Заявки на эту тему:</Typography>
        </div>
        <div className="ml30">
          {this.props.data!.map((item) => this.renderItem(item))}
        </div>
      </div>
    );
  }

  private renderEmptyList() {
    return (
      <div className="ml30">
        <Typography variant="h6">Нет заявок на эту курсовую</Typography>
      </div>
    );
  }

  private isEmpty(obj: any) {
    try {
      return Object.keys(obj).length === 0;
    } catch {
      return true;
    }
  }

  render() {
    return !this.isEmpty(this.props.data![0])
      ? this.renderRequestsList()
      : this.renderEmptyList();
  }
}

export default RequestsList;
