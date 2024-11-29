import * as React from "react"; 
import {
  TextField,
  Button,
  Typography,
  Grid,
  Paper,
} from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import './Styles/CreateCourse.css';
import { FC, FormEvent, useState, useEffect } from "react";
import GroupIcon from '@material-ui/icons/Group';
import makeStyles from "@material-ui/styles/makeStyles";
import Container from "@material-ui/core/Container";

interface ICreateCourseState {
  name: string;
  groupName?: string;
  courseId: string;
  errors: string[];
}

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(7),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.paper,
  },
  avatar: {
    margin: theme.spacing(1),
  },
  form: {
    marginTop: theme.spacing(3),
    width: '100%',
  },
  button: {
    marginTop: theme.spacing(1),
  },
  groupList: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    borderRadius: 4,
    backgroundColor: '#f7f7f7',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  groupItem: {
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    border: '1px solid #ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
}));

const CreateCourse: FC = () => {
  const [course, setCourse] = useState<ICreateCourseState>({
    name: "",
    groupName: "",
    courseId: "",
    errors: [],
  });

  const [apiResult, setApiResult] = useState<string[]>([]);
  const [programName, setProgramName] = useState<string>('');
  const [fetchingGroups, setFetchingGroups] = useState<boolean>(false);

  useEffect(() => {
    const fetchApiData = async (program: string) => {
      if (!program) return;
      setFetchingGroups(true); 
      try {
        const response = await ApiSingleton.coursesApi.apiCoursesGetGroupsGet(program);
        const data = await response.json(); 
        setApiResult(data); 
      } catch (e) {
        console.error("Error fetching API:", e);
        setApiResult(["Error fetching API result"]);
      } finally {
        setFetchingGroups(false); 
      }
    };

    if (programName) {
      fetchApiData(programName); 
    }
  }, [programName]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: true,
    };
    try {
      const courseId = await ApiSingleton.coursesApi.apiCoursesCreatePost(courseViewModel);
      setCourse((prevState) => ({
        ...prevState,
        courseId: courseId.toString(),
      }));
      window.location.assign("/"); 
    } catch (e) {
      setCourse((prevState) => ({
        ...prevState,
        errors: ['Сервис недоступен'],
      }));
    }
  };

  const classes = useStyles();

  if (!ApiSingleton.authService.isLecturer()) {
    return (
      <Typography component="h1" variant="h5">
        Страница не доступна
      </Typography>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <div className={classes.paper}>
        <GroupIcon
          fontSize="large"
          style={{ color: 'white', backgroundColor: '#ecb50d' }}
          className={classes.avatar}
        />
        <Typography component="h1" variant="h5">
          Создать курс
        </Typography>

        {/* Form for creating course */}
        <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                label="Название курса"
                variant="outlined"
                fullWidth
                name={course.name}
                onChange={(e) => {
                  e.persist();
                  setCourse((prevState) => ({
                    ...prevState,
                    name: e.target.value,
                  }));
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Номер группы"
                variant="outlined"
                fullWidth
                value={course.groupName}
                onChange={(e) => {
                  e.persist();
                  setCourse((prevState) => ({
                    ...prevState,
                    groupName: e.target.value,
                  }));
                }}
              />
            </Grid>
          </Grid>
          <Button
            style={{ marginTop: '16px' }}
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
          >
            Создать курс
          </Button>
        </form>

        {/* Button to fetch group information, now above the program name field */}
        <Button
          fullWidth
          variant="contained"
          color="secondary"
          style={{ marginTop: '16px' }}
          disabled 
        >
          Получить информацию по группам
        </Button>

        {/* Program Name Input Field */}
        <TextField
          label="Название программы"
          variant="outlined"
          fullWidth
          value={programName}
          onChange={(e) => setProgramName(e.target.value)} 
          style={{ marginTop: '16px' }}
        />
        
        {/* Display groups if there are any */}
        {apiResult.length > 0 && !fetchingGroups && (
          <Paper className={classes.groupList}>
            <Typography
              component="h2"
              variant="h6"
              gutterBottom
              style={{ textAlign: 'center' }} 
            >
              Группы для программы "{programName}":
            </Typography>
            <ul>
              {apiResult.length > 0 ? (
                apiResult.map((group, index) => (
                  <li key={index} className={classes.groupItem}>{group}</li>
                ))
              ) : (
                <li>No groups available for this program.</li>
              )}
            </ul>
          </Paper>
        )}

        {/* Display loading indicator */}
        {fetchingGroups && (
          <Typography variant="h6" style={{ marginTop: '20px' }}>
            Загрузка групп...
          </Typography>
        )}
      </div>
    </Container>
  );
};

export default CreateCourse;
