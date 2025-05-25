import { FC, useState, useEffect } from "react";
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from "@mui/material";
import { NestedMenuItem } from "mui-nested-menu";
import { Download, ShowChart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import DownloadStats from "../Solutions/DownloadStats";
import ExportToGoogle from "../Solutions/ExportToGoogle";
import ExportToYandex from "../Solutions/ExportToYandex";
import SaveIcon from '@mui/icons-material/Save';
import GoogleIcon from '@mui/icons-material/Google';
import YandexLogo from './YandexLogo.svg';

enum SaveStatsAction {
    Download,
    ShareWithGoogle,
    ShareWithYandex,
}

const actions = [SaveStatsAction.Download, SaveStatsAction.ShareWithGoogle, SaveStatsAction.ShareWithYandex]

interface StatsMenuProps {
    courseId: number | undefined;
    userId: string;
    yandexCode: string | null;
    onActionOpening: () => void;
    onActionClosing: () => void;
}

interface StatsMenuState {
    anchorEl: HTMLElement | null;
    saveStatsAction: SaveStatsAction | null;
}

const StatsMenu: FC<StatsMenuProps> = props => {
    const {courseId, userId, yandexCode, onActionOpening, onActionClosing} = props

    const [menuState, setMenuState] = useState<StatsMenuState>({
        anchorEl: null,
        saveStatsAction: yandexCode !== null ? SaveStatsAction.ShareWithYandex : null,
    })

    const {anchorEl, saveStatsAction} = menuState
    const showMenu = anchorEl !== null
    const openAction = saveStatsAction !== null

    useEffect(() => {
        if (saveStatsAction !== null)
            onActionOpening()
        else
            onActionClosing()
    }, [saveStatsAction]);

    const navigate = useNavigate();

    const goToCharts = () => navigate(`/statistics/${courseId}/charts`)

    const handleOpen = (event: React.MouseEvent<HTMLElement>) =>
        setMenuState ({
            anchorEl: event.currentTarget,
            saveStatsAction: null,
        })

    const handleClose = () =>
        setMenuState ({
            anchorEl: null,
            saveStatsAction: null,
        })

    const handleSelectAction = (action: SaveStatsAction | null) =>
        setMenuState({
            anchorEl: null,
            saveStatsAction: action,
        })

    const getActionIcon = (action: SaveStatsAction | null) => {
        switch (action) {
            case SaveStatsAction.Download:
                return <SaveIcon fontSize="small"/>
            case SaveStatsAction.ShareWithGoogle:
                return <GoogleIcon fontSize="small"/>
            case SaveStatsAction.ShareWithYandex:
                return <img src={YandexLogo} alt="Y" width="20" height="20"/>
            default:
                return null
        }
    }

    const getActionLabel = (action: SaveStatsAction | null) => {
        switch (action) {
            case SaveStatsAction.Download:
                return "На диск"
            case SaveStatsAction.ShareWithGoogle:
                return "В Google Docs"
            case SaveStatsAction.ShareWithYandex:
                return "На Яндекс Диск"
            default:
                return ""
        }
    }

    const getActionContent = (action: SaveStatsAction | null) => {
        switch (action) {
            case SaveStatsAction.Download:
                return <DownloadStats
                    courseId={courseId}
                    userId={userId}
                    onClose={handleClose}
                />
            case SaveStatsAction.ShareWithGoogle:
                return <ExportToGoogle
                    courseId={courseId}
                    open={openAction}
                    onClose={handleClose}
                />
            case SaveStatsAction.ShareWithYandex:
                return <ExportToYandex
                    courseId={courseId}
                    userId={userId}
                    userCode={yandexCode}
                    open={openAction}
                    onClose={handleClose}
                />
            default:
                return null
        }
    }

    return (
        <div style={{ paddingTop: 4 }}>
            <Button
                size="medium"
                color="primary"
                onClick={handleOpen}
            >
                Статистика
            </Button>
            <Menu
                id="long-menu"
                MenuListProps={{"aria-labelledby": "long-button"}}
                anchorEl={anchorEl}
                open={showMenu}
                onClose={handleClose}
            >
                <MenuItem onClick={goToCharts}>
                    <ListItemIcon>
                        <ShowChart fontSize="small"/>
                    </ListItemIcon>
                    <ListItemText>
                        Графики успеваемости
                    </ListItemText>
                </MenuItem>
                <NestedMenuItem
                    parentMenuOpen={showMenu}
                    style={{ paddingLeft: 16 }}
                    leftIcon={
                        <ListItemIcon style={{ alignItems: "center" }}>
                            <Download fontSize="small"/>
                        </ListItemIcon>
                    }
                    renderLabel={() =>
                        <ListItemText>
                            Выгрузить таблицу
                        </ListItemText>
                    }
                >
                    {actions.map(action =>
                        <MenuItem onClick={() => handleSelectAction(action)}>
                            <ListItemIcon>
                                {getActionIcon(action)}
                            </ListItemIcon>
                            <ListItemText>
                                {getActionLabel(action)}
                            </ListItemText>
                        </MenuItem>
                    )}
                </NestedMenuItem>
            </Menu>
            {getActionContent(saveStatsAction)}
        </div>
    )
}

export default StatsMenu;
