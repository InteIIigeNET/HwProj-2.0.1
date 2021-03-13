import React, { Component } from "react";
import { Typography } from "@material-ui/core";
import { Button, Gapped, Switcher } from "@skbkontur/react-ui";

import "./RequireCriticList.css";

interface Idata {
  title?: string;
  teacher?: string;
  teacherContacts?: string;
  scienceArea?: string;
  description?: string;
  reportFile?: string;
  presentationFile?: string;
  consultantReportFile?: string;
  link?: string;
  consultant?: string;
  consultantContacts?: string;
  status?: string;
  switcher?: string;
  id?: number;
}

interface Props {
  data: Idata;
  newChangePage(newPage: string): void;
  userId?: number;
}

interface State {}

class RequireCriticItem extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private handleSwitcher = (event: { target: { value: string } }) => {
    //----------------------------------------------------------------------------------------------------
    // Запрос по userId, id и this.target.value на изменение состояние (могу рецензировать, хочу, не могу)
    //----------------------------------------------------------------------------------------------------

    //----------------------------------------------
    let newData = this.props.data;
    newData.switcher = event.target.value;
    this.setState({ data: newData });
    //----------------------------------------------
  };

  private renderButton(id?: number) {
    return (
      <Button
        onClick={(e) =>
          this.props.newChangePage("requireCritic_" + id?.toString())
        }
        use="success"
      >
        Подробнее
      </Button>
    );
  }

  render() {
    return (
      <div className="requireItem">
        <div className="requireTitle">
          <Typography variant="h6">
            {this.props.data.title}, преподаватель {this.props.data.teacher}
          </Typography>
        </div>
        <Gapped gap={50}>
          {this.renderButton(this.props.data.id)}
          {/*<Switcher*/}
          {/*  items={["Да", "Мб", "Нет"]}*/}
          {/*  value={this.props.data.switcher}*/}
          {/*  onChange={this.handleSwitcher}*/}
          {/*  key={this.props.data.id}*/}
          {/*/>*/}
        </Gapped>
      </div>
    );
  }
}

export default RequireCriticItem;
