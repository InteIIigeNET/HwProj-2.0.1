import {Navigate, Outlet, useLocation} from 'react-router-dom';
import React, {FC} from "react";
import ApiSingleton from "./api/ApiSingleton";

const AuthLayout: FC = () => {
    const location = useLocation()

    if (ApiSingleton.authService.isLoggedIn()) return <Outlet/>

    // Гостю на корне сайта показываем лендинг, а не форму входа: это единственная
    // публичная страница, и с неё же поисковики начинают обход (public/sitemap.xml).
    // replace — чтобы кнопка «Назад» не возвращала на "/" и не редиректила снова
    return location.pathname === "/"
        ? <Navigate to={"/welcome"} replace/>
        : <Navigate to={`/login?returnUrl=${location.pathname}`}/>
}

export default AuthLayout;
