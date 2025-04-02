import {FC, Dispatch, SetStateAction, ChangeEvent} from "react"
import {
  Grid,
  TextField,
  Button,
} from "@material-ui/core";
import {LoadingButton} from "@mui/lab";
import {ICreateCourseState} from "./ICreateCourseState";

interface IAddCourseInfoProps {
  state: ICreateCourseState;
  setState: Dispatch<SetStateAction<ICreateCourseState>>;
}

const AddCourseInfo: FC<IAddCourseInfoProps> = (props: IAddCourseInfoProps) => {
  const state = props.state

  const handleCourseNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    props.setState((prevState) => ({
      ...prevState,
      courseName: e.target.value,
    }))
  }

  const handleGroupNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    props.setState((prevState) => ({
      ...prevState,
      groupName: e.target.value,
    }))
  }

  const handleBack = () =>
    props.setState((prevState) => {
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
          variant="contained"
          size="large"
          sx={{ marginLeft: "auto", background: "#3f51b5", color: "white" }}
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
