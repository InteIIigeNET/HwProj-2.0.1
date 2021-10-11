import {Box, Button, DialogActions} from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import ApiSingleton from 'api/ApiSingleton'
import React, {FC, FormEvent, useEffect, useState} from 'react'
import {AccountDataDto} from "../../api";
import {Autocomplete} from "@material-ui/lab";

interface AddLecturerInCourseProps {
    onClose: any;
    isOpen: boolean;
    courseId: string;
    update: any;
}

interface AddLecturerInCourseState {
    email: string;
    errors: string[];
    info: string[];
    data: AccountDataDto[];
}

const AddLecturerInCourse: FC<AddLecturerInCourseProps> = (props) => {

    const [lecturerState, setLecturerState] = useState<AddLecturerInCourseState>({
        email: '',
        errors: [],
        info: [],
        data: [],
    })

    const isCorrectEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
        return re.test(email);
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isCorrectEmail(lecturerState.email)) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты']
            }))
            return
        }
        try {
            await ApiSingleton.coursesApi
                .apiCoursesAcceptLecturerByCourseIdByLecturerEmailGet(+props.courseId, lecturerState.email)
            const data = await ApiSingleton.coursesApi
                .apiCoursesGetLecturersAvailableForCourseByCourseIdGet(+props.courseId);
            setLecturerState((prevState) => ({
                ...prevState,
                info: ['Преподаватель добавлен'],
                data: data
            }))
            props.update()
        } catch (e) {
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const closeDialogIcon = () => {
        setLecturerState({
            info: [],
            errors: [],
            email: '',
            data: [],
        })
        props.onClose()
    }

    const setCurrentState = async () => {
        const data = await ApiSingleton.coursesApi
            .apiCoursesGetLecturersAvailableForCourseByCourseIdGet(+props.courseId);
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
            <Dialog
                onClose={closeDialogIcon}
                aria-labelledby="simple-dialog-title"
                open={props.isOpen}
            >
                <DialogTitle id="form-dialog-title">
                    Добавить преподавателя в курс
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <Typography>
                            Для добавления преподавателя в курс, введите его адрес элекстронной почты.
                            Пользователь должен быть зарегистрированным и иметь статус лектора.
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
                                        getOptionLabel={(option) => option.email! + ' (' + option.surname! + ' ' + option.name! + ' ' + option.middleName! + ')'}
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
                                            onClick={props.onClose}
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

export default AddLecturerInCourse