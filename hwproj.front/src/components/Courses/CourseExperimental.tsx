import * as React from "react";
import {
    HomeworkTaskViewModel,
    HomeworkViewModel, Solution, StatisticsCourseMatesModel, StatisticsCourseSolutionsModel
} from "../../api";
import {
    Button,
    Grid,
    InputBase, Tab, Tabs,
    TextField,
    Typography,
    Collapse,
    IconButton,
    Menu,
    MenuItem,
    Popover,
    List,
    ListItem,
    Paper
} from "@material-ui/core";
import {FC, useEffect, useState} from "react";
import {useClickAway} from "react-use"
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import {Box, Card, CardActions, CardContent, Chip, Divider, ListItemButton} from "@mui/material";
import ReactMarkdown from "react-markdown";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {CheckCircleOutline} from "@mui/icons-material";
import FilledInput from '@mui/material/FilledInput';
import {makeStyles} from "@material-ui/styles";
import Checkbox from "@material-ui/core/Checkbox";
import ApiSingleton from "../../api/ApiSingleton";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeletionConfirmation from "components/DeletionConfirmation";
import TaskExperimental from "components/Tasks/TaskExperimental";
import AddTaskExperimental from "components/Tasks/AddTaskExperimental";
import AddHomeworkExperimental from "../Homeworks/AddHomeworkExperimental";
import HomeworkExperimental from "components/Homeworks/HomeworkExperimental";

interface ICourseExperimentalProps {
    homeworks: HomeworkViewModel[]
    studentSolutions: StatisticsCourseMatesModel[]
    isMentor: boolean
    isReadingMode: boolean
    isStudentAccepted: boolean
    creationState: boolean
    onDelete: () => void
    onCancel: () => void
    userId: string
    id: number,
    onSubmit: () => void
}

interface ICourseExperimentalState {
    selectedItem: {
        isHomework: boolean,
        id: number | undefined,
        data: HomeworkViewModel | HomeworkTaskViewModel | undefined
    }
}

interface ICreationTaskState {
    homework: {
        id: number | undefined,
        create: boolean
    }
}

const styles = makeStyles(() => ({
    lackTasks: {
        margin: 10, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontSize: 'calc(1em + 1vw)',
        color: 'gray'
    }
}))

