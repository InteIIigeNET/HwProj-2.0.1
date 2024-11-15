import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {AccountDataDto, HomeworkTaskViewModel, SolutionViewModel} from "../../api";
import {FC, useState} from "react";
import {Alert, Autocomplete, Grid, DialogContent, Dialog, DialogTitle, DialogActions} from "@mui/material";
import {TextFieldWithPreview} from "../Common/TextFieldWithPreview";
import {TestTag} from "../Common/HomeworkTags";

interface IAddSolutionProps {
    userId: string
    lastSolutionUrl: string | undefined,
    lastGroup: string[],
    task: HomeworkTaskViewModel,
    supportsGroup: boolean,
    students: AccountDataDto[]
    onAdd: () => void,
    onCancel: () => void,
}

const AddSolution: FC<IAddSolutionProps> = (props) => {

    const [solution, setSolution] = useState<SolutionViewModel>({
        githubUrl: props.lastSolutionUrl || "",
        comment: "",
        groupMateIds: props.lastGroup || []
    })

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await ApiSingleton.solutionsApi.apiSolutionsByTaskIdPost(props.task.id!, solution)
        props.onAdd()
    }

    const {githubUrl} = solution
    const isTest = props.task.tags?.includes(TestTag)
    const showTestGithubInfo = isTest && githubUrl?.startsWith("https://github") && githubUrl.includes("/pull/")
    const courseMates = props.students.filter(s => props.userId !== s.userId)

    return (
        <Dialog open={true} onClose={() => props.onCancel()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">
                Отправить новое решение
            </DialogTitle>
            <DialogContent>
                <Grid style={{marginTop: 10}} container xs={12}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            required
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
                            <Alert sx={{paddingTop: 0, paddingBottom: 0, marginTop: 0.2}} severity="info">
                                Для данного решения будет сохранена информация о коммитах на момент отправки.
                                <br/>
                                Убедитесь, что работа закончена, и отправьте решение в конце.
                            </Alert>}
                        {githubUrl === props.lastSolutionUrl && !showTestGithubInfo &&
                            <Alert sx={{paddingTop: 0, paddingBottom: 0, marginTop: 0.2}} severity="info">Ссылка
                                взята из предыдущего
                                решения</Alert>}
                    </Grid>
                    {props.supportsGroup && <Grid item xs={12} style={{marginTop: '16px'}}>
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
                        {props.lastGroup?.length > 0 && solution.groupMateIds === props.lastGroup &&
                            <Alert sx={{paddingTop: 0, paddingBottom: 0, marginTop: 0.2}} severity="info">Команда
                                взята из предыдущего
                                решения</Alert>}
                    </Grid>}
                    <Grid item xs={12} style={{marginTop: '16px'}}>
                        <TextFieldWithPreview
                            multiline
                            fullWidth
                            minRows={4}
                            maxRows={20}
                            margin="normal"
                            label="Комментарий"
                            variant="outlined"
                            previewStyle={{borderColor: "GrayText"}}
                            value={solution.comment}
                            onChange={(e) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    comment: e.target.value,
                                }))
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    type="submit"
                    onClick={e => handleSubmit(e)}
                >
                    Отправить решение
                </Button>
                <Button
                    size="small"
                    onClick={() => props.onCancel()}
                    variant="contained"
                    color="primary"
                >
                    Отменить
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddSolution
