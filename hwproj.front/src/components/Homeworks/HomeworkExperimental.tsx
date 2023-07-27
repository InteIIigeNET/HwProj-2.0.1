import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import EditIcon from '@material-ui/icons/Edit';
import {HomeworkViewModel} from "../../api";
import {Link as RouterLink} from 'react-router-dom'
import ApiSingleton from "../../api/ApiSingleton";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    CircularProgress,
    Grid,
    Tab,
    Tabs,
    TextField
} from '@material-ui/core';
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import DeletionConfirmation from "../DeletionConfirmation";
import HourglassEmpty from "@material-ui/icons/HourglassEmpty";
import Utils from "../../services/Utils";
import {Box, CardContent, Chip, Divider, Stack} from "@mui/material";
import ReactMarkdown from "react-markdown";
import Checkbox from "@material-ui/core/Checkbox";

interface IHomeworkProp {
    homework: HomeworkViewModel,
    isReadingMode: boolean,
    isMentor: boolean,
    editMode: boolean,
    doubleClickEdit: (e: any) => void,
    renderMenuTask: () => void,
    onSubmit: () => void
}

interface IEditHomeworkState {
    isLoaded: boolean;
    title: string;
    description: string;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
    isPreview: boolean;
}

const useStyles = makeStyles((theme) => ({
    tools: {
        display: "flex",
        flexDirection: 'row',
        alignItems: 'center',
    },
    tool: {
        marginRight: theme.spacing(2),
        marginLeft: theme.spacing(2),
    },
    text: {
        marginTop: '16px',
    }
}))

const HomeworkExperimental: FC<IHomeworkProp> = (props) => {
    const [previewEdit, setPreviewEdit] = useState(false)
    const {homework, 
        isReadingMode,
        isMentor,
        editMode,
        doubleClickEdit,
        renderMenuTask,
        onSubmit} = props
    const deferredHomeworks = homework.tasks!.filter(t => t.isDeferred!)
    
    const [homeworkState, setHomeworkState] = useState<IEditHomeworkState>({
        isLoaded: false,
        title: "",
        description: "",
        courseId: 0,
        courseMentorIds: [],
        edited: false,
        isPreview: false,
    })

    useEffect(() => {
        setPreviewEdit(false)
        setHomeworkState(prevState => ({
            ...prevState,
            isLoaded: false,
        }))
        getHomework()
    }, [editMode])

    const getHomework = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)
        setHomeworkState((prevState) => ({
            ...prevState,
            isLoaded: true,
            title: homework.title!,
            description: homework.description!,
            courseId: homework.courseId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
        }))
    }
    
    /*const classes = useStyles()*/


    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const homeworkViewModel = {
            title: homeworkState.title,
            description: homeworkState.description,
        };
        await ApiSingleton.homeworksApi
            .apiHomeworksUpdateByHomeworkIdPut(+homework.id!, homeworkViewModel)

        setHomeworkState((prevState) => ({
            ...prevState,
            edited: true
        }))
        
        onSubmit()
    }

    if(!homeworkState.isLoaded) {
        return (
            <CardContent style={{ minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
            </CardContent>)
    }
    else return (
        <CardContent>
            <form onSubmit={(e) => handleSubmit(e)}>
                {editMode &&
                    <Tabs
                        onChange={(event, value) => setPreviewEdit(value === 1)}
                        indicatorColor="primary"
                        style={{ marginBottom: 10 }}
                        value={previewEdit ? 1 : 0}
                        centered
                    >
                        <Tab label="Редактировать"
                             id="simple-tab-0"
                             aria-controls="simple-tabpanel-0"
                             style={{ width: '50%' }}/>
                        <Tab label="Превью" id="simple-tab-1" aria-controls="simple-tabpanel-1"
                             style={{ width: '50%' }}/>
                    </Tabs>
                }
                <Grid xs item hidden={!isReadingMode}>
                    <Grid
                          xs={12}
                          item
                          id="simple-tab-0"
                          component="div"
                          alignItems={"center"}
                    >
                        <Grid container xs={12} item>
                            <Grid item xs>
                                <Typography variant="h6" component="div">
                                    {homework.title}
                                </Typography>
                            </Grid>
                            {isMentor && deferredHomeworks!.length > 0 &&
                                <Grid item><Chip label={"🕘 " + deferredHomeworks!.length}/></Grid>
                            }
                            <Grid item><Chip label={homework.tasks!.length + " заданий"}/></Grid>
                        </Grid>
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                            <ReactMarkdown children={homework.description!}/>
                        </Typography>
                    </Grid>
                </Grid>
                {!editMode ?
                    <Grid xs item hidden={isReadingMode}>
                        <Grid container xs={12} item>
                            <Grid item xs>
                                <Typography variant="h6" component="div">
                                    {homework.title}
                                </Typography>
                            </Grid>
                            {isMentor && deferredHomeworks!.length > 0 &&
                                <Grid item><Chip label={"🕘 " + deferredHomeworks!.length}/></Grid>
                            }
                            <Grid item><Chip label={homework.tasks!.length + " заданий"}/></Grid>
                            {!editMode && renderMenuTask()}
                        </Grid>
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <Typography style={{color: "GrayText"}} gutterBottom variant="body1">
                            <ReactMarkdown children={homework.description!}/>
                        </Typography>
                    </Grid> 
                    :
                    <Grid>
                        <Grid container xs={12} item>
                            <Grid item xs>
                                <TextField fullWidth
                                           variant="standard"
                                           id="title"
                                           label='Название задания'
                                           hidden={previewEdit}
                                           autoComplete="off"
                                           value={homeworkState.title}
                                           onChange={(e) => {
                                               e.persist()
                                               setHomeworkState((prevState) => ({
                                                   ...prevState,
                                                   title: e.target.value
                                               }))
                                           }}
                                />
                                <Typography role="tabpanel"
                                            hidden={!previewEdit}
                                            id="simple-tab-1"
                                            variant="h6"
                                            component="div">
                                    {homeworkState.title}
                                </Typography>
                            </Grid>
                        </Grid>
                        <Divider style={{marginTop: 15, marginBottom: 15}}/>
                        <TextField id="input-description"
                                   style={{ padding: 0 }}
                                   variant="outlined"
                                   label='Описание задания'
                                   hidden={previewEdit}
                                   multiline
                                   fullWidth
                                   minRows={1}
                                   maxRows={6}
                                   value={homeworkState.description!}
                                   onChange={(e) => {
                                       e.persist()
                                       setHomeworkState((prevState) => ({
                                           ...prevState,
                                           description: e.target.value
                                       }))
                                   }}/>
                        <Typography role="tabpanel"
                                    hidden={!previewEdit}
                                    id="simple-tab-1"
                                    style={{color: "GrayText"}}
                                    gutterBottom
                                    variant="body1">
                            <ReactMarkdown children={homeworkState.description!}/>
                        </Typography>
                    </Grid>}
                {editMode &&
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginTop: 8 }}
                        type={'submit'}
                        fullWidth
                    >Редактировать задание</Button>}
            </form>
        </CardContent>
    )
}

export default HomeworkExperimental
