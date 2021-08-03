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

  

  setUserIdFake(id: number){
    window.localStorage.setItem("userId", String(id));
  }

  getUserIdFake = () => Number(window.localStorage.getItem("userId"));

  getRoleFake = () => window.localStorage.getItem("role") === "lecturer";

  setRoleFake(role: string){
    window.localStorage.setItem("role", role);
  }

  loginFake() {
    window.localStorage.setItem("isLoggin", "true");
  }

  async getAllUsersFake() {
    let response = await fetch("http://localhost:3001/login")
    let users = await response.json()
    return users
  }

  async getUserByUserIdFake() {
    const userId = this.getUserIdFake()
    const response = await fetch("http://localhost:3001/login")
    const data = await response.json()
    const user = data.filter((item: any) => item.id == userId).shift()
    return user
  }

  async registerUserFake(registerUserModel: any) {
    const response = await fetch("http://localhost:3001/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(registerUserModel)
    })
    const user = await response.json()
    return user
  }

  async editUserProfile(userModel: any) {
    const id = this.getUserIdFake()

    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userModel),
    };
    const path = "http://localhost:3001/login/" + id
    await fetch(path, requestOptions)
  }

  logoutFake() {
    window.localStorage.setItem("isLoggin", "false");
  }

  getLogginStateFake = () => window.localStorage.getItem("isLoggin") === "true";

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