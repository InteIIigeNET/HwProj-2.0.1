import React from "react";
import PropTypes from "prop-types";
import { createStyles, withStyles, WithStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import AuthService from "../services/AuthService";
import ApiSingleton from "api/ApiSingleton";

const styles = createStyles({
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

// export interface Props extends WithStyles<typeof styles> {}

interface IAppBarState {
  loaded: boolean;
}

interface AppBarProps extends WithStyles<typeof styles> {
  loggedIn: boolean;
  isLecturer: boolean;
  onLogout: () => void;
}

class ButtonAppBar extends React.Component<AppBarProps, IAppBarState> {
  constructor(props: AppBarProps) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  render() {
    const { loaded } = this.state;
    const { classes} = this.props;
    const loggedIn = this.props.loggedIn;
    const isLecturer = this.props.isLecturer;
    if (loaded) {
      return (
        <div className={classes.root}>
          <AppBar style={{ position: "relative", width: "100vw" }}>
            <Toolbar>
              <Button
                onClick={() => window.location.assign("/")}
                color="inherit"
              >
                HwProj
              </Button>
              <Typography
                variant="h6"
                color="inherit"
                className={classes.grow}
              />
              {loggedIn && isLecturer && 
                (
                  <div>
                    <Button
                      onClick={() => window.location.assign("/invite_lecturer")}
                      color="inherit"
                    >
                      Пригласить преподавателя
                    </Button>
                    <Button
                      onClick={() => window.location.assign("/create_course")}
                      color="inherit"
                    >
                      Создать курс
                    </Button>
                  </div>
                )}
              {loggedIn && (
                <div>
                  <Button
                    color="inherit"
                    onClick={() => window.location.assign("/user/edit")}
                  >
                    Редактировать данные
                  </Button>
                  <Button onClick={this.props.onLogout} color="inherit">
                    Выйти
                  </Button>
                </div>
              )}
              {!loggedIn && (
                <div>
                  <Button
                    onClick={() => window.location.assign("/login")}
                    color="inherit"
                  >
                    Вход
                  </Button>
                  <Button
                    onClick={() => window.location.assign("/register")}
                    color="inherit"
                  >
                    Регистрация
                  </Button>
                </div>
              )}
            </Toolbar>
          </AppBar>
          <br />
        </div>
      );
    }

    return (
      <div className={classes.root}>
        <AppBar position="static" style={{}}>
          <Toolbar>
            <Button href="/" color="inherit">
              HwProj
            </Button>
            <Typography variant="h6" color="inherit" className={classes.grow} />
          </Toolbar>
        </AppBar>
        <br />
      </div>
    );
  }

  componentDidMount() {
    this.setState({ loaded: true });
  }
}

(ButtonAppBar as React.ComponentClass<AppBarProps>).propTypes = {
  classes: PropTypes.object.isRequired,
} as any;

export default withStyles(styles)(ButtonAppBar);
