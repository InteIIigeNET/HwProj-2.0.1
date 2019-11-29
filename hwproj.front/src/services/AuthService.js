import decode from 'jwt-decode';
import { AccountApi } from '../api/auth/api'

export default class AuthService {
    client = new AccountApi();
    constructor() {
        this.login = this.login.bind(this)
        this.getProfile = this.getProfile.bind(this)
    }

    async login(username, password) {
        const res = await this.client.login({ email: username, password: password });
        const tokenCredentials = await res.json();
        this.setToken(tokenCredentials.accessToken);
        return Promise.resolve(tokenCredentials);
    }

    isLoggedIn() {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    isTokenExpired(token) {
        try {
            let decoded = decode(token);
            return decoded.exp + 300 < Date.now() / 1000;
        }
        catch (err) {
            return false;
        }
    }

    setToken(idToken) {
        localStorage.setItem('id_token', idToken)
    }

    getToken() {
        return localStorage.getItem('id_token')
    }

    logout() {
        localStorage.removeItem('id_token');
        this.client.logOff();
    }

    getProfile() {
        return decode(this.getToken());
    }
}
