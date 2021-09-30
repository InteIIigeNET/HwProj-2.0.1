import { Button, DialogActions } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import ApiSingleton from 'api/ApiSingleton'
import React, {FC, FormEvent, useState} from 'react'

interface AddLecturerInCourseProps {
    onClose: any;
    isOpen: boolean;
    courseId: string;
}

interface AddLecturerInCourseState {
    email: string;
    errors: string[];
    info: string[];
}

const AddLecturerInCourse: FC<AddLecturerInCourseProps> = (props) => {

    const [lecturerState, setLecturerState] = useState<AddLecturerInCourseState>({
        email: '',
        errors: [],
        info: []
    })

    const isCorrectEmail = (email: string) => {
        const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,5}))$/;
        return re.test(email);
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isCorrectEmail(lecturerState.email)){
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Некорректный адрес электронной почты']
            }))
            return
        }
        try {
            await ApiSingleton.coursesApi
                .apiCoursesAcceptLecturerByCourseIdByLecturerEmailGet(+props.courseId, lecturerState.email)
            setLecturerState((prevState) => ({
                ...prevState,
                info: ['Преподаватель добавлен']
            }))
        }
        catch (e) {
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
        })
        props.onClose()
    }

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
                                    <TextField
                                        type="email"
                                        fullWidth
                                        label="Электронная почта"
                                        margin="normal"
                                        name={lecturerState.email}
                                        onChange={(e) => {
                                            e.persist()
                                            setLecturerState((prevState) => ({
                                                ...prevState,
                                                email: e.target.value
                                            }))
                                        }}
                                    />
                                </Grid>
                                <Grid item>
                                    <Button
                                        onClick={closeDialogIcon}
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
                                        Добавить
                                    </Button>
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