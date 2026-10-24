import * as React from "react";
import {FC, FormEvent, useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import GitHubIcon from '@mui/icons-material/GitHub';
import ApiSingleton from "../api/ApiSingleton";
import {useSearchParams} from 'react-router-dom';
import EditIcon from "@mui/icons-material/Edit";
import {EditAccountViewModel} from "@/api";
import AvatarUtils from "@/components/Utils/AvatarUtils";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Container,
    Grid,
    Link,
    TextField,
    Typography
} from "@mui/material";

interface IEditProfileProps {
    isExpert: boolean;
}

interface IEditProfileState {
    isLoaded: boolean;
    edited: boolean;
    errors: string[];
    email: string;
    name: string;
    surname: string;
    middleName?: string;
    bio: string;
    company: string;
    isExternalAuth?: boolean;
    githubId: string | undefined;
    githubLoginUrl?: string
}

// theme.spacing(n) в v4 возвращал число 8n, поэтому подставляем итоговые отступы
const pageSx = {
    mt: 3,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const submitButtonSx = {
    py: 1,
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
}

const EditProfile: FC<IEditProfileProps> = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const removeGithubCodeParam = () => {
        searchParams.delete('code');
        setSearchParams(searchParams);
    }

    const [profile, setProfile] = useState<IEditProfileState>({
        isLoaded: false,
        edited: false,
        errors: [],
        email: "",
        name: "",
        surname: "",
        middleName: "",
        bio: "",
        company: "",
        isExternalAuth: false,
        githubId: "",
        githubLoginUrl: "",
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const editForm: EditAccountViewModel = {
            name: profile.name,
            surname: profile.surname,
            middleName: profile.middleName,
            email: profile.email,
            bio: profile.bio,
            companyName: profile.company
        }
        try {
            const result = await ApiSingleton.accountApi.accountEdit(editForm)
            if (result.succeeded) {
                setProfile((prevState) => ({
                    ...prevState,
                    edited: true,
                }));
                if (props.isExpert) {
                    await ApiSingleton.authService.setIsExpertProfileEdited();
                }
            } else {
                setProfile((prevState) => ({
                    ...prevState,
                    errors: result.errors!
                }));
            }
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
                githubId = (await ApiSingleton.accountApi.accountAuthorizeGithub(code)).githubId
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
            const githubLoginUrl = (await ApiSingleton.accountApi.accountGetGithubLoginUrl({url: window.location.href})).url
            const currentUser = (await ApiSingleton.accountApi.accountGetUserData()).userData!
            githubId = githubId ? githubId : currentUser.githubId

            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                email: currentUser.email!,
                name: currentUser.name!,
                surname: currentUser.surname!,
                middleName: currentUser.middleName || "",
                bio: currentUser.bio || "",
                company: currentUser.companyName || "",
                isExternalAuth: currentUser.isExternalAuth,
                githubId: githubId,
                githubLoginUrl: githubLoginUrl
            }))
        } catch (e) {
            setProfile((prevState) => ({
                ...prevState,
                isLoaded: true,
                errors: ['Сервис недоступен']
            }))
        }
    }


    if (profile.edited) {
        return <Navigate to={"/"}/>;
    }
    return profile.isLoaded ? (
        <div>
            {!profile.isExternalAuth && (
                <Container component="main" maxWidth="xs">
                    <Box sx={pageSx}>
                        <Avatar {...AvatarUtils.stringAvatar(profile!)}
                                sx={{m: 1, width: 56, height: 56}}/>
                        <Typography component="h1" variant="h5">
                            Редактировать профиль
                        </Typography>
                        {profile.errors && profile.errors.length > 0 && (
                            <Alert severity="error" sx={{mt: 2, width: "100%", borderRadius: "10px"}}>
                                {profile.errors.map((error, index) => <div key={index}>{error}</div>)}
                            </Alert>
                        )}
                        <form
                            onSubmit={(e) => handleSubmit(e)}
                            style={{marginTop: 24, width: "100%"}}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Имя"
                                        variant="outlined"

                                        sx={inputSx}
                                        value={profile.name}
                                        onChange={(e) => {
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

                                        sx={inputSx}
                                        value={profile.surname}
                                        onChange={(e) => {
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

                                        sx={inputSx}
                                        value={profile.middleName}
                                        onChange={(e) => {
                                            setProfile((prevState) => ({
                                                ...prevState,
                                                middleName: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                {props.isExpert && <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        type="email"
                                        label="Электронная почта"
                                        variant="outlined"

                                        sx={inputSx}
                                        value={profile.email}
                                        onChange={(e) => {
                                            setProfile((prevState) => ({
                                                ...prevState,
                                                email: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>}
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Организация/Компания"
                                        variant="outlined"

                                        sx={inputSx}
                                        value={profile.company}
                                        onChange={(e) => {
                                            setProfile((prevState) => ({
                                                ...prevState,
                                                company: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                {props.isExpert && <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        label="Дополнительная информация (био)"
                                        variant="outlined"

                                        sx={inputSx}
                                        value={profile.bio}
                                        onChange={(e) => {
                                            setProfile((prevState) => ({
                                                ...prevState,
                                                bio: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>}
                            </Grid>
                            {!props.isExpert &&
                                <Grid container direction="row" spacing={1} alignItems="center"
                                      justifyContent="center">
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
                                </Grid>}
                            <Button
                                style={{marginTop: '15px'}}
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit"
                            >
                                Сохранить
                            </Button>
                        </form>
                    </Box>
                </Container>
            )}
            {profile.isExternalAuth && (
                <Container component="main" maxWidth="xs">
                    <Box sx={pageSx}>
                        <Avatar {...AvatarUtils.stringAvatar(profile)}
                                sx={{m: 1, width: 56, height: 56}}/>
                        <Typography component="h1" variant="h5">
                            Редактировать профиль
                        </Typography>
                        {profile.errors && profile.errors.length > 0 && (
                            <Alert severity="error" sx={{mt: 2, width: "100%", borderRadius: "10px"}}>
                                {profile.errors.map((error, index) => <div key={index}>{error}</div>)}
                            </Alert>
                        )}
                        <form
                            onSubmit={(e) => handleSubmit(e)}
                            style={{marginTop: 24, width: "100%"}}
                        >
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        required
                                        label="Имя"
                                        variant="outlined"

                                        sx={inputSx}
                                        value={profile.name}
                                        onChange={(e) => {
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

                                        sx={inputSx}
                                        value={profile.surname}
                                        onChange={(e) => {
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

                                        sx={inputSx}
                                        value={profile.middleName}
                                        onChange={(e) => {
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
                    </Box>
                </Container>
            )}
        </div>
    ) : (
        <div>

        </div>
    );
}

export default EditProfile