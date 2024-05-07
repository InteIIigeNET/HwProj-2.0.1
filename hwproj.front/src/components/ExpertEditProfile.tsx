import makeStyles from "@material-ui/styles/makeStyles";
import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ApiSingleton from "../api/ApiSingleton";
import {RegisterExpertViewModel, EditExpertViewModel} from "../api/";
import Grid from "@material-ui/core/Grid";
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined';
import Avatar from "@material-ui/core/Avatar";
import {Container} from "@mui/material";
import {Navigate} from "react-router-dom";

interface IRegisterExpertState {
    isUpdateSuccessful: boolean | undefined;
    errors: string[];
    edited: boolean;
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
}))

const isCorrectEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
    return re.test(email);
}

const ExpertEditProfile: FC = () => {
    const [editProfileState, setEditProfileState] = useState<EditExpertViewModel>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        companyName: "",
        bio: ""
    })

    const [commonState, setCommonState] = useState<IRegisterExpertState>({
        isUpdateSuccessful: undefined,
        errors: [],
        edited: false
    })

    const classes = useStyles()

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (editProfileState.email !== undefined && editProfileState.email !== "") {
            if (!isCorrectEmail(editProfileState.email)) {
                setCommonState((prevState) => ({
                    ...prevState,
                    errors: ['Некорректный адрес электронной почты']
                }))
                return
            }
        }
        try {
            const result = await ApiSingleton.accountApi.apiAccountEditExpertPut(editProfileState);
            result.succeeded
                ? setCommonState((prevState) => ({
                    ...prevState,
                    edited: true,
                }))
                : setCommonState((prevState) => ({
                    ...prevState,
                    errors: result.errors!
                }))
        } catch (e) {
            setCommonState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен'],
            }))
        }
    }

    if (commonState.edited) {
        return <Navigate to={"/"}/>;
    }

    return (
        <div>
            <Container component="main" maxWidth="xs">
                <div className={classes.paper}>
                    <Avatar
                        src="/broken-image.jpg"
                        style={{color: 'white', backgroundColor: '#3fcb27'}}
                        className={classes.avatar}
                    />
                    <Typography component="h1" variant="h5">
                        Редактировать профиль
                    </Typography>
                    {commonState.errors && (
                        <p style={{color: "red", marginBottom: "0"}}>{commonState.errors}</p>
                    )}
                    <form onSubmit={handleSubmit} className={classes.form}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Имя"
                                    variant="outlined"
                                    name={editProfileState.name}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
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
                                    name={editProfileState.surname}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
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
                                    name={editProfileState.middleName}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
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
                                    name={editProfileState.email}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
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
                                    value={editProfileState.companyName}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
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
                                    value={editProfileState.bio}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditProfileState((prevState) => ({
                                            ...prevState,
                                            bio: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Button
                            style={{marginTop: '15px'}}
                            fullWidth
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            Редактировать
                        </Button>
                    </form>
                </div>
            </Container>
        </div>
    )
}

export default ExpertEditProfile;
