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
    error: string[] | undefined;
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

    const classes = useStyles()
    const [resetPasswordState, setState] = useState<IResetPasswordState>({
        password: "",
        passwordConfirm: "",
        error: [],
        isSuccess: false,
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData = {
            userId: urlParams.get("id")!,
            token: urlParams.get("token")!,
            password: resetPasswordState.password,
            passwordConfirm: resetPasswordState.passwordConfirm
        }

        try {
            const result = await ApiSingleton.accountApi.apiAccountResetPasswordPost(userData)

            setState(prevState => ({
                ...prevState,
                error: result.errors,
                isSuccess: result.succeeded as boolean
            }))
        } catch (e) {
            setState(prevState => ({
                ...prevState,
                error: ['Сервис недоступен'],
                isSuccess: false
            }))
        }
    }

    const headerStyles: React.CSSProperties = {marginRight: "9.5rem"};
    if (resetPasswordState.error) {
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
                {resetPasswordState.error && (
                    <p style={{color: "red", marginBottom: "0"}}>
                        {resetPasswordState.error}
                    </p>
                )}
            </Grid>
            {resetPasswordState.isSuccess ? <Alert
                    severity="success"
                    sx={{mt: 1}}
                    action={
                        <Button color="inherit" size="small" onClick={() => window.location.assign("/login")}>
                            ВОЙТИ
                        </Button>
                    }
                >
                    <AlertTitle>Пароль успешно изменён</AlertTitle>
                </Alert> :
                <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
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
