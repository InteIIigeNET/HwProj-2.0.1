import * as React from "react";
import {FC, FormEvent, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import GitHubIcon from '@mui/icons-material/GitHub';
import RefreshIcon from '@mui/icons-material/Refresh';
import {Button, Container, Grid, TextField, Typography, IconButton} from "@material-ui/core";
import ApiSingleton from "../api/ApiSingleton";
import {useSearchParams} from 'react-router-dom';
import makeStyles from "@material-ui/styles/makeStyles";
import { Api } from "@mui/icons-material";

interface IEditProfileState {
    isLoaded: boolean;
    edited: boolean;
    errors: string[];
    name: string;
    surname: string;
    middleName?: string;
    isExternalAuth?: boolean;
    githubLogin: string | undefined;
    githubLoginUrl?: string
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
    const [searchParams] = useSearchParams()
    const code = searchParams.get('code')

    const [profile, setProfile] = useState<IEditProfileState>({
        isLoaded: false,
        edited: false,
        errors: [],
        name: "",
        surname: "",
        middleName: "",
        isExternalAuth: false,
        githubLogin: "",
        githubLoginUrl: "",
    })
    
    const source = "HwProj.front:Attachment"

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const editForm = {
            name: profile.name,
            surname: profile.surname,
            middleName: profile.middleName,
        }
        try {
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
        } catch (e) {
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
        let githubLogin: string | undefined

        if (code) {
            try {
                githubLogin = await (await ApiSingleton.accountApi.apiAccountGithubAuthorizePost(code, source)).login
            } catch (e) {
                setProfile((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    errors: ['Ошибка при авторизации в GitHub']
                }))
            }
        }

        try {
            const githubLoginUrl = (await ApiSingleton.accountApi.apiAccountGithubUrlGet(source)).githubUrl
            const currentUser = await (await ApiSingleton.accountApi.apiAccountGetUserDataGet()).userData!
            githubLogin = githubLogin ? currentUser.githubLogin : githubLogin
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                name: currentUser.name!,
                surname: currentUser.surname!,
                middleName: currentUser.middleName!,
                isExternalAuth:currentUser.isExternalAuth,
                githubLogin: currentUser.githubLogin,
                githubLoginUrl: githubLoginUrl!
            }))
        } catch (e) {
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const classes = useStyles()

    if (profile.edited) {
        return <Navigate to={"/"}/>;
    }
    return profile.isLoaded ? (
        <div>
            {!profile.isExternalAuth && (
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
                                        onChange={(e) => {
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
                                        onChange={(e) => {
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
                                        onChange={(e) => {
                                            e.persist()
                                            setProfile((prevState) => ({
                                                ...prevState,
                                                middleName: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Логин GitHub"
                                        variant="outlined"
                                        value={profile.githubLogin}
                                        disabled
                                    />
                                </Grid>
                                <Grid item xs={6} sm={6}>
                                <IconButton color="primary" href={profile.githubLoginUrl ?? ''}>
                                    {profile.githubLogin ? <RefreshIcon style={{ fontSize: 30}}/> : <GitHubIcon style={{ fontSize: 30 }}/>}
                                </IconButton>
                                </Grid>
                            </Grid>
                            <Button
                                style={{marginTop: '15px'}}
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
                            style={{color: 'white', backgroundColor: '#3fcb27'}}
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
                                        onChange={(e) => {
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
                                        onChange={(e) => {
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
                                        onChange={(e) => {
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
                                style={{marginTop: '15px'}}
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
    ) : (
        <div>

        </div>
    );
}

export default EditProfile
