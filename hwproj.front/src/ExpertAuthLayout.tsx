import {Navigate, Outlet, useParams} from 'react-router-dom';
import React, {FC, useEffect, useState} from "react";
import ApiSingleton from "./api/ApiSingleton";
import ExpertEditProfile from "./components/ExpertEditProfile";
import {Box, CircularProgress, Paper, Typography} from "@material-ui/core";
import {Center} from "@skbkontur/react-ui";
import {TokenCredentials} from "api/api";

interface IExpertAuthLayoutProps {
    onLogin: any;
}

const ExpertAuthLayout: FC<IExpertAuthLayoutProps> = (props: IExpertAuthLayoutProps) => {
    const {token} = useParams();
    const credentials: TokenCredentials = {
        accessToken: token
    }
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const isExpired = ApiSingleton.authService.isTokenExpired(token);
            if (!isExpired) {
                const isExpertLoggedIn = await ApiSingleton.accountApi.apiAccountLoginExpertPost(credentials)
                if (isExpertLoggedIn.succeeded) {
                    ApiSingleton.authService.setToken(token!);
                    setIsTokenValid(true);
                    props.onLogin();
                    setIsLoading(false);
                    return
                }
            }
            setIsTokenValid(false);
            setIsLoading(false);
        };

        checkToken();
    }, [token]);

    const isEdited = ApiSingleton.authService.isExpertProfileEdited();
    if (isEdited) {
        return <Navigate to={"/"}/>;
    }

    return isLoading ? (
        <Center>
            <Box sx={{minWidth: 150, marginTop: 15}}>
                <CircularProgress/>
                <p>Проверка токена...</p>
            </Box>
        </Center>
    ) : (
        isTokenValid ? (
            <ExpertEditProfile/>
        ) : (
            <Center>
                <Box sx={{minWidth: 150, marginTop: 15}}>
                    <Paper elevation={3}>
                        <Box p={2}>
                            <Typography variant="h6" gutterBottom align="center">
                                Отказано в доступе
                            </Typography>
                            <Typography variant="body1">
                                Ссылка невалидна.
                                Обратитесь к преподавателю для получения корректного приглашения в сервис.
                            </Typography>
                        </Box>
                    </Paper>
                </Box>
            </Center>
        )
    );
}

export default ExpertAuthLayout;