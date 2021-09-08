import React, {FormEvent, useContext, useState} from "react";
import { RouteComponentProps } from "react-router-dom";
import { TextField, Button, Typography } from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Login.css";
import { LoginViewModel } from "../../api/"
import { GoogleLoginButton, GithubLoginButton } from "react-social-login-buttons";
import GoogleLogin, {useGoogleLogin} from "react-google-login";
// @ts-ignore
import LoginGithub, {onBtnClick} from 'react-login-github';

interface LoginProps extends Partial<RouteComponentProps> {
  onLogin: () => void;
}

interface ILoginState {
  email: string;
  password: string;
  error: string[] | null;
  isLogin: boolean;
}

export default class Login extends React.Component<LoginProps, ILoginState> {
  constructor(props: LoginProps) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: [],
      isLogin: false,
    };
  }

  handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const userData : LoginViewModel = {
      email: this.state.email,
      password: this.state.password,
      rememberMe: false
    }
    const result = await ApiSingleton.authService.login(userData)
    this.setState({
      error: result!.error,
      isLogin: result.isLogin
    })
  }

  githubResponse = async (response: any) => {

    debugger
    const token = (await (await fetch(`http://localhost:9999/authenticate/`+response.code.toString())).json()).token
    debugger

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Bearer', token);
      const result = await fetch("https://api.github.com/user",{
      mode: 'same-origin',
      headers: headers
    })
    debugger
   /* console.log(response)
    debugger

    let headers = new Headers();

    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    headers.append('Origin','http://localhost:3000');

    const requestData = {
      client_id: "",
      client_secret: "",
      code: response.code! as string
    };
    const data = new FormData();
    data.append("client_id", "");
    data.append("client_secret", "");
    data.append("code", response.code! as string);

    console.log(requestData.code)
    debugger
    const proxy_url = "https://github.com/login/oauth/access_token";

    // Use code parameter and other parameters to make POST request to proxy_server
  fetch(proxy_url, {
    mode: 'cors',
    credentials: 'include',
    method: "POST",
    headers: headers,
    body: data
  })
  .then(response => {
    response.json()
    debugger
  })
        /!*.then(data => {console.log(data)})
        .catch(error => {
          this.setState({
            error: error,
            isLogin: false
          });
        });

    /!*const data = new FormData();
    data.append("client_id", "");
    data.append("client_secret", "");
    data.append("code", response.code! as string);

    // Request to exchange code for an access token
    fetch(`https://github.com/login/oauth/access_token`, {
      method: "POST",
      body: data,
    })
        .then((response) => response.text())
        .then((paramsString) => {
          debugger
          let params = new URLSearchParams(paramsString);
          const access_token = params.get("access_token");

          // Request to return data of a user that has been authenticated
          return fetch(`https://api.github.com/user`, {
            headers: {
              Authorization: `token ${access_token}`,
            },
          });
        })
        .then((response) => response.json())
        /!*.then((response) => {
          return res.status(200).json(response);
        })
        .catch((error) => {
          return res.status(400).json(error);
        })*!/;*!/*/
  }

  googleResponse = async (response: any) => {
    console.log(response)
    debugger
    const result = await ApiSingleton.authService.loginByGoogle(response.tokenId)
    this.setState({
      error: result!.error,
      isLogin: result.isLogin
    })
  }

  render() {
    const headerStyles: React.CSSProperties = { marginRight: "9.5rem" };

    if (this.state.error) {
      headerStyles.marginBottom = "-1.5rem";
    }

    if (this.state.isLogin){
      this.props.onLogin?.();
    }

    return (
      <div className="page">
        <Typography component="h1" variant="h5">
          Войти
        </Typography>
        {this.state.error && (
          <p style={{ color: "red", marginBottom: "0" }}>{this.state.error}</p>
        )}
        <form onSubmit={(e) => this.handleSubmit(e)} className="loginForm">
          <TextField
            required
            type="email"
            size="small"
            label="Email Address"
            variant="outlined"
            margin="normal"
            name={this.state.email}
            onChange={(e) => this.setState({ email: e.target.value })}
          />
          <TextField
            required
            type="password"
            size="small"
            label="Password"
            variant="outlined"
            margin="normal"
            value={this.state.password}
            onChange={(e) => this.setState({ password: e.target.value })}
          />
          <br />
          <Button
            size="small"
            variant="contained"
            color="primary"
            type="submit"
          >
            Войти
          </Button>
        </form>
        <Typography>
          <hr/>Или войдите с помощью других сервисов<hr/>
        </Typography>
        <div>
          {/*<GoogleLoginButton onClick={()=>useGoogleLogin({
                clientId:"",
                onSuccess: this.googleResponse}
          )}/>
          <GithubLoginButton  onClick={()=>onBtnClick({clientId:"",
            onSuccess: this.githubResponse})}/>*/}
          {/*<GoogleLogin
              clientId=""
              onSuccess={this.googleResponse}
              buttonText=""
          />*/}
          <LoginGithub
              clientId=""
              onSuccess={this.githubResponse}
          />
        </div>
      </div>
    );
  }
}
