import React, {FC, FormEvent} from "react";
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import {
    Alert,
    AlertTitle,
    Button,
    Container,
    Grid,
    TextField,
    Typography
} from "@mui/material";

interface IResetPasswordState {
    password: string;
    passwordConfirm: string;
    errors: string[] | undefined;
    isSuccess: boolean;
}

// theme.spacing(n) в v4 возвращал число 8n, поэтому подставляем итоговые отступы
const headerSx = {
    mt: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
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

const ResetPassword: FC = () => {

    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("id")
    const token = urlParams.get("token")
    const isUrlValid = userId !== null && token !== null

    const [resetPasswordState, setState] = useState<IResetPasswordState>({
        password: "",
        passwordConfirm: "",
        errors: isUrlValid ? [] : ['Неверная ссылка для сброса пароля'],
        isSuccess: false,
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = {
            userId: userId!,
            token: token!,
            password: resetPasswordState.password,
            passwordConfirm: resetPasswordState.passwordConfirm
        }

        try {
            const result = await ApiSingleton.accountApi.accountResetPassword(userData)

            setState(prevState => ({
                ...prevState,
                errors: result.errors,
                isSuccess: result.succeeded as boolean
            }))
        } catch (e) {
            setState(prevState => ({
                ...prevState,
                errors: ['Сервис недоступен'],
                isSuccess: false
            }))
        }
    }

    const headerStyles: React.CSSProperties = {marginRight: "9.5rem"};
    if (resetPasswordState.errors) {
        headerStyles.marginBottom = "-1.5rem";
    }

    const {password, passwordConfirm} = resetPasswordState
    const isInvalid = password !== "" && password !== passwordConfirm

    return (
        <Container component="main" maxWidth="xs">
            <Grid container sx={headerSx}>
                <Typography component="h1" variant="h5">
                    Изменение пароля
                </Typography>
                {resetPasswordState.errors && resetPasswordState.errors.length > 0 && (
                    <Alert severity="error" sx={{mt: 2, width: "100%", borderRadius: "10px"}}>
                        {resetPasswordState.errors.map((error, index) => <div key={index}>{error}</div>)}
                    </Alert>
                )}
            </Grid>
            {resetPasswordState.isSuccess
                ? <Alert
                    severity="success"
                    sx={{mt: 1}}
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.assign("/login")}>
                            ВОЙТИ
                        </Button>
                    }
                >
                    <AlertTitle>Пароль успешно изменён</AlertTitle>
                </Alert>
                : isUrlValid && <form onSubmit={(e) => handleSubmit(e)} style={{marginTop: 24, width: "100%"}}>
                <Grid container direction="column" spacing={2} justifyContent="center">
                    <Grid item>
                        <TextField
                            required
                            fullWidth
                            type="password"
                            label="Новый пароль"
                            variant="outlined"
                            sx={inputSx}
                            value={resetPasswordState.password}
                            onChange={(e) => {
                                setState((prevState) => ({
                                    ...prevState,
                                    password: e.target.value
                                }))
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <TextField
                            required
                            fullWidth
                            error={isInvalid}
                            helperText={isInvalid ? "Пароль и его подтверждение должны совпадать" : ""}
                            type="password"
                            label="Подтвердите пароль"
                            variant="outlined"
                            sx={inputSx}
                            value={resetPasswordState.passwordConfirm}
                            onChange={(e) => {
                                setState((prevState) => ({
                                    ...prevState,
                                    passwordConfirm: e.target.value
                                }))
                            }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            disabled={isInvalid}
                            fullWidth
                            variant="contained"
                            color="primary"
                            disableElevation
                            type="submit"
                            sx={submitButtonSx}
                        >
                            Сменить пароль
                        </Button>
                    </Grid>
                </Grid>
            </form>
            }
        </Container>
    )
}

export default ResetPassword
