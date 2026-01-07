import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter} from "react-router-dom";
import ThemeProvider from "@material-ui/styles/ThemeProvider";
import {createTheme} from "@material-ui/core/styles";
import {SnackbarProvider} from "notistack";
import { Provider } from "react-redux";
import { store } from "./store";

const theme = createTheme({
    typography: {
        fontFamily: [
            'Helvetica',
            'Arial',
            'sans-serif',
            'Roboto',
            '"Helvetica Neue"',
        ].join(','),
    }
});

ReactDOM.render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <SnackbarProvider maxSnack={3}>
                <BrowserRouter>
                    <App/>
                </BrowserRouter>
            </SnackbarProvider>
        </ThemeProvider>
    </Provider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
