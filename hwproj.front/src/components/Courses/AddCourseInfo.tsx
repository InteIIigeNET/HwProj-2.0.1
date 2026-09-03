import React, {FC, ChangeEvent} from "react"
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Chip,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {IStepComponentProps} from "./ICreateCourseState";

const inputSx = {
    "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const actionButtonSx = {
    textTransform: "none",
    borderRadius: "10px",
    fontWeight: 500,
    px: 2,
}

// Подсказка прикреплена прямо под полем, поэтому без верхнего отступа
// и без лишней высоты стандартного Alert
const hintAlertSx = {
    mt: 0.25,
    py: 0,
    borderRadius: "10px",
    alignItems: "center",
    "& .MuiAlert-icon": {py: 0.75, mr: 1},
    "& .MuiAlert-message": {py: 0.75, fontSize: "0.8125rem"},
}

const optionRowSx = {
    px: 1.5,
    py: 1,
    border: "1px solid #e0e3e7",
    borderRadius: "12px",
}

const groupChipSx = {
    height: 26,
    borderRadius: "999px",
    "& .MuiChip-label": {px: 1, fontSize: "0.8125rem", fontWeight: 500},
}

const AddCourseInfo: FC<IStepComponentProps> = ({state, setState}) => {
    const handleCourseNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        e.persist()
        setState((prevState) => ({
            ...prevState,
            courseName: e.target.value,
        }))
    }

    const handleBack = () =>
        setState((prevState) => {
            const newCompletedSteps = prevState.completedSteps
            newCompletedSteps.delete(prevState.activeStep - 1)
            return ({
                ...prevState,
                activeStep: prevState.activeStep - 1,
                completedSteps: newCompletedSteps,
            })
        })

    const handleGroupSelection = (event: React.SyntheticEvent, newValue: string[]) => {
        setState(prev => ({
            ...prev,
            selectedGroups: newValue,
            isGroupFromList: newValue.some(group => isGroupFromList(group)),
            fetchStudents: newValue.every(group => state.groupNames.includes(group)) ? prev.fetchStudents : false,
        }));
    }

    const isGroupFromList = (group: string) => state.groupNames.includes(group);

    // Пока программа не выбрана из списка, группы и студентов из базы университета подтянуть нельзя
    const showProgramHint = !state.programNames.includes(state.programName)
    const canGoBack = !!state.baseCourses?.length

    return (
        <Stack spacing={2}>
            <TextField
                required
                fullWidth
                size={"small"}
                label="Название курса"
                variant="outlined"
                sx={inputSx}
                value={state.courseName}
                onChange={handleCourseNameChange}
            />
            {/* Подсказка прижата к полю программы, поэтому блок отделяем от следующего поля
                своим нижним отступом: верхний Stack задаёт margin-top детям и перебил бы mt */}
            <Box sx={{mb: 1}}>
                <Autocomplete
                    freeSolo
                    fullWidth
                    size={"small"}
                    sx={inputSx}
                    value={state.programName}
                    onChange={(_, newValue) => {
                        setState(prev => ({
                            ...prev,
                            programName: newValue || '',
                        }));
                    }}
                    options={state.programNames}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Название программы"
                            required={false}
                            variant="outlined"
                            fullWidth
                        />
                    )}
                />
                {showProgramHint &&
                    <Alert severity={"info"} sx={hintAlertSx}>
                        Выберите программу из списка, чтобы добавить группы и студентов из базы университета
                    </Alert>}
            </Box>
            <Autocomplete
                multiple
                freeSolo
                fullWidth
                size={"small"}
                sx={inputSx}
                value={state.selectedGroups}
                onChange={handleGroupSelection}
                options={state.programName ? state.groupNames : []}
                loading={state.fetchingGroups}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Название группы (групп)"
                        variant="outlined"
                        fullWidth
                        helperText={"После ввода нажмите Enter"}
                        placeholder={state.programName
                            ? "Выберите или введите название группы или нескольких групп"
                            : "Введите название группы или нескольких групп"}
                    />
                )}
                renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                        <Chip
                            {...getTagProps({index})}
                            key={option}
                            label={option}
                            size={"small"}
                            // введённые руками группы остаются серыми, из базы — индиго
                            color={isGroupFromList(option) ? "primary" : "default"}
                            sx={groupChipSx}
                        />
                    ))
                }
            />
            {state.isGroupFromList &&
                <Box sx={optionRowSx}>
                    <FormControlLabel
                        sx={{m: 0}}
                        control={
                            <Checkbox
                                checked={state.fetchStudents}
                                onChange={(e, checked) => {
                                    setState(prev => ({...prev, fetchStudents: checked}));
                                }}
                                color="primary"
                            />
                        }
                        label="Добавить студентов из выбранных групп"
                    />
                    <Typography variant={"caption"} sx={{display: "block", pl: 4, color: "text.secondary"}}>
                        Студенты подтянутся из базы университета — записываться на курс им не придётся
                    </Typography>
                </Box>}
            <Stack
                direction={"row"}
                alignItems={"center"}
                justifyContent={"flex-end"}
                spacing={1}
                sx={{pt: 0.5}}
            >
                {/* Кнопку скрываем условием, а не атрибутом hidden:
                    MUI задаёт кнопке display: inline-flex, и hidden на неё не действует */}
                {canGoBack &&
                    <Button variant="text" onClick={handleBack} sx={{...actionButtonSx, mr: "auto"}}>
                        Назад
                    </Button>}
                <LoadingButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    disableElevation
                    sx={actionButtonSx}
                    disabled={!state.courseName || state.selectedGroups.length === 0}
                    loading={state.courseIsLoading}
                >
                    Создать курс
                </LoadingButton>
            </Stack>
        </Stack>
    )
}

export default AddCourseInfo
