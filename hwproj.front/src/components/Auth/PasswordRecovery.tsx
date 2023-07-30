import React, {FC, FormEvent} from "react";
import Avatar from '@material-ui/core/Avatar';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import {TextField, Button, Typography} from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import makeStyles from "@material-ui/styles/makeStyles";
import Container from '@material-ui/core/Container';
import {Alert, AlertTitle} from "@mui/material";

interface IRecoverState {
    email: string;
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

const PasswordRecovery: FC = () => {

    const classes = useStyles()
    const [recoverState, setRecoverState] = useState<IRecoverState>({
        email: '',
        error: [],
        isSuccess: false,
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const result = await ApiSingleton.accountApi.apiAccountRequestPasswordRecoveryPost({email: recoverState.email})
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
        e.persist()
        setRecoverState((prevState) => ({
            ...prevState,
            email: e.target.value
        }))
    }

    const headerStyles: React.CSSProperties = {marginRight: "9.5rem"};
    if (recoverState.error) {
        headerStyles.marginBottom = "-1.5rem";
    }

    return (
        <Container component="main" maxWidth="xs">
            <Grid container className={classes.paper}>
                <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#ba2e2e'}}>
                    <QuestionMarkOutlinedIcon/>
                </Avatar>
                <Typography component="h1" variant="h5">
                    Восстановление пароля
                </Typography>
                {recoverState.error && (
                    <p style={{color: "red", marginBottom: "0"}}>
                        {recoverState.error}
                    </p>
                )}
            </Grid>
            {recoverState.isSuccess
                ? (<Alert severity="success" sx={{mt: 1}}>
                    <AlertTitle>Запрос отправлен</AlertTitle>
                    Ссылка для смены пароля отправлена на
                    <br/>
                    <b>{recoverState.email}</b>
                </Alert>)
                : <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                    <Grid container direction="column" justifyContent="center">
                        <TextField
                            required
                            type="email"
                            fullWidth
                            label="Электронная почта"
                            variant="outlined"
                            margin="normal"
                            name={recoverState.email}
                            onChange={handleChangeEmail}
                        />
                        <div className={classes.button}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Восстановить пароль
                            </Button>
                        </div>
                    </Grid>
                </form>}
        </Container>
    )
}

export default PasswordRecovery
