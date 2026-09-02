import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom";
import {
    AppBar,
    Badge,
    Box,
    Button,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PersonAddAlt1OutlinedIcon from '@mui/icons-material/PersonAddAlt1Outlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import InviteLecturerModal from "./InviteLecturerModal";
import hwCat from "./hw-cat.png";

// Фирменное индиго; то же значение закреплено как palette.primary.main в src/index.tsx
const BRAND = "#3f51b5"

const appBarSx = {
    backgroundColor: BRAND,
    backgroundImage: "none",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.16)",
}

const toolbarSx = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 1,
    minHeight: {xs: 52, sm: 56},
}

const logoSx = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    flexShrink: 0,
    textDecoration: "none",
    borderRadius: "10px",
    transition: "opacity .15s",
    "&:hover": {opacity: 0.85, textDecoration: "none"},
}

const navButtonSx = {
    color: "white",
    flexShrink: 0,
    px: 1.5,
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.14)", color: "white"},
}

// Контекстное действие всегда ведёт на уровень выше («Курсы», «К курсу»), поэтому оформляем его
// как хлебную крошку: отделяем от логотипа чертой, даём форму пилюли и шеврон, который на hover
// уезжает влево — так видно, что это переход назад, а не обычная кнопка
const contextActionSx = {
    color: "white",
    flexShrink: 0,
    pl: 1,
    pr: 1.75,
    py: 0.375,
    borderRadius: "999px",
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    border: "1px solid rgba(255, 255, 255, 0.22)",
    transition: "background-color .15s, border-color .15s",
    "& .MuiButton-startIcon": {
        mr: 0.25,
        transition: "transform .15s",
    },
    "&:hover, &:focus": {
        color: "white",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        borderColor: "rgba(255, 255, 255, 0.42)",
    },
    "&:hover .MuiButton-startIcon": {
        transform: "translateX(-2px)",
    },
}

const iconButtonSx = {
    color: "white",
    flexShrink: 0,
    // Кнопка уведомлений — это ссылка, а Bootstrap перекрашивает a:hover в синий.
    // Поэтому цвет фиксируем и на hover/focus, меняется только подложка.
    "&:hover, &:focus": {
        color: "white",
        backgroundColor: "rgba(255, 255, 255, 0.14)",
    },
}

const registerButtonSx = {
    flexShrink: 0,
    px: 2,
    borderRadius: "10px",
    textTransform: "none",
    fontSize: "0.9375rem",
    fontWeight: 500,
    backgroundColor: "white",
    color: BRAND,
    boxShadow: "none",
    "&:hover": {backgroundColor: "rgba(255, 255, 255, 0.88)", color: BRAND, boxShadow: "none"},
}

const menuPaperSx = {
    mt: 1,
    minWidth: 232,
    borderRadius: "12px",
    border: "1px solid #e0e3e7",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
    "& .MuiList-root": {py: 0.5},
    "& .MuiMenuItem-root": {
        mx: 0.5,
        px: 1.25,
        py: 0.875,
        borderRadius: "8px",
        fontSize: "0.9375rem",
        color: "#212529",
        // Bootstrap перекрашивает и подчёркивает ссылки на hover — пункт меню не должен вести себя как текстовая ссылка
        textDecoration: "none",
        "&:hover, &:focus": {color: "#212529", textDecoration: "none"},
    },
    "& .MuiListItemIcon-root": {minWidth: 32, color: BRAND},
}

export type AppBarContextAction = { actionName: string, link: string } | null | "Default"

class AppBarStateManager {
    private _handler: ((state: AppBarContextAction) => void) | undefined = undefined

    public setOnContextActionChange(handler: (state: AppBarContextAction) => void) {
        this._handler = handler;
    }

    public setContextAction(action: AppBarContextAction) {
        this._handler!(action)
    }

    public reset() {
        this._handler!("Default")
    }
}

let appBarStateManager = new AppBarStateManager()
export {appBarStateManager}


interface AppBarProps {
    loggedIn: boolean;
    isLecturer: boolean;
    isExpert: boolean;
    newNotificationsCount: number;
    onLogout: () => void;
    contextAction: AppBarContextAction;
}

