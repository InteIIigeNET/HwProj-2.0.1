﻿import {FC, useState} from "react";
import {Link} from "@material-ui/core";
import {
    Alert, Avatar, Card, CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid, IconButton, Stack,
    Typography
} from "@mui/material";
import * as React from "react";
import {ReactMarkdownWithCodeHighlighting, TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import Button from "@material-ui/core/Button";
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, AddAnswerForQuestionDto, AddTaskQuestionDto, GetTaskQuestionDto} from "../../api";
import {Checkbox} from "@mui/material/";
import CloseIcon from "@mui/icons-material/Close";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import AvatarUtils from "../Utils/AvatarUtils";

interface ITaskQuestionsProps {
    forMentor: boolean
    student: AccountDataDto
    taskId: number
    questions: GetTaskQuestionDto[]
    onChange: () => void
}

interface IAddQuestionState {
    show: boolean
}

interface IAddAnswerState {
    questionId: number | undefined
}

const TaskQuestions: FC<ITaskQuestionsProps> = (props) => {
    const [addQuestionState, setAddQuestionState] = useState<IAddQuestionState & AddTaskQuestionDto>({
        show: false,
        text: "",
        isPrivate: true
    })

    const [addAnswerState, setAddAnswerState] = useState<IAddAnswerState & AddAnswerForQuestionDto>({
        questionId: undefined,
        answer: ""
    })

    const closeAddQuestion = () => setAddQuestionState({show: false, text: "", isPrivate: true})
    const sendQuestion = async (question: AddTaskQuestionDto) => {
        await ApiSingleton.tasksApi.apiTasksAddQuestionPost(question)
        closeAddQuestion()
        props.onChange()
    }

    const sendAnswer = async (answer: AddAnswerForQuestionDto) => {
        await ApiSingleton.tasksApi.apiTasksAddAnswerPost(answer)
        setAddAnswerState({questionId: undefined, answer: ""})
        props.onChange()
    }

    return <div style={{marginTop: 5}}>
        <Dialog fullWidth open={addQuestionState.show} onClose={closeAddQuestion}>
            <DialogTitle>
                Задать новый вопрос
            </DialogTitle>
            <DialogContent>
                <FormControlLabel
                    label="Виден другим студентам"
                    control={
                        <Checkbox
                            color="primary"
                            checked={!addQuestionState.isPrivate}
                            onChange={(e) => {
                                setAddQuestionState(prevState => ({
                                    ...prevState,
                                    isPrivate: !e.target.checked,
                                }))
                            }}
                        />
                    }
                />
                <TextFieldWithPreview
                    multiline
                    fullWidth
                    style={{width: "100%", minWidth: "100%"}}
                    minRows={4}
                    maxRows={20}
                    margin="normal"
                    label="Вопрос"
                    variant="outlined"
                    previewStyle={{borderColor: "GrayText"}}
                    value={addQuestionState.text}
                    onChange={(e) => {
                        e.persist()
                        setAddQuestionState((prevState) => ({
                            ...prevState,
                            text: e.target.value,
                        }))
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={_ => sendQuestion({...addQuestionState, taskId: props.taskId})}
                >
                    Отправить вопрос
                </Button>
                <Button
                    size="small"
                    onClick={closeAddQuestion}
                    variant="contained"
                    color="primary"
                >
                    Отменить
                </Button>
            </DialogActions>
        </Dialog>
        {props.forMentor && props.questions.length === 0 && <Typography variant={"caption"}>
            Никто не задал ещё вопросы.
        </Typography>}
        <Grid container spacing={1} direction={"column"}>
            {!props.forMentor && <Grid item><Link
                style={{cursor: "pointer"}}
                onClick={() => setAddQuestionState(prevState => ({...prevState, show: true}))}
            >
                <Typography variant={"caption"}>
                    Задать вопрос по задаче
                </Typography>
            </Link>
            </Grid>}
            {props.questions.map(q => {
                const addAnswer = q.id === addAnswerState.questionId
                const isCurrentStudent = q.studentId === props.student.userId
                const isAnswered = q.answer !== null
                return <Grid item>
                    <Alert severity={isAnswered ? "success" : "info"}
                           icon={isCurrentStudent
                               ? <Avatar style={{width: 30, height: 30}} {...AvatarUtils.stringAvatar(props.student)} />
                               : q.isPrivate
                                   ? <PersonIcon fontSize={"small"}/>
                                   : <GroupsIcon fontSize={"medium"}/>}
                           action={isAnswered || !props.forMentor ? null :
                               <Stack direction={"row"} alignItems={"center"}>
                                   {addAnswer &&
                                       <IconButton color={"error"} disableTouchRipple disableFocusRipple
                                                   style={{backgroundColor: 'transparent'}}
                                                   onClick={() => setAddAnswerState({
                                                       answer: "",
                                                       questionId: undefined
                                                   })}>
                                           <CloseIcon
                                               fontSize={"small"}/></IconButton>}
                                   <Button color="inherit" size="small" disableRipple
                                           style={{backgroundColor: 'transparent'}}
                                           variant={"text"}
                                           onClick={() => {
                                               addAnswer
                                                   ? sendAnswer({...addAnswerState, questionId: q.id})
                                                   : setAddAnswerState(prevState => ({
                                                       ...prevState,
                                                       questionId: q.id
                                                   }))
                                           }}>
                                       {addAnswer ? "Отправить" : "Ответить"}
                                   </Button>
                               </Stack>
                           }>
                        {isCurrentStudent && <Typography variant={"caption"}>
                            Вопрос от проверяемого студента:
                        </Typography>}
                        <ReactMarkdownWithCodeHighlighting value={q.text!}/>
                        {!isAnswered && q.id === addAnswerState.questionId && <TextFieldWithPreview
                            multiline
                            fullWidth
                            style={{width: "100%"}}
                            minRows={4}
                            maxRows={20}
                            margin="normal"
                            label="Ответ"
                            variant="outlined"
                            previewStyle={{borderColor: "GrayText"}}
                            value={addAnswerState.answer}
                            onChange={(e) => {
                                e.persist()
                                setAddAnswerState((prevState) => ({
                                    ...prevState,
                                    answer: e.target.value,
                                }))
                            }}
                        />}
                        {isAnswered &&
                            <div>
                                <Typography variant={"caption"}>
                                    Ответ преподавателя:
                                </Typography>
                                <Card variant={"outlined"}
                                      style={{backgroundColor: "ghostwhite"}}>
                                    <CardContent style={{paddingBottom: 0, marginBottom: 0}}>
                                        <ReactMarkdownWithCodeHighlighting value={q.answer!}/>
                                    </CardContent>
                                </Card>
                            </div>}
                    </Alert>
                </Grid>;
            })}
        </Grid>
    </div>
}
export default TaskQuestions;