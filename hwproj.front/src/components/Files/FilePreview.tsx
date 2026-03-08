import React, {useEffect, useState} from 'react';
import {Box, Typography, IconButton, useTheme, CircularProgress} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import {IFileInfo} from './IFileInfo';
import {FileStatus} from "./FileStatus";
import LightTooltip from '../Common/LightTooltip';

interface FilePreviewProps {
    fileInfo: IFileInfo;
    onClick?: (f: IFileInfo) => void;
    onRemove?: (f: IFileInfo) => void;
    showOkStatus?: boolean;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
    const theme = useTheme();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const hasRemoveButton = !!props.onRemove;

    useEffect(() => {
        if (props.fileInfo.file && props.fileInfo.type?.startsWith('image/')) {
            const url = URL.createObjectURL(props.fileInfo.file);
            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [props.fileInfo.file]);

    const getFileIcon = () => {
        const iconStyle = {fontSize: 24};
        if (props.fileInfo.type?.startsWith('image/') ||
            props.fileInfo.name.endsWith('png') ||
            props.fileInfo.name.endsWith('jpg') ||
            props.fileInfo.name.endsWith('jpeg')) {
            return <ImageIcon sx={iconStyle}/>;
        }
        if (props.fileInfo.type === 'application/pdf' ||
            props.fileInfo.name.endsWith('pdf')) {
            return <PictureAsPdfIcon sx={iconStyle}/>;
        }
        if (props.fileInfo.type?.startsWith('text/') ||
            props.fileInfo.name.endsWith('txt') ||
            props.fileInfo.name.endsWith('doc') ||
            props.fileInfo.name.endsWith('docx')) {
            return <DescriptionIcon sx={iconStyle}/>;
        }
        return <InsertDriveFileIcon sx={iconStyle}/>;
    };

    const getFileSize = (sizeInBytes: number) => {
        const sizeInKB = sizeInBytes / 1024;
        const sizeInMB = sizeInKB / 1024;

        if (sizeInMB >= 1) {
            return `${sizeInMB.toFixed(1)} MB`;
        }
        return `${sizeInKB.toFixed(1)} KB`;
    }

    const getStatusInfo = (status: FileStatus) => {
        switch (status) {
            case FileStatus.Uploading:
                return {
                    text: "Загружаем",
                    tooltipText: "",
                    icon: <CircularProgress size={14} thickness={5} sx={{color: theme.palette.info.main}}/>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.info.main
                    }
                };
            case FileStatus.Deleting:
                return {
                    text: "Удаляем",
                    tooltipText: "",
                    icon: <CircularProgress size={14} thickness={5} sx={{color: theme.palette.info.main}}/>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.info.main
                    }
                };
            case FileStatus.UploadingError:
                return {
                    text: "Ошибка загрузки",
                    // tooltipText: "" "Нажмите, чтобы повторить загрузку",
                    icon: <ErrorIcon sx={{fontSize: '0.85rem', color: theme.palette.error.dark}}/>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.error.dark
                    }
                };
            case FileStatus.DeletingError:
                return {
                    text: "Ошибка удаления",
                    // tooltipText: "Нажмите, чтобы повторить удаление",
                    icon: <ErrorIcon sx={{fontSize: '0.85rem', color: theme.palette.error.dark}}/>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.error.dark
                    }
                };
            case FileStatus.ReadyToUse:
                return {
                    tooltipText: "",
                    icon: props.showOkStatus ?
                        <CheckCircleIcon sx={{fontSize: '0.85rem', color: theme.palette.success.dark}}/> : <></>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.success.dark
                    }
                };
            default:
                return {
                    text: "",
                    tooltipText: "",
                    icon: <></>,
                    color: {
                        bg: theme.palette.grey[200],
                        text: theme.palette.text.secondary
                    }
                };
        }
    }

    const statusInfo = getStatusInfo(props.fileInfo.status);

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '8px 12px',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            backgroundColor: statusInfo.color.bg,
            maxWidth: hasRemoveButton ? 310 : 270,
            minWidth: 200,
            width: '100%',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
            position: 'relative', // Для позиционирования статуса
            '&:hover': {
                boxShadow: theme.shadows[1]
            }
        }}>
            {/* Обертка для превью/иконки */}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                flexShrink: 0,
                borderRadius: 0.5,
                backgroundColor: 'rgba(255,255,255,0.4)',

                overflow: 'hidden'
            }}>
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.text.secondary
                    }}>
                        {getFileIcon()}
                    </Box>
                )}
            </Box>

            {/* Текстовая информация */}
            <Box
                onClick={() => props.onClick?.(props.fileInfo)}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    cursor: props.onClick ? 'pointer' : 'default',
                }}>
                <Typography
                    variant="body2"
                    noWrap
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        color: theme.palette.text.primary
                    }}
                >
                    {props.fileInfo.name}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5
                }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            color: theme.palette.text.secondary
                        }}
                    >
                        {getFileSize(props.fileInfo.sizeInBytes)}
                    </Typography>

                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        marginLeft: 'auto', // Прижимаем к правому краю
                        paddingLeft: 1, // Отступ от текста
                        backgroundColor: statusInfo.color.bg,
                        zIndex: 1
                    }}>
                        {statusInfo.icon}
                        <LightTooltip title={statusInfo.tooltipText}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    color: statusInfo.color.text
                                }}
                            >
                                {statusInfo.text}
                            </Typography>
                        </LightTooltip>
                    </Box>
                </Box>
            </Box>

            {hasRemoveButton && (
                <IconButton
                    size="small"
                    onClick={() => props.onRemove!(props.fileInfo)}
                    sx={{
                        flexShrink: 0,
                        color: theme.palette.text.secondary
                    }}
                >
                    <CloseIcon fontSize="small"/>
                </IconButton>
            )}
        </Box>
    );
};

export default FilePreview;