import React, {useState} from 'react';
import {Box, Modal, Typography, IconButton, TextField} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {prism} from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ITextWindowProps {
    open: boolean;
    text: string;
    isEditable: boolean;
    onClose: () => void;
    language?: string;
    title?: string;
}

interface ITextWindowState {
    text: string;
}

const TextWindow: React.FC<ITextWindowProps> = (props) => {
    const [state, setTextWindowState] = useState<ITextWindowState>({
        text: props.text,
    });

    const handleCopy = () => {
        navigator.clipboard.writeText(state.text);
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
                    maxWidth: 650,
                    minHeight: 400,
                    maxHeight: 600
                }}
            >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">{props.title ? props.title : props.language}</Typography>
                    <Box>
                        <IconButton onClick={handleCopy}>
                            <ContentCopyIcon/>
                        </IconButton>
                        <IconButton onClick={props.onClose}>
                            <CloseIcon/>
                        </IconButton>
                    </Box>
                </Box>
                <Box flexGrow={1} mb={2}>
                    {props.isEditable
                        ? <TextField
                            fullWidth
                            variant="filled"
                            multiline
                            value={state.text}
                            onChange={(e) => setTextWindowState({...state, text: e.target.value})}
                            minRows={10}
                            maxRows={15}
                        />
                        : <SyntaxHighlighter style={prism} language={props.language}>
                            {state.text}
                        </SyntaxHighlighter>}
                </Box>
            </Box>
        </Modal>
    );
};

export default TextWindow;