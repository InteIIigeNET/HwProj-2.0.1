import React, {useEffect, useState} from 'react';
import {Box, Typography, IconButton, LinearProgress, Stack} from '@mui/material';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {IFileInfo} from './IFileInfo';
import {FileStatus} from "./FileStatus";
import LightTooltip from '../Common/LightTooltip';

interface FilePreviewProps {
    fileInfo: IFileInfo;
    onClick?: (f: IFileInfo) => void;
    onRemove?: (f: IFileInfo) => void;
    showOkStatus?: boolean;
    // Плоский вид для списка внутри уже очерченного блока: без рамки и подложки,
    // строка подсвечивается только при наведении
    flat?: boolean;
}

type FileKind = "image" | "pdf" | "document" | "archive" | "code" | "other"

// Плитка типа файла: спокойные тона в духе редизайна курса, по одному оттенку на тип
const kindStyles: Record<FileKind, { bg: string, color: string }> = {
    image: {bg: "#e8f3ea", color: "#2e7d32"},
    pdf: {bg: "#fdecec", color: "#c62828"},
    document: {bg: "#eaf1fd", color: "#1565c0"},
    archive: {bg: "#fff4d6", color: "#9a5b00"},
    code: {bg: "#efeafc", color: "#5c35b8"},
    other: {bg: "#eef0f5", color: "#5f6673"},
}

const kindIcons: Record<FileKind, React.ReactElement> = {
    image: <ImageRoundedIcon sx={{fontSize: 22}}/>,
    pdf: <PictureAsPdfRoundedIcon sx={{fontSize: 22}}/>,
    document: <DescriptionRoundedIcon sx={{fontSize: 22}}/>,
    archive: <FolderZipRoundedIcon sx={{fontSize: 22}}/>,
    code: <CodeRoundedIcon sx={{fontSize: 22}}/>,
    other: <InsertDriveFileRoundedIcon sx={{fontSize: 22}}/>,
}

interface StatusInfo {
    text: string;
    tooltipText: string;
    icon: React.ReactElement | null;
    color: string;
    bg: string;
    // Пока файл едет на сервер, вместо статичной плашки показываем полосу прогресса
    inProgress: boolean;
    isError: boolean;
}

const cardSx = (isError: boolean, isClickable: boolean, isFlat: boolean) => ({
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: 1.25,
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    px: isFlat ? 1 : 1.25,
    py: 1,
    borderRadius: isFlat ? '10px' : '12px',
    border: '1px solid',
    borderColor: isFlat ? 'transparent' : (isError ? '#f0c7c7' : '#e0e3e7'),
    backgroundColor: isError ? '#fef7f7' : (isFlat ? 'transparent' : '#fff'),
    overflow: 'hidden',
    transition: 'border-color .15s, box-shadow .15s, background-color .15s',
    // В плоском виде рамка и тень не нужны: за границы отвечает блок-родитель,
    // а строка отзывается на наведение мягкой подложкой
    '&:hover': isFlat
        ? {backgroundColor: isError ? 'rgba(198, 40, 40, 0.07)' : 'rgba(63, 81, 181, 0.07)'}
        : {
            borderColor: isError ? '#e0a9a9' : (isClickable ? '#b7bfe8' : '#c4cad2'),
            boxShadow: '0 2px 8px rgba(31, 41, 55, 0.07)',
        },
    // Иконку скачивания показываем только при наведении, чтобы карточка оставалась спокойной
    '&:hover .file-preview-download': {opacity: 1},
})

const thumbSx = (kind: FileKind) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 38,
    height: 38,
    flexShrink: 0,
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: kindStyles[kind].bg,
    color: kindStyles[kind].color,
})

const nameSx = (isClickable: boolean) => ({
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.3,
    color: 'text.primary',
    transition: 'color .15s',
    ...(isClickable && {
        '&:hover': {color: '#3f51b5', textDecoration: 'underline'},
    }),
})

const statusPillSx = (status: StatusInfo) => ({
    flexShrink: 0,
    px: 0.75,
    py: 0.125,
    borderRadius: '999px',
    backgroundColor: status.bg,
    color: status.color,
})

const removeButtonSx = {
    flexShrink: 0,
    width: 26,
    height: 26,
    color: '#8a919e',
    transition: 'color .15s, background-color .15s',
    '&:hover': {color: '#c62828', backgroundColor: '#fdecec'},
}

const progressSx = {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 2,
    backgroundColor: 'transparent',
    '& .MuiLinearProgress-bar': {backgroundColor: '#3f51b5'},
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const hasRemoveButton = !!props.onRemove;
    const isClickable = !!props.onClick;

    useEffect(() => {
        if (props.fileInfo.file && props.fileInfo.type?.startsWith('image/')) {
            const url = URL.createObjectURL(props.fileInfo.file);
            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [props.fileInfo.file]);

    const getFileKind = (): FileKind => {
        const name = props.fileInfo.name.toLowerCase();
        const endsWithAny = (...extensions: string[]) => extensions.some(e => name.endsWith(e));

        if (props.fileInfo.type?.startsWith('image/') ||
            endsWithAny('png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp')) {
            return "image";
        }
        if (props.fileInfo.type === 'application/pdf' || endsWithAny('pdf')) {
            return "pdf";
        }
        if (props.fileInfo.type?.startsWith('text/') ||
            endsWithAny('txt', 'doc', 'docx', 'rtf', 'odt', 'md')) {
            return "document";
        }
        if (endsWithAny('zip', 'rar', '7z', 'tar', 'gz')) {
            return "archive";
        }
        if (endsWithAny('cs', 'java', 'py', 'js', 'ts', 'tsx', 'cpp', 'c', 'h', 'kt', 'go', 'rs', 'json', 'xml', 'ipynb')) {
            return "code";
        }
        return "other";
    };

    const getFileSize = (sizeInBytes: number) => {
        const sizeInKB = sizeInBytes / 1024;
        const sizeInMB = sizeInKB / 1024;

        if (sizeInMB >= 1) {
            return `${sizeInMB.toFixed(1)} MB`;
        }
        return `${sizeInKB.toFixed(1)} KB`;
    }

    const getStatusInfo = (status: FileStatus): StatusInfo => {
        const idle: StatusInfo = {
            text: "",
            tooltipText: "",
            icon: null,
            color: "text.secondary",
            bg: "transparent",
            inProgress: false,
            isError: false,
        };

        switch (status) {
            case FileStatus.Uploading:
                return {...idle, text: "Загружаем", color: "#3f51b5", bg: "#e4e7f6", inProgress: true};
            case FileStatus.Deleting:
                return {...idle, text: "Удаляем", color: "#3f51b5", bg: "#e4e7f6", inProgress: true};
            case FileStatus.UploadingError:
                return {
                    ...idle,
                    text: "Ошибка загрузки",
                    // tooltipText: "" "Нажмите, чтобы повторить загрузку",
                    icon: <ErrorRoundedIcon sx={{fontSize: '0.85rem'}}/>,
                    color: "#c62828",
                    bg: "#fbdede",
                    isError: true,
                };
            case FileStatus.DeletingError:
                return {
                    ...idle,
                    text: "Ошибка удаления",
                    // tooltipText: "Нажмите, чтобы повторить удаление",
                    icon: <ErrorRoundedIcon sx={{fontSize: '0.85rem'}}/>,
                    color: "#c62828",
                    bg: "#fbdede",
                    isError: true,
                };
            case FileStatus.ReadyToUse:
                return props.showOkStatus
                    ? {
                        ...idle,
                        tooltipText: "Файл загружен",
                        icon: <CheckCircleRoundedIcon sx={{fontSize: '1rem', color: '#2e7d32'}}/>,
                    }
                    : idle;
            default:
                return idle;
        }
    }

    const kind = getFileKind();
    const statusInfo = getStatusInfo(props.fileInfo.status);

    // У готового файла статус — только галочка, плашка вокруг неё выглядела бы шумно
    const status = statusInfo.text
        ? <Stack direction="row" alignItems="center" spacing={0.5} sx={statusPillSx(statusInfo)}>
            {statusInfo.icon}
            <Typography variant="caption" sx={{fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap'}}>
                {statusInfo.text}
            </Typography>
        </Stack>
        : statusInfo.icon && <Box sx={{display: 'flex', flexShrink: 0}}>{statusInfo.icon}</Box>

    return (
        <Box sx={cardSx(statusInfo.isError, isClickable, !!props.flat)}>
            {/* Обертка для превью/иконки */}
            <Box sx={thumbSx(kind)}>
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
                ) : kindIcons[kind]}
            </Box>

            {/* Текстовая информация */}
            <Box
                onClick={() => props.onClick?.(props.fileInfo)}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    cursor: isClickable ? 'pointer' : 'default',
                }}>
                <LightTooltip title={props.fileInfo.name} enterDelay={600} placement={"top"}>
                    <Typography variant="body2" noWrap sx={nameSx(isClickable)}>
                        {props.fileInfo.name}
                    </Typography>
                </LightTooltip>

                <Stack direction="row" alignItems="center" spacing={1} sx={{mt: 0.25, minWidth: 0}}>
                    <Typography
                        variant="caption"
                        sx={{fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', whiteSpace: 'nowrap'}}
                    >
                        {getFileSize(props.fileInfo.sizeInBytes)}
                    </Typography>

                    {status &&
                        <Box sx={{display: 'flex', marginLeft: 'auto'}}>
                            {statusInfo.tooltipText
                                ? <LightTooltip title={statusInfo.tooltipText}>{status}</LightTooltip>
                                : status}
                        </Box>}
                </Stack>
            </Box>

            {isClickable && !hasRemoveButton &&
                <DownloadRoundedIcon
                    className={"file-preview-download"}
                    sx={{
                        flexShrink: 0,
                        fontSize: 18,
                        color: '#8a919e',
                        opacity: 0,
                        transition: 'opacity .15s',
                        pointerEvents: 'none',
                    }}/>}

            {hasRemoveButton && (
                <LightTooltip title={"Убрать файл"}>
                    <IconButton
                        size="small"
                        onClick={() => props.onRemove!(props.fileInfo)}
                        sx={removeButtonSx}
                    >
                        <CloseRoundedIcon sx={{fontSize: 17}}/>
                    </IconButton>
                </LightTooltip>
            )}

            {statusInfo.inProgress && <LinearProgress sx={progressSx}/>}
        </Box>
    );
};

export default FilePreview;
