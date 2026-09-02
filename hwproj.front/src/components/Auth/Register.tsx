import React, {FC, useState} from "react";
import {Link} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {RegisterViewModel} from "../../api/";
import "./Styles/Register.css";
import ValidationUtils from "../Utils/ValidationUtils";
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import hwCat from "../hw-cat.png";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface ICommonState {
    error: string[];
    isRegistered: boolean;
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

const Logo: FC = () => (
    <Link
        to={"/"}
        aria-label={"HwProj — главная"}
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            textDecoration: "none",
            padding: "24px 0",
        }}
    >
        <img
            src={hwCat}
            alt={""}
            draggable={false}
            style={{
                display: "block",
                width: "80px",
                height: "70px",
                objectFit: "contain",
            }}
        />
        <Typography
            component={"span"}
            style={{
                color: "#3f51b5",
                fontFamily: "Helvetica, Arial, sans-serif",
                fontSize: "32px",
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: "0.5px",
            }}
        >
            HwProj
        </Typography>
    </Link>
)

const Register: FC = () => {

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
                isRegistered: false
            }))
        }
    }

    if (commonState.isRegistered) {
        return (
            <Container component="main" maxWidth="xs">
                <DotLottieReact
                    style={{marginTop: -80}}
                    src="https://lottie.host/919997f6-e82f-4995-b17d-bb3dad2376be/jDvgCK2W1q.lottie"
                    autoplay
                />
                <Card raised sx={{borderRadius: '16px'}}>
                    <CardContent>
                        <Alert severity="success">
                            <AlertTitle>Подтвердите почту</AlertTitle>
                            Ссылка для подтверждения профиля отправлена на указанную при регистрации почту
                        </Alert>
                        <Stack justifyContent={"center"} direction={"row"} alignItems={"baseline"}
                               style={{paddingTop: 15}}
                               spacing={1}>
                            <Link to="/login">
                                <Typography variant={"body2"}>
                                    Вернуться ко входу
                                </Typography>
                            </Link>
                        </Stack>
                    </CardContent>
                </Card>
            </Container>
        )
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
                                Давайте знакомиться 🤝
                            </Typography>
                        </Grid>
                        {commonState.error.length > 0 && <Grid item><Alert severity={"error"}>
                            {commonState.error}
                        </Alert></Grid>}
                    </Grid>
                    <form onSubmit={handleSubmit} style={{marginTop: 24, width: "100%"}}>
                        <Stack spacing={2}>
                            <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Имя"
                                    variant="outlined"

                                    sx={inputSx}
                                    name={registerState.name}
                                    onChange={(e) => {
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            name: e.target.value
                                        }))
                                    }}
                                />
                                <TextField
                                    required
                                    fullWidth
                                    label="Фамилия"
                                    variant="outlined"

                                    sx={inputSx}
                                    name={registerState.surname}
                                    onChange={(e) => {
                                        setRegisterState((prevState) => ({
                                            ...prevState,
                                            surname: e.target.value
                                        }))
                                    }}
                                />
                            </Stack>
                            <TextField
                                size={"small"}
                                fullWidth
                                label="Отчество"
                                variant="outlined"

                                sx={inputSx}
                                name={registerState.middleName}
                                onChange={(e) => {
                                    setRegisterState((prevState) => ({
                                        ...prevState,
                                        middleName: e.target.value
                                    }))
                                }}
                            />
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"

                                sx={inputSx}
                                name={registerState.email}
                                onChange={(e) => {
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
                        </Stack>
                        <Box sx={{mt: 2}}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                disableElevation
                                type="submit"
                                disabled={isRegisterButtonDisabled}
                                sx={submitButtonSx}
                            >
                                Зарегистрироваться
                            </Button>
                        </Box>
                    </form>
                    <Stack justifyContent={"center"} direction={"row"} alignItems={"baseline"}
                           style={{paddingTop: 15}}
                           spacing={1}>
                        <Typography variant={"body2"}>
                            Уже есть аккаунт?
                        </Typography>
                        <Link to="/login">
                            <Typography variant={"body2"}>
                                Войти
                            </Typography>
                        </Link>
                    </Stack>
                </CardContent>
            </Card>
        </Container>
    )
}

export default Register
