import { LoginViewModel, AccountApi, RegisterViewModel } from './../api/';
import ApiSingleton from "../api/ApiSingleton";
import decode from "jwt-decode";

interface TokenPayload {
  _userName: string;
  _id: string;
  _email: string;
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
    const token = await ApiSingleton.accountApi.apiAccountLoginPost(user)
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

  async register(user: RegisterViewModel){
    const token = await ApiSingleton.accountApi.apiAccountRegisterPost(user) 
    if (!token.succeeded) {
      return {
        loggedIn: false,
        error: token.errors
      }
    }
    this.setToken(token.value?.accessToken!)
    return {
      loggedIn: true,
      error: []
    }
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

  setToken = (idToken: string) => localStorage.setItem("id_token", idToken);

  getToken = () => localStorage.getItem("id_token");

  logout = () => localStorage.removeItem("id_token");

  getProfile = () => decode<TokenPayload>(this.getToken() as string);

  getUserId = () => this.getProfile()._id;

  loggedIn = () => this.getToken() !== null

  isLecturer() {
    if (this.getToken() === null) {
      return false
    }
    return this.getProfile()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === "Lecturer"
  }
}