import * as React from "react";
import {
  TextField,
  Button,
  Typography,
  Grid,
  Checkbox,
  FormControlLabel,
} from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import './Styles/CreateCourse.css';
import {FC, FormEvent, useState} from "react";
import GroupIcon from '@material-ui/icons/Group';
import {makeStyles} from '@material-ui/core/styles';
import Container from "@material-ui/core/Container";
import {Navigate} from "react-router-dom";

interface ICreateCourseState {
  name: string;
  groupName?: string;
  courseId: string;
  isOpen: boolean;
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
    isOpen: false,
    errors: [],
  })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: course.isOpen,
    }
    try {
      const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel)
      setCourse((prevState) => ({
        ...prevState,
        courseId: courseId.toString(),
      }))
    }
    catch (e) {
      setCourse((prevState) => ({
        ...prevState,
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
              <Grid>
                <FormControlLabel
                    style={{ margin: 0 }}
                    control={
                        <Checkbox
                            defaultChecked
                            color="primary"
                            checked={course.isOpen}
                            onChange={(e) => {
                                e.persist()
                                setCourse((prevState) => ({
                                    ...prevState,
                                    isOpen: e.target.checked
                                }))
                            }}
                        />
                    }
                    label="Ограниченно видимый курс"
                />
              </Grid>
            </Grid>
            <Button
                style={{ marginTop: '16px'}}
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
            >
              Создать курс
            </Button>
          </form>
        </div>
      </Container>
  )
}

export default CreateCourse