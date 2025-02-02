import React, {useState} from "react";
import {makeStyles} from '@material-ui/core/styles';
import AppBar from "@material-ui/core/AppBar";
import {Link} from "react-router-dom";
import {Badge, Grid, IconButton, MenuItem, Typography} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from '@material-ui/core/Menu';
import InviteLecturerModal from "./InviteLecturerModal";
import MailIcon from '@mui/icons-material/Mail';
import {Button} from "@mui/material";

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
    isExpert: boolean;
    newNotificationsCount: number;
    onLogout: () => void;
}

export const Header: React.FC<AppBarProps> = (props: AppBarProps) => {
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
    
    const isLecturer = props.isLecturer
    const isExpert = props.isExpert

    return (
        <div>
            <AppBar style={{position: "static", width: "100vw", maxWidth: "100%", alignItems: "center",
                minHeight: "5vh", justifyContent: "center"}}>
                <div className={"container"} style={{display: "flex", alignItems: "center"}}>
                    <Grid container spacing={1} alignItems={"center"}>
                        <Grid item>
                            <Link to={"/"}>
                                <Typography variant="h6" style={{color: 'white', fontFamily: "Helvetica"}}>
                                    HW
                                </Typography>
                            </Link>
                        </Grid>
                        {props.loggedIn && !isExpert &&
                            <Grid item>
                                <Link to={"/notifications"}>
                                    <IconButton>
                                        {props.newNotificationsCount > 0
                                            ? <Badge badgeContent={props.newNotificationsCount} color="primary">
                                                <MailIcon fontSize={"small"} htmlColor={"white"}/>
                                            </Badge>
                                            : <MailIcon fontSize={"small"} htmlColor={"white"}/>
                                        }
                                    </IconButton>
                                </Link>
                            </Grid>
                        }
                        {props.loggedIn &&
                            <Grid item>
                                <Link
                                    style={{color: 'white', fontFamily: "Helvetica", textDecoration: "none"}}
                                    to={("/courses")}>
                                    <Button>
                                        <Typography style={{color: 'white', fontFamily: "Helvetica"}}>
                                            Курсы
                                        </Typography>
                                    </Button>
                                </Link>
                            </Grid>
                        }
                    </Grid>
                    {props.loggedIn && isLecturer && <div>
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
                            <Link
                                style={{textDecoration: "none", color: "black"}}
                                to={"/user/edit"}>
                                <MenuItem>
                                    Редактировать профиль
                                </MenuItem>
                            </Link>
                            <MenuItem onClick={openInviteLecturer}>
                                Пригласить преподавателя
                            </MenuItem>
                            <Link
                                color={"initial"}
                                style={{textDecoration: "none", color: "black"}}
                                to={"/experts"}>
                                <MenuItem>
                                    К списку экспертов
                                </MenuItem>
                            </Link>
                            <Link
                                color={"initial"}
                                style={{textDecoration: "none"}}
                                to={"/create_course"}>
                                <MenuItem>
                                    Создать курс
                                </MenuItem>
                            </Link>
                            <MenuItem onClick={props.onLogout}>
                                Выйти
                            </MenuItem>
                        </Menu>
                    </div>}
                    {props.loggedIn && !isLecturer && <div>
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
                            <Link
                                style={{textDecoration: "none", color: "black"}}
                                to={"/user/edit"}>
                                <MenuItem>
                                    Редактировать профиль
                                </MenuItem>
                            </Link>
                            <MenuItem onClick={props.onLogout}>
                                Выйти
                            </MenuItem>
                        </Menu>
                    </div>}
                </div>
            </AppBar>
            {isOpenInviteLecturer && (
                <InviteLecturerModal isOpen={isOpenInviteLecturer} close={closeInviteLecturer}/>
            )}
        </div>
    );
}
