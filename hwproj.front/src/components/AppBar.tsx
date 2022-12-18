import React, {useState} from "react";
import {makeStyles} from '@material-ui/styles';
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Link from "@material-ui/core/Link";
import {Badge, Button, Grid, IconButton, MenuItem, Typography} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from '@material-ui/core/Menu';
import InviteLecturerModal from "./InviteLecturerModal";
import MailIcon from '@mui/icons-material/Mail';
import {useNavigate} from "react-router-dom";

const styles = makeStyles(theme => ({
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

interface AppBarProps {
    loggedIn: boolean;
    isLecturer: boolean;
    newNotificationsCount: number;
    onLogout: () => void;
}

export const Header: React.FC<AppBarProps> = (props: AppBarProps) => {
    const navigate = useNavigate()
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

    const [isOpenInviteLecturer, setIsOpenInviteLecturer] = useState<boolean>(false)

    const closeInviteLecturer = () => {
        setIsOpenInviteLecturer(false)
    }

    const openInviteLecturer = () => {
        handleClose()
        setIsOpenInviteLecturer(true)
    }

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }

    const handleClose = () => {
        setAnchorEl(null)
    }
    const classes = styles()

    return (
        <div>
            <AppBar style={{position: "static", width: "100vw", maxWidth: "100%"}}>
                <div className={"container"}>
                    <Toolbar>
                        <Grid container spacing={1} alignItems={"center"}>
                            <Grid item style={{marginRight: 1}}>
                                <Typography>
                                    <Link
                                        className={classes.logo}
                                        onClick={() => navigate("/")}
                                        component="button"
                                        variant="h6"
                                        color="inherit"
                                        style={{fontFamily: "Helvetica"}}
                                    >
                                        HW
                                    </Link>
                                </Typography>
                            </Grid>
                            {props.loggedIn &&
                                <Grid item>
                                    <IconButton onClick={() => navigate(`/notifications`)}>
                                        {props.newNotificationsCount > 0
                                            ? <Badge badgeContent={props.newNotificationsCount} color="primary">
                                                <MailIcon fontSize={"small"} htmlColor={"white"}/>
                                            </Badge>
                                            : <MailIcon fontSize={"small"} htmlColor={"white"}/>
                                        }
                                    </IconButton>
                                </Grid>
                            }
                            {props.loggedIn &&
                                <Grid item>
                                    <Typography>
                                        <Button
                                            onClick={() => navigate(`/courses`)}
                                            color="inherit"
                                            style={{fontFamily: "Helvetica"}}
                                        >
                                            Курсы
                                        </Button>
                                    </Typography>
                                </Grid>
                            }
                        </Grid>
                        {props.loggedIn && props.isLecturer &&
                            (
                                <div>
                                    <IconButton
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                        onClick={handleClick}
                                    >
                                        <MenuIcon/>
                                    </IconButton>
                                    <Menu
                                        id="simple-menu"
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                    >
                                        <MenuItem onClick={openInviteLecturer}>
                                            Пригласить преподавателя
                                        </MenuItem>
                                        <MenuItem onClick={() => navigate("/create_course")}>
                                            Создать курс
                                        </MenuItem>
                                        <MenuItem onClick={props.onLogout}>
                                            Выйти
                                        </MenuItem>
                                    </Menu>
                                </div>
                            )}
                        {props.loggedIn && !props.isLecturer && (
                            <div>
                                <IconButton
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleClick}
                                >
                                    <MenuIcon/>
                                </IconButton>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem onClick={props.onLogout}>
                                        Выйти
                                    </MenuItem>
                                </Menu>
                            </div>
                        )}
                        {!props.loggedIn && (
                            <div className={classes.tools}>
                                <Link
                                    onClick={() => navigate("/login")}
                                    component="button"
                                    color="inherit"
                                    className={classes.item}
                                    style={{marginLeft: "10px"}}
                                >
                                    Вход
                                </Link>
                                <Link
                                    onClick={() => navigate("/register")}
                                    component="button"
                                    color="inherit"
                                    className={classes.item}
                                    style={{marginLeft: "10px"}}
                                >
                                    Регистрация
                                </Link>
                            </div>
                        )}
                    </Toolbar>
                </div>
            </AppBar>
            {isOpenInviteLecturer && (
                <InviteLecturerModal isOpen={isOpenInviteLecturer} close={closeInviteLecturer}/>
            )}
        </div>
    );
}
