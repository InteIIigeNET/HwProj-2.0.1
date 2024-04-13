import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';
import {Grid, Typography, Button, TextField} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import {Alert, Checkbox, FormControlLabel} from "@mui/material";
import Tags from "./HomeworkTags";

interface IEditHomeworkState {
    isLoaded: boolean;
    title: string;
    description: string;
    courseId: number;
    courseMentorIds: string[];
    edited: boolean;
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    publicationDate: Date;
    isPublished: boolean;
    isGroupWork: boolean;
    hasErrors: boolean;
    changedTaskPublicationDates: Date[];
    tags: string[];
}

const useStyles = makeStyles(theme => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    form: {
        marginTop: "20px"
    }
}))


const EditHomework: FC = () => {
    const {homeworkId} = useParams()

    const [editHomework, setEditHomework] = useState<IEditHomeworkState>({
        isGroupWork: false,
        isLoaded: false,
        title: "",
        description: "",
        courseId: 0,
        courseMentorIds: [],
        edited: false,
        hasDeadline: false,
        deadlineDate: undefined,
        isDeadlineStrict: false,
        publicationDate: new Date(),
        isPublished: false,
        hasErrors: false,
        changedTaskPublicationDates: [],
        tags: []
    })

    useEffect(() => {
        getHomework()
    }, [])

    const getHomework = async () => {
        const homework = await ApiSingleton.homeworksApi.apiHomeworksGetForEditingByHomeworkIdGet(+homeworkId!)

        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(homework.courseId!)

        const deadline = homework.deadlineDate == undefined
            ? undefined
            : new Date(homework.deadlineDate)

        setEditHomework((prevState) => ({
            ...prevState,
            isLoaded: true,
            isGroupWork: homework.isGroupWork!,
            title: homework.title!,
            description: homework.description!,
            courseId: homework.courseId!,
            courseMentorIds: course.mentors!.map(x => x.userId!),
            hasDeadline: homework.hasDeadline!,
            deadlineDate: deadline,
            isDeadlineStrict: homework.isDeadlineStrict!,
            publicationDate: new Date(homework.publicationDate!),
            isPublished: !homework.isDeferred,
            hasErrors: false,
            tags: homework.tags!,
            changedTaskPublicationDates: homework.tasks!
                .filter(t => t.publicationDate != undefined)
                .map(t => new Date(t.publicationDate!)),
        }))
    }
    const handleSubmit = async (e: any) => {
        e.preventDefault()

        await ApiSingleton.homeworksApi
            .apiHomeworksUpdateByHomeworkIdPut(+homeworkId!, editHomework)
        setEditHomework((prevState) => ({
            ...prevState,
            edited: true
        }))
    }

    const handleTagsChange = (newValue: string[]) => {
        setEditHomework((prevState) => ({
            ...prevState,
            tags: newValue
        }))
    };

    const classes = useStyles()

    const isSomeTaskSoonerThanHomework = editHomework.changedTaskPublicationDates
        .some(d => d < editHomework.publicationDate)

    if (editHomework.edited) {
        return <Navigate to={"/courses/" + editHomework.courseId}/>;
    }

    if (editHomework.isLoaded) {
        if (!editHomework.courseMentorIds.includes(ApiSingleton.authService.getUserId())) {
            return (
                <Typography variant="h6" gutterBottom>
                    Только преподаватель может редактировать домашнюю работу
                </Typography>
            );
        }
        return (
            <Grid container justifyContent="center">
                <Grid item xs={9}>
                    <Grid container style={{marginTop: '20px'}}>
                        <Grid item xs={11}>
                            <Link
                                style={{color: '#212529'}}
                                to={"/courses/" + editHomework.courseId.toString()}
                            >
                                <Typography>
                                    Назад к курсу
                                </Typography>
                            </Link>
                        </Grid>
                    </Grid>

                    <div className={classes.logo}>
                        <div>
                            <EditIcon style={{color: 'red'}}/>
                        </div>
                        <div>
                            <Typography style={{fontSize: '22px'}}>
                                Редактировать домашнее задание
                            </Typography>
                        </div>
                    </div>
                    <form
                        onSubmit={(e) => handleSubmit(e)}
                        className={classes.form}
                    >
                        <Grid container spacing={1}>
                            <Grid container xs={"auto"} spacing={1} direction={"row"}>
                                <Grid item>
                                    <TextField
                                        required
                                        fullWidth
                                        style={{width: '300px'}}
                                        label="Название задания"
                                        variant="outlined"
                                        margin="normal"
                                        value={editHomework.title}
                                        onChange={(e) => {
                                            e.persist()
                                            setEditHomework((prevState) => ({
                                                ...prevState,
                                                title: e.target.value,
                                            }))
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={11}>
                                <TextFieldWithPreview
                                    multiline
                                    fullWidth
                                    minRows={7}
                                    maxRows="20"
                                    label="Условие задания"
                                    variant="outlined"
                                    margin="normal"
                                    value={editHomework.description}
                                    onChange={(e) => {
                                        e.persist()
                                        setEditHomework((prevState) => ({
                                            ...prevState,
                                            description: e.target.value
                                        }))
                                    }}
                                />
                            </Grid>
                            <Grid item xs={11} style={{marginBottom: 15}}>
                                <Tags editFlag={true} tags={editHomework.tags} courseId={editHomework.courseId} onTagsChange={handleTagsChange}/>
                                <PublicationAndDeadlineDates
                                    hasDeadline={editHomework.hasDeadline}
                                    isDeadlineStrict={editHomework.isDeadlineStrict}
                                    publicationDate={editHomework.publicationDate}
                                    deadlineDate={editHomework.deadlineDate}
                                    disabledPublicationDate={editHomework.isPublished}
                                    onChange={(state) => setEditHomework(prevState => ({
                                        ...prevState,
                                        hasDeadline: state.hasDeadline,
                                        isDeadlineStrict: state.isDeadlineStrict,
                                        publicationDate: state.publicationDate,
                                        deadlineDate: state.deadlineDate,
                                        hasErrors: state.hasErrors
                                    }))}
                                />
                            </Grid>
                            {isSomeTaskSoonerThanHomework &&
                                <Grid item xs={11}>
                                    <Alert severity="error">
                                        Дата публикации домашнего задания позже даты публикации задачи
                                    </Alert>
                                </Grid>}
                            <Grid item xs={11}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    type="submit"
                                    disabled={isSomeTaskSoonerThanHomework || editHomework.hasErrors}
                                >
                                    Редактировать
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Grid>
            </Grid>
        )
    }
    return (
        <div>

        </div>
    );
}

export default EditHomework
