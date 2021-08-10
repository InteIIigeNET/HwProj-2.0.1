import React from "react";
import { makeStyles } from '@material-ui/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";

const styles = makeStyles({
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

interface AppBarProps{
  loggedIn: boolean;
  isLecturer: boolean;
  onLogout: () => void; 
}

export const Header: React.FC<AppBarProps> = (props: AppBarProps) =>  {
  const classes = styles()

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
          {props.loggedIn && props.isLecturer && 
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
          {props.loggedIn && (
            <div>
              <Box display="flex" flexDirection="row">
                <Avatar
                  src="/broken-image.jpg"
                  onClick={() => window.location.assign("/profile")}
                />
                <Button
                  color="inherit"
                  onClick={() => window.location.assign("/user/edit")}
                >
                  Редактировать данные
                </Button>
                <Button onClick={props.onLogout} color="inherit">
                  Выйти
                </Button>
              </Box>
            </div>
          )}
          {!props.loggedIn && (
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
