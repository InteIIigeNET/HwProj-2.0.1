import * as React from 'react';
import {FC, useState} from 'react';
import ApiSingleton from "../../api/ApiSingleton";
import {
    AccountDataDto,
    FileInfoDTO,
    GetSolutionModel,
    HomeworkTaskViewModel,
    SolutionState,
    SolutionViewModel
} from "@/api";
import {Alert, Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid} from "@mui/material";
import {MarkdownEditor} from "../Common/MarkdownEditor";
import {TestTag} from "../Common/HomeworkTags";
import {LoadingButton} from "@mui/lab";
import TextField from "@mui/material/TextField";
import FilesUploader from '../Files/FilesUploader';
import {IEditFilesState} from '../Homeworks/CourseHomeworkExperimental';
import {CourseUnitType} from '../Files/CourseUnitType';
import ErrorsHandler from "@/components/Utils/ErrorsHandler";
import {enqueueSnackbar} from "notistack";
import FileInfoConverter from "@/components/Utils/FileInfoConverter";

interface IAddSolutionProps {
    courseId: number
    userId: string
    lastSolution: GetSolutionModel | undefined,
    task: HomeworkTaskViewModel,
    supportsGroup: boolean,
    students: AccountDataDto[],
    courseFilesInfo: FileInfoDTO[],
    onAdd: () => void,
    onCancel: () => void,
    onStartProcessing: (solutionId: number, courseUnitType: CourseUnitType, previouslyExistingFilesCount: number, waitingNewFilesCount: number, deletingFilesIds: number[]) => void;
}

