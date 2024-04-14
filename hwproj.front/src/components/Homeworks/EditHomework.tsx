import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';
import {Button} from "@material-ui/core";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import {Alert, Checkbox, FormControlLabel, Grid, Typography, TextField} from "@mui/material";

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
    changedTaskPublicationDates: Date[]
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
        changedTaskPublicationDates: []
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
            changedTaskPublicationDates: homework.tasks!
                .filter(t => t.publicationDate != undefined)
                .map(t => new Date(t.publicationDate!))
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
            <Grid container className="container" justifyContent="center">
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
                        <EditIcon style={{color: 'red', marginRight: '0.5rem'}}/>
                    </div>
                    <div>
                        <Typography style={{fontSize: '22px', marginBottom: '10px'}}>
                            Редактировать домашнее задание
                        </Typography>
                    </div>
                </div>
                <form
                    onSubmit={(e) => handleSubmit(e)}
                    className={classes.form}
                >
                    <Grid container spacing={1}>
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
                        <Grid item xs={12}>
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
                        <Grid item style={{width: "90%", maxHeight: "45px"}}>
                            <FormControlLabel
                                label="Командное"
                                control={
                                    <Checkbox
                                        color="primary"
                                        checked={editHomework.isGroupWork}
                                        onChange={(e) => {
                                            setEditHomework(prevState => ({
                                                ...prevState,
                                                isGroupWork: e.target.checked,
                                            }))
                                        }}
                                    />
                                }
                            />
                        </Grid>
                        <Grid item style={{width: "90%", marginBottom: '20px'}}>
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
                        <Grid item xs={12}>
                            <Alert severity="error">
                                Дата публикации домашнего задания позже даты публикации задачи
                            </Alert>
                        </Grid>}

                        <Grid item xs={11}>
                            <Button
                                color="primary"
                                variant="contained"
                                style={{
                                    textTransform: 'none',
                                    fontSize: '0.9rem',
                                    borderRadius: '0.5rem'}}
                                startIcon={<EditIcon />}
                                type="submit"
                                disabled={isSomeTaskSoonerThanHomework || editHomework.hasErrors}
                            >
                                Редактировать домашнее задание
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Grid>
        )
    }
    return (
        <div>

        </div>
    );
}

export default EditHomework