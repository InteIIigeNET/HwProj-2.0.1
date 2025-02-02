import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Navigate} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import { RegisterViewModel } from "../../api/";
import "./Styles/Register.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Avatar from "@material-ui/core/Avatar";
import ValidationUtils from "../Utils/ValidationUtils";

interface  ICommonState {
    loggedIn: boolean;
    error: string[];
}

interface LoginProps {
    onLogin: () => void;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    button: {
        marginTop: theme.spacing(1)
    },
}))

const Register: FC<LoginProps> = (props) => {

    const classes = useStyles()
    const [registerState, setRegisterState] = useState<RegisterViewModel>({
        name: "",
        surname: "",
        email: "",
        middleName: "",
        password: "",
        passwordConfirm: "",
    })

    const [commonState, setCommonState] = useState<ICommonState>({
        loggedIn: ApiSingleton.authService.isLoggedIn(),
        error: [],
    })
    const [passwordError, setPasswordError] = useState<string>(""); // Состояние для ошибки паролей
    const [emailError, setEmailError] = useState<string>(""); // Состояние для ошибки электронной почты
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки

    const handleSubmit = async (e: any) => {
        e.preventDefault();
       if (registerState.password !== registerState.passwordConfirm) {
            setPasswordError("Пароли не совпадают");
            setIsRegisterButtonDisabled(true);
            return;
        }
        if (!ValidationUtils.isCorrectEmail(registerState.email)) {
            setEmailError("Некорректный адрес электронной почты");
            setIsRegisterButtonDisabled(true);
            return;
        }
        e.preventDefault()
        try {
            const result = await ApiSingleton.authService.register(registerState)
            setCommonState((prevState) => ({
                ...prevState,
                error: result!.error!,
                loggedIn: result.loggedIn
            }))
            if (result.loggedIn) {
                props.onLogin()
            }
        }
        catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                error: ['Сервис недоступен'],
                loggedIn: false
            }))
        }
        if (commonState.loggedIn) {
            window.location.assign("/")
        }
    }

    if (commonState.loggedIn) {
      return <Navigate to={"/"} />;
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} style={{ color: 'white', backgroundColor: '#ba2e2e' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Регистрация
                </Typography>
                {commonState.error.length > 0 && (
                    <p style={{ color: "red", marginBottom: "0" }}>{commonState.error}</p>
                )}
                <form onSubmit={handleSubmit} className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Имя"
                                variant="outlined"
                                name={registerState.name}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        name: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Фамилия"
                                variant="outlined"
                                name={registerState.surname}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        surname: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Отчество"
                                variant="outlined"
                                name={registerState.middleName}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        middleName: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                name={registerState.email}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        email: e.target.value
                                    }))
                                    setEmailError("");
                                    setIsRegisterButtonDisabled(false);
                                }}
                                error={emailError !== ""}
                                helperText={emailError}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="password"
                                label="Пароль"
                                variant="outlined"
                                value={registerState.password}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        password: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="password"
                                label="Подтвердите пароль"
                                variant="outlined"
                                value={registerState.passwordConfirm}
                                onChange={(e) =>
                                {
                                    e.persist()
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        passwordConfirm: e.target.value
                                    }))
                                    setPasswordError("");
                                    setIsRegisterButtonDisabled(false);
                                }}
                                error={passwordError !== ""}
                                helperText={passwordError}
                            />
                        </Grid>
                    </Grid>
                    <Button
                        style={{ marginTop: '15px'}}
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isRegisterButtonDisabled}
                    >
                        Зарегистрироваться
                    </Button>
                </form>
            </div>
        </Container>
    )
}

export default Register