export const Header: React.FC<AppBarProps> = (props: AppBarProps) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [isOpenInviteLecturer, setIsOpenInviteLecturer] = useState<boolean>(false)
    const contextAction = props.contextAction === "Default" ? {
        actionName: "Курсы",
        link: "/courses"
    } : props.contextAction

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
    const location = useLocation()
    const showAuthButtons = location.pathname === "/welcome" && !props.loggedIn

    return (
        <AppBar position={"sticky"} sx={appBarSx}>
            <Box className={"container"} sx={toolbarSx}>
                <Box component={Link} to={"/"} aria-label={"HW — главная"} sx={logoSx}>
                    <img
                        src={hwCat}
                        alt={""}
                        draggable={false}
                        style={{
                            display: "block",
                            width: "50px",
                            height: "44px",
                            objectFit: "contain"
                        }}
                    />
                    <Typography
                        component={"span"}
                        style={{
                            color: "white",
                            fontFamily: "Helvetica, Arial, sans-serif",
                            fontSize: "22px",
                            fontWeight: 700,
                            lineHeight: 1,
                            letterSpacing: "0.5px",
                        }}
                    >
                        HW
                    </Typography>
                </Box>

                {props.loggedIn && contextAction && <>
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{my: 1.25, borderColor: "rgba(255, 255, 255, 0.26)"}}
                    />
                    <Button
                        component={Link}
                        to={contextAction.link}
                        startIcon={<ChevronLeftIcon/>}
                        sx={contextActionSx}
                    >
                        {contextAction.actionName}
                    </Button>
                </>}

                <Box sx={{flexGrow: 1}}/>

                {showAuthButtons &&
                    <Stack direction={"row"} alignItems={"center"} spacing={1}>
                        <Button component={Link} to={"/login"} sx={navButtonSx}>
                            Вход
                        </Button>
                        <Button component={Link} to={"/register"} variant={"contained"} sx={registerButtonSx}>
                            Регистрация
                        </Button>
                    </Stack>}

                {props.loggedIn && !isExpert &&
                    <Tooltip arrow title={props.newNotificationsCount > 0
                        ? `Уведомления: ${props.newNotificationsCount} новых`
                        : "Уведомления"}>
                        <IconButton component={Link} to={"/notifications"} size={"medium"}
                                    sx={{...iconButtonSx, mr: 0.5}}>
                            <Badge
                                overlap="rectangular"
                                color="error"
                                badgeContent={props.newNotificationsCount}
                                sx={{"& .MuiBadge-badge": {fontSize: "0.6875rem", fontWeight: 600}}}
                            >
                                <MailOutlineIcon fontSize={"small"}/>
                            </Badge>
                        </IconButton>
                    </Tooltip>}

                {props.loggedIn && <>
                    <Tooltip arrow title={"Меню"}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleClick}
                            sx={iconButtonSx}
                        >
                            <MenuIcon/>
                        </IconButton>
                    </Tooltip>
                    <Menu
                        id="simple-menu"
                        anchorEl={anchorEl}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                        transformOrigin={{vertical: "top", horizontal: "right"}}
                        PaperProps={{sx: menuPaperSx}}
                    >
                        <MenuItem component={Link} to={"/user/edit"} onClick={handleClose}>
                            <ListItemIcon><PersonOutlineIcon fontSize="small"/></ListItemIcon>
                            <ListItemText>Редактировать профиль</ListItemText>
                        </MenuItem>
                        {isLecturer && <MenuItem onClick={openInviteLecturer}>
                            <ListItemIcon><PersonAddAlt1OutlinedIcon fontSize="small"/></ListItemIcon>
                            <ListItemText>Пригласить преподавателя</ListItemText>
                        </MenuItem>}
                        {isLecturer && <MenuItem component={Link} to={"/experts"} onClick={handleClose}>
                            <ListItemIcon><WorkspacePremiumOutlinedIcon fontSize="small"/></ListItemIcon>
                            <ListItemText>К списку экспертов</ListItemText>
                        </MenuItem>}
                        {isLecturer && <MenuItem component={Link} to={"/create_course"} onClick={handleClose}>
                            <ListItemIcon><AddCircleOutlineIcon fontSize="small"/></ListItemIcon>
                            <ListItemText>Создать курс</ListItemText>
                        </MenuItem>}
                        <Divider sx={{my: 0.5}}/>
                        <MenuItem onClick={props.onLogout}>
                            <ListItemIcon><LogoutIcon fontSize="small"/></ListItemIcon>
                            <ListItemText>Выйти</ListItemText>
                        </MenuItem>
                    </Menu>
                </>}
            </Box>
            {isOpenInviteLecturer && (
                <InviteLecturerModal isOpen={isOpenInviteLecturer} close={closeInviteLecturer}/>
            )}
        </AppBar>)
}
