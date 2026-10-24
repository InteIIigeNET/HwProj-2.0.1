import React, {FC, FormEvent} from "react";
import {Navigate, Link, useSearchParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Login.css";
import {useState} from "react";
import {LoginViewModel} from "@/api"
import ValidationUtils from "../Utils/ValidationUtils";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
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

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const submitButtonSx = {
    py: 1,
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
}

const Login: FC<LoginProps> = (props) => {
    const [searchParams] = useSearchParams()
    const returnUrl = searchParams.get("returnUrl")
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

    if (loginState.isLogin) {
        return <Navigate to={"/"}/>;
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
                    <form onSubmit={(e) => handleSubmit(e)} style={{marginTop: 24, width: "100%"}}>
                        <Grid container direction="column" justifyContent="center">
                            <Grid item>
                                <TextField
                                    required
                                    type="email"
                                    fullWidth
                                    label="Электронная почта"
                                    variant="outlined"
                                    margin="normal"
                                    sx={inputSx}
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
                                    sx={inputSx}
                                    value={loginState.password}
                                    onChange={handleChangePassword}
                                />
                                <Link to="/recovery" state={{email: loginState.email}}>
                                    <Typography variant={"caption"}>
                                        Забыли пароль?
                                    </Typography>
                                </Link>
                            </Grid>
                            <Grid item sx={{mt: 2}}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    disableElevation
                                    type="submit"
                                    disabled={isLoginButtonDisabled}
                                    sx={submitButtonSx}
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
