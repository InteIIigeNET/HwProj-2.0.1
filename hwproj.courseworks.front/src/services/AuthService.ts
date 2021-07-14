import decode from "jwt-decode";
import { AccountApi } from "../api/auth";

interface TokenPayload {
    _userName: string;
    _id: string;
    _email: string;
    _role: string;
    nbf: number;
    exp: number;
    iss: string;
}

interface LoginResponseData {
    errors: Array<{ code: string | null; description: string }> | null;
    succeeded: boolean;
    value: { accessToken: string; expiresIn: number } | null;
}

export default class AuthService {
    client = new AccountApi();

    constructor() {
        this.login = this.login.bind(this);
        this.getProfile = this.getProfile.bind(this);
    }

    async login(email: string, password: string) {
        const res = await this.client.apiAccountLoginPost({ email, password });
        const data: LoginResponseData = await res.json();

        if (data.errors && data.errors.length > 0) {
            const firstErrorMsg = data.errors[0].description;
            return Promise.reject(firstErrorMsg);
        }

        if (data.value) {
            this.setToken(data.value.accessToken);
            return Promise.resolve(data);
        }

        throw new Error("Should never happen. api has returned a 'value' of null");
    }

    isLoggedIn() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    isTokenExpired(token: any) {
        try {
            let decoded: any = decode(token);
            return decoded.exp + 300 < Date.now() / 1000;
        } catch (err) {
            return false;
        }
    }

    setToken(idToken: any) {
        localStorage.setItem("id_token", idToken);
    }

    getToken() {
        return localStorage.getItem("id_token");
    }

    logout() {
        localStorage.removeItem("id_token");
    }

    getProfile() {
        return decode<TokenPayload>(this.getToken() as string);
    }

    getUserId() {
        return this.getProfile()._id;
    }
}