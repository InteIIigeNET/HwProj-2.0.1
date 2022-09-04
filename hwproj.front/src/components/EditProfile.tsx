import * as React from "react";
import {FC, FormEvent, useEffect, useState} from "react";
import { Redirect } from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';

import {Button, TextField, Typography, Container, Grid} from "@material-ui/core";

import ApiSingleton from "../api/ApiSingleton";
import makeStyles from "@material-ui/styles/makeStyles";

interface IEditProfileState {
    isLoaded: boolean;
    edited: boolean;
    errors: string[];
    name: string;
    surname: string;
    middleName?: string;
    currentPassword: string;
    newPassword: string;
    isExternalAuth?: boolean;
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

const EditProfile: FC = () => {

    const [profile, setProfile] = useState<IEditProfileState>({
        isLoaded: false,
        edited: false,
        errors: [],
        name: "",
        surname: "",
        middleName: "",
        currentPassword: "",
        newPassword: "",
        isExternalAuth: false,
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const editForm = {
            name: profile.name,
            surname: profile.surname,
            middleName: profile.middleName,
            currentPassword: profile.currentPassword,
            newPassword: profile.newPassword,
        }
        try{
            if (profile.isExternalAuth) {
                const result = await ApiSingleton.accountApi.apiAccountEditExternalPut(editForm)
                result.succeeded
                    ? setProfile((prevState) => ({
                        ...prevState,
                        edited: true,
                    }))
                    : setProfile((prevState) => ({
                        ...prevState,
                        errors: result.errors!
                    }))
                return
            }
            const result = await ApiSingleton.accountApi.apiAccountEditPut(editForm)
            result.succeeded
                ? setProfile((prevState) => ({
                    ...prevState,
                    edited: true,
                }))
                : setProfile((prevState) => ({
                    ...prevState,
                    errors: result.errors!
                }))
        }
        catch (e) {
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                errors: ['Сервис недоступен']
            }))
        }
    }

    useEffect(() => {
        getUserInfo()
    }, [])

    const getUserInfo = async () => {
        try{
            const currentUser = await (await ApiSingleton.accountApi.apiAccountGetUserDataGet()).userData!
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                name: currentUser.name!,
                surname: currentUser.surname!,
                middleName: currentUser.middleName!,
                isExternalAuth: currentUser.isExternalAuth,
            }))
        }
        catch (e) {
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const classes = useStyles()

    if (profile.edited) {
        return <Redirect to={"/"}/>;
    }
    if (profile.isLoaded) {
        if (!ApiSingleton.authService.isLoggedIn()) {
            return (
                <Typography variant="h6" gutterBottom>
                    Страница не найдена
                </Typography>
            );
        }

        return (
            <div>
                {!profile.isExternalAuth && (
                    <Container component="main" maxWidth="xs">
                        <div className={classes.paper}>
                            <Avatar
                                src="/broken-image.jpg"
                                style={{ color: 'white', backgroundColor: '#3fcb27' }}
                                className={classes.avatar}
                            />
                            <Typography component="h1" variant="h5">
                                Редактировать профиль
                            </Typography>
                            {profile.errors && (
                                <p style={{color: "red", marginBottom: "0"}}>{profile.errors}</p>
                            )}
                            <form
                                onSubmit={(e) => handleSubmit(e)}
                                className={classes.form}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Имя"
                                            variant="outlined"
                                            value={profile.name}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
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
                                            value={profile.surname}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
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
                                            value={profile.middleName}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
                                                    ...prevState,
                                                    middleName: e.target.value
                                                }))
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Пароль"
                                            variant="outlined"
                                            value={profile.currentPassword}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
                                                    ...prevState,
                                                    currentPassword: e.target.value
                                                }))
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Новый пароль"
                                            variant="outlined"
                                            value={profile.newPassword}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
                                                    ...prevState,
                                                    newPassword: e.target.value
                                                }))
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    style={{ marginTop: '15px'}}
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Редактировать профиль
                                </Button>
                            </form>
                        </div>
                    </Container>
                )}
                {profile.isExternalAuth && (
                    <Container component="main" maxWidth="xs">
                        <div className={classes.paper}>
                            <Avatar
                                src="/broken-image.jpg"
                                style={{ color: 'white', backgroundColor: '#3fcb27' }}
                                className={classes.avatar}
                            />
                            <Typography component="h1" variant="h5">
                                Редактировать профиль
                            </Typography>
                            {profile.errors && (
                                <p style={{color: "red", marginBottom: "0"}}>{profile.errors}</p>
                            )}
                            <form
                                onSubmit={(e) => handleSubmit(e)}
                                className={classes.form}
                            >
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            required
                                            label="Имя"
                                            variant="outlined"
                                            value={profile.name}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
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
                                            value={profile.surname}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
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
                                            value={profile.middleName}
                                            onChange={(e) =>
                                            {
                                                e.persist()
                                                setProfile((prevState) => ({
                                                    ...prevState,
                                                    middleName: e.target.value
                                                }))
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    style={{ marginTop: '15px'}}
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                >
                                    Редактировать профиль
                                </Button>
                            </form>
                        </div>
                    </Container>
                )}
            </div>
        )
    }
    return(
        <div>

        </div>
    )
}

export default EditProfile