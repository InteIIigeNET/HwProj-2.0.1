import {FC, ChangeEvent} from "react"
import {
  Grid,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {Link} from "react-router-dom";
import {IStepComponentProps} from "./ICreateCourseState";
import NameBuilder from "../Utils/NameBuilder";

const SelectBaseCourse: FC<IStepComponentProps> = (props) => {
  const state = props.state

  const baseCourses = state.baseCourses!

  const baseCourseId = state.baseCourseIndex !== undefined
    ? baseCourses[state.baseCourseIndex].id
    : undefined

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.persist()
    const index = e.target.value as unknown as (number | undefined)
    props.setState((prevState) => ({
      ...prevState,
      baseCourseIndex: index,
    }))
  }

  const handleSkip = () => {
    props.setState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
      skippedSteps: prevState.skippedSteps.add(prevState.activeStep),
      baseCourseIndex: undefined,
      courseName: "",
      groupName: "",
    }))
  }

  const handleNext = () => {
    const selectedCourse = baseCourses[state.baseCourseIndex!]
    props.setState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
      courseName: selectedCourse.name!,
      groupName: selectedCourse.groupName!,
    }))
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          select
          label="Базовый курс"
          fullWidth
          variant="outlined"
          value={state.baseCourseIndex !== undefined ? state.baseCourseIndex : ""}
          onChange={handleChange}
        >
          {!baseCourses.length &&
            <MenuItem value={undefined} key={undefined}>
              <Typography>
                Базовых курсов не найдено &#128532;<br/>
                Попробуйте создать курс с нуля
              </Typography>
            </MenuItem>
          }
          {baseCourses.map((course, index) =>
            <MenuItem value={index} key={index}>
              <Box style={{ fontSize: "20px" }}>
                {NameBuilder.getCourseFullName(course.name!, course.groupName)}
              </Box>
            </MenuItem>
          ).reverse()}
        </TextField>
      </Grid>
      <Grid item xs={12} style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
        {baseCourseId !== undefined &&
          <Link to={`/courses/${baseCourseId}`} target="_blank" rel="noopener noreferrer">
            <Button variant="text" size="large">
              Открыть курс
            </Button>
          </Link>
        }
        <Box style={{ marginLeft: "auto" }}>
          <Button
            variant="text"
            size="large"
            style={{ marginRight: 8 }}
            onClick={handleSkip}
          >
            Пропустить
          </Button>
          <Button
            variant="text"
            color="primary"
            size="large" 
            disabled={state.baseCourseIndex === undefined}
            onClick={handleNext}
          >
            Далее
          </Button>
        </Box>
      </Grid>
    </Grid>
  )
}

export default SelectBaseCourse
