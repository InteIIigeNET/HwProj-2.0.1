import React, { Component } from "react";
import { Logotype, Toast, TopBar } from "@skbkontur/react-ui";
import { User } from "@skbkontur/react-icons";
import styles from "./TopBar.module.css";

interface Props {
  firstName?: string;
  lastName?: string;
  logout(): void;
}

interface State {
  isAccountTitleHovered: boolean;
}

export default class ServiceTopBar extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { isAccountTitleHovered: false };
  }

  render() {
    return this.renderTopBar();
  }

  private renderTopBar = () => {
    const { isAccountTitleHovered } = this.state;
    return (
      <TopBar>
        <TopBar.Start>
          <TopBar.ItemStatic>
            <div style={{ fontSize: 25 }}>
              <Logotype
                suffix="курсач"
                locale={{ prefix: "hwpr", suffix: "j" }}
                color="#1E79BE"
              />
            </div>
          </TopBar.ItemStatic>
        </TopBar.Start>
        <TopBar.End>
          <div
            onMouseEnter={() => this.setState({ isAccountTitleHovered: true })}
            onMouseLeave={() => this.setState({ isAccountTitleHovered: false })}
            className={styles.accountTitle}
          >
            <TopBar.ItemStatic
              active={isAccountTitleHovered}
              _onClick={this.onAccountTitleClick}
            >
              <User color="#666" />
              &nbsp;{this.props.firstName} {this.props.lastName}
            </TopBar.ItemStatic>
          </div>
          <TopBar.Divider />
          <TopBar.Logout
            onClick={() => {
              //-----------------------
              // Запрос на выход
              //-----------------------
              Toast.push("Logout");
              this.props.logout();
            }}
          />
        </TopBar.End>
      </TopBar>
    );
  };

  private onAccountTitleClick = () => {
    Toast.push("Этот раздел ещё в разработке", {
      label: "Окей, я понял",
      handler: () => Toast.push("Допиши сам!"),
    });
  };
}
