import React, {FC, useEffect, useState} from 'react'
import ApiSingleton from "../../api/ApiSingleton";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CloseIcon from '@mui/icons-material/Close';
import {CoursePreviewView, HomeworkViewModel, InviteExpertViewModel, AccountDataDto} from "../../api";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Snackbar,
    Stack,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import CourseFilter from "../Courses/CourseFilter";
import NameBuilder from "../Utils/NameBuilder";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";

interface IInviteExpertProps {
    isOpen: boolean;
    onClose: any;
    expertEmail: string;
    expertFullName: string;
    expertId: string;
}

interface IInviteExpertState {
    accessToken: string;
    lecturerCourses: CoursePreviewView[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    selectedCourseId: number;
    errors: string[];
}

// TODO: make placeholder darker
const handleCopyClick = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
}

const InviteExpertModal: FC<IInviteExpertProps> = (props) => {
    const [state, setState] = useState<IInviteExpertState>({
        accessToken: "",
        lecturerCourses: [],
        selectedHomeworks: [],
        selectedStudents: [],
        selectedCourseId: -1,
        errors: []
    });

    const [isInviteButtonDisabled, setIsInviteButtonDisabled]
        = useState<boolean>(true); // Состояние для блокировки кнопки "Пригласить"

    const [isLinkAccessible, setIsLinkAccessible]
        = useState<boolean>(false); // Состояние для блокировки отображения ссылки

    const [isLinkCopied, setIsLinkCopied]
        = useState<boolean>(false); // Состояние для отображения сообщения "Ссылка скопирована"

    const [isInvited, setIsInvited]
        = useState<boolean>(false); // Состояние для скрытия кнопки "Пригласить"

    const [isCourseListLoading, setIsCourseListLoading]
        = useState<boolean>(true); // Состояние для отображения элемента загрузки списка курсов

    const [isWorkspaceLoading, setIsWorkspaceLoading]
        = useState<boolean>(true); // Состояние для отображения элемента загрузки данных курса

    useEffect(() => {
        const fetchCourses = async () => {
            const courses = await ApiSingleton.coursesApi.coursesGetAllUserCourses();
            setState(prevState => ({
                ...prevState,
                lecturerCourses: courses.filter(x => !x.isCompleted).reverse()
            }));
            setIsCourseListLoading(false);
        }

        const fetchCredentials = async () => {
            const tokenCredentials = await ApiSingleton.expertsApi.expertsGetToken(props.expertEmail);
            setState(prevState => ({
                ...prevState,
                accessToken: tokenCredentials.value!.accessToken!
            }));
        }

        fetchCourses();
        fetchCredentials();
    }, [])

    useEffect(() => {
        const controlItemsAccessibility = () => {
            if (isLinkAccessible) {
                setIsLinkAccessible(false);
            }

            const isInputAllowed = state.selectedCourseId !== -1;
            setIsInviteButtonDisabled(!isInputAllowed);
            setIsInvited(!isInputAllowed);
        }

        controlItemsAccessibility();
    }, [state.selectedCourseId, state.selectedStudents, state.selectedHomeworks])

    const invitationLink = `${window.location.origin}/join/${state.accessToken}`;

    const handleInvitation = async () => {
        try {
            const inviteExpertModel: InviteExpertViewModel = {
                userId: props.expertId,
                userEmail: props.expertEmail,
                courseId: state.selectedCourseId,
                homeworkIds: state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.map(accountData => accountData.userId!)
            }

            const result = await ApiSingleton.expertsApi.expertsInvite(inviteExpertModel);
            if (result.succeeded) {
                setIsInviteButtonDisabled(true);
                setIsLinkAccessible(true);
                setIsInvited(true);
                navigator.clipboard.writeText(invitationLink).then(() => {
                    setIsLinkCopied(true);
                    setTimeout(() => setIsLinkCopied(false), 5000);
                }).catch(err => {
                    console.error('Ошибка при копировании ссылки в буфер обмена: ', err);
                });
            }
            setState((prevState) => ({
                ...prevState,
                errors: result!.errors ?? [],
            }));
        } catch (e) {
            const responseErrors = await (e as Response).json()
            setState((prevState) => ({
                ...prevState,
                errors: responseErrors ?? ['Сервис недоступен']
            }))
        }
    }

    return (
        <>
            <Dialog
                open={props.isOpen}
                onClose={props.onClose}
                aria-labelledby="dialog-title"
                fullWidth
                maxWidth={"sm"}
                PaperProps={{sx: {borderRadius: "16px"}}}
            >
                <DialogTitle id="dialog-title" sx={{p: 2}}>
                    <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}>
                                {props.expertFullName}
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Приглашение эксперта на курс
                            </Typography>
                        </Box>
                        <Tooltip arrow title={"Закрыть"}>
                            <IconButton size={"small"} onClick={props.onClose} sx={{flexShrink: 0}}>
                                <CloseIcon fontSize={"small"}/>
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </DialogTitle>
                <Divider/>
                <DialogContent sx={{p: 2}}>
                    {state.errors.length > 0 && (
                        <Alert severity="error" sx={{mb: 1.5, borderRadius: "10px"}}>
                            {state.errors.map((error, index) => <div key={index}>{error}</div>)}
                        </Alert>
                    )}
                    {isCourseListLoading ? (
                        <div className="container">
                            <DotLottieReact
                                src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                                loop
                                autoplay
                            />
                        </div>
                    ) : (
                        <div>
                            <Typography>
                                Выберите курс, на который хотите пригласить эксперта
                            </Typography>
                            <Grid container style={{marginTop: '10px'}}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12}>
                                        <FormControl fullWidth>
                                            <InputLabel id="course-select-label">Курс</InputLabel>
                                            <Select
                                                required
                                                fullWidth
                                                label="Курс"
                                                labelId="course-select-label"
                                                value={state.selectedCourseId === -1 ? '' : state.selectedCourseId}
                                                onChange={e => {
                                                    setIsWorkspaceLoading(true)
                                                    setState((prevState) => ({
                                                        ...prevState,
                                                        selectedCourseId: +e.target.value,
                                                        selectedHomeworks: [],
                                                        selectedStudents: []
                                                    }));
                                                }}>
                                                {state.lecturerCourses.map((courseViewModel, i) =>
                                                    <MenuItem key={i} value={courseViewModel.id}>
                                                        {NameBuilder.getCourseFullName(courseViewModel.name!, courseViewModel.groupName)}
                                                    </MenuItem>)}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                                {state.selectedCourseId !== -1 && (
                                    <Grid container direction="column">
                                        <Grid item>
                                            <CourseFilter key={state.selectedCourseId}
                                                          courseId={state.selectedCourseId}
                                                          mentorId={props.expertId}
                                                          isStudentsSelectionHidden={true}
                                                          onSelectedHomeworksChange={(homeworks) =>
                                                              setState(prevState => ({
                                                                  ...prevState,
                                                                  selectedHomeworks: homeworks
                                                              }))
                                                          }
                                                          onSelectedStudentsChange={(students) =>
                                                              setState(prevState => ({
                                                                  ...prevState,
                                                                  selectedStudents: students
                                                              }))
                                                          }
                                                          onWorkspaceInitialize={(success, errors) => {
                                                              if (!success) {
                                                                  setState(prevState => ({
                                                                      ...prevState,
                                                                      errors: errors ?? ['Сервис недоступен']
                                                                  }))
                                                              }
                                                              setIsWorkspaceLoading(false)
                                                          }}
                                            />
                                        </Grid>
                                    </Grid>
                                )}
                                {isLinkAccessible && (
                                    <Grid container style={{marginTop: '10px'}}>
                                        <Typography>
                                            Для приглашения эксперта поделитесь с ним ссылкой:
                                        </Typography>
                                        <Grid container style={{marginTop: '2px'}}>
                                            <Grid item xs={12} sm={11} style={{marginTop: '4px'}}>
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
                                            <Grid item sm={1} justifyContent="center" alignItems="center">
                                                <IconButton
                                                    onClick={() => handleCopyClick(invitationLink)}
                                                    color="primary">
                                                    <ContentCopyIcon/>
                                                </IconButton>
                                            </Grid>
                                        </Grid>
                                        <Grid container style={{marginTop: '2px'}}>
                                            <Grid
                                                direction="row"
                                                item
                                                style={{marginTop: '0px'}}
                                            >
                                                <Typography>
                                                    Действительна
                                                    до <b>{ApiSingleton.authService.getTokenExpirationDate(state.accessToken)}</b>
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>)}
                            </Grid>
                        </div>)}
                </DialogContent>
                {!isCourseListLoading && <>
                    <Divider/>
                    <DialogActions sx={{px: 2, py: 1.5, gap: 1}}>
                        {!isInvited && <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            onClick={handleInvitation}
                            disabled={isInviteButtonDisabled}
                            sx={{textTransform: "none", borderRadius: "10px", px: 2.5}}
                        >
                            Получить ссылку
                        </Button>}
                        <Button
                            onClick={props.onClose}
                            color="primary"
                            variant="text"
                            sx={{textTransform: "none", borderRadius: "10px"}}
                        >
                            Закрыть
                        </Button>
                    </DialogActions>
                </>}
            </Dialog>
            <Snackbar
                anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
                open={isLinkCopied}
                onClose={() => setIsLinkCopied(false)}
                autoHideDuration={5000}
            >
                <Alert severity="success" variant="filled" sx={{borderRadius: "10px"}}>
                    Ссылка скопирована в буфер обмена
                </Alert>
            </Snackbar>
        </>
    )
}

export default InviteExpertModal;