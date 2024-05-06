import React, {FC, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ApiSingleton from "../api/ApiSingleton";
import Typography from "@material-ui/core/Typography";
import Grid from '@material-ui/core/Grid';
import {IconButton} from "@material-ui/core";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface IInviteExpertProps {
    isOpen: boolean;
    close: any;
    expertEmail: string;
}

const handleCopyClick = (textToCopy : string) => {
    navigator.clipboard.writeText(textToCopy);
}

const InviteExpertModal: FC<IInviteExpertProps> = (props) => {

    const [invitationLink, setInvitationLink] = useState<string>("");
    
    const setCurrentState = async () => {

        const expertToken = await ApiSingleton.accountApi.apiAccountGetExpertTokenGet(props.expertEmail);
        const invitationLink = ApiSingleton.authService.buildInvitationLink(expertToken!.value!.accessToken!);

        setInvitationLink(invitationLink);
    }

    useEffect(() => {
        setCurrentState()
    }, [])
    
    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.close} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">
                    Пригласить эксперта
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography>
                            Для приглашения эксперта поделитесь с ним ссылкой:
                        </Typography>
                        <Grid container>
                            <Grid item xs={12} sm={10}>
                                <TextField
                                    id="outlined-read-only-input"
                                    label=""
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                    variant="standard"
                                    fullWidth
                                    value={invitationLink}
                                />
                            </Grid>
                            <Grid item sm={2}>
                                <IconButton onClick={() => handleCopyClick(invitationLink)} color="primary">
                                    <ContentCopyIcon />
                                </IconButton>
                            </Grid>
                            <Grid
                                direction="row"
                                justifyContent="flex-end"
                                alignItems="flex-end"
                                container
                                style={{marginTop: '16px'}}
                            >
                                <Grid item>
                                    <Button
                                        onClick={props.close}
                                        color="primary"
                                        variant="contained"
                                    >
                                        Закрыть
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default InviteExpertModal;
