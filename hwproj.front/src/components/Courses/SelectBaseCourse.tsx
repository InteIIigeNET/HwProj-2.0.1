import {FC, Dispatch, SetStateAction, ChangeEvent} from "react"
import {
  Grid,
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {ICreateCourseState} from "./ICreateCourseState";
import NameBuilder from "../Utils/NameBuilder";

interface ISelectBaseCourseProps {
  state: ICreateCourseState;
  setState: Dispatch<SetStateAction<ICreateCourseState>>;
}

const SelectBaseCourse: FC<ISelectBaseCourseProps> = (props: ISelectBaseCourseProps) => {
  const state = props.state
  const baseCourses = state.baseCourses!

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.persist()
    const index = e.target.value ? +e.target.value : undefined
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
          value={state.baseCourseIndex || ""}
          onChange={handleChange}
        >
          {!baseCourses.length &&
            <MenuItem value="" key={null}>
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
      <Grid item xs={12} style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="text"
          size="large"
          style={{ marginRight: 8 }}
          onClick={handleSkip}
        >
          Пропустить
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large" 
          disabled={state.baseCourseIndex === undefined}
          onClick={handleNext}
        >
          Далее
        </Button>
      </Grid>
    </Grid>
  )
}

export default SelectBaseCourse
