import React, {FC, useState} from "react";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import {useSearchParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {InitRegistrationRequestViewModel, RequestedRole} from "@/api";
import "../Auth/Styles/Register.css";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from '@material-ui/core/styles';
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Avatar from "@material-ui/core/Avatar";
import ValidationUtils from "../Utils/ValidationUtils";
import {Alert, AlertTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent} from "@mui/material";

interface IRegistrationRequestState {
    name: string;
    surname: string;
    middleName: string;
    email: string;
    requestedRole: RequestedRole;
    description: string;
    preferredLecturerEmail: string;
    courseId?: number;
}

interface ICommonState {
    error: string[];
    isConfirmationSent: boolean;
}

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

const RegistrationRequestForm: FC = () => {
    const classes = useStyles();
    const [searchParams] = useSearchParams();

    const courseIdFromQuery = searchParams.get("courseId");
    const parsedCourseId = courseIdFromQuery ? Number(courseIdFromQuery) : undefined;
    const isCourseBound = parsedCourseId !== undefined && !Number.isNaN(parsedCourseId);
    
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const [requestState, setRequestState] = useState<IRegistrationRequestState>({
        name: "",
        surname: "",
        middleName: "",
        email: "",
        requestedRole: RequestedRole.NUMBER_0,
        description: "",
        preferredLecturerEmail: "",
        courseId: isCourseBound ? parsedCourseId : undefined,
    })

    const [commonState, setCommonState] = useState<ICommonState>({
        error: [],
        isConfirmationSent: false,
    })

    const [emailError, setEmailError] = useState<string>(""); // Состояние для ошибки электронной почты
    const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState<boolean>(false); // Состояние для блокировки кнопки
    const [preferredLecturerEmailError, setPreferredLecturerEmailError] = useState<string>(""); // Состояние для ошибки электронной почты выбранного для проверки заявки преподавателя

    const effectiveRequestedRole = isCourseBound
        ? RequestedRole.NUMBER_0
        : requestState.requestedRole;

    const isStudentRequest = effectiveRequestedRole === RequestedRole.NUMBER_0;

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        
        if (isSubmitting) {
            return;
        }
        
        if (!ValidationUtils.isCorrectEmail(requestState.email)) {
            setEmailError("Некорректный адрес электронной почты");
            setIsSubmitButtonDisabled(true);
            return;
        }

        if (isStudentRequest && requestState.preferredLecturerEmail.trim() && !ValidationUtils.isCorrectEmail(requestState.preferredLecturerEmail)) {
            setPreferredLecturerEmailError("Некорректный адрес электронной почты");
            setIsSubmitButtonDisabled(true);
            return;
        }
        
        setIsSubmitting(true);
        try {
            const requestModel: InitRegistrationRequestViewModel =
                {
                    email: requestState.email.trim(),
                    name: requestState.name.trim(),
                    surname: requestState.surname.trim(),
                    middleName: requestState.middleName?.trim() || "",
                    requestedRole: effectiveRequestedRole,
                    description: requestState.description.trim() || undefined,
                    preferredLecturerEmail: isStudentRequest
                        ? requestState.preferredLecturerEmail.trim() || undefined
                        : undefined,
                    courseId: isCourseBound ? requestState.courseId : undefined,
                };

            const result = await ApiSingleton.authService.initRegistrationRequest(requestModel);
            setCommonState(_ => ({
                error: result.error ?? [],
                isConfirmationSent: result.isConfirmationSent ?? false,
            }))
        } catch {
            setCommonState((prevState) => ({
                ...prevState,
                error: ['Сервис недоступен'],
                isConfirmationSent: false
            }))
        } finally {
            setIsSubmitting(false);
        }
    }

    if (commonState.isConfirmationSent) {
        return <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Alert severity="success" sx={{mt: 1}}>
                    <AlertTitle>Подтвердите почту</AlertTitle>
                    {isCourseBound
                        ? "Ссылка для подтверждения регистрации и заявки на вступление в курс отправлена на указанную почту."
                        : "Ссылка для подтверждения заявки отправлена на указанную почту."}

                </Alert>
            </div>
        </Container>
    }

    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <Avatar className={classes.avatar} style={{color: 'white', backgroundColor: '#ba2e2e'}}>
                    <LockOutlinedIcon/>
                </Avatar>

                <Typography component="h1" variant="h5">
                    {isCourseBound ? "Регистрация и заявка на курс" : "Регистрация"}
                </Typography>

                {commonState.error.length > 0 && (
                    <Typography color="error" style={{marginBottom: 0}}>
                        {commonState.error.join(", ")}
                    </Typography>
                )}
                <form onSubmit={handleSubmit} className={classes.form}>
                    <Grid container spacing={2}>
                        {!isCourseBound && (
                            <Grid item xs={12}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="requested-role-label">Тип заявки</InputLabel>
                                    <Select
                                        labelId="requested-role-label"
                                        value={String(requestState.requestedRole ?? RequestedRole.NUMBER_0)}
                                        onChange = {(e: SelectChangeEvent) => {
                                            const selectedRole = Number(e.target.value) as RequestedRole;
                                            setRequestState((prevState) => ({
                                                ...prevState,
                                                requestedRole: selectedRole
                                            }));

                                            setPreferredLecturerEmailError("");
                                            setIsSubmitButtonDisabled(false);
                                        }}
                                        label="Тип заявки"
                                    >
                                        <MenuItem value={String(RequestedRole.NUMBER_0)}>
                                            Студент
                                        </MenuItem>
                                        <MenuItem value={String(RequestedRole.NUMBER_1)}>
                                            Преподаватель
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                required
                                label="Имя"
                                variant="outlined"
                                value={requestState.name}
                                onChange={(e) => {
                                    setRequestState((prevState) => ({
                                        ...prevState,
                                        name: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                label="Фамилия"
                                variant="outlined"
                                value={requestState.surname}
                                onChange={(e) => {
                                    setRequestState((prevState) => ({
                                        ...prevState,
                                        surname: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Отчество"
                                variant="outlined"
                                value={requestState.middleName}
                                onChange={(e) => {
                                    setRequestState((prevState) => ({
                                        ...prevState,
                                        middleName: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                type="email"
                                label="Электронная почта"
                                variant="outlined"
                                value={requestState.email}
                                onChange={(e) => {
                                    setRequestState((prevState) => ({
                                        ...prevState,
                                        email: e.target.value
                                    }))
                                    setEmailError("");
                                    setIsSubmitButtonDisabled(false);
                                }}
                                error={emailError !== ""}
                                helperText={emailError}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                label="Описание/О себе"
                                variant="outlined"
                                value={requestState.description ?? ""}
                                onChange={(e) => {
                                    setRequestState((prevState) => ({
                                        ...prevState,
                                        description: e.target.value
                                    }))
                                }}
                            />
                        </Grid>
                        {!isCourseBound && isStudentRequest && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    type="email"
                                    label="Почта предпочитаемого преподавателя"
                                    variant="outlined"
                                    value={requestState.preferredLecturerEmail ?? ""}
                                    onChange={(e) => {
                                        setRequestState((prevState) => ({
                                            ...prevState,
                                            preferredLecturerEmail: e.target.value,
                                        }));
                                        setPreferredLecturerEmailError("");
                                        setIsSubmitButtonDisabled(false);
                                    }}
                                    error={preferredLecturerEmailError !== ""}
                                    helperText={
                                        preferredLecturerEmailError ||
                                        "Необязательно. Если указать преподавателя, заявку будет для него выделена"
                                    }
                                />
                            </Grid>
                        )}
                    </Grid>
                    <Button
                        style={{marginTop: '15px'}}
                        fullWidth
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={isSubmitButtonDisabled || isSubmitting}
                    >
                        {isSubmitting ? "Отправка..." : "Отправить заявку"}
                    </Button>
                </form>
            </div>
        </Container>
    )
}

export default RegistrationRequestForm;
