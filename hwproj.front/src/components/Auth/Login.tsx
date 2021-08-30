import React, { FormEvent } from "react";
import { RouteComponentProps } from "react-router-dom";
import { TextField, Button, Typography } from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/Login.css";
import { LoginViewModel } from "../../api/"
import GoogleLogin, {GoogleLoginResponse, GoogleLoginResponseOffline} from "react-google-login";

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

  googleResponse = async (response: any) => {
    const result = await ApiSingleton.authService.loginByGoogle(response.tokenId)
    this.setState({
      error: result!.error,
      isLogin: result.isLogin
    })
  };
  
  render() {
    const headerStyles: React.CSSProperties = { marginRight: "9.5rem" };
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID!

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
          <GoogleLogin
              clientId={clientId}
              buttonText=''
              onSuccess={this.googleResponse}
          />
        </div>
      </div>
    );
  }
}
