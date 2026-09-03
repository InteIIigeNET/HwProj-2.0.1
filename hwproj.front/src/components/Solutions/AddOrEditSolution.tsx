import * as React from 'react';
import {FC, useState} from 'react';
import ApiSingleton from "../../api/ApiSingleton";
import {
    AccountDataDto,
    FileInfoDTO,
    GetSolutionModel,
    HomeworkTaskViewModel,
    PostSolutionModel,
    SolutionState,
} from "@/api";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography
} from "@mui/material";
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import {MarkdownEditor} from "../Common/MarkdownEditor";
import {TestTag} from "../Common/HomeworkTags";
import {LoadingButton} from "@mui/lab";
import TextField from "@mui/material/TextField";
import FilesUploader from '../Files/FilesUploader';
import {CourseUnitType} from '../Files/CourseUnitType';
import FileInfoConverter from "@/components/Utils/FileInfoConverter";
import {FilesHandler} from "@/components/Files/FilesHandler";

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
    onStartProcessing: (solutionId: number,
        courseUnitType: CourseUnitType,
        previouslyExistingFilesCount: number,
        waitingNewFilesCount: number,
        deletingFilesIds: number[]) => void,
}

// Оформление согласовано с редизайном страницы решений: те же радиусы, мягкий индиго-акцент и компактные подсказки
const titleIconSx = {
    width: 36,
    height: 36,
    flexShrink: 0,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f2fc",
    color: "#3f51b5",
}

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

// Подсказка под полем — это уточнение, а не отдельный блок: убираем лишнюю высоту стандартного Alert
const hintAlertSx = {
    mt: 1,
    py: 0,
    borderRadius: "10px",
    alignItems: "center",
    "& .MuiAlert-icon": {py: 0.75, mr: 1},
    "& .MuiAlert-message": {py: 0.75, fontSize: "0.8125rem"},
}

const actionButtonSx = {
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 500,
    px: 2,
}

// У редактора markdown отступы заданы инлайном — гасим их, чтобы вертикальный ритм задавал Stack
const editorBlockSx = {
    "& > div[data-color-mode]": {marginTop: "0 !important", marginBottom: "12px !important"},
}

const AddOrEditSolution: FC<IAddSolutionProps> = (props) => {
    const {lastSolution} = props
    const isEdit = lastSolution?.state === SolutionState.NUMBER_0
    const lastGroup = lastSolution?.groupMates?.map(x => x.userId!) || []

    const [solution, setSolution] = useState<PostSolutionModel>({
        githubUrl: lastSolution?.githubUrl || "",
        comment: isEdit ? lastSolution!.comment : "",
        groupMateIds: lastGroup
    })

    const [disableSend, setDisableSend] = useState(false)

    const maxFilesCount = 5;

    const filesInfo = isEdit ? FileInfoConverter.getCourseUnitFilesInfo(props.courseFilesInfo, CourseUnitType.Solution, lastSolution.id!) : []
    const {filesState, setFilesState, handleFilesChange} = FilesHandler(filesInfo);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setDisableSend(true)

        let solutionId = await ApiSingleton.solutionsApi.solutionsPostSolution(props.task.id!, solution)
        await handleFilesChange(props.courseId, CourseUnitType.Solution, solutionId,
            props.onStartProcessing,
            props.onAdd
        );
    }

    const {githubUrl} = solution
    const isTest = props.task.tags?.includes(TestTag)
    const showTestGithubInfo = isTest && githubUrl?.startsWith("https://github") && githubUrl.includes("/pull/")
    const courseMates = props.students.filter(s => props.userId !== s.userId)

    return (
        <Dialog fullWidth
                maxWidth="md"
                open={true}
                PaperProps={{sx: {borderRadius: "16px"}}}
                onClose={() => props.onCancel()} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title" sx={{px: 3, py: 2}}>
                <Stack direction={"row"} alignItems={"center"} spacing={1.5}>
                    <Box sx={titleIconSx}>
                        {isEdit ? <EditOutlinedIcon fontSize={"small"}/> : <SendOutlinedIcon fontSize={"small"}/>}
                    </Box>
                    <Box sx={{minWidth: 0}}>
                        <Typography sx={{fontSize: "1.1rem", fontWeight: 500, lineHeight: 1.3}}>
                            {isEdit ? "Изменить решение" : "Отправить решение"}
                        </Typography>
                        {props.task.title &&
                            <Typography variant={"caption"} sx={{color: "text.secondary", wordBreak: "break-word"}}>
                                {props.task.title}
                            </Typography>}
                    </Box>
                </Stack>
            </DialogTitle>
            <Divider/>
            <DialogContent sx={{px: 3, pt: 2.5}}>
                <Stack direction={"column"} spacing={2}>
                    <Box>
                        <TextField
                            fullWidth
                            label="Ссылка на решение"
                            variant="outlined"
                            sx={inputSx}
                            value={solution.githubUrl}
                            onChange={(e) => {
                                e.persist()
                                setSolution((prevState) => ({
                                    ...prevState,
                                    githubUrl: e.target.value?.trim(),
                                }))
                            }}
                        />
                        {showTestGithubInfo &&
                            <Alert sx={hintAlertSx} severity="info">
                                Для данного решения будет сохранена информация о коммитах на момент отправки.
                                Убедитесь, что работа закончена, и отправьте решение в конце.
                            </Alert>}
                        {!isEdit && githubUrl === lastSolution?.githubUrl && !showTestGithubInfo &&
                            <Alert sx={hintAlertSx} severity="info">
                                Ссылка взята из предыдущего решения
                            </Alert>}
                    </Box>
                    {props.supportsGroup && <Box>
                        <Autocomplete
                            multiple
                            id="tags-outlined"
                            sx={inputSx}
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
                            <Alert sx={hintAlertSx} severity="info">
                                Команда взята из предыдущего решения
                            </Alert>}
                    </Box>}
                    <Box sx={editorBlockSx}>
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
                            maxFilesCount={maxFilesCount}
                        />
                    </Box>
                </Stack>
            </DialogContent>
            <Divider/>
            <DialogActions sx={{px: 3, py: 2}}>
                {!disableSend && <Button
                    size="medium"
                    onClick={() => props.onCancel()}
                    variant="text"
                    color="inherit"
                    sx={actionButtonSx}
                >
                    Отменить
                </Button>}
                <LoadingButton
                    size="medium"
                    variant="contained"
                    color="primary"
                    type="submit"
                    disableElevation
                    loading={disableSend}
                    sx={actionButtonSx}
                    onClick={e => handleSubmit(e)}
                >
                    {isEdit ? "Изменить решение" : "Отправить решение"}
                </LoadingButton>
            </DialogActions>
        </Dialog>
    )
}

export default AddOrEditSolution
