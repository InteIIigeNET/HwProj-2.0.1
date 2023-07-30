import React, {FC, FormEvent} from "react";
import {
    TextField,
    Button,
    Typography
} from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import Container from '@material-ui/core/Container';
import {Alert, AlertTitle} from "@mui/material";

interface IResetPasswordState {
    password: string;
    passwordConfirm: string;
    errors: string[] | undefined;
    isSuccess: boolean;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
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
    },
}))

const ResetPassword: FC = () => {

    const urlParams = new URLSearchParams(window.location.search)
    const userId = urlParams.get("id")
    const token = urlParams.get("token")
    const isUrlValid = userId !== null && token !== null

    const classes = useStyles()
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
            const result = await ApiSingleton.accountApi.apiAccountResetPasswordPost(userData)

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
            <Grid container className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Изменение пароля
                </Typography>
                {resetPasswordState.errors && (
                    <p style={{color: "red", marginBottom: "0"}}>
                        {resetPasswordState.errors}
                    </p>
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
                : isUrlValid && <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                <Grid container direction="column" spacing={2} justifyContent="center">
                    <Grid item>
                        <TextField
                            required
                            fullWidth
                            type="password"
                            label="Новый пароль"
                            variant="outlined"
                            value={resetPasswordState.password}
                            onChange={(e) => {
                                e.persist()
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
                            value={resetPasswordState.passwordConfirm}
                            onChange={(e) => {
                                e.persist()
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
                            type="submit"
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
