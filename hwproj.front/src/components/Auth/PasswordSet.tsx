import React, {FC, FormEvent} from "react";
import Avatar from '@material-ui/core/Avatar';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import {TextField, Button, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import Container from '@material-ui/core/Container';
import { SetPasswordViewModel } from "api";
import { Alert, AlertTitle } from "@mui/material";

interface IPasswordSetProps {}

interface IPasswordSetState {
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

const SetPassword: FC<IPasswordSetProps> = (props) => {

    const urlParams = new URLSearchParams(window.location.search)

    const classes = useStyles()
    const [passwordSetState, setState] = useState<IPasswordSetState>({
        password: "",
        passwordConfirm: "",
        error: [],
        isSuccess: false,
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData: SetPasswordViewModel = {
            userId: urlParams.get("id")!,
            token: urlParams.get("token")!,
            password: passwordSetState.password,
            passwordConfirm: passwordSetState.passwordConfirm
        }

        try {
            const result = await ApiSingleton.accountApi.apiAccountSetPassword(userData)
            if (result.errors?.includes('Not Found')) {
                result.errors = ['Пользователь не найден']
            }

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
    if (passwordSetState.error) {
        headerStyles.marginBottom = "-1.5rem";
    }

    return (
        <Container component="main" maxWidth="xs">
            <Grid container className={classes.paper}>
                <Typography component="h1" variant="h5">
                    Изменение пароля
                </Typography>
                {passwordSetState.error && (
                    <p style={{color: "red", marginBottom: "0"}}>
                        {passwordSetState.error}
                    </p>
                )} 
            </Grid>
            <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                <Grid container direction="column" spacing={2} justifyContent="center">
                    <Grid item>
                        <TextField
                            required
                            fullWidth
                            type="password"
                            label="Новый пароль"
                            variant="outlined"
                            value={passwordSetState.password}
                            onChange={(e) =>
                            {
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
                            type="password"
                            label="Подтвердите пароль"
                            variant="outlined"
                            value={passwordSetState.passwordConfirm}
                            onChange={(e) =>
                            {
                                e.persist()
                                setState((prevState) => ({
                                    ...prevState,
                                    passwordConfirm: e.target.value
                                }))
                            }}
                        />
                    </Grid>
                    <Grid item>
                        {!passwordSetState.isSuccess && (<Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        >
                            Сменить пароль
                        </Button>)}
                        {passwordSetState.isSuccess && (<Alert 
                        severity="success"
                        sx={{mt: 1}}
                        action={
                            <Button color="inherit" size="small" onClick={() => window.location.assign("/login")}>
                                ВОЙТИ
                            </Button>
                        }
                        >    
                            <AlertTitle>Изменение пароля</AlertTitle>
                            Ваш пароль успешно изменён

                        </Alert>)}
                    </Grid>
                </Grid>
            </form>
        </Container>
    )
}

export default SetPassword