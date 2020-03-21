import React, {Component} from "react";
import ServiceTopBar from "./Components/TopBar/ServiceTopBar";
import styles from "./App.module.css";

class App extends Component {
    render() {
        return <div className={styles.pageStyle}><ServiceTopBar/></div>
    }
}

export default App;