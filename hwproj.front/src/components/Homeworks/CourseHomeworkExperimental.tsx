import {CardContent, Chip, Divider, Grid, IconButton, TextField, Typography} from "@mui/material";
import {MarkdownEditor, MarkdownPreview} from "components/Common/MarkdownEditor";
import FilesPreviewList from "components/Files/FilesPreviewList";
import {IFileInfo} from "components/Files/IFileInfo";
import {FC, useEffect, useState} from "react"
import Utils from "services/Utils";
import {FileInfoDTO, HomeworkViewModel} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";
import UpdateFilesUtils from "../Utils/UpdateFilesUtils";
import Tags from "../Common/Tags";
import apiSingleton from "../../api/ApiSingleton";
import FilesUploader from "../Files/FilesUploader";
import PublicationAndDeadlineDates from "../Common/PublicationAndDeadlineDates";
import * as React from "react";
import EditIcon from "@mui/icons-material/Edit";
import {LoadingButton} from "@mui/lab";
import ErrorsHandler from "../Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";

export interface HomeworkAndFilesInfo {
    homework: HomeworkViewModel,
    filesInfo: IFileInfo[]
}

interface IEditHomeworkState {
    hasDeadline: boolean;
    deadlineDate: Date | undefined;
    isDeadlineStrict: boolean;
    publicationDate: Date;
}

interface IEditFilesState {
    initialFilesInfo: IFileInfo[]
    selectedFilesInfo: IFileInfo[]
    isLoadingInfo: boolean
}

const CourseHomeworkEditor: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    onUpdate: (update: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] }) => void
}> = (props) => {
    const speculativeHomework = props.homeworkAndFilesInfo.homework

    const [homeworkData, setHomeworkData] = useState<{
        homework: HomeworkViewModel,
        isLoaded: boolean
    }>({homework: speculativeHomework, isLoaded: false})

    useEffect(() => {
        ApiSingleton.homeworksApi
            .homeworksGetForEditingHomework(speculativeHomework.id!)
            .then(homework => setHomeworkData({homework, isLoaded: true}))
    }, [])

    const {homework, isLoaded} = homeworkData

    const filesInfo = props.homeworkAndFilesInfo.filesInfo
    const homeworkId = homework.id!
    const courseId = homework.courseId!

    const isPublished = !homework.isDeferred
    const deadline = homework.deadlineDate == null
        ? undefined
        : new Date(homework.deadlineDate)
    const changedTaskPublicationDates = homework.tasks!
        .filter(t => t.publicationDate != null)
        .map(t => new Date(t.publicationDate!))

    const [metadata, setMetadata] = useState<IEditHomeworkState>({
        hasDeadline: homework.hasDeadline!,
        deadlineDate: deadline,
        isDeadlineStrict: homework.isDeadlineStrict!,
        publicationDate: new Date(homework.publicationDate!),
    })
    const [title, setTitle] = useState<string>(homework.title!)
    const [tags, setTags] = useState<string[]>(homework.tags!)
    const [description, setDescription] = useState<string>(homework.description!)
    const [filesControlState, setFilesControlState] = useState<IEditFilesState>({
        initialFilesInfo: filesInfo,
        selectedFilesInfo: filesInfo,
        isLoadingInfo: false
    });
    const [hasErrors, setHasErrors] = useState<boolean>(false)

    const [handleSubmitLoading, setHandleSubmitLoading] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setHandleSubmitLoading(true)
        const updatedHomework = await ApiSingleton.homeworksApi.homeworksUpdateHomework(+homeworkId!, {
            title: title!,
            description: description,
            tags: tags,
            hasDeadline: metadata.hasDeadline,
            deadlineDate: metadata.deadlineDate,
            isDeadlineStrict: metadata.isDeadlineStrict,
            publicationDate: metadata.publicationDate
        })

        // Если какие-то файлы из ранее добавленных больше не выбраны, удаляем их из хранилища
        const deleteOperations = filesControlState.initialFilesInfo
            .filter(initialFile =>
                initialFile.key &&
                !filesControlState.selectedFilesInfo.some(s => s.key === initialFile.key)
            )
            .map(initialFile => UpdateFilesUtils.deleteFileWithErrorsHadling(courseId, initialFile));

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, загружаем их в хранилище
        const uploadOperations = filesControlState.selectedFilesInfo
            .filter(selectedFile =>
                selectedFile.file &&
                !filesControlState.initialFilesInfo.some(i => i.key === selectedFile.key)
            )
            .map(selectedFile => UpdateFilesUtils.uploadFileWithErrorsHadling(
                selectedFile.file!,
                courseId,
                +homeworkId!)
            );

        // Дожидаемся удаления и загрузки необходимых файлов
        await Promise.all([...deleteOperations, ...uploadOperations])

        if (deleteOperations.length === 0 && uploadOperations.length === 0) {
            props.onUpdate({homework: updatedHomework.value!, fileInfos: filesControlState.selectedFilesInfo})
        } else {
            try {
                const newFilesDtos = await ApiSingleton.filesApi.filesGetFilesInfo(courseId, homeworkId!)
                props.onUpdate({homework: updatedHomework.value!, fileInfos: newFilesDtos})
            } catch (e) {
                const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
                enqueueSnackbar(responseErrors[0], {variant: "warning", autoHideDuration: 4000});
                props.onUpdate({homework: updatedHomework.value!, fileInfos: filesControlState.selectedFilesInfo})
            }
        }
    }

    const isSomeTaskSoonerThanHomework = changedTaskPublicationDates.some(d => d < metadata.publicationDate)
    const isDisabled = isSomeTaskSoonerThanHomework || hasErrors || !isLoaded

    return (
        <CardContent>
            <Grid container xs={"auto"} spacing={1} direction={"row"} justifyContent={"space-between"}
                  alignItems={"center"}>
                <Grid item>
                    <TextField
                        required
                        fullWidth
                        style={{width: '300px'}} //TODO
                        label="Название задания"
                        variant="standard"
                        margin="normal"
                        value={title}
                        onChange={(e) => {
                            e.persist()
                            setTitle(e.target.value)
                        }}
                    />
                </Grid>
                <Grid item xs={6} style={{marginTop: 6}}>
                    <Tags tags={tags} onTagsChange={newTags => setTags(newTags)} isElementSmall={false}
                          requestTags={() => apiSingleton.coursesApi.coursesGetAllTagsForCourse(courseId)}/>
                </Grid>
            </Grid>
            <Grid container>
                <Grid item xs={12} style={{marginBottom: "5px", marginTop: -2}}>
                    <MarkdownEditor
                        label={"Условие задания"}
                        height={240}
                        maxHeight={400}
                        value={description}
                        onChange={(value) => {
                            setDescription(value)
                        }}
                    />
                </Grid>
                <Grid item xs={12} style={{marginBottom: "15px"}}>
                    <Grid container direction="column">
                        <FilesUploader
                            initialFilesInfo={filesControlState.selectedFilesInfo}
                            isLoading={filesControlState.isLoadingInfo}
                            onChange={(filesInfo) => {
                                setFilesControlState((prevState) => ({
                                    ...prevState,
                                    selectedFilesInfo: filesInfo
                                }))
                            }}
                        />
                        <PublicationAndDeadlineDates
                            hasDeadline={metadata.hasDeadline}
                            isDeadlineStrict={metadata.isDeadlineStrict}
                            publicationDate={metadata.publicationDate}
                            deadlineDate={metadata.deadlineDate}
                            autoCalculatedDeadline={undefined}
                            disabledPublicationDate={isPublished}
                            onChange={(state) => {
                                setMetadata({
                                    hasDeadline: state.hasDeadline,
                                    isDeadlineStrict: state.isDeadlineStrict,
                                    publicationDate: state.publicationDate,
                                    deadlineDate: state.deadlineDate,
                                })
                                setHasErrors(state.hasErrors)
                            }}
                        />
                    </Grid>
                </Grid>
                <LoadingButton
                    fullWidth
                    onClick={handleSubmit}
                    color="primary"
                    variant="contained"
                    type="submit"
                    disabled={isDisabled}
                    loadingPosition="end"
                    endIcon={<span style={{width: 17}}/>}
                    loading={handleSubmitLoading}
                    style={isDisabled ? undefined : {color: "white", backgroundColor: "#3f51b5"}}
                >
                    Редактировать задание
                </LoadingButton>
            </Grid>
        </CardContent>
    )
}

