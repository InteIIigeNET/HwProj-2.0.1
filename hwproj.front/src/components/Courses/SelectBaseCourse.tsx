import {FC, SyntheticEvent} from "react"
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import {Link} from "react-router-dom";
import {CoursePreviewView} from "api";
import {IStepComponentProps} from "./ICreateCourseState";
import {CourseTile} from "../Common/CourseTile";

const inputSx = {
  "& .MuiOutlinedInput-root": {borderRadius: "10px"},
}

const actionButtonSx = {
  textTransform: "none",
  borderRadius: "10px",
  fontWeight: 500,
  px: 2,
}

const optionNameSx = {
  fontSize: "0.9375rem",
  fontWeight: 500,
  lineHeight: 1.3,
}

const SelectBaseCourse: FC<IStepComponentProps> = ({state, setState}) => {
  const baseCourses = state.baseCourses!.slice().reverse()
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
    <Stack spacing={2}>
      <Box>
        <Autocomplete<CoursePreviewView>
          fullWidth
          size={"small"}
          value={selectedBaseCourse || null}
          options={baseCourses}
          // filter(Boolean): у курса может не быть группы, и тогда прежняя склейка давала «undefined, Название»
          getOptionLabel={course => [course.groupName, course.name].filter(Boolean).join(", ")}
          getOptionKey={course => course.id!}
          noOptionsText={"Нет подходящих курсов"}
          sx={inputSx}
          renderInput={props => (
            <TextField
              {...props}
              fullWidth
              label="Базовый курс"
              variant="outlined"
            />
          )}
          renderOption={(props, course) => (
            <Box component={"li"} {...props} key={course.id}>
              <Stack direction={"row"} alignItems={"center"} spacing={1.5} sx={{width: "100%", minWidth: 0}}>
                <CourseTile name={course.name ?? ""} size={32} fontSize={"0.75rem"} borderRadius={"10px"}/>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={optionNameSx}>{course.name}</Typography>
                  {course.groupName &&
                    <Typography variant={"caption"} noWrap sx={{display: "block", color: "text.secondary"}}>
                      {course.groupName}
                    </Typography>}
                </Box>
              </Stack>
            </Box>
          )}
          onChange={handleChange}
        />
        <Typography variant={"caption"} sx={{display: "block", mt: 1, color: "text.secondary"}}>
          Задания выбранного курса вместе с файлами скопируются в новый. Шаг можно пропустить и создать
          курс с нуля.
        </Typography>
      </Box>
      <Stack
        direction={"row"}
        alignItems={"center"}
        justifyContent={"flex-end"}
        spacing={1}
        flexWrap={"wrap"}
        sx={{rowGap: 1}}
      >
        {/* Ссылка на шаблон прижата влево, навигация шага — вправо */}
        {selectedBaseCourse &&
          <Button
            component={Link}
            to={`/courses/${selectedBaseCourse.id!}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="text"
            startIcon={<OpenInNewIcon/>}
            sx={{...actionButtonSx, mr: "auto"}}
          >
            Открыть курс
          </Button>}
        <Stack direction={"row"} alignItems={"center"} spacing={1}>
          {/* «Пропустить» скрываем условием, а не атрибутом hidden:
              MUI задаёт кнопке display: inline-flex, и hidden на неё не действует */}
          {!selectedBaseCourse &&
            <Button variant="text" onClick={handleSkip} sx={actionButtonSx}>
              Пропустить
            </Button>}
          <Button
            variant="contained"
            color="primary"
            disableElevation
            disabled={!selectedBaseCourse}
            onClick={handleNext}
            sx={actionButtonSx}
          >
            Далее
          </Button>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default SelectBaseCourse
