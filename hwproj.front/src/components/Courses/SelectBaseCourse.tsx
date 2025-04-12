import {FC, SyntheticEvent} from "react"
import {
  Grid,
  Box,
  TextField,
  Button,
} from "@material-ui/core";
import {Autocomplete, MenuItem} from "@mui/material";
import {Link} from "react-router-dom";
import {CoursePreviewView} from "api";
import {IStepComponentProps} from "./ICreateCourseState";
import NameBuilder from "../Utils/NameBuilder";

const SelectBaseCourse: FC<IStepComponentProps> = ({state, setState}) => {
  const baseCourses = state.baseCourses!.toReversed()
  const selectedBaseCourse = state.selectedBaseCourse

  const handleChange = (e: SyntheticEvent<Element, Event>, value: CoursePreviewView | null) => {
    e.persist()
    setState((prevState) => ({
      ...prevState,
      selectedBaseCourse: value || undefined,
    }))
  }

  const handleSkip = () =>
    setState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
      courseName: "",
      groupName: "",
    }))

  const handleNext = () =>
    setState((prevState) => ({
      ...prevState,
      activeStep: prevState.activeStep + 1,
      completedSteps: prevState.completedSteps.add(prevState.activeStep),
      courseName: selectedBaseCourse!.name!,
      groupName: selectedBaseCourse!.groupName!,
    }))

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Autocomplete<CoursePreviewView>
          value={selectedBaseCourse || null}
          options={baseCourses}
          getOptionLabel={course => (course.groupName && course.groupName + ", ") + course.name!}
          getOptionKey={course => course.id!}
          renderInput={props => (
            <TextField
              {...props}
              fullWidth
              label="Базовый курс"
              variant="outlined"
            />
          )}
          renderOption={(props, course) => (
            <MenuItem {...props}>
              <Box style={{ fontSize: "18px" }}>
                {NameBuilder.getCourseFullName(course.name!, course.groupName)}
              </Box>
            </MenuItem>
          )}
          onChange={handleChange}
        />
      </Grid>
      <Grid item xs={12} style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
        {selectedBaseCourse &&
          <Link to={`/courses/${selectedBaseCourse.id!}`} target="_blank" rel="noopener noreferrer">
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
            hidden={!!selectedBaseCourse}
            onClick={handleSkip}
          >
            Пропустить
          </Button>
          <Button
            variant="text"
            color="primary"
            size="large" 
            disabled={!selectedBaseCourse}
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
