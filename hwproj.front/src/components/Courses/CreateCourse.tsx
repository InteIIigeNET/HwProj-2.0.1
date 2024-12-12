import * as React from "react";
import { TextField, Button, Typography } from "@material-ui/core";
import ApiSingleton from "../../api/ApiSingleton";
import { FC, FormEvent, useState, useEffect } from "react";
import GroupIcon from '@material-ui/icons/Group';
import makeStyles from "@material-ui/styles/makeStyles";
import Container from "@material-ui/core/Container";
import Autocomplete from "@material-ui/lab/Autocomplete";

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
}));

const CreateCourse: FC = () => {
  const [course, setCourse] = useState<ICreateCourseState>({
    name: "",
    groupName: "",
    courseId: "",
    errors: [],
  });

  const [programNames, setProgramNames] = useState<string[]>([]);
  const [programName, setProgramName] = useState<string>('');
  const [groupNames, setGroupNames] = useState<string[]>([]);
  const [fetchingGroups, setFetchingGroups] = useState<boolean>(false);

  // Загрузка списка программ при монтировании компонента
  useEffect(() => {
    const fetchProgramNames = async () => {
      try {
        const response = await ApiSingleton.coursesApi.apiCoursesGetProgramNamesGet();
        const data = await response.json();
        setProgramNames(data); 
      } catch (e) {
        console.error("Ошибка при загрузке списка программ:", e);
        setProgramNames([]);
      }
    };

    fetchProgramNames();
  }, []); 

  // Загрузка списка групп, при выборе программа
  useEffect(() => {
    const fetchGroups = async (program: string) => {
      if (!program) return;
      setFetchingGroups(true); 
      try {
        const response = await ApiSingleton.coursesApi.apiCoursesGetGroupsGet(program);
        const data = await response.json();
        setGroupNames(data); 
      } catch (e) {
        console.error("Ошибка при загрузке списка групп:", e);
        setGroupNames([]);
      } finally {
        setFetchingGroups(false);
      }
    };

    if (programName) {
      fetchGroups(programName);
    } else {
      setGroupNames([]);
    }
  }, [programName]); 

  // Обработчик отправки формы
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const courseViewModel = {
      name: course.name,
      groupName: course.groupName,
      isOpen: true,
    };
    try {
      const courseId = await ApiSingleton.coursesApi.apiCoursesCreatePost(courseViewModel); // Создаем курс
      await ApiSingleton.coursesApi.apiCoursesInviteAndAddStudentsToCoursePost(course.groupName, courseId); // Приглашаем студентов в курс
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

  // Проверка роли пользователя
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

        <form onSubmit={(e) => handleSubmit(e)} className={classes.form}>
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

          <Autocomplete freeSolo
            value={programName}
            onChange={(event, newValue) => {
              setProgramName(newValue || '');
            }}
            options={programNames}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Название программы"
                variant="outlined"
                fullWidth
                style={{ marginTop: '16px' }}
              />
            )}
            fullWidth
          />

          {/* Если выбрана программа, показываем список существующих для нее групп */}
          {programName ? (
            <Autocomplete
              freeSolo
              value={course.groupName}
              onChange={(event, newValue) => {
                setCourse((prevState) => ({
                  ...prevState,
                  groupName: newValue || '',
                }));
              }}
              options={groupNames}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Название группы"
                  variant="outlined"
                  fullWidth
                  style={{ marginTop: '16px' }}
                />
              )}
              fullWidth
            />
          ) : (
            <TextField
              label="Название группы"
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
              style={{ marginTop: '16px' }}
            />
          )}

          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            style={{ marginTop: '16px' }}
          >
            Создать курс
          </Button>
        </form>
      </div>
    </Container>
  );
};

export default CreateCourse;
