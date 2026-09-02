import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.min.css";
import {BrowserRouter} from "react-router-dom";
import {createTheme, ThemeProvider} from "@mui/material/styles";
import {SnackbarProvider} from "notistack";

const theme = createTheme({
    palette: {
        // Индиго #3f51b5 — фирменный цвет: он в шапке и во всех акцентах перерисованных панелей.
        // Раньше его давала палитра MUI v4 по умолчанию, теперь закрепляем явно.
        primary: {
            main: "#3f51b5",
        },
    },
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
    <ThemeProvider theme={theme}>
        <SnackbarProvider maxSnack={3}>
            <BrowserRouter>
                <App/>
            </BrowserRouter>
        </SnackbarProvider>
    </ThemeProvider>,
    document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
