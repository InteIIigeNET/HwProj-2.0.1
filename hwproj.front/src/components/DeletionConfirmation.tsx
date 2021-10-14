import React, {FC, useState} from 'react';
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import {DialogActions} from "@material-ui/core";
import Button from "@material-ui/core/Button";

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
        if (currentWord === props.confirmationWord){
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
                        <Typography>
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
                        variant="contained"
                        size="small"
                    >
                        Удалить
                    </Button>
                    <Button
                        onClick={onCancel}
                        color="primary"
                        variant="contained"
                        size="large"
                    >
                        Закрыть
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default DeletionConfirmation;