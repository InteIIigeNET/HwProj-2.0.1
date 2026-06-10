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
import {Alert, Avatar, Card, CardContent, Stack} from "@mui/material";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";

interface LoginProps {
    onLogin(returnUrl: string | null): void;
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
        marginTop: theme.spacing(2),
        width: '100%'
    }
}))

const Login: FC<LoginProps> = (props) => {
    const [searchParams] = useSearchParams()
    const returnUrl = searchParams.get("returnUrl")

    const getCourseIdFromReturnUrl = (url: string | null) => {
        if (!url) return undefined;

        const match = url.match(/^\/courses\/(\d+)(?:\/|$)/);
        if (!match) return undefined;

        const parsed = Number(match[1]);
        return Number.isNaN(parsed) ? undefined : parsed;
    };

    const courseIdFromReturnUrl = getCourseIdFromReturnUrl(returnUrl);
    const isCourseBoundEntry = courseIdFromReturnUrl !== undefined;
    const registerLink = isCourseBoundEntry
        ? `/register?courseId=${courseIdFromReturnUrl}`
        : "/register";
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
        } catch {
            setLoginState(prevState => ({
                ...prevState,
                error: ['Сервис недоступен'],
                isLogin: false
            }))
        }
    }

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginState((prevState) => ({
            ...prevState,
            email: e.target.value
        }))
        setEmailError("");
        setIsLoginButtonDisabled(false);
    }

    const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginState((prevState) => ({
            ...prevState,
            password: e.target.value
        }))
    }

    const headerStyles: React.CSSProperties = {marginRight: "9.5rem"};

    if (loginState.isLogin) {
        return <Navigate to={returnUrl || "/"}/>;
    }

    if (loginState.error) {
        headerStyles.marginBottom = "-1.5rem";
    }

    return (
        <Container component="main" maxWidth="xs">
            <Grid container justifyContent="center" style={{marginBottom: 16}}>
                <Avatar className={classes.avatar} style={{color: "white", backgroundColor: "#ba2e2e"}}>
                    <LockOutlinedIcon/>
                </Avatar>
            </Grid>
            <Card raised sx={{borderRadius: '16px'}}>
                <CardContent>
                    <Grid container direction="column" spacing={1} alignItems={"center"}>
                        <Grid item>
                            <Typography component="h1" variant="h5">
                                Привет 👋, рады Вас видеть
                            </Typography>
                        </Grid>
                        {loginState.error && loginState.error.length > 0 && <Grid item><Alert severity={"error"}>
                            {loginState.error}
                        </Alert></Grid>}
                    </Grid>
                    {isCourseBoundEntry && (
                        <Grid item>
                            <Alert severity="info">
                                Для доступа к курсу сначала войдите в систему или подайте заявку на регистрацию.
                            </Alert>
                        </Grid>
                    )}
                    <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                        <Grid container direction="column" justifyContent="center">
                            <Grid item>
                                <TextField
                                    required
                                    type="email"
                                    fullWidth
                                    label="Электронная почта"
                                    variant="outlined"
                                    value={loginState.email}
                                    onChange={handleChangeEmail}
                                    error={emailError !== ""}
                                    helperText={emailError}
                                />
                            </Grid>
                            <Grid item style={{marginTop: 16}}>
                                <TextField
                                    required
                                    type="password"
                                    fullWidth
                                    label="Пароль"
                                    variant="outlined"
                                    value={loginState.password}
                                    onChange={handleChangePassword}
                                />
                                <Link to="/recovery" state={{email: loginState.email, returnUrl}}>
                                    <Typography variant={"caption"}>
                                        Забыли пароль?
                                    </Typography>
                                </Link>
                            </Grid>
                            <Grid item style={{marginTop: 16}}>
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
                            {isCourseBoundEntry ? "Нет аккаунта?" : "Впервые тут?"}
                        </Typography>
                        <Link to={registerLink}>
                            <Typography variant={"body2"}>
                                Зарегистрироваться
                            </Typography>
                        </Link>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    )
}

export default Login
