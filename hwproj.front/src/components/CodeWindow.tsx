import React, { useState } from 'react';
import { Box, Modal, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface ICodeWindowProps {
    open: boolean;
    code: string;
    language: string;
    onClose: () => void;
    title?: string
}

const CodeWindow: React.FC<ICodeWindowProps> = (props) => {
    const handleCopy = () => {
    navigator.clipboard.writeText(props.code);
    };

    return (
    <Modal open={props.open} onClose={props.onClose}>
        <Box
            sx={{
                overflow: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                minWidth: 600,
                maxWidth: 600,
                maxHeight: 800
            }}
            >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{props.title ? props.title : props.language}</Typography>
                <Box>
                <IconButton onClick={handleCopy}>
                    <ContentCopyIcon />
                </IconButton>
                <IconButton onClick={props.onClose} aria-label="Close">
                    <CloseIcon />
                </IconButton>
                </Box>
            </Box>
            <SyntaxHighlighter style={{overflow: 'auto'}} language={props.language}>
                {props.code}
            </SyntaxHighlighter>
        </Box>
    </Modal>
    );
    };

export default CodeWindow;