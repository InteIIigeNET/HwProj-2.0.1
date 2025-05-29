import * as React from "react";
import {FC, useEffect, useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Grid,
    Typography,
    TextField,
    Button,
    Avatar
} from "@mui/material";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApiSingleton from "../../api/ApiSingleton";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {useSnackbar} from 'notistack';
import {makeStyles} from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    button: {
        marginTop: theme.spacing(1)
    },
}))

interface RegisterStudentDialogProps {
    courseId: number;
    open: boolean;
    onClose: () => void;
    onStudentRegistered: () => Promise<void>;
    initialEmail?: string;
}

const RegisterStudentDialog: FC<RegisterStudentDialogProps> = ({courseId, open, onClose, onStudentRegistered, initialEmail}) => {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [email, setEmail] = useState(initialEmail || "");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [errors, setErrors] = useState<string[]>([]);
    const [isRegistering, setIsRegistering] = useState(false);

    useEffect(() => {
        if (initialEmail) {
            setEmail(initialEmail);
        }
    }, [initialEmail]);

    const registerStudent = async () => {
        setIsRegistering(true);
        setErrors([]);
        try {
            await ApiSingleton.coursesApi.coursesInviteStudent({
                courseId: courseId,
                email: email,
                name: name,
                surname: surname,
                middleName: middleName
            });
            enqueueSnackbar("Студент успешно зарегистрирован и приглашен", {variant: "success"});
            onClose();
            await onStudentRegistered();
        } catch (error) {
            const responseErrors = await ErrorsHandler.getErrorMessages(error as Response);
            if (responseErrors.length > 0) {
                setErrors(responseErrors);
            } else {
                setErrors(['Не удалось зарегистрировать студента']);
            }
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={() => !isRegistering && onClose()}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                <Grid container>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#00AB00'}}>
                            <MailOutlineIcon/>
                        </Avatar>
                    </Grid>
                    <Grid item container direction={"row"} justifyContent={"center"}>
                        <Typography variant="h5">
                            Зарегистрировать студента
                        </Typography>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {errors.length > 0 && (
                    <Typography color="error" align="center" style={{marginBottom: '16px'}}>
                        {errors[0]}
                    </Typography>
                )}
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                size="small"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-email"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Имя"
                                variant="outlined"
                                size="small"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-name"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Фамилия"
                                variant="outlined"
                                size="small"
                                value={surname}
                                onChange={(e) => setSurname(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-surname"
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Отчество"
                                variant="outlined"
                                size="small"
                                value={middleName}
                                onChange={(e) => setMiddleName(e.target.value)}
                                InputProps={{
                                    autoComplete: "new-middlename"
                                }}
                            />
                        </Grid>
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
                                variant="text"
                                onClick={registerStudent}
                                disabled={!email || !name || !surname || isRegistering}
                                style={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    color: '#3f51b5',
                                    transition: 'opacity 0.3s ease',
                                    opacity: (!email || !name || !surname || isRegistering) ? 0.5 : 1,
                                    padding: '6px 16px',
                                    marginRight: '8px'
                                }}
                            >
                                {isRegistering ? 'Регистрация...' : 'Зарегистрировать'}
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="text"
                                onClick={onClose}
                                disabled={isRegistering}
                                style={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 'normal',
                                    color: '#3f51b5',
                                    transition: 'opacity 0.3s ease',
                                    opacity: isRegistering ? 0.5 : 1,
                                    padding: '6px 16px'
                                }}
                            >
                                Закрыть
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RegisterStudentDialog;