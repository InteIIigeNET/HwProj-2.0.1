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
