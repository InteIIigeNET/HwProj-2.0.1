import {Navigate, Outlet, useParams} from 'react-router-dom';
import React, {FC, useEffect, useState} from "react";
import ApiSingleton from "./api/ApiSingleton";
import EditProfile from "./components/EditProfile";
import {Box, CircularProgress} from "@material-ui/core";

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
        <Box sx={{minWidth: 150, marginTop: 15}}>
            <CircularProgress/>
            <p>Проверка токена...</p>
        </Box>
    ) : (
        isTokenValid ? (
            <EditProfile/>
        ) : (
            <Navigate to="/*"/>
        )
    );
}

export default ExpertAuthLayout;