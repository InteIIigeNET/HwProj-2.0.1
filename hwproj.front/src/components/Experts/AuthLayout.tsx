import {Navigate, useParams} from 'react-router-dom';
import React, {FC, useEffect, useState} from "react";
import ApiSingleton from "./../../api/ApiSingleton";
import {Box, Typography} from "@material-ui/core";
import {TokenCredentials} from "api/api";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

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
    const [isExpert, setIsExpert] = useState(false);

    useEffect(() => {
        const checkToken = async () => {
            const isExpired = ApiSingleton.authService.isTokenExpired(token);
            if (!isExpired) {
                try {
                    const expertLoginResult = await ApiSingleton.expertsApi.expertsLogin(credentials);
                    
                    if (expertLoginResult.succeeded) {
                        ApiSingleton.authService.setToken(token!);
                        setIsTokenValid(true);
                        setIsExpert(true);
                        props.onLogin();

                        const isEdited = await ApiSingleton.authService.isExpertProfileEdited();
                        if (isEdited.succeeded && isEdited.value) {
                            setIsProfileAlreadyEdited(true);
                        }

                        setIsLoading(false);
                        return;
                    }

                    const loginResult = await ApiSingleton.accountApi.accountLoginWithToken(credentials);
                    
                    if (loginResult.succeeded) {
                        ApiSingleton.authService.setToken(token!);
                        setIsTokenValid(true);
                        setIsExpert(false);
                        props.onLogin();
                        
                        setIsLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Login error:", error);
                }
            }
            
            setIsTokenValid(false);
            setIsLoading(false);
        };

        checkToken();
    }, [token]);

    if (isLoading) {
        return (
            <div className="container">
                <p>Checking token...</p>
                <DotLottieReact
                    src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                    loop
                    autoplay
                />
            </div>
        );
    }

    if (!isTokenValid) {
        return (
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
        );
    }

    if (isExpert) {
        return isProfileAlreadyEdited 
            ? <Navigate to="/" />
            : <Navigate to="/user/edit" />;
    } else {
        return <Navigate to="/" />;
    }
}

export default ExpertAuthLayout;