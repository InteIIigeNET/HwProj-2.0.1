import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import {Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions} from "@mui/material";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../../api/ApiSingleton";
import { RegisterExpertViewModel } from "../../api/";
import "./Styles/Register.css";
import Grid from "@material-ui/core/Grid";
import makeStyles from "@material-ui/styles/makeStyles";
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import Avatar from "@material-ui/core/Avatar";

interface  IRegisterExpertProps {
    isOpen: boolean;
    close: any;
}

interface IRegisterExpertState {
    errors: string[];
    isRegisterSuccessful: boolean | undefined;
}

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
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
        marginTop: theme.spacing(1)
    },
}))

const isCorrectEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
    return re.test(email);
}

const RegisterExpertModal: FC<IRegisterExpertProps> = (props) => {
    const classes = useStyles()
    
    const [registerState, setRegisterState] = useState<RegisterExpertViewModel>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        companyName: "",
        bio: ""
    })
    
    const [commonState, setCommonState] = useState<IRegisterExpertState>({
        errors: [],
        isRegisterSuccessful: undefined
    })
    
    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isCorrectEmail(registerState.email)) {
            setCommonState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты']
            }))
            return
        }
        try {
            const result = await ApiSingleton.accountApi.apiAccountRegisterExpertPost(registerState);
            setCommonState((prevState) => ({
                ...prevState,
                errors: result!.errors ?? [],
                isRegisterSuccessful: result.succeeded
            }));
        }
        catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен'],
            }))
        }
    }
    
    const close = () => {
        setRegisterState({
            name: "",
            surname: "",
            middleName: "",
            email: "",
            companyName: "",
            bio: ""
        })
        setCommonState(prevState => ({
            ...prevState,
            isRegisterSuccessful: undefined
        }))
        props.close()
    }

    return (
        <div>
            <Dialog open={props.isOpen} onClose={close} aria-labelledby="form-dialog-title" maxWidth="xs">
                <DialogTitle id="form-dialog-title">
                    <Grid container>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Avatar className={classes.avatar} style={{ color: 'white', backgroundColor: '#00AB00' }}>
                                <PersonAddOutlinedIcon />
                            </Avatar>
                        </Grid>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            <Typography variant="h5">
                                Зарегистрировать эксперта
                            </Typography>
                        </Grid>
                    </Grid>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Grid item container direction={"row"} justifyContent={"center"}>
                            {commonState.errors.length > 0 && (
                                <p style={{ color: "red", marginBottom: "0" }}>{commonState.errors}</p>
                            )}
                            {commonState.isRegisterSuccessful && (
                                <p style={{color: "green", marginBottom: "0"}}>Эксперт успешно зарегистрирован</p>
                            )}
                        </Grid>
                        <form onSubmit={handleSubmit} className={classes.form}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Имя"
                                        variant="outlined"
                                        name={registerState.name}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                name: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="Фамилия"
                                        variant="outlined"
                                        name={registerState.surname}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                surname: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Отчество"
                                        variant="outlined"
                                        size="small"
                                        name={registerState.middleName}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                middleName: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        required
                                        fullWidth
                                        type="email"
                                        label="Электронная почта"
                                        variant="outlined"
                                        size="small"
                                        name={registerState.email}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                email: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Компания"
                                        variant="outlined"
                                        size="small"
                                        value={registerState.companyName}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                companyName: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        label="Дополнительная информация (bio)"
                                        variant="outlined"
                                        size="small"
                                        value={registerState.bio}
                                        onChange={(e) => {
                                            e.persist()
                                            setRegisterState((prevState) => ({
                                                ...prevState,
                                                bio: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                container
                                style={{marginTop: '16px'}}
                            >
                                <Grid item>
                                    <Button
                                        onClick={close}
                                        color="primary"
                                        variant="contained"
                                        style={{marginRight: '10px'}}
                                    >
                                        Закрыть
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        type="submit"
                                    >
                                        Зарегистрировать
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default RegisterExpertModal
