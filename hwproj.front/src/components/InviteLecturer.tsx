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
import {AccountDataDto, UserDataDto} from "../api";
import {Box} from "@material-ui/core";


interface InviteLecturer {
    isOpen: boolean;
    close: any;
}

const isCorrectEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
    return re.test(email);
}

interface InviteLecturerState {
    email: string;
    errors: string[];
    info: string[];
    data: AccountDataDto[];
}

const InviteLecturer: FC<InviteLecturer> = (props) => {

    const [lecturerState, setLecturerState] = useState<InviteLecturerState>({
        email: '',
        errors: [],
        info: [],
        data: [],
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isCorrectEmail(lecturerState.email)) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты.']
            }))
            return
        }
        try {
            const result = await ApiSingleton.accountApi
                .apiAccountInviteNewLecturerPost({email: lecturerState.email})
            if (result.succeeded) {
                const data = await ApiSingleton.accountApi.apiAccountGetAllStudentsGet();
                setLecturerState((prevState) => ({
                    ...prevState,
                    info: ['Запрос отправлен'],
                    data: data
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
        const data = await ApiSingleton.accountApi.apiAccountGetAllStudentsGet();
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
                    <DialogContentText>
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
                                        getOptionLabel={(option) => option.email!}
                                        options={lecturerState.data}
                                        renderOption={(props, option) => (
                                            <Grid
                                                direction="row"
                                                justifyContent="flex-start"
                                                alignItems="flex-end"
                                                container
                                            >
                                                <Grid item>
                                                    <Box component="li" {...props} fontWeight='fontWeightMedium'>
                                                        {props.email} /
                                                    </Box>
                                                </Grid>
                                                <Grid item>
                                                    <Typography
                                                        style={{marginLeft: '3px'}}
                                                    >
                                                        {props.name} {props.surname}
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

export default InviteLecturer