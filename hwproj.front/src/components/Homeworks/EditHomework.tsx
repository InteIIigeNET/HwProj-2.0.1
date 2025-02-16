import * as React from "react";
import {Navigate, Link, useParams} from "react-router-dom";
import ApiSingleton from "../../api/ApiSingleton";
import {FC, useEffect, useState} from "react";
import {makeStyles} from "@material-ui/styles";
import EditIcon from '@material-ui/icons/Edit';
import {Button} from "@material-ui/core";
import {MarkdownEditor} from "../Common/MarkdownEditor";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import Tags from "../Common/Tags";
import {Grid, Typography, TextField, CircularProgress} from "@mui/material";
import apiSingleton from "../../api/ApiSingleton";
import FilesUploader from "components/Files/FilesUploader";
import {IFileInfo} from "components/Files/IFileInfo";
import FileInfoConverter from "components/Utils/FileInfoConverter";
import UpdateFilesUtils from "components/Utils/UpdateFilesUtils";

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
    tags: string[]
}

interface IHomeworkFilesState {
    initialFilesInfo: IFileInfo[]
    selectedFilesInfo: IFileInfo[]
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
        tags: [],
        changedTaskPublicationDates: []
    })
    const [filesControlState, setFilesControlState] = useState<IHomeworkFilesState>({
        initialFilesInfo: [],
        selectedFilesInfo: []
    });
    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false);

    useEffect(() => {
        getHomework()
    }, [])

    const getHomework = async () => {
        const homework = await ApiSingleton.homeworksApi.homeworksGetForEditingHomework(+homeworkId!)
        const course = await ApiSingleton.coursesApi.coursesGetCourseData(homework.courseId!)
        const deadline = homework.deadlineDate == null
            ? undefined
            : new Date(homework.deadlineDate)

        await fetchAndSetHomeworkFiles(course.id!, +homeworkId!)

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
                .filter(t => t.publicationDate != null)
                .map(t => new Date(t.publicationDate!))
        }))
    }

    const fetchAndSetHomeworkFiles = async (courseId: number, homeworkId: number) => {
        const homeworkFiles = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, homeworkId)
        if (homeworkFiles.length > 0) {
            const filesInfo = FileInfoConverter.fromFileInfoDTOArray(homeworkFiles)
            setFilesControlState((prevState) => ({
                ...prevState,
                initialFilesInfo: filesInfo,
                selectedFilesInfo: filesInfo
            }))
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        await ApiSingleton.homeworksApi.homeworksUpdateHomework(+homeworkId!, editHomework)
        
        // Если какие-то файлы из ранее добавленных больше не выбраны, удаляем их из хранилища
        const deleteOperations = filesControlState.initialFilesInfo
            .filter(initialFile =>
                initialFile.key &&
                !filesControlState.selectedFilesInfo.some(s => s.key === initialFile.key)
            )
            .map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(initialFile));

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, загружаем их в хранилище
        const uploadOperations = filesControlState.selectedFilesInfo
            .filter(selectedFile =>
                selectedFile.file &&
                !filesControlState.initialFilesInfo.some(i => i.key === selectedFile.key)
            )
            .map(selectedFile => UpdateFilesUtils.uploadFileWithErrorsHadling(
                selectedFile.file!,
                editHomework.courseId,
                +homeworkId!)
            );
        
        // Дожидаемся удаления и загрузки необходимых файлов
        await Promise.all([...deleteOperations, ...uploadOperations]);

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
                    Только преподаватель может редактировать задание
                </Typography>
            );
        }
        return (
            <Grid container className="container" justifyContent="center">
                <Grid container style={{marginTop: '20px'}}>
                    <Grid item xs={12}>
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
                        <EditIcon color='primary' style={{marginRight: '0.5rem'}}/>
                    </div>
                    <div>
                        <Typography style={{fontSize: '22px'}}>
                            Редактировать задание
                        </Typography>
                    </div>
                </div>
                <form
                    onSubmit={(e) => handleSubmit(e)}
                    className={classes.form}
                >
                    <Grid container>
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
                        <Grid item xs={12} style={{marginBottom: "5px", marginTop: -2}}>
                            <MarkdownEditor
                                label={"Условие задания"}
                                height={240}
                                maxHeight={400}
                                value={editHomework.description}
                                onChange={(value) => {
                                    setEditHomework((prevState) => ({
                                        ...prevState,
                                        description: value
                                    }))
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} style={{marginBottom: "15px"}}>
                            <Tags tags={editHomework.tags} onTagsChange={handleTagsChange} isElementSmall={false}
                                  requestTags={() => apiSingleton.coursesApi.coursesGetAllTagsForCourse(editHomework.courseId)}/>
                            <Grid
                                container
                                direction="row"
                                justifyContent="space-between"
                            >
                                <Grid item>
                                    <PublicationAndDeadlineDates
                                        hasDeadline={editHomework.hasDeadline}
                                        isDeadlineStrict={editHomework.isDeadlineStrict}
                                        publicationDate={editHomework.publicationDate}
                                        deadlineDate={editHomework.deadlineDate}
                                        autoCalculatedDeadline={undefined}
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
                                <Grid item style={{marginTop: "12px"}}>
                                    <FilesUploader
                                        initialFilesInfo={filesControlState.selectedFilesInfo}
                                        onChange={(filesInfo) => {
                                            setFilesControlState((prevState) => ({
                                                ...prevState,
                                                selectedFilesInfo: filesInfo
                                            }))
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Button
                            fullWidth
                            color="primary"
                            variant="contained"
                            type="submit"
                            disabled={isSomeTaskSoonerThanHomework || editHomework.hasErrors}>
                            Редактировать задание
                        </Button>
                        {handleSubmitLoading &&
                            <div className="container" style={{marginTop: 10, textAlign: "center"}}>
                                <p>Сохраняем задание...</p>
                                <CircularProgress/>
                            </div>}
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
