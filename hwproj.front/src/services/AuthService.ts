import {LoginViewModel, AccountApi, RegisterViewModel} from '../api';
import ApiSingleton from "../api/ApiSingleton";
import decode from "jwt-decode";

interface TokenPayload {
    _userName: string;
    _id: string;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
    nbf: number;
    exp: number;
    iss: string;
}

export default class AuthService {
    client = new AccountApi();

    constructor() {
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    async login(user: LoginViewModel) {
        const token = await ApiSingleton.accountApi.accountLogin(user)
        if (token.errors) {
            return {
                error: token.errors,
                isLogin: false
            }
        }
        this.setToken(token.value?.accessToken!)
        return {
            error: null,
            isLogin: true
        }
    }

    async register(user: RegisterViewModel) {
        const result = await ApiSingleton.accountApi.accountRegister(user)
        return {
            isRegistered: result.succeeded,
            error: result.errors
        }
    }

    isLoggedIn() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    isTokenExpired(token: any) {
        try {
            let decoded = decode<TokenPayload>(token);
            return decoded.exp < Date.now() / 1000;
        } catch (err) {
            return true;
        }
    }

    getTokenExpirationDate(token: any) {
        const decoded = decode<TokenPayload>(token);
        const expirationDate = new Date(decoded.exp * 1000);

        return expirationDate.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    }

    setToken = (idToken: string) => localStorage.setItem("id_token", idToken);

    refreshToken = (idToken: string) => {
        this.setToken(idToken)
        window.location.reload()
    }

    getToken = () => localStorage.getItem("id_token");

    logout = () => localStorage.clear();

    getProfile = () => {
        let result = decode<TokenPayload>(this.getToken() as string);
        if (result.exp < 1761527002) {
            this.logout()
            alert("Мы обновили кое-что важное, и чтобы все правильно работало, просим вас заново войти в аккаунт! Приносим извинения за неудобства.")
            window.location.reload()
        }
        return result
    };

    getUserId = () => this.getProfile()._id;

    isExpertProfileEdited = async () => await ApiSingleton.expertsApi.expertsGetIsProfileEdited();

    setIsExpertProfileEdited = async () => await ApiSingleton.expertsApi.expertsSetProfileIsEdited();

    loggedIn = () => this.getToken() !== null

    getUserEmail = () => {
        if (this.getToken() === null) {
            return ""
        }
        return this.getProfile()["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]
    }

    getRole = () => {
        if (this.getToken() === null) {
            return null
        }

        return  this.getProfile()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    }
    
    isMentor() {
        if (this.getToken() === null) {
            return false
        }

        const role = this.getProfile()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        return role === "Lecturer" || role === "Expert";
    }

    isLecturer() {
        if (this.getToken() === null) {
            return false
        }
        return this.getProfile()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Lecturer"
    }

    isExpert() {
        if (this.getToken() === null) {
            return false
        }
        return this.getProfile()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Expert"
    }
}
