import React, { Component } from "react";
import { Button, Gapped, Toast } from "@skbkontur/react-ui";
import { Delete, Ok, OkDouble } from "@skbkontur/react-icons";

import "./Buttons.css";

interface Props {
  userId?: number;
  id?: number;
}

interface State {}

class Buttons extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  private buttonYes = () => {
    //---------------------------------------------
    // Запрос "Буду рецензировать" по userId и id
    //---------------------------------------------

    Toast.push("Выбрано: Буду рецензировать");
  };

  private buttonMayBe = () => {
    //---------------------------------------------
    // Запрос "Могу рецензировать" по userId и id
    //---------------------------------------------

    Toast.push("Выбрано: Могу рецензировать");
  };

  private buttonNo = () => {
    //---------------------------------------------
    // Запрос "Не могу рецензировать" по userId и id
    //---------------------------------------------

    Toast.push("Выбрано: Не могу рецензировать");
  };

  private renderButtons() {
    return (
      <div style={{ marginLeft: "20px" }}>
        <Gapped>
          <Button icon={<OkDouble />} use="success" onClick={this.buttonYes}>
            Буду рецензировать
          </Button>

          <Button icon={<Ok />} onClick={this.buttonMayBe}>
            Могу рецензировать
          </Button>

          <Button icon={<Delete />} use="danger" onClick={this.buttonNo}>
            Не буду рецензировать
          </Button>
        </Gapped>
      </div>
    );
  }

  render() {
    return this.renderButtons();
  }
}

export default Buttons;
