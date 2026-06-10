import {FC, useEffect, useState} from "react";
import {DialogActions, Grid, TextField, Button, DialogTitle, Typography, Dialog, DialogContent} from "@mui/material";

interface IRejectRegistrationRequestModalProps {
    isOpen: boolean;
    applicantName?: string;
    isSubmitting?: boolean;
    error?: string[];
    onClose: () => void;
    onReject: (rejectReason?: string) => void;
}

const RejectRegistrationRequestModal: FC<IRejectRegistrationRequestModalProps> = (props) => {
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        if (!props.isOpen) {
            setRejectReason("");
        }
    }, [props.isOpen]);

    const handleClose = () => {
        setRejectReason("");
        props.onClose();
    }

    const handleReject = () => {
        props.onReject(rejectReason.trim() || undefined);
    }

    return (
        <Dialog
            open={props.isOpen}
            onClose={(_, reason) => {
                if (props.isSubmitting || reason === "backdropClick") {
                    return;
                }
                handleClose();
            }}
            aria-labelledby="reject-registration-request-dialog-title"
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle id="reject-registration-request-dialog-title">
                Отклонить заявку
            </DialogTitle>
            <DialogContent>
                <Grid container direction="column" spacing={2}>
                    {props.applicantName && (
                        <Grid item>
                            <Typography>
                                Заявка: {props.applicantName}
                            </Typography>
                        </Grid>
                    )}

                    {props.error && props.error.length > 0 && (
                        <Grid item>
                            <Typography color="error">
                                {props.error.join(", ")}
                            </Typography>
                        </Grid>
                    )}

                    <Grid item>
                        <TextField
                            fullWidth
                            multiline
                            minRows={4}
                            label="Причина отклонения"
                            variant="outlined"
                            value={rejectReason}
                            onChange={(e) => {
                                setRejectReason(e.target.value);
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleReject}
                    color="error"
                    size="small"
                    disabled={props.isSubmitting}>
                    Отклонить
                </Button>
                <Button
                    onClick={handleClose}
                    color="primary"
                    variant="text"
                    size="medium"
                    disabled={props.isSubmitting}>
                    Отмена
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default RejectRegistrationRequestModal