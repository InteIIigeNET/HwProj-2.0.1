import React, {FC, FormEvent} from "react";
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import {
    Alert,
    AlertTitle,
    Avatar,
    Box,
    Button,
    Container,
    Grid,
    TextField,
    Typography
} from "@mui/material";
import ValidationUtils from "../Utils/ValidationUtils";
import { useLocation } from "react-router-dom";

interface IRecoverState {
    email: string;
    error: string[] | undefined;
    isSuccess: boolean;
}

// theme.spacing(n) в v4 возвращал число 8n, поэтому подставляем итоговые пиксели
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

const PasswordRecovery: FC = () => {
    const location = useLocation();
    const [recoverState, setRecoverState] = useState<IRecoverState>({
        email: location.state?.email || '',
        error: [],
        isSuccess: false,
    })

    const [emailError, setEmailError] = useState<string>(""); // Состояние для ошибки электронной почты
    const [isRecoveryButtonDisabled, setIsRecoveryButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!ValidationUtils.isCorrectEmail(recoverState.email)) {
            setEmailError("Некорректный адрес электронной почты");
            setIsRecoveryButtonDisabled(true);
            return;
        }

        try {
            const result = await ApiSingleton.accountApi.accountRequestPasswordRecovery({email: recoverState.email})
            setRecoverState(prevState => ({
                ...prevState,
                error: result.errors,
                isSuccess: result.succeeded as boolean
            }))
        } catch (e) {
            setRecoverState(prevState => ({
                ...prevState,
                error: ['Сервис недоступен'],
                isSuccess: false
            }))
        }
    }

    const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRecoverState((prevState) => ({
            ...prevState,
            email: e.target.value
        }))
        setEmailError("");
        setIsRecoveryButtonDisabled(false);
    }

    return (
        <Container component="main" maxWidth="xs">
            <Grid container sx={headerSx}>
                <Avatar sx={{m: 1, color: 'white', backgroundColor: '#ba2e2e'}}>
                    <QuestionMarkOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Восстановление пароля
                </Typography>
                {recoverState.error && recoverState.error.length > 0 && (
                    <Alert severity="error" sx={{mt: 2, width: "100%", borderRadius: "10px"}}>
                        {recoverState.error.map((error, index) => <div key={index}>{error}</div>)}
                    </Alert>
                )}
            </Grid>
            {recoverState.isSuccess
                ? (<Alert severity="success" sx={{mt: 1}}>
                    <AlertTitle>Запрос отправлен</AlertTitle>
                    Ссылка для смены пароля отправлена на
                    <br/>
                    <b>{recoverState.email}</b>
                </Alert>)
                : <form onSubmit={(e) => handleSubmit(e)} style={{marginTop: 24, width: "100%"}}>
                    <Grid container direction="column" justifyContent="center">
                        <TextField
                            required
                            type="email"
                            fullWidth
                            label="Электронная почта"
                            variant="outlined"
                            margin="normal"
                            sx={inputSx}
                            value={recoverState.email}
                            onChange={handleChangeEmail}
                            error={emailError !== ""}
                            helperText={emailError}
                        />
                        <Box sx={{mt: 2}}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                disableElevation
                                type="submit"
                                disabled={isRecoveryButtonDisabled}
                                sx={submitButtonSx}
                            >
                                Восстановить пароль
                            </Button>
                        </Box>
                    </Grid>
                </form>}
        </Container>
    )
}

export default PasswordRecovery