const CourseHomeworkExperimental: FC<{
    homeworkAndFilesInfo: HomeworkAndFilesInfo,
    isMentor: boolean,
    onUpdate: (x: { homework: HomeworkViewModel, fileInfos: FileInfoDTO[] }) => void
}> = (props) => {
    const {homework, filesInfo} = props.homeworkAndFilesInfo
    const deferredHomeworks = homework.tasks!.filter(t => t.isDeferred!)
    const tasksCount = homework.tasks!.length
    const [showEditMode, setShowEditMode] = useState(false)
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setEditMode(false)
    }, [homework.id])

    if (editMode) return <CourseHomeworkEditor
        homeworkAndFilesInfo={{homework, filesInfo}}
        onUpdate={update => {
            setEditMode(false)
            props.onUpdate(update)
        }}
    />

    return <CardContent
        onMouseEnter={() => setShowEditMode(props.isMentor)}
        onMouseLeave={() => setShowEditMode(false)}>
        <Grid xs={12} container direction={"row"} alignItems={"center"} alignContent={"center"}
              justifyContent={"space-between"}>
            <Grid item container spacing={1} xs={11}>
                <Grid item>
                    <Typography variant="h6" component="div">
                        {homework.title}
                    </Typography>
                </Grid>
                {props.isMentor && deferredHomeworks!.length > 0 &&
                    <Grid item><Chip label={"🕘 " + deferredHomeworks!.length}/></Grid>
                }
                {tasksCount > 0 && <Grid item>
                    <Chip
                        label={tasksCount + " " + Utils.pluralizeHelper(["Задание", "Задания", "Заданий"], tasksCount)}/>
                </Grid>}
                {homework.tags?.filter(t => t !== '').map((tag, index) => (
                    <Grid item key={index}>
                        <Chip key={index} label={tag}/>
                    </Grid>
                ))}
            </Grid>
            {showEditMode && <Grid item>
                <IconButton onClick={() => {
                    setEditMode(true)
                    setShowEditMode(false)
                }}>
                    <EditIcon color={"primary"} fontSize={"small"}/>
                </IconButton>
            </Grid>}
        </Grid>
        <Divider style={{marginTop: 15, marginBottom: 15}}/>
        <Typography component="div" style={{color: "#454545"}} gutterBottom variant="body1">
            <MarkdownPreview value={homework.description!}/>
        </Typography>
        {
            filesInfo && filesInfo.length > 0 &&
            <div>
                <FilesPreviewList
                    filesInfo={filesInfo}
                    onClickFileInfo={async (fileInfo: IFileInfo) => {
                        const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.key!)
                        window.open(url, '_blank');
                    }}
                />
            </div>
        }
    </CardContent>
}
export default CourseHomeworkExperimental;