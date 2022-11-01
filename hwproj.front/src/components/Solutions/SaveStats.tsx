import React, {FC, useState} from "react";
import {Alert, Box, Button, CircularProgress, Grid, MenuItem, Select, TextField} from "@mui/material";
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import GetAppIcon from '@material-ui/icons/GetApp';
import SpeedDial from '@mui/material/SpeedDial';
import SaveIcon from '@mui/icons-material/Save';
import ShareIcon from '@mui/icons-material/Share';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import {ResultString} from "../../api";
import apiSingleton from "../../api/ApiSingleton";
import {green} from "@mui/material/colors";
import ExportToGoogle from "components/Solutions/ExportToGoogle";
import ExportToYandex from "components/Solutions/ExportToYandex";
import DownloadStats from "components/Solutions/DownloadStats";
import YandexLogo from './YandexLogo.svg';
import GoogleIcon from '@mui/icons-material/Google';

interface SaveStatsProps {
    courseId : number | undefined;
    userId : string;
    yandexCode: string | null;
}

enum SpeedDialActions {
    None,
    Download,
    ShareWithGoogle,
    ShareWithYandex
}

enum SpeedDialView {
    Opened,
    Expanded
}

interface SaveStatsState {
    selectedAction: SpeedDialActions;
    speedDialView : SpeedDialView;
}

const SaveStats: FC<SaveStatsProps> = (props : SaveStatsProps) => {
    const [state, setState] = useState<SaveStatsState>({
        selectedAction: props.yandexCode === null ? SpeedDialActions.None : SpeedDialActions.ShareWithYandex,
        speedDialView: SpeedDialView.Opened
    })

    const {selectedAction, speedDialView} = state

    const handleCancellation = () => {
        setState(prevState => ({...prevState, speedDialView: SpeedDialView.Opened, selectedAction: SpeedDialActions.None}));
    }

    const handleSpeedDialItemClick = (operation : string) => {
        switch ( operation ) {
            case 'download':
                setState(prevState =>
                    ({...prevState, selectedAction: SpeedDialActions.Download}));
                break;
            case 'shareWithGoogle':
                setState(prevState =>
                    ({...prevState, selectedAction: SpeedDialActions.ShareWithGoogle}));
                break;
            case 'shareWithYandex':
                setState(prevState =>
                    ({...prevState, selectedAction: SpeedDialActions.ShareWithYandex}));
                break;
            default:
                break;
        }
    }

    const handleChangeSpeedDialView = () =>
        setState(prevState => ({
        ...prevState,
        speedDialView: speedDialView === SpeedDialView.Opened ? SpeedDialView.Expanded : SpeedDialView.Opened
        }))

    const actions = [
        { icon: <SaveIcon sx={{ fontSize: 30 }} />, name: 'Сохранить', operation: 'download' },
        { icon: <GoogleIcon sx={{ fontSize: 30 }} />, name: 'Отправить в Google', operation: 'shareWithGoogle' },
        // Icon by Icons8 ("https://icons8.com")
        { icon: <img src={YandexLogo} alt="Y"  width="40" height="30" />, name: 'Отправить в Яндекс', operation: 'shareWithYandex' },
    ];

    return (
        <div>
        {selectedAction === SpeedDialActions.None &&
            <Box sx={{ fontSize: 100 }}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    icon={<GetAppIcon/>}
                    direction="right"
                    onClick={handleChangeSpeedDialView}
                    sx={{ '& .MuiFab-primary': { width: 45, height: 45 } }}
                    open={speedDialView === SpeedDialView.Expanded}
                >
                    {actions.map((action) => (
                        <SpeedDialAction
                            key={action.name}
                            icon={action.icon}
                            tooltipTitle={action.name}
                            onClick={() => {
                                handleSpeedDialItemClick(action.operation)
                            }}
                        />
                    ))}
                </SpeedDial>
            </Box>
        }
        {selectedAction === SpeedDialActions.Download &&
            <DownloadStats
                courseId={props.courseId}
                userId={props.userId}
                onCancellation={() => handleCancellation()}
            />
        }
        {selectedAction === SpeedDialActions.ShareWithGoogle &&
            <ExportToGoogle
                courseId={props.courseId}
                userId={props.userId}
                onCancellation={() => handleCancellation()}
            />
        }
        {selectedAction === SpeedDialActions.ShareWithYandex &&
            <ExportToYandex
                courseId={props.courseId}
                userId={props.userId}
                onCancellation={() => handleCancellation()}
                userCode={props.yandexCode}
            />
        }
        </div>
    )
}
export default SaveStats;