const CourseExperimental: FC<ICourseExperimentalProps> = (props) => {
    const homeworks = props.homeworks.slice().reverse()
    const {isMentor, studentSolutions, isReadingMode, isStudentAccepted, userId} = props
    const [creationStateHomework, setCreationStateHomework] = useState<boolean>(false)
    const [creationStateTask, setCreationStateTask] = useState<ICreationTaskState>({
        homework:  {
            id: undefined,
            create: false
        }
    })
    
    const [state, setState] = useState<ICourseExperimentalState>({
        selectedItem: {
            isHomework: true,
            id: homeworks?.length && homeworks[0].id,
            data: homeworks?.length ? homeworks[0] : undefined
        }
    })

    
    const [editMode, setEditMode] = useState<boolean>(false)
    const [previewEdit, setPreviewEdit] = useState<boolean>(false)
    const classes = styles()
    const ref = React.useRef(null)
    useClickAway(ref, () => {
        props.onCancel()
        setEditMode(false)
    })

    const [isOpenDialogDelete, setIsOpenDialogDelete] = useState<boolean>(false)

    const openDialogDelete = () => {
        setIsOpenDialogDelete(true)
    }

    const closeDialogDelete = () => {
        setIsOpenDialogDelete(false)
    }

    const deleteTask = async () => {
        state.selectedItem.isHomework ? 
            await ApiSingleton.homeworksApi.apiHomeworksDeleteByHomeworkIdDelete(state.selectedItem.id!)
            :
            await ApiSingleton.tasksApi.apiTasksDeleteByTaskIdDelete(state.selectedItem.id!)
        closeDialogDelete()
        props.onDelete()
    }
    
    const {data, id, isHomework} = state.selectedItem
    
    const renderDate = (date: Date) => {
        date = new Date(date)
        const options = {month: 'long', day: 'numeric'};
        return date.toLocaleString("ru-RU", options)
    }

    const renderTime = (date: Date) => {
        date = new Date(date)
        const options = {hour: "2-digit", minute: "2-digit"};
        return date.toLocaleString("ru-RU", options)
    }

    const hoveredItemStyle = {backgroundColor: "ghostwhite", borderRadius: "10px", cursor: "pointer"}

    const getStyle = (itemIsHomework: boolean, itemId: number) =>
        itemIsHomework === isHomework && itemId === id ? hoveredItemStyle : {}
    
    const doubleClickEdit = (event: any) => {
        setEditMode(true)
        if (event.detail > 1) {
            event.preventDefault()
        }
    }
    
    const deleteButton = () => {
        handleClose()
        openDialogDelete()
    }
    
    const addTask = () => {
        handleClose()
        setCreationStateTask(prevState => ({
            ...prevState,
            homework: {
                id: state.selectedItem.id,
                create: true
            }
        }))
    }
    
    const renderMenuTask = () => {
        return (
            <Grid xs={1} item
                  style={{display: "flex",
                      alignItems: "center",
                      justifyContent: 'flex-end',
                      maxWidth: 30}}>
                <IconButton size={'small'}
                            onClick={(e) =>
                                handleClick(e)}>
                    <MoreVertIcon/>
                </IconButton>
                <Menu
                    id="basic-menu"
                    anchorEl={anchor}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                    }}
                >
                    {isHomework &&
                        <MenuItem onClick={addTask}>
                            <Grid xs={12} item container direction={'row'}>
                                <Grid xs={1} item style={{ marginRight: 5, minWidth: 24 }}>
                                    <AddIcon/>
                                </Grid>
                                <Grid xs item>
                                    Добавить задачу
                                </Grid>
                            </Grid>
                        </MenuItem>}
                    <MenuItem onClick={() => editTask()}
                              style={{textDecoration: 'none'}}
                              title={"Редактировать"}>
                        <Grid xs={12} item container direction={'row'}>
                            <Grid xs={1} item style={{ marginRight: 5, minWidth: 24 }}><EditIcon/></Grid>
                            <Grid xs item>
                                Редактировать
                            </Grid>
                        </Grid>
                    </MenuItem>
                    <MenuItem onClick={deleteButton}>
                        <Grid xs={12} item container direction={'row'}>
                            <Grid xs={1} item style={{ marginRight: 5, minWidth: 24 }}>
                                <DeleteIcon color={'error'}/>
                            </Grid>
                            <Grid xs item style={{ color: '#d32f2f' }}>
                                Удалить
                            </Grid>
                        </Grid>
                    </MenuItem>
                </Menu>
            </Grid>
        )
    }

    const taskSolutionsMap = new Map<number, StatisticsCourseSolutionsModel[]>()

    if (!isMentor && isStudentAccepted) {
        studentSolutions
            .filter(t => t.id === userId)
            .flatMap(t => t.homeworks!)
            .flatMap(t => t.tasks!)
            .forEach(x => taskSolutionsMap.set(x.id!, x.solution!))
    }

    const renderTaskStatus = (taskId: number) => {
        if (taskSolutionsMap.has(taskId)) {
            const solutions = taskSolutionsMap.get(taskId)
            /// final
            if (solutions!.some(x => x.state === Solution.StateEnum.NUMBER_2))
                return <CheckCircleIcon color={"success"} fontSize={"small"}/>
            /// rated
            if (solutions!.some(x => x.state === Solution.StateEnum.NUMBER_1))
                return <CheckCircleOutline color={"success"} fontSize={"small"}/>
            return <TimelineDot variant={"outlined"}/>
        }
        return <TimelineDot variant={"outlined"}/>
    }

    const onSubmitEdit = async () => {
        await props.onSubmit()
        setEditMode(false)
    }
    
    const renderSelectedItem = () => {
        if (!data) return null

        if (isHomework) 
            return <Card
                ref={ref}
                onDoubleClick={(e) => !isReadingMode && !editMode && doubleClickEdit(e)}
                variant="elevation" style={{backgroundColor: "ghostwhite"}}>
                <HomeworkExperimental
                    homework={data as HomeworkViewModel}
                    isReadingMode={isReadingMode}
                    isMentor={isMentor}
                    editMode={editMode}
                    doubleClickEdit={doubleClickEdit}
                    renderMenuTask={renderMenuTask}
                    onSubmit={onSubmitEdit}
                />
            </Card>

        const task = data as HomeworkTaskViewModel
        return <Card
            ref={ref}
            onDoubleClick={(e) => !isReadingMode && !editMode && doubleClickEdit(e)}
            variant="elevation" style={{backgroundColor: "ghostwhite"}}>
            <TaskExperimental
                task={data as HomeworkTaskViewModel}
                isReadingMode={isReadingMode}
                isMentor={isMentor}
                editMode={editMode}
                doubleClickEdit={doubleClickEdit}
                renderMenuTask={renderMenuTask}
                onSubmit={onSubmitEdit}
            />
            {!props.isMentor && props.isStudentAccepted && <CardActions>
                <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.assign("/task/" + task.id!.toString())}
                >
                    Решения
                </Button>                
            </CardActions>}
        </Card>
    }
    
    const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        setAnchor(event.currentTarget)
    }

    const handleClose = () => {
        setAnchor(null)
    }

    const editTask = () => {
        setEditMode(true)
        setAnchor(null)
    }
    
    const open = Boolean(anchor)
    
    const handleCreationState = () => {
        setCreationStateHomework(false)
    }
    
    const handleSubmitCreate = () => {
        setCreationStateHomework(false)
        props.onSubmit()
    }

    return <Grid container direction={"row"} spacing={1}>
        <Grid item xs={4}>
            {!isReadingMode && 
                <Grid style={{ padding: '0px 16px' }} hidden={creationStateHomework || creationStateTask.homework.create}>
                    <Button fullWidth 
                            color={'primary'} 
                            variant={'contained'} 
                            style={{ borderRadius: 10 }}
                            onClick={() => setCreationStateHomework(true)}>
                        <Grid xs={12} item container direction={'row'} style={{ display: 'flex', justifyContent: 'center' }}>
                            <AddIcon style={{ marginRight: 8 }}/>
                            {'Добавить задание'}
                        </Grid>
                    </Button>
                </Grid>
            }
            {homeworks.length !== 0 ?
                <Timeline style={{ maxHeight: 500, overflow: 'auto'}}
                          sx={{'&::-webkit-scrollbar': {display: "none"}}}>
                    {homeworks.map(x => <div>
                        <Box sx={{":hover": hoveredItemStyle}}
                             style={{...getStyle(true, x.id!),
                                 minHeight: 30,
                                 marginTop: 10,
                                 marginBottom: 10,
                                 display: 'flex',
                                 flexDirection: 'row'}}
                             onClick={() => {
                                 setState(prevState => ({
                                     ...prevState,
                                     selectedItem: {
                                         data: x,
                                         isHomework: true,
                                         id: x.id
                                     }
                                 }))
                             }}>
                            <Grid xs={12} item container direction='row'>
                                <Grid xs item style={{ display: 'flex', justifyContent: 'center', fontWeight: "bold" }}>
                                    {x.title}
                                </Grid>
                            </Grid>
                        </Box>
                        {x.tasks?.length === 0 &&
                            <TimelineItem style={{minHeight: 30, marginBottom: -5}}>
                                <TimelineOppositeContent></TimelineOppositeContent>
                                <TimelineSeparator><TimelineConnector/></TimelineSeparator>
                                <TimelineContent></TimelineContent>
                            </TimelineItem>}
                        {x.tasks!.map(t =>
                            <TimelineItem
                                onClick={() => {
                                    setState(prevState => ({
                                        ...prevState,
                                        selectedItem: {
                                            data: t,
                                            isHomework: false,
                                            id: t.id
                                        }
                                    }))
                                }}
                                style={{...getStyle(false, t.id!)}}
                                sx={{":hover": hoveredItemStyle}}>
                                <TimelineOppositeContent color="textSecondary">
                                    {t.deadlineDate ? renderDate(t.deadlineDate) : ""}
                                    <br/>
                                    {t.deadlineDate ? renderTime(t.deadlineDate) : ""}
                                </TimelineOppositeContent>
                                <TimelineSeparator>
                                    {renderTaskStatus(t.id!)}
                                    <TimelineConnector style={{ marginBottom: 8 }}/>
                                </TimelineSeparator>
                                <TimelineContent alignItems={"center"}>
                                    <Typography className="antiLongWords">
                                        {t.title}
                                    </Typography>
                                </TimelineContent>
                            </TimelineItem>)}
                    </div>)}
                </Timeline> :
                <Grid style={{ padding: '0px 16px' }}>
                    <Paper elevation={0} style={{ width: '100%', borderRadius: 10, padding: 10 }}>
                        <Typography className={classes.lackTasks}>
                             Нет заданий
                        </Typography>
                    </Paper>
                </Grid>
            }
        </Grid>

        <Grid item xs={8}>
            {creationStateHomework &&
                <AddHomeworkExperimental
                    id={props.id}
                    onCancel={handleCreationState}
                    onSubmit={handleSubmitCreate}
                />}
            {creationStateTask.homework.create &&
                <AddTaskExperimental
                    id={creationStateTask.homework.id!}
                    onAdding={() => window.location.reload()}
                    onCancel={() => {
                        setCreationStateTask((prevState) => ({
                        ...prevState,
                        homework: {
                            id: undefined,
                            create: false
                        }
                    }))}}
                    update={() => props.onDelete()}
                />}
            {homeworks?.length > 0 && !creationStateHomework && !creationStateTask.homework.create && renderSelectedItem()}
            
        </Grid>
        <DeletionConfirmation
            onCancel={closeDialogDelete}
            onSubmit={deleteTask}
            isOpen={isOpenDialogDelete}
            dialogTitle={'Удаление домашнего задания'}
            dialogContentText={isHomework ? 
                `Вы точно хотите удалить домашнее задание "${data?.title}"?` : 
                `Вы точно хотите удалить задачу "${data?.title}"?`
            }
            confirmationWord={''}
            confirmationText={''}
        />
    </Grid>
}

export default CourseExperimental
