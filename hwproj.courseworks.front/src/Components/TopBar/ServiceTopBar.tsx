import React, {Component} from "react";
import TopBar from "@skbkontur/react-ui/TopBar";
import Logotype from "@skbkontur/react-ui/Logotype";
import {User} from "@skbkontur/react-icons";
import styles from "./ServiceTopBar.module.css";
import Toast from "@skbkontur/react-ui/Toast";

interface Props {

}

interface State {
    isAccountTitleHovered: boolean;
}

export default class ServiceTopBar extends Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {isAccountTitleHovered: false}
    }

    render() {
        return this.renderTopBar();
    }

    private renderTopBar = () => {
        const {isAccountTitleHovered} = this.state;
        return (
                <TopBar>
                    <TopBar.Start>
                        <TopBar.ItemStatic>
                            <div style={{fontSize: 25}}>
                                <Logotype suffix="курсач" locale={{prefix: "hwpr", suffix: "j"}} color="#1E79BE"/>
                            </div>
                        </TopBar.ItemStatic>
                    </TopBar.Start>
                    <TopBar.End>
                        <div onMouseEnter={() => this.setState({isAccountTitleHovered: true})}
                             onMouseLeave={() => this.setState({isAccountTitleHovered: false})}
                             className={styles.accountTitle}>
                            <TopBar.ItemStatic active={isAccountTitleHovered}
                            _onClick={this.onAccountTitleClick}>
                                <User color="#666"/>
                                &nbsp;Alex Berezhnykh
                            </TopBar.ItemStatic>
                        </div>
                        <TopBar.Divider/>
                        <TopBar.Logout onClick={() => alert('Logout!')}/>
                    </TopBar.End>
                </TopBar>
        )
    };

    private onAccountTitleClick = () => {
        Toast.push("Этот раздел ещё в разработке", {
            label: "Окей, я понял",
            handler: () => Toast.push("Допиши сам!"),
        });
    }
}