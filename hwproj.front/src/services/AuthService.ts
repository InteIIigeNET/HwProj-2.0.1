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

export default class AuthService {
  client = new AccountApi();
  constructor() {
    this.login = this.login.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  async login(email: string, password: string) {
    const res = await this.client.apiAccountLoginPost({
      email: email,
      password: password,
    });

    const tokenCredentials = await res.json();
    this.setToken(tokenCredentials.value.accessToken);
    return Promise.resolve(tokenCredentials);
  }

  isLoggedIn() {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: any) {
    try {
      let decoded = decode(token);
      return (decoded as any).exp + 300 < Date.now() / 1000;
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
