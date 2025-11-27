import {LoginViewModel, AccountApi, RegisterViewModel} from '../api';
import ApiSingleton from "../api/ApiSingleton";
import decode from "jwt-decode";


interface User {
    id: string;
    email: string;
    role: string;
}

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
    private _user: User | null = null;

    constructor() {
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    public async getUser() {
        try {
            const accountData = await ApiSingleton.accountApi.accountGetUserSummary();
            if (accountData) {
                this._user = {
                    id: accountData.userId!,
                    email: accountData.email!,
                    role: accountData.role!,
                };
            } else {
                this._user = null;
            }
        }
        catch (e) {
            this._user = null;
        }
    }

    async login(user: LoginViewModel) {
        try {
            await ApiSingleton.accountApi.accountLogin(user);
            await this.getUser();

            return {
                error: null,
                isLogin: true
            }
        }
        catch (e: any) {
            this._user = null;

            const status = e?.status ?? e?.response?.status;
            const message = status === 401 ? "Неверный логин или пароль" : "Ошибка авторизации";
            return {
                error: [message],
                isLogin: false
            }
        }
    }

    async register(user: RegisterViewModel) {
        const result = await ApiSingleton.accountApi.accountRegister(user)
        return {
            isRegistered: result.succeeded,
            error: result.errors
        }
    }

    loggedIn = () => this._user !== null;

    async refreshAccessToken(){
        try {
            await ApiSingleton.accountApi.accountRefreshToken();
            await this.getUser();
            window.location.reload();
        }
        catch {
            await this.logout();
        }
    }

    public async getProfile() {
        await this.getUser();

        return this._user;
    };

    getUserId = () => this._user?.id ?? "";

    isExpertProfileEdited = async () => await ApiSingleton.expertsApi.expertsGetIsProfileEdited();

    setIsExpertProfileEdited = async () => await ApiSingleton.expertsApi.expertsSetProfileIsEdited();

    getUserEmail = () => this._user?.email ?? "";

    getRole = () => this._user?.role ?? "";

    isMentor() {
        const role = this._user?.role ?? "";
        return role === "Lecturer" || role === "Expert";
    }

    isLecturer = () => this._user?.role === "Lecturer";

    isExpert = () => this._user?.role === "Expert";

    async logout() {
        try {
            await ApiSingleton.accountApi.accountLogout();
        }
        catch {}

        this._user = null;
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
}
