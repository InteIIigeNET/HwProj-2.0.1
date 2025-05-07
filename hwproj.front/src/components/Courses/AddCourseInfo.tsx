import React, {FC, ChangeEvent} from "react"
import {
    Grid,
    TextField,
    Button, Typography,
} from "@material-ui/core";
import {LoadingButton} from "@mui/lab";
import {IStepComponentProps} from "./ICreateCourseState";
import {MarkdownEditor} from '../Common/MarkdownEditor';
import {Alert, Autocomplete, Checkbox, FormControlLabel, Chip} from "@mui/material";

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

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    required
                    label="Название курса"
                    variant="outlined"
                    fullWidth
                    value={state.courseName}
                    onChange={handleCourseNameChange}
                />
            </Grid>
            <Grid item xs={12} style={{ marginTop: -15, marginBottom: -15 }}>
                <MarkdownEditor
                    label={"Описание курса"}
                    value={state.description}
                    onChange={(value) => {
                        setState((prevState) => ({
                            ...prevState,
                            description: value
                        }))
                    }}
                />
            </Grid>
            <Grid item xs={12}>
                <Autocomplete
                    freeSolo
                    value={state.programName}
                    onChange={(_, newValue) => {
                        setState(prev => ({
                            ...prev,
                            programName: newValue || '',
                            selectedGroups: [],
                            isGroupFromList: false,
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
                    fullWidth
                />
                <Alert severity={"info"}>Выберите программу из списка, чтобы иметь возможность выбрать группу и
                    студентов из базы студентов университета</Alert>
            </Grid>

            <Grid item xs={12}>
                <Autocomplete
                    multiple
                    freeSolo
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
                                label={option}
                                {...getTagProps({ index })}
                                color={isGroupFromList(option) ? "primary" : "default"}
                            />
                        ))
                    }
                    fullWidth
                />
            </Grid>

            {state.isGroupFromList && (
                <Grid item xs={12}>
                    <FormControlLabel
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
                </Grid>
            )}
            <Grid item xs={12} style={{marginTop: 8, display: "flex", justifyContent: "space-between"}}>
                <Button
                    variant="text"
                    size="large"
                    hidden={!state.baseCourses?.length}
                    onClick={handleBack}
                >
                    Назад
                </Button>
                <LoadingButton
                    type="submit"
                    variant="text"
                    size="large"
                    sx={{
                        marginLeft: "auto",
                        color: "#3f51b5",
                        ":hover": {background: "#f7f8fc"},
                    }}
                    disabled={!state.courseName || state.selectedGroups.length === 0}
                    loading={state.courseIsLoading}
                >
                    Создать курс
                </LoadingButton>
            </Grid>
        </Grid>
    )
}

export default AddCourseInfo
