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
import ValidationUtils from "./Utils/ValidationUtils";


interface InviteLecturer {
    isOpen: boolean;
    close: any;
}

interface InviteLecturerState {
    email: string;
    errors: string[];
    info: string[];
    data: AccountDataDto[];
}

const InviteLecturerModal: FC<InviteLecturer> = (props) => {

    const [lecturerState, setLecturerState] = useState<InviteLecturerState>({
        email: '',
        errors: [],
        info: [],
        data: [],
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!ValidationUtils.isCorrectEmail(lecturerState.email)) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты.']
            }))
            return
        }
        try {
            const result = await ApiSingleton.accountApi.accountInviteNewLecturer({email: lecturerState.email})
            if (result.succeeded) {
                setLecturerState((prevState) => ({
                    ...prevState,
                    info: ['Запрос отправлен']
                }))
                return
            }
            setLecturerState((prevState) => ({
                ...prevState,
                errors: result.errors!
            }))
        } catch (e) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const close = () => {
        setLecturerState((prevState) => ({
            ...prevState,
            email: '',
            errors: [],
            info: [],
            data: [],
        }))
        props.close()
    }

    const setCurrentState = async () => {
        const data = await ApiSingleton.accountApi.accountGetAllStudents();
        setLecturerState({
            errors: [],
            email: '',
            info: [],
            data: data
        })
    }

    useEffect(() => {
        setCurrentState()
    }, [])

    return (
        <div>
            <Dialog open={props.isOpen} onClose={close} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    Пригласить преподавателя
                </DialogTitle>
                <DialogContent>
                    <DialogContentText component="div">
                        <Typography>
                            Для получения пользователем статуса преподавателя, введите его адрес электронной почты.
                        </Typography>
                        <div style={{textAlign: 'center', marginBottom: "0"}}>
                            {lecturerState.info && (
                                <p style={{color: "green", marginBottom: "0"}}>
                                    {lecturerState.info}
                                </p>
                            )}
                            {lecturerState.errors && (
                                <p style={{color: "red", marginBottom: "0"}}>
                                    {lecturerState.errors}
                                </p>
                            )}
                        </div>
                        <form onSubmit={(e) => handleSubmit(e)}>
                            <Grid container justifyContent="flex-end">
                                <Grid item xs={12}>
                                    <Autocomplete
                                        onChange={(e, values) => {
                                            e.persist()
                                            setLecturerState((prevState) => ({
                                                ...prevState,
                                                email: (values as AccountDataDto).email!
                                            }))
                                        }}
                                        freeSolo
                                        disableClearable
                                        getOptionLabel={(option) => option.email! + ' / ' + option.surname! + ' ' + option.name!}
                                        options={lecturerState.data}
                                        renderOption={(option) => (
                                            <Grid
                                                direction="row"
                                                justifyContent="flex-start"
                                                alignItems="flex-end"
                                                container
                                            >
                                                <Grid item>
                                                    <Box fontWeight='fontWeightMedium'>
                                                        {option.email} /
                                                    </Box>
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        style={{marginLeft: '3px'}}
                                                    >
                                                        {option.name} {option.surname}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        )}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Введите email или ФИО"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    type: 'search',
                                                }}
                                            />
                                        )}
                                    />
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
                                            onClick={close}
                                            color="primary"
                                            variant="contained"
                                            style={{marginRight: '10px'}}
                                        >
                                            Закрыть
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                        >
                                            Пригласить
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default InviteLecturerModal
