import React, {FC, FormEvent} from "react";
import {Navigate, Link, useSearchParams} from "react-router-dom";
import {TextField, Button, Typography} from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Login.css";
import {useState} from "react";
import {LoginViewModel} from "@/api"
import {makeStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import ValidationUtils from "../Utils/ValidationUtils";
import {Alert, Card, CardContent, Stack} from "@mui/material";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface LoginProps {
    onLogin: (returnUrl: string | null) => void;
}

interface ILoginState {
    email: string;
    password: string;
    error: string[] | null;
    isLogin: boolean;
}

const useStyles = makeStyles((theme) => ({
    login: {
        marginTop: '16px',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
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
        marginTop: theme.spacing(2)
    }
}))

const Login: FC<LoginProps> = (props) => {
    const [searchParams] = useSearchParams()
    const returnUrl = searchParams.get("returnUrl")
    const classes = useStyles()
    const [loginState, setLoginState] = useState<ILoginState>({
        email: '',
        password: '',
        error: [],
        isLogin: ApiSingleton.authService.isLoggedIn(),
    })

    // Состояние для ошибки электронной почты
    const [emailError, setEmailError] = useState<string>("");
    // Состояние для блокировки кнопки
    const [isLoginButtonDisabled, setIsLoginButtonDisabled]
        = useState<boolean>(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!ValidationUtils.isCorrectEmail(loginState.email)) {
            setEmailError("Некорректный адрес электронной почты");
            setIsLoginButtonDisabled(true);
            return;
        }

        const userData: LoginViewModel = {
            email: loginState.email,
            password: loginState.password,
            rememberMe: false
        }
        try {
            const result = await ApiSingleton.authService.login(userData)
            if (result.isLogin) props.onLogin?.(returnUrl)
            else {
                setLoginState(prevState => ({
                    ...prevState,
                    error: result.error,
                    isLogin: result.isLogin,
                }))
            }
        } catch (e) {
            setLoginState(prevState => ({
                ...prevState,
                error: ['Сервис недоступен'],
                isLogin: false
            }))
        }
    }

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist()
        setLoginState((prevState) => ({
            ...prevState,
            email: e.target.value
        }))
        setEmailError("");
        setIsLoginButtonDisabled(false);
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.persist()
        setLoginState((prevState) => ({
            ...prevState,
            password: e.target.value
        }))
    }

    const headerStyles: React.CSSProperties = {marginRight: "9.5rem"};

    if (loginState.isLogin) {
        return <Navigate to={"/"}/>;
    }

    if (loginState.error) {
        headerStyles.marginBottom = "-1.5rem";
    }

    return (
        <Container component="main" maxWidth="xs">
            <DotLottieReact
                style={{marginTop: -80}}
                src="https://lottie.host/919997f6-e82f-4995-b17d-bb3dad2376be/jDvgCK2W1q.lottie"
                autoplay
            />
            <Card raised sx={{borderRadius: '16px'}}>
                <CardContent>
                    <Grid container direction="column" spacing={1} alignItems={"center"}>
                        <Grid item>
                            <Typography component="h1" variant="h5" align={"center"}>
                                Привет 👋, рады Вас видеть
                            </Typography>
                        </Grid>
                        {loginState.error && loginState.error.length > 0 && <Grid item><Alert severity={"error"}>
                            {loginState.error}
                        </Alert></Grid>}
                    </Grid>
                    <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                        <Grid container direction="column" justifyContent="center">
                            <Grid item>
                                <TextField
                                    required
                                    type="email"
                                    fullWidth
                                    label="Электронная почта"
                                    variant="outlined"
                                    margin="normal"
                                    name={loginState.email}
                                    onChange={handleChangeEmail}
                                    error={emailError !== ""}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item>
                                <TextField
                                    required
                                    type="password"
                                    fullWidth
                                    label="Пароль"
                                    variant="outlined"
                                    margin="normal"
                                    value={loginState.password}
                                    onChange={handleChangePassword}
                                />
                                <Link to="/recovery" state={{email: loginState.email}}>
                                    <Typography variant={"caption"}>
                                        Забыли пароль?
                                    </Typography>
                                </Link>
                            </Grid>
                            <Grid item className={classes.button}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isLoginButtonDisabled}
                                >
                                    Войти
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    <Stack justifyContent={"center"} direction={"row"} alignItems={"baseline"}
                           style={{paddingTop: 15}}
                           spacing={1}>
                        <Typography variant={"body2"}>
                            Впервые тут?
                        </Typography>
                        <Link to="/register">
                            <Typography variant={"body2"}>
                                Регистрация
                            </Typography>
                        </Link>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    )
}

export default Login
