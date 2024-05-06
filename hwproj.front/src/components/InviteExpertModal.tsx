import React, {FC, FormEvent, useEffect, useState} from 'react'
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
import {Autocomplete} from "@material-ui/lab";
import {AccountDataDto} from "../api";
import {Box} from "@material-ui/core";

interface IInviteExpertProps {
    isOpen: boolean;
    close: any;
    expertEmail: string;
}

const InviteExpertModal: FC<IInviteExpertProps> = (props) => {
    return (
        <div>
            <Dialog open={props.isOpen} onClose={props.close} aria-labelledby="dialog-title">
                <DialogTitle id="dialog-title">
                    Пригласить эксперта
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography>
                            Для приглашения эксперта отправьте ему ссылку.
                        </Typography>
                        <Grid container justifyContent="flex-end">
                            <Grid item xs={12}>
                                {/*                    <div style={{marginTop: '3px'}}>*/}
                                {/*                        /!*<DefaultCopyField*!/*/}
                                {/*                        /!*    label="Ссылка"*!/*/}
                                {/*                        /!*    value={ApiSingleton.authService.buildInvitationLink(commonState.expertToken!)}*!/*/}
                                {/*                        /!*    fullWidth*!/*/}
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