const AddOrEditSolution: FC<IAddSolutionProps> = (props) => {
    const { lastSolution } = props
    const isEdit = lastSolution?.state === SolutionState.NUMBER_0
    const lastGroup = lastSolution?.groupMates?.map(x => x.userId!) || []

    const [solution, setSolution] = useState<SolutionViewModel>({
        githubUrl: lastSolution?.githubUrl || "",
        comment: isEdit ? lastSolution!.comment : "",
        groupMateIds: lastGroup
    })

    const [disableSend, setDisableSend] = useState(false)

    const filesInfo = lastSolution?.id ? FileInfoConverter.getSolutionFilesInfo(props.courseFilesInfo, lastSolution.id) : []
    const initialFilesInfo = filesInfo.filter(x => x.id !== undefined)
    const [filesState, setFilesState] = useState<IEditFilesState>({
        initialFilesInfo: initialFilesInfo,
        selectedFilesInfo: filesInfo,
        isLoadingInfo: false
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setDisableSend(true)

        let solutionId = await ApiSingleton.solutionsApi.solutionsPostSolution(props.task.id!, solution)

        // Если какие-то файлы из ранее добавленных больше не выбраны, их потребуется удалить
        const deletingFileIds = filesState.initialFilesInfo.filter(initialFile =>
            initialFile.id && !filesState.selectedFilesInfo.some(sf => sf.id === initialFile.id))
            .map(fileInfo => fileInfo.id!)

        // Если какие-то файлы из выбранных сейчас не были добавлены раньше, они новые
        const newFiles = filesState.selectedFilesInfo.filter(selectedFile =>
            selectedFile.file && selectedFile.id == undefined).map(fileInfo => fileInfo.file!)

        // Если требуется, отправляем запрос на обработку файлов
        if (deletingFileIds.length + newFiles.length > 0) {
            try {
                await ApiSingleton.customFilesApi.processFiles({
                    courseId: props.courseId!,
                    courseUnitType: CourseUnitType.Solution,
                    courseUnitId: solutionId,
                    deletingFileIds: deletingFileIds,
                    newFiles: newFiles,
                });
            } catch (e) {
                const errors = await ErrorsHandler.getErrorMessages(e as Response);
                enqueueSnackbar(`Проблема при обработке файлов. ${errors[0]}`, {
                    variant: "warning",
                    autoHideDuration: 2000
                });
            }
        }
        if (deletingFileIds.length === 0 && newFiles.length === 0) {
            props.onAdd()
        } else {
            try {
                props.onAdd();
                props.onStartProcessing(
                    solutionId,
                    CourseUnitType.Solution,
                    filesState.initialFilesInfo.length,
                    newFiles.length,
                    deletingFileIds
                );
            } catch (e) {
                const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
                enqueueSnackbar(responseErrors[0], { variant: "warning", autoHideDuration: 4000 });
                props.onAdd()
            }
        }
    }

    const { githubUrl } = solution
    const isTest = props.task.tags?.includes(TestTag)
    const showTestGithubInfo = isTest && githubUrl?.startsWith("https://github") && githubUrl.includes("/pull/")
    const courseMates = props.students.filter(s => props.userId !== s.userId)

    return (
        <Dialog fullWidth
            maxWidth="md"
            open={true}
            onClose={() => props.onCancel()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Отправить новое решение
            </DialogTitle>
            <DialogContent>
                <Grid style={{ marginTop: 10 }} container xs={12}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Ссылка на решение"
                            variant="outlined"
                            value={solution.githubUrl}
                            onChange={(e) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    githubUrl: e.target.value,
                                }))
                            }}
                        />
                        {showTestGithubInfo &&
                            <Alert sx={{ paddingTop: 0, paddingBottom: 0, marginTop: 0.2 }} severity="info">
                                Для данного решения будет сохранена информация о коммитах на момент отправки.
                                <br />
                                Убедитесь, что работа закончена, и отправьте решение в конце.
                            </Alert>}
                        {!isEdit && githubUrl === lastSolution?.githubUrl && !showTestGithubInfo &&
                            <Alert sx={{ paddingTop: 0, paddingBottom: 0, marginTop: 0.2 }} severity="info">Ссылка
                                взята из предыдущего
                                решения</Alert>}
                    </Grid>
                    {props.supportsGroup && <Grid item xs={12} style={{ marginTop: '16px' }}>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            options={courseMates}
                            value={courseMates.filter(s => solution.groupMateIds?.includes(s.userId!))}
                            getOptionLabel={(option) => option.surname! + ' ' + option.name! + " / " + option.email!}
                            filterSelectedOptions
                            onChange={(e, values) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    groupMateIds: values.map(x => x.userId!)
                                }))
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Команда"
                                    placeholder="Совместно с"
                                />
                            )}
                        />
                        {!isEdit && lastGroup?.length > 0 && solution.groupMateIds === lastGroup &&
                            <Alert sx={{ paddingTop: 0, paddingBottom: 0, marginTop: 0.2 }} severity="info">Команда
                                взята из предыдущего
                                решения</Alert>}
                    </Grid>}
                    <Grid item xs={12} style={{ marginTop: '12px', marginBottom: -4 }}>
                        <MarkdownEditor
                            label={"Комментарий"}
                            value={solution.comment ?? ""}
                            previewMode={"live"}
                            onChange={(value) => {
                                setSolution((prevState) => ({
                                    ...prevState,
                                    comment: value
                                }))
                            }}
                        />
                        <FilesUploader
                            initialFilesInfo={filesState.selectedFilesInfo}
                            isLoading={filesState.isLoadingInfo}
                            onChange={(filesInfo) => {
                                setFilesState((prevState) => ({
                                    ...prevState,
                                    selectedFilesInfo: filesInfo
                                }));
                            }}
                            courseUnitType={CourseUnitType.Solution}
                            courseUnitId={lastSolution?.id !== undefined ? lastSolution.id : -1}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <LoadingButton
                    size="medium"
                    variant="text"
                    color="primary"
                    type="submit"
                    loading={disableSend}
                    onClick={e => handleSubmit(e)}
                >
                    {isEdit ? "Изменить решение" : "Отправить решение"}
                </LoadingButton>
                {!disableSend && <Button
                    size="medium"
                    onClick={() => props.onCancel()}
                    variant="text"
                    color="inherit"
                >
                    Отменить
                </Button>}
            </DialogActions>
        </Dialog>
    )
}

export default AddOrEditSolution
