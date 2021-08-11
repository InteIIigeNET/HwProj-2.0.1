import React from "react";
import { makeStyles } from '@material-ui/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Link from "@material-ui/core/Link";
import { IconButton, MenuItem, Typography } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from '@material-ui/core/Menu';

const styles = makeStyles( theme => ({
  tools: {
    display: "flex",
    flexWrap: "nowrap",
    flexDirection: "row",
    width: "100vw",
    justifyContent: "flex-end",
  },
  item: {
    fontFamily: theme.typography.fontFamily,
    marginLeft: "10px",
  },
  logo: {
    fontFamily: theme.typography.fontFamily,
    flexGrow: 1,
  }
}));

interface AppBarProps{
  loggedIn: boolean;
  isLecturer: boolean;
  onLogout: () => void; 
}

export const Header: React.FC<AppBarProps> = (props: AppBarProps) =>  {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const classes = styles()
  const isMobileLecturer = useMediaQuery('(min-width:850px)');
  const isMobileStudent = useMediaQuery('(min-width:560px)');
  console.log(isMobileStudent)
  
  return (
    <div>
      <AppBar style={{ position: "static", width: "100vw"}}>
        <Toolbar>
          <Typography>
            <Link
              className={classes.logo}
              onClick={() => window.location.assign("/")}
              component="button"
              variant="h6"
              color="inherit"
              style={{ fontFamily: "Helvetica" }}
            >
              HwProj
          </Link>
          </Typography>
          {props.loggedIn && props.isLecturer &&
            (
              <div className={classes.tools}>
                {isMobileLecturer && 
                (
                  <div>
                    <Link 
                      component="button"
                      color="inherit"
                      onClick={() => window.location.assign("/invite_lecturer")}
                      className={classes.item}
                      style={{ marginLeft: "10px" }}
                    >
                      Пригласить преподавателя
                    </Link>
                    <Link
                      onClick={() => window.location.assign("/create_course")}
                      component="button"
                      color="inherit"
                      className={classes.item}
                      style={{ marginLeft: "10px" }}
                    >
                      Создать курс
                    </Link>
                    <Link
                      onClick={() => window.location.assign("/profile")}
                      component="button"
                      color="inherit"
                      className={classes.item}
                      style={{ marginLeft: "10px" }}
                    >
                      Профиль
                    </Link>
                    <Link
                      component="button"
                      color="inherit"
                      className={classes.item}
                      onClick={() => window.location.assign("/user/edit")}
                      style={{ marginLeft: "10px" }}
                    >
                      Редактировать данные
                    </Link>
                    <Link 
                      onClick={props.onLogout}
                      component="button"
                      color="inherit"
                      className={classes.item}
                      style={{ marginLeft: "10px" }}
                    >
                      Выйти
                    </Link>
                  </div>
                )}
                {!isMobileLecturer && (
                  <div> 
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="menu"
                      onClick={handleClick}
                    >
                      <MenuIcon />
                    </IconButton>
                    <Menu
                      id="simple-menu"
                      anchorEl={anchorEl}
                      keepMounted
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                    >
                      <MenuItem onClick={() => window.location.assign("/invite_lecturer")}>
                        Пригласить преподавателя
                      </MenuItem>
                      <MenuItem onClick={() => window.location.assign("/create_course")}>
                        Создать курс
                      </MenuItem>
                      <MenuItem  onClick={() => window.location.assign("/profile")}>
                        Профиль
                      </MenuItem>
                      <MenuItem onClick={() => window.location.assign("/user/edit")}>
                        Редактировать данные
                      </MenuItem>
                      <MenuItem onClick={props.onLogout}>
                        Выйти
                      </MenuItem>
                    </Menu>
                  </div>
                )}
              </div>
            )}
          {props.loggedIn && !props.isLecturer && (
            <div className={classes.tools}>
              {isMobileStudent && (
                <div>
                  <Link
                    onClick={() => window.location.assign("/profile")}
                    component="button"
                    color="inherit"
                    className={classes.item}
                    style={{ marginLeft: "10px" }}
                  >
                    Профиль
                  </Link>
                  <Link
                    component="button"
                    color="inherit"
                    className={classes.item}
                    onClick={() => window.location.assign("/user/edit")}
                    style={{ marginLeft: "10px" }}
                  >
                    Редактировать данные
                  </Link>
                  <Link 
                    onClick={props.onLogout}
                    component="button"
                    color="inherit"
                    className={classes.item}
                    style={{ marginLeft: "10px" }}
                  >
                    Выйти
                  </Link>
                </div>
              )}
              { !isMobileStudent && (
                <div>
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={handleClick}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem  onClick={() => window.location.assign("/profile")}>
                      Профиль
                    </MenuItem>
                    <MenuItem onClick={() => window.location.assign("/user/edit")}>
                      Редактировать данные
                    </MenuItem>
                    <MenuItem onClick={props.onLogout}>
                      Выйти
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
          )}
          {!props.loggedIn && (
            <div className={classes.tools}>
              <Link
                onClick={() => window.location.assign("/login")}
                component="button"
                color="inherit"
                className={classes.item}
                style={{ marginLeft: "10px" }}
              >
                Вход
              </Link>
              <Link
                onClick={() => window.location.assign("/register")}
                component="button"
                color="inherit"
                className={classes.item}
                style={{ marginLeft: "10px" }}
              >
                Регистрация
              </Link>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}
