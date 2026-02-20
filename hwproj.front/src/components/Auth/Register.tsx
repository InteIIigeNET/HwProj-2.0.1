import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {Navigate} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {RegisterViewModel} from "../../api/";
import "./Styles/Register.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Avatar from "@material-ui/core/Avatar";
import ValidationUtils from "../Utils/ValidationUtils";
import {Alert, AlertTitle} from "@mui/material";

interface ICommonState {
    error: string[];
    isRegistered: boolean;
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

const Register: FC = () => {

    const classes = useStyles()
    const [registerState, setRegisterState] = useState<RegisterViewModel>({
        name: "",
        surname: "",
        email: "",
        middleName: "",
    })

    const [commonState, setCommonState] = useState<ICommonState>({
        error: [],
        isRegistered: false,
    })
    const [emailError, setEmailError] = useState<string>(""); // Состояние для ошибки электронной почты
    const [isRegisterButtonDisabled, setIsRegisterButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!ValidationUtils.isCorrectEmail(registerState.email)) {
            setEmailError("Некорректный адрес электронной почты");
            setIsRegisterButtonDisabled(true);
            return;
        }
        e.preventDefault()
        try {
            const registerModel: RegisterViewModel =
                {
                    email: registerState.email.trim(),
                    name: registerState.name.trim(),
                    surname: registerState.surname.trim(),
                    middleName: registerState.middleName?.trim() || ""
                }
            const result = await ApiSingleton.authService.register(registerModel)
            setCommonState((prevState) => ({
                ...prevState,
                error: result!.error!,
                isRegistered: result.isRegistered!
            }))
        } catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                error: ['Сервис недоступен'],
                loggedIn: false
            }))
        }
    }

    if (commonState.isRegistered) {
        return <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Alert severity="success" sx={{mt: 1}}>
                    <AlertTitle>Подтведите почту</AlertTitle>
                    Ссылка для подтверждение профиля отправлена на указанную при регистрации почту
                </Alert>
            </div>
        </Container>
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#ba2e2e'}}>
                    <LockOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Регистрация
                </Typography>
                {commonState.error.length > 0 && (
                    <p style={{color: "red", marginBottom: "0"}}>{commonState.error}</p>
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
                                onChange={(e) => {
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
                                onChange={(e) => {
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
                                onChange={(e) => {
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
                                onChange={(e) => {
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
                    </Grid>
                    <Button
                        style={{marginTop: '15px'}}
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
