﻿import {Navigate, Outlet, useParams} from 'react-router-dom';
import React, {FC, useEffect, useState} from "react";
import ApiSingleton from "./api/ApiSingleton";
import EditProfile from "./components/EditProfile";
import {Box, CircularProgress, Paper, Typography} from "@material-ui/core";
import {Center} from "@skbkontur/react-ui";

const ExpertAuthLayout: FC = () => {
    const {token} = useParams();
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkToken = async () => {
            const isValid = await ApiSingleton.authService.isTokenValid(token);
            if (isValid) {
                ApiSingleton.authService.setToken(token!);
            }
            setIsTokenValid(isValid);
            setIsLoading(false);
        };

        checkToken();
    }, [token]);

    return isLoading ? (
        <Center>
            <Box sx={{minWidth: 150, marginTop: 15}}>
                <CircularProgress/>
                <p>Проверка токена...</p>
            </Box>
        </Center>
    ) : (
        isTokenValid ? (
            <EditProfile/>
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