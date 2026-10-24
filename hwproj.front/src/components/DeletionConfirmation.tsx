import React, {FC, useState} from 'react';
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import {DialogActions} from "@mui/material";
import Button from "@mui/material/Button";

interface DeletionConfirmationProps {
    onCancel: any,
    onSubmit: any,
    isOpen: boolean,
    dialogTitle: string,
    dialogContentText: string,
    confirmationWord: string,
    confirmationText: string,
}

const DeletionConfirmation: FC<DeletionConfirmationProps> = (props) => {

    const [currentWord, setCurrentWord] = useState<string>('')
    const [error, setError] = useState<string>('')

    const onDelete = () => {
        if (currentWord === props.confirmationWord) {
            props.onSubmit()
            return
        }
        setError("Неверное название")
    }

    const onCancel = () => {
        setError('')
        setCurrentWord('')
        props.onCancel()
    }

    return (
        <div>
            <Dialog
                fullWidth={true}
                maxWidth={'sm'}
                open={props.isOpen}
                onClose={props.onCancel}
                aria-labelledby="form-dialog-title"
            >
                <DialogTitle id="form-dialog-title">
                    {props.dialogTitle}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography color={"primary"}>
                            {props.dialogContentText}
                        </Typography>
                        {props.confirmationWord &&
                            <div>
                                <Typography>
                                    {props.confirmationText}
                                </Typography>
                                {error &&
                                    <p style={{color: "red", marginBottom: "0"}}>
                                        {error}
                                    </p>
                                }
                                <TextField
                                    fullWidth
                                    label="Название курса"
                                    margin="normal"
                                    name={currentWord}
                                    onChange={(e) => {
                                        e.persist()
                                        setCurrentWord(e.target.value)
                                    }}
                                />
                            </div>
                        }
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={onDelete}
                        color="secondary"
                        variant="text"
                        size="medium"
                    >
                        Удалить
                    </Button>
                    <Button
                        onClick={onCancel}
                        color="primary"
                        variant="text"
                        size="medium"
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeletionConfirmation;