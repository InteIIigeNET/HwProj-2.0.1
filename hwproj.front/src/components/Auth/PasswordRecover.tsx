import React, {FC, FormEvent} from "react";
import Avatar from '@material-ui/core/Avatar';
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined';
import {Navigate} from "react-router-dom";
import {TextField, Button, Typography} from "@material-ui/core";
import Grid from '@material-ui/core/Grid';
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Register.css";
import {useState} from "react";
import {LoginViewModel} from "../../api/"
import makeStyles from "@material-ui/styles/makeStyles";
import Container from '@material-ui/core/Container';

interface RecoverProps {

}

interface IRecoverState {
    email: string;
    error: string[] | null;
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

const Recover: FC<RecoverProps> = (props) => {

    const classes = useStyles()
    const [recoverState, setRecoverState] = useState<IRecoverState>({
        email: '',
        error: []
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const userData: LoginViewModel = {
            email: recoverState.email,
            password: "$",
            rememberMe: false
        }

        try {
            const result = await ApiSingleton.authService.login(userData)
            setRecoverState(prevState => ({
                ...prevState,
                error: result.error
            }))
            console.log(result)
        } catch (e) {
            setRecoverState(prevState => ({
                ...prevState,
                error: ['Сервис недоступен']
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
            <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
                <Grid container direction="column" justifyContent="center">
                        <Grid>
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
                        </Grid>
                        <Grid className={classes.button}>
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Восстановить пароль
                            </Button>
                        </Grid>
                </Grid>
            </form>       
        </Container>
    )
}

export default Recover