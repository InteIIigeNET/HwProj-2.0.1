import {Navigate, useParams} from 'react-router-dom';
import React, {FC, useEffect, useState} from "react";
import ApiSingleton from "./../../api/ApiSingleton";
import {Box, CircularProgress, Typography} from "@material-ui/core";
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
    const [isProfileAlreadyEdited, setIsProfileAlreadyEdited] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const isExpired = ApiSingleton.authService.isTokenExpired(token);
            if (!isExpired) {
                const isExpertLoggedIn = await ApiSingleton.expertsApi.expertsLogin(credentials)
                if (isExpertLoggedIn.succeeded) {
                    ApiSingleton.authService.setToken(token!);
                    setIsTokenValid(true);
                    props.onLogin();

                    const isEdited = await ApiSingleton.authService.isExpertProfileEdited();
                    if (isEdited.succeeded && isEdited.value) {
                        setIsProfileAlreadyEdited(true);
                    }

                    setIsLoading(false);
                    return
                }
            }
            setIsTokenValid(false);
            setIsLoading(false);
        };

        checkToken();
    }, [token]);

    return isLoading ? (
        <div className="container">
            <p>Проверка токена...</p>
            <CircularProgress/>
        </div>
    ) : (
        isTokenValid ? (
            isProfileAlreadyEdited ? (
                <Navigate to={"/"}/>) : (<Navigate to={"/user/edit"}/>)
        ) : (
            <Box sx={{minWidth: 150, marginTop: 15}} display={'flex'} alignItems={'center'}
                 justifyContent={'center'}>
                <Box p={2}>
                    <Typography variant="h6" gutterBottom align="center">
                        Ошибка в пригласительной ссылке
                    </Typography>
                    <Typography variant="body1">
                        Ссылка просрочена или содержит опечатку. Обратитесь к выдавшему её преподавателю.
                    </Typography>
                </Box>
            </Box>
        )
    );
}

export default ExpertAuthLayout;