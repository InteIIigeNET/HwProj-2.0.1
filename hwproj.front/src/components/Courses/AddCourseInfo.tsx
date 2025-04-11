import {FC, ChangeEvent} from "react"
import {
  Grid,
  TextField,
  Button,
} from "@material-ui/core";
import {LoadingButton} from "@mui/lab";
import {IStepComponentProps} from "./ICreateCourseState";

const AddCourseInfo: FC<IStepComponentProps> = ({state, setState}) => {
  const handleCourseNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    setState((prevState) => ({
      ...prevState,
      courseName: e.target.value,
    }))
  }

  const handleGroupNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    setState((prevState) => ({
      ...prevState,
      groupName: e.target.value,
    }))
  }

  const handleBack = () =>
    setState((prevState) => {
      const newSkippedSteps = prevState.skippedSteps
      newSkippedSteps.delete(prevState.activeStep - 1)
      return ({
        ...prevState,
        activeStep: prevState.activeStep - 1,
        skippedSteps: newSkippedSteps,
      })
    })

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
      <Grid item xs={12}>
        <TextField
          label="Номер группы"
          variant="outlined"
          fullWidth
          value={state.groupName}
          onChange={handleGroupNameChange}
        />
      </Grid>
      <Grid item xs={12} style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
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
            ":hover": { background: "#f7f8fc" },
          }}
          disabled={!state.courseName}
          loading={state.courseIsLoading}
        >
          Создать курс
        </LoadingButton>
      </Grid>
    </Grid>
  )
}

export default AddCourseInfo
