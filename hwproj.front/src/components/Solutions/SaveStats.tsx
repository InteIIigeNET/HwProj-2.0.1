import {FC, useState, useEffect} from "react";
import {Box} from "@mui/material";
import GetAppIcon from '@material-ui/icons/GetApp';
import SpeedDial from '@mui/material/SpeedDial';
import SaveIcon from '@mui/icons-material/Save';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import ExportToGoogle from "components/Solutions/ExportToGoogle";
import ExportToYandex from "components/Solutions/ExportToYandex";
import DownloadStats from "components/Solutions/DownloadStats";
import YandexLogo from './YandexLogo.svg';
import GoogleIcon from '@mui/icons-material/Google';

interface SaveStatsProps {
    courseId : number | undefined;
    userId : string;
    yandexCode: string | null;
    onActionOpening: () => void;
    onActionClosing: () => void;
}

enum SpeedDialView {
    Collapsed,
    Expanded,
    Download,
    ShareWithGoogle,
    ShareWithYandex,
}

interface SaveStatsState {
    selectedView : SpeedDialView;
}

const SaveStats: FC<SaveStatsProps> = (props : SaveStatsProps) => {
    const [state, setSelectedView] = useState<SaveStatsState>({
        selectedView: props.yandexCode === null ? SpeedDialView.Collapsed : SpeedDialView.ShareWithYandex,
    })

    const {selectedView} = state

    useEffect(() => {
        if (selectedView === SpeedDialView.Download ||
            selectedView === SpeedDialView.ShareWithGoogle ||
            selectedView === SpeedDialView.ShareWithYandex) {
            props.onActionOpening()
            return
        }
        props.onActionClosing()
    }, [selectedView]);

    const handleSpeedDialItemClick = (operation : string) => {
        switch ( operation ) {
            case 'download':
                setSelectedView({selectedView: SpeedDialView.Download});
                break;
            case 'shareWithGoogle':
                setSelectedView({selectedView: SpeedDialView.ShareWithGoogle});
                break;
            case 'shareWithYandex':
                setSelectedView({selectedView: SpeedDialView.ShareWithYandex});
                break;
            default:
                break;
        }
    }

    const handleCancellation = () => setSelectedView({selectedView: SpeedDialView.Collapsed});

    const handleChangingView = () =>
        setSelectedView({selectedView: selectedView === SpeedDialView.Collapsed ?
                SpeedDialView.Expanded : SpeedDialView.Collapsed
        })

    const actions = [
        { icon: <SaveIcon sx={{ fontSize: 30 }} />, name: 'Сохранить', operation: 'download' },
        { icon: <GoogleIcon sx={{ fontSize: 30 }} />, name: 'Отправить в Google', operation: 'shareWithGoogle' },
        // Icon by Icons8 ("https://icons8.com")
        { icon: <img src={YandexLogo} alt="Y"  width="40" height="30" />, name: 'Отправить в Яндекс', operation: 'shareWithYandex' },
    ];

    return (
        <div>
        {(selectedView === SpeedDialView.Collapsed || selectedView === SpeedDialView.Expanded) &&
            <Box sx={{ fontSize: 100 }}>
                <SpeedDial
                    ariaLabel="SpeedDial basic example"
                    icon={<GetAppIcon/>}
                    direction="right"
                    onClickCapture={handleChangingView}
                    sx={{ '& .MuiFab-primary': { width: 45, height: 45 } }}
                    open={selectedView !== SpeedDialView.Collapsed}
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
        {selectedView === SpeedDialView.Download &&
            <DownloadStats
                courseId={props.courseId}
                userId={props.userId}
                onCancellation={() => handleCancellation()}
            />
        }
        {selectedView === SpeedDialView.ShareWithGoogle &&
            <ExportToGoogle
                courseId={props.courseId}
                userId={props.userId}
                onCancellation={() => handleCancellation()}
            />
        }
        {selectedView === SpeedDialView.ShareWithYandex &&
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
