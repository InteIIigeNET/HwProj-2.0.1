import * as React from "react";
import {
  TextField,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
  FormControlLabel,
} from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import './Styles/CreateCourse.css';
import {FC, FormEvent, useState, useEffect} from "react";
import GroupIcon from '@material-ui/icons/Group';
import {makeStyles} from '@material-ui/core/styles';
import Container from "@material-ui/core/Container";
import {Navigate} from "react-router-dom";
import {CoursePreviewView} from "api";
import NameBuilder from "../Utils/NameBuilder";
import {LoadingButton} from "@mui/lab";
import {useSnackbar} from "notistack";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import {Checkbox} from "@mui/material";

interface ICreateCourseState {
  name: string;
  groupName?: string;
  baseCourseId: string;
  courseId: string;
  isLoading: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(7),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    marginTop: theme.spacing(3),
    width: '100%'
  },
  button: {
    marginTop: theme.spacing(1)
  },
}))

const CreateCourse: FC = () => {
  const [course, setCourse] = useState<ICreateCourseState>({
    name: "",
    groupName: "",
    baseCourseId: "",
    courseId: "",
    isLoading: false,
  })

  const [baseCourses, setBaseCourses] = useState<CoursePreviewView[]>()
  const [baseCoursesEnabled, setBaseCoursesEnabled] = useState<boolean>(false)

  const {enqueueSnackbar} = useSnackbar()

  useEffect(() => {
    const loadBaseCourses = async () => {
      try {
        const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses()
        setBaseCourses(userCourses)
      } catch (e) {
        setBaseCourses([])
        console.error("Ошибка при загрузке курсов лектора:", e)
        enqueueSnackbar("Не удалось загрузить существующие курсы", {variant: "warning", autoHideDuration: 4000})
      }
    };

    loadBaseCourses()
  }, [])

  const setCourseIsLoading = (isLoading: boolean) =>
    setCourse((prevState) =>
    ({
      ...prevState,
      isLoading: isLoading,
    }))

  const setBaseCourseId = (id: string) =>
    setCourse((prevState) =>
    ({
      ...prevState,
      baseCourseId: id,
    }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: true,
      baseCourseId: (course.baseCourseId && +course.baseCourseId) || undefined
    }
    try {
      setCourseIsLoading(true)
      const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel)
      setCourse((prevState) => ({
        ...prevState,
        isLoading: false,
        courseId: courseId.toString(),
      }))
    }
    catch (e) {
      setCourseIsLoading(false)
      console.error("Ошибка при создании курса:", e)
      const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
      enqueueSnackbar(responseErrors[0], {variant: "error"})
    }
  }

  const classes = useStyles()

  if (!ApiSingleton.authService.isLecturer()) {
    return (
        <Typography component="h1" variant="h5">
          Страница не доступна
        </Typography>
    )
  }
  return course.courseId !== "" ?
      <Navigate to={`/courses/${course.courseId}/editHomeworks`}/>
      :
      (<Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <GroupIcon
              fontSize='large'
              style={{ color: 'white', backgroundColor: '#ecb50d' }}
              className={classes.avatar}
          />
          <Typography component="h1" variant="h5">
            Создать курс
          </Typography>
          <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                    required
                    label="Название курса"
                    variant="outlined"
                    fullWidth
                    name={course.name}
                    onChange={(e) =>
                    {
                      e.persist()
                      setCourse((prevState) => ({
                        ...prevState,
                        name: e.target.value
                      }))
                    }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                    label="Номер группы"
                    variant="outlined"
                    fullWidth
                    value={course.groupName}
                    onChange={(e) =>
                    {
                      e.persist()
                      setCourse((prevState) => ({
                        ...prevState,
                        groupName: e.target.value
                      }))
                    }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  label="На основе существующего курса"
                  control={
                    <Checkbox
                      checked={baseCoursesEnabled}
                      onChange={(e) =>
                      {
                        e.persist()
                        setBaseCoursesEnabled(e.target.checked)
                        setBaseCourseId("")
                      }}
                    />
                  }
                />
                <TextField
                  select
                  disabled={!baseCoursesEnabled}
                  label="Базовый курс"
                  variant="outlined"
                  fullWidth
                  value={course.baseCourseId}
                  onChange={(e) =>
                  {
                    e.persist()
                    setBaseCourseId(e.target.value)
                  }}
                >
                  {!baseCourses &&
                    <Grid item style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <CircularProgress/>
                      <Typography>Загрузка курсов...</Typography>
                    </Grid>
                  }
                  {baseCourses && !baseCourses.length &&
                    <Typography>
                      Базовых курсов не найдено &#128532;<br/>
                      Попробуйте создать курс с нуля
                    </Typography>
                  }
                  {baseCourses &&
                    baseCourses.map(course =>
                      <MenuItem value={course.id!}>
                        <Typography style={{ fontSize: "18px" }}>
                          {NameBuilder.getCourseFullName(course.name!, course.groupName)}
                        </Typography>
                      </MenuItem>
                    ).reverse()
                  }
                </TextField>
              </Grid>
            </Grid>
            <LoadingButton
                style={{ marginTop: '16px', color: "white", backgroundColor: "#3f51b5" }}
                fullWidth
                variant="contained"
                type="submit"
                loading={course.isLoading}
            >
              Создать курс
            </LoadingButton>
          </form>
        </div>
      </Container>
  )
}

export default CreateCourse
