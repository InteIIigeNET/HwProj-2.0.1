import {Navigate, Outlet} from 'react-router-dom';
import React, {FC} from "react";
import ApiSingleton from "./api/ApiSingleton";

const AuthLayout: FC = () => {
    return ApiSingleton.authService.isLoggedIn()
        ? <Outlet/>
        : <Navigate to="/login"/>;
}

export default AuthLayout;
