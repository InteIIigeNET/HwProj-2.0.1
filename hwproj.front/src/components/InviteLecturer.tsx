import React, {FC, FormEvent, useState} from 'react'
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
}

const InviteLecturer: FC<InviteLecturer> = (props) => {

    const [lecturerState, setLecturerState] = useState<InviteLecturerState>({
        email: '',
        errors: [],
        info: []
    })

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isCorrectEmail(lecturerState.email)){
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
            debugger
            setLecturerState((prevState) => ({
                ...prevState,
                errors: ['Сервис недоступен']
            }))
        }
    }

    const close = () => {
        setLecturerState({
            errors: [],
            email: '',
            info: []
        })
        props.close()
    }

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