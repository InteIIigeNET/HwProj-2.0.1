import * as React from "react";
import {
  TextField,
  Typography,
  Grid,
  MenuItem,
  CircularProgress,
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
import { LoadingButton } from "@mui/lab";

interface ICreateCourseState {
  name: string;
  groupName?: string;
  baseCourseId?: string;
  courseId: string;
  isLoading: boolean;
  errors: string[];
}

interface IBaseCoursesState {
  areLoaded: boolean;
  courses: CoursePreviewView[];
  errors: string[];
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
    courseId: "",
    isLoading: false,
    errors: [],
  })

  const [baseCourses, setBaseCourses] = useState<IBaseCoursesState>({
    areLoaded: false,
    courses: [],
    errors: [],
  })

  useEffect(() => {
    const loadBaseCourses = async () => {
      try {
        const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses()
        setBaseCourses ({
          areLoaded: true,
          courses: userCourses,
          errors: [],
        })
      } catch (e) {
        console.error("Ошибка при загрузке курсов лектора:", e)
        setBaseCourses ({
          areLoaded: true,
          courses: [],
          errors: ['Не удалось загрузить существующие курсы'],
        })
      }
    };

    loadBaseCourses()
  }, [])

  const setCourseIsLoading = () =>
    setCourse((prevState) =>
    ({
      ...prevState,
      isLoading: true,
    }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: true,
    }
    try {
      setCourseIsLoading()
      const courseId = course.baseCourseId !== undefined
        ? await ApiSingleton.coursesApi.coursesCreateCourseBasedOn(Number(course.baseCourseId), courseViewModel)
        : await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel) 
      setCourse((prevState) => ({
        ...prevState,
        isLoading: false,
        courseId: courseId.toString(),
      }))
    }
    catch (e) {
      setCourse((prevState) => ({
        ...prevState,
        isLoading: false,
        errors: ['Сервис недоступен'],
      }))
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
              {!baseCourses.areLoaded &&
                <Grid item xs={12} style={{display: "flex", justifyContent: "center"}}>
                    <CircularProgress/>
                </Grid>
              }
              {baseCourses.courses.length !== 0 &&
                <Grid item xs={12}>
                    <TextField
                      select
                      label="На основе существующего курса"
                      variant="outlined"
                      fullWidth
                      value={course.baseCourseId}
                      onChange={(e) =>
                      {
                        e.persist()
                        setCourse((prevState) => ({
                          ...prevState,
                          baseCourseId: e.target.value || undefined
                        }))
                      }}
                    >
                      <MenuItem value="">
                        <Typography style={{fontSize: "20px"}}>Курс с нуля</Typography>
                      </MenuItem>
                      {baseCourses.courses.map(course =>
                        <MenuItem value={course.id!}>
                          <Typography style={{fontSize: "20px"}}>
                            {NameBuilder.getCourseFullName(course.name!, course.groupName)}
                          </Typography>
                        </MenuItem>
                      ).toReversed()}
                    </TextField>
                </Grid>
              }
            </Grid>
            <LoadingButton
                style={{ marginTop: '16px'}}
                fullWidth
                variant="contained"
                color="primary"
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
