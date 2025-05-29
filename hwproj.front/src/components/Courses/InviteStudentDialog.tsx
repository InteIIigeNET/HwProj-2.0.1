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
    Box,
    Avatar,
    Autocomplete
} from "@mui/material";
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto} from "@/api";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {useSnackbar} from 'notistack';
import {makeStyles} from '@material-ui/core/styles';
import RegisterStudentDialog from "./RegisterStudentDialog";

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

interface InviteStudentDialogProps {
    courseId: number;
    open: boolean;
    onClose: () => void;
    onStudentInvited: () => Promise<void>;
    email?: string;
}

const InviteStudentDialog: FC<InviteStudentDialogProps> = ({courseId, open, onClose, onStudentInvited, email: initialEmail}) => {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [email, setEmail] = useState(initialEmail || "");
    const [errors, setErrors] = useState<string[]>([]);
    const [isInviting, setIsInviting] = useState(false);
    const [showRegisterDialog, setShowRegisterDialog] = useState(false);
    const [students, setStudents] = useState<AccountDataDto[]>([]);

    const getStudents = async () => {
        try {
            const data = await ApiSingleton.accountApi.accountGetAllStudents();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    useEffect(() => {
        getStudents();
    }, []);

    const getCleanEmail = (input: string) => {
        return input.split(' / ')[0].trim();
    };

    const inviteStudent = async () => {
        setIsInviting(true);
        setErrors([]);
        try {
            const cleanEmail = getCleanEmail(email);
            await ApiSingleton.coursesApi.coursesInviteStudent({
                courseId: courseId,
                email: cleanEmail,
                name: "",
                surname: "",
                middleName: ""
            });
            enqueueSnackbar("Студент успешно приглашен", {variant: "success"});
            setEmail("");
            onClose();
            await onStudentInvited();
        } catch (error) {
            const responseErrors = await ErrorsHandler.getErrorMessages(error as Response);
            if (responseErrors.length > 0) {
                setErrors(responseErrors);
            } else {
                setErrors(['Студент с такой почтой не найден']);
            }
        } finally {
            setIsInviting(false);
        }
    };

    const hasMatchingStudent = () => {
        const cleanEmail = getCleanEmail(email);
        return students.some(student =>
            student.email === cleanEmail ||
            `${student.surname} ${student.name}`.includes(cleanEmail)
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={() => !isInviting && onClose()}
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
                                Пригласить студента
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
                                <Autocomplete
                                    freeSolo
                                    options={students}
                                    getOptionLabel={(option) =>
                                        typeof option === 'string'
                                            ? option
                                            : `${option.email} / ${option.surname} ${option.name}`
                                    }
                                    inputValue={email}
                                    onInputChange={(event, newInputValue) => {
                                        setEmail(newInputValue);
                                    }}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            <Grid container alignItems="center">
                                                <Grid item>
                                                    <Box fontWeight="fontWeightMedium">
                                                        {option.email} /
                                                    </Box>
                                                </Grid>
                                                <Grid item>
                                                    <Typography style={{marginLeft: '3px'}}>
                                                        {option.surname} {option.name}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </li>
                                    )}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Введите email или ФИО"
                                            variant="outlined"
                                            size="small"
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            spacing={1}
                            justifyContent="flex-end"
                            style={{marginTop: '16px'}}
                        >
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={() => {
                                        setShowRegisterDialog(true);
                                        onClose();
                                    }}
                                    disabled={hasMatchingStudent() || !getCleanEmail(email)}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: hasMatchingStudent() || !getCleanEmail(email) ? 0.5 : 1,
                                        padding: '6px 16px',
                                        marginRight: '8px'
                                    }}
                                >
                                    Зарегистрировать
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={inviteStudent}
                                    disabled={!hasMatchingStudent() || isInviting}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: !hasMatchingStudent() || isInviting ? 0.5 : 1,
                                        padding: '6px 16px',
                                        marginRight: '8px'
                                    }}
                                >
                                    {isInviting ? 'Отправка...' : 'Пригласить'}
                                </Button>
                            </Grid>
                            <Grid item>
                                <Button
                                    variant="text"
                                    onClick={onClose}
                                    disabled={isInviting}
                                    style={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 'normal',
                                        color: '#3f51b5',
                                        transition: 'opacity 0.3s ease',
                                        opacity: isInviting ? 0.5 : 1,
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

            <RegisterStudentDialog
                courseId={courseId}
                open={showRegisterDialog}
                onClose={() => setShowRegisterDialog(false)}
                onStudentRegistered={onStudentInvited}
                initialEmail={getCleanEmail(email)}
            />
        </>
    );
};

export default InviteStudentDialog;