import * as React from "react";
import {FC, FormEvent, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import Avatar from '@material-ui/core/Avatar';
import GitHubIcon from '@mui/icons-material/GitHub';
import {Button, Container, Grid, TextField, Typography, Link} from "@material-ui/core";
import ApiSingleton from "../api/ApiSingleton";
import {useSearchParams} from 'react-router-dom';
import EditIcon from "@material-ui/icons/Edit";
import makeStyles from "@material-ui/styles/makeStyles";

interface IEditProfileState {
    isLoaded: boolean;
    edited: boolean;
    errors: string[];
    name: string;
    surname: string;
    middleName?: string;
    isExternalAuth?: boolean;
    githubId: string | undefined;
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
    const [searchParams, setSearchParams] = useSearchParams();

    const removeGithubCodeParam = () => {
        searchParams.delete('code');
        setSearchParams(searchParams);
    }

    const [profile, setProfile] = useState<IEditProfileState>({
        isLoaded: false,
        edited: false,
        errors: [],
        name: "",
        surname: "",
        middleName: "",
        isExternalAuth: false,
        githubId: "",
        githubLoginUrl: "",
    })

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
        let githubId: string | undefined

        const code = searchParams.get('code')

        if (code) {
            try {
                githubId = (await ApiSingleton.accountApi.apiAccountGithubAuthorizePost(code)).githubId
            } catch (e) {
                setProfile((prevState) => ({
                    ...prevState,
                    isLoaded: true,
                    errors: ['Ошибка при авторизации в GitHub']
                }))
            } finally {
                removeGithubCodeParam()
            }
        }

        try {
            const githubLoginUrl = (await ApiSingleton.accountApi.apiAccountGithubUrlPost({url: window.location.href})).url
            const currentUser = (await ApiSingleton.accountApi.apiAccountGetUserDataGet()).userData!
            githubId = githubId ? githubId : currentUser.githubId

            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                name: currentUser.name!,
                surname: currentUser.surname!,
                middleName: currentUser.middleName!,
                isExternalAuth: currentUser.isExternalAuth,
                githubId: githubId,
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
                            </Grid>
                            <Grid container direction="row" spacing={1} alignItems="center" justifyContent="center">
                                <Grid item>
                                    <GitHubIcon/>
                                </Grid>
                                <Grid item>
                                    {profile.githubId
                                        ? <Link href={`https://github.com/${profile.githubId}`} underline="hover">
                                            <Typography display="inline"
                                                        style={{fontSize: 15}}>{profile.githubId}</Typography>
                                        </Link>
                                        : <Link href={profile.githubLoginUrl ?? ''} underline="hover">
                                            <Typography display="inline" style={{fontSize: 15}}>Добавить логин
                                                GitHub</Typography>
                                        </Link>
                                    }
                                </Grid>

                                {profile.githubId &&
                                    <Grid item>
                                        <Link href={profile.githubLoginUrl ?? ''} underline="hover">
                                            <EditIcon style={{fontSize: 17}}/>
                                        </Link>
                                    </Grid>
                                }
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
