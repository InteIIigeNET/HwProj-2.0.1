import axios from "axios";
import {LoginViewModel} from "./api";

interface RegisterModel {
    name: string,
    surname: string,
    middleName: string,
    email: string,
    password: string,
    passwordConfirm: string
}

export default class AccountApi {
    static async register(registerModel: RegisterModel) {
        await axios.post(`http://localhost:5000/api/account/register`, registerModel)
    }

    static async login(loginModel: LoginViewModel) {
        await axios.post(`http://localhost:5000/api/account/login`, loginModel)
    }
}
