import * as React from 'react';
import ApiSingleton from "../../api/ApiSingleton";
import { AccountDataDto, GetSolutionModel, HomeworkTaskViewModel, SolutionState, SolutionViewModel } from "@/api";
import { FC, useState } from "react";
import { Alert, Autocomplete, Grid, DialogContent, Dialog, DialogTitle, DialogActions, Button } from "@mui/material";
import { MarkdownEditor } from "../Common/MarkdownEditor";
import { TestTag } from "../Common/HomeworkTags";
import { LoadingButton } from "@mui/lab";
import TextField from "@mui/material/TextField";
import FilesUploader from '../Files/FilesUploader';
import { IEditFilesState } from '../Homeworks/CourseHomeworkExperimental';
import { IFileInfo } from '../Files/IFileInfo';
import { CourseUnitType } from '../Files/CourseUnitType';

interface IAddSolutionProps {
    userId: string
    lastSolution: GetSolutionModel | undefined,
    task: HomeworkTaskViewModel,
    supportsGroup: boolean,
    students: AccountDataDto[],
    filesInfo: IFileInfo[],
    onAdd: () => void,
    onCancel: () => void,
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

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setDisableSend(true)
        await ApiSingleton.solutionsApi.solutionsPostSolution(props.task.id!, solution)
        props.onAdd()
    }

    const { githubUrl } = solution
    const isTest = props.task.tags?.includes(TestTag)
    const showTestGithubInfo = isTest && githubUrl?.startsWith("https://github") && githubUrl.includes("/pull/")
    const courseMates = props.students.filter(s => props.userId !== s.userId)

    const initialFilesInfo = props.filesInfo.filter(x => x.id !== undefined)
    const [filesState, setFilesState] = useState<IEditFilesState>({
        initialFilesInfo: initialFilesInfo,
        selectedFilesInfo: props.filesInfo,
        isLoadingInfo: false
    });

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
                            courseUnitId={lastSolution?.id !== undefined ? lastSolution.id : 0} />
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
