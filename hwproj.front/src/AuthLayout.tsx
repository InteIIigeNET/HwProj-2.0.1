﻿import {Navigate, Outlet} from 'react-router-dom';
import React, {FC} from "react";
import ApiSingleton from "./api/ApiSingleton";

const AuthLayout: FC = () =>
    ApiSingleton.authService.isLoggedIn()
        ? <Outlet/>
        : <Navigate to={`/login?returnUrl=${window.location.pathname}`}/>

export default AuthLayout;
