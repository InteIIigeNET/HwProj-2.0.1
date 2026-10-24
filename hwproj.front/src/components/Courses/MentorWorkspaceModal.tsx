import React, {FC, useState} from 'react'
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Snackbar,
    Stack,
    Tooltip,
    Typography
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, EditMentorWorkspaceDTO, HomeworkViewModel} from "@/api";
import ErrorsHandler from "../Utils/ErrorsHandler";
import CourseFilter from "./CourseFilter";
import {UserInitialsAvatar} from "../Common/UserInitialsAvatar";

interface MentorWorkspaceProps {
    isOpen: boolean;
    onClose: any;
    courseId: number;
    // Передаём аккаунт целиком, чтобы в заголовке показать настоящий аватар преподавателя
    mentor: AccountDataDto;
}

interface MentorWorkspaceState {
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    errors: string[];
}

const MentorWorkspaceModal: FC<MentorWorkspaceProps> = (props) => {
    const [state, setState] = useState<MentorWorkspaceState>({
        selectedHomeworks: [],
        selectedStudents: [],
        errors: []
    });

    // Состояние для отображения элемента загрузки
    const [isWorkspaceLoading, setIsWorkspaceLoading]
        = useState<boolean>(true);

    // Состояние для отображения сообщения об успешном обновлении воркспейса ментора
    const [isWorkspaceUpdated, setIsWorkspaceUpdated]
        = useState<boolean>(false);

    // Если преподаватель не выбрал ни одного студента, по умолчанию регистрируем всех. Аналогично с выбором домашних работ
    const handleWorkspaceChanges = async () => {
        try {
            const workspaceViewModel: EditMentorWorkspaceDTO = {
                homeworkIds: state.selectedHomeworks.map(homeworkViewModel => homeworkViewModel.id!),
                studentIds: state.selectedStudents.map(accountData => accountData.userId!)
            }

            await ApiSingleton.coursesApi.coursesEditMentorWorkspace(
                props.courseId, props.mentor.userId!, workspaceViewModel
            );

            setIsWorkspaceUpdated(true);
        } catch (e) {
            const errors = await ErrorsHandler.getErrorMessages(e as Response);
            setState((prevState) => ({
                ...prevState,
                errors: errors
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
                        <UserInitialsAvatar user={props.mentor} size={40}/>
                        <Box sx={{flexGrow: 1, minWidth: 0}}>
                            <Typography sx={{fontSize: "1.05rem", fontWeight: 500, lineHeight: 1.3}}>
                                {props.mentor.name}&nbsp;{props.mentor.surname}
                            </Typography>
                            <Typography variant={"caption"} sx={{color: "text.secondary"}}>
                                Область работы преподавателя
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
                    <Stack spacing={1.5}>
                        {state.errors.length > 0 &&
                            <Alert severity="error" sx={{borderRadius: "10px"}}>
                                {state.errors.map((error, index) => <div key={index}>{error}</div>)}
                            </Alert>}
                        {!isWorkspaceLoading &&
                            <Typography variant={"body2"} sx={{color: "text.secondary"}}>
                                Выберите задания и студентов, за которые отвечает преподаватель.
                                Если ничего не выбрать, преподаватель получит доступ ко всему курсу.
                            </Typography>}
                        <CourseFilter courseId={props.courseId}
                                      mentorId={props.mentor.userId!}
                                      isStudentsSelectionHidden={false}
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
                    </Stack>
                </DialogContent>
                {!isWorkspaceLoading && <>
                    <Divider/>
                    <DialogActions sx={{px: 2, py: 1.5, gap: 1}}>
                        <Button
                            variant="contained"
                            color="primary"
                            disableElevation
                            onClick={handleWorkspaceChanges}
                            sx={{textTransform: "none", borderRadius: "10px", px: 2.5}}
                        >
                            Изменить
                        </Button>
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
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                open={isWorkspaceUpdated}
                onClose={() => setIsWorkspaceUpdated(false)}
                key={'top center'}
                autoHideDuration={5000}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setIsWorkspaceUpdated(false)}
                    sx={{borderRadius: "10px"}}
                >
                    Успешно обновлено
                </Alert>
            </Snackbar>
        </>
    )
}

export default MentorWorkspaceModal;
