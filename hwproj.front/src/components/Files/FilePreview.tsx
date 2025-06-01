import React, {useEffect, useState} from 'react';
import {Box, Typography, IconButton} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import {IFileInfo} from './IFileInfo';
import LightTooltip from 'components/Common/LightTooltip';

interface FilePreviewProps {
    fileInfo: IFileInfo;
    onClick?: (f: IFileInfo) => void;
    onRemove?: (f: IFileInfo) => void;
}

const FilePreview: React.FC<FilePreviewProps> = (props) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Стили для иконки статуса
    const statusStyle = {
        fontSize: '0.6rem',
        lineHeight: 1.2,
        whiteSpace: 'nowrap'
    };

    useEffect(() => {
        if (props.fileInfo.file && props.fileInfo.type?.startsWith('image/')) {
            const url = URL.createObjectURL(props.fileInfo.file);
            setPreviewUrl(url);

            return () => URL.revokeObjectURL(url);
        }
    }, [props.fileInfo.file]);

    const getFileIcon = () => {
        const iconStyle = {fontSize: 28};
        if (props.fileInfo.type?.startsWith('image/')
            || props.fileInfo.name.endsWith('png') || props.fileInfo.name.endsWith('jpg')
            || props.fileInfo.name.endsWith('jpeg'))
            return <ImageIcon sx={iconStyle}/>;
        if (props.fileInfo.type === 'application/pdf' || props.fileInfo.name.endsWith('pdf'))
            return <PictureAsPdfIcon sx={iconStyle}/>;
        if (props.fileInfo.type?.startsWith('text/') || props.fileInfo.name.endsWith('txt')
            || props.fileInfo.name.endsWith('doc') || props.fileInfo.name.endsWith('docx'))
            return <DescriptionIcon sx={iconStyle}/>;
        return <InsertDriveFileIcon sx={iconStyle}/>;
    };

    const getFileSize = (sizeInBytes: number) => {
        const sizeInKB = sizeInBytes / 1024;
        const sizeInMB = sizeInKB / 1024;

        if (sizeInMB >= 1) {
            return `${sizeInMB.toFixed(1)} MB`;
        } else {
            return `${sizeInKB.toFixed(1)} KB`;
        }
    }
    
    const hasRemoveButton = !!props.onRemove;

    return (
        <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: hasRemoveButton ? 0.5 : 0.3,
            padding: hasRemoveButton ? '4px 8px' : '4px 4px',
            border: '1px solid #ddd',
            borderRadius: 1,
            width: 222.5,
            position: 'relative',
            backgroundColor: '#f5f5f5',
            fontSize: hasRemoveButton ? '0.8rem' : '0.75rem',
            transition: 'all 0.2s ease',
        }}>
            {/* Обертка для превью/иконки и статуса */}
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 0.5
            }}>
                {/*Превью изображения*/}
                {previewUrl ? (
                    <>
                        <img
                            src={previewUrl}
                            alt="Preview"
                            style={{
                                width: hasRemoveButton ? 32 : 28,
                                height: hasRemoveButton ? 32 : 28,
                                objectFit: 'cover',
                                borderRadius: 4,
                                flexShrink: 0
                            }}
                        />
                        <Typography sx={statusStyle}>
                            {props.fileInfo.status}
                        </Typography>
                    </>
                ) : (
                    <>
                        <Box
                            onClick={() => props.onClick?.(props.fileInfo)}
                            sx={{
                                width: hasRemoveButton ? 32 : 28,
                                height: hasRemoveButton ? 32 : 28,
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: props.onClick ? 'pointer' : 'default',
                            }}>
                            {getFileIcon()}
                        </Box>
                        <Typography sx={statusStyle}>
                            {props.fileInfo.status}
                        </Typography>
                    </>
                )}
            </Box>


            {/*Текстовая информация*/}
            <Box
                onClick={() => props.onClick?.(props.fileInfo)}
                sx={{
                    flex: '1 1 auto',
                    minWidth: 0,
                    maxWidth: 200,
                    paddingRight: hasRemoveButton ? 3 : 1,
                    marginRight: hasRemoveButton ? 0 : 0,
                    cursor: props.onClick ? 'pointer' : 'default',
                }}>
                <LightTooltip title={props.fileInfo.name}>
                    <Typography
                        variant="body2"
                        noWrap
                        sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block',
                            fontSize: hasRemoveButton ? '0.8rem' : '0.75rem'
                        }}
                    >
                        {props.fileInfo.name}
                    </Typography>
                </LightTooltip>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{fontSize: hasRemoveButton ? '0.7rem' : '0.65rem'}}
                >
                    {getFileSize(props.fileInfo.sizeInBytes)}
                </Typography>
            </Box>

            {hasRemoveButton && <IconButton
                size="small"
                onClick={() => props.onRemove!(props.fileInfo)}
                sx={{
                    position: 'absolute',
                    right: 4,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    padding: 0.5,
                    '& svg': {
                        fontSize: hasRemoveButton ? '1rem' : '0.8rem'
                    }
                }}
            >
                <CloseIcon/>
            </IconButton>}
        </Box>
    );
};

export default FilePreview