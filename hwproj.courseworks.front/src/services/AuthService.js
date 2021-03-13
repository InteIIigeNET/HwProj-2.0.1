import decode from 'jwt-decode';
import { AccountApi } from '../Api/auth'
import axios from "axios";

export default class AuthService {
    client = new AccountApi();
    constructor() {
        this.login = this.login.bind(this)
        this.getProfile = this.getProfile.bind(this)
    }

    async login(email, password) {
        // const res = await this.client.login({ email: username, password: password });
        // const tokenCredentials = await res.json();
        // this.setToken(tokenCredentials.value.accessToken);
        // return Promise.resolve(tokenCredentials);
        // const res = await axios.post('https://localhost:5001/api/account/login', { email, password }
        //const token = res.data.value.accessToken;
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