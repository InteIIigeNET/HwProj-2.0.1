import {
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import {FC, FormEvent, useState, useEffect} from "react";
import ApiSingleton from "../../api/ApiSingleton";
import "./Styles/CreateCourse.css";
import GroupIcon from "@material-ui/icons/Group";
import {makeStyles} from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import {CoursePreviewView} from "api";
import {useNavigate} from "react-router-dom";
import {useSnackbar} from "notistack";
import ErrorsHandler from "components/Utils/ErrorsHandler";
import SelectBaseCourse from "./SelectBaseCourse";
import AddCourseInfo from "./AddCourseInfo";

enum CreateCourseSteps {
  SelectBaseCourseStep = 0,
  AddCourseInfoStep = 1,
}

const stepLabels = ["Взять за основу существующий курс", "Заполнить данные о курсе"]

const stepIsOptional = (step: CreateCourseSteps) =>
  step === CreateCourseSteps.SelectBaseCourseStep

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
    marginTop: theme.spacing(1),
  },
}))

const CreateCourse: FC = () => {
  const [courseName, setCourseName] = useState<string>("")
  const [groupName, setGroupName] = useState<string>("")
  const [courseIsLoading, setCourseIsLoading] = useState<boolean>(false)

  const [baseCourses, setBaseCourses] = useState<CoursePreviewView[]>()
  const [baseCourseIndex, setBaseCourseIndex] = useState<number>()

  const [activeStep, setActiveStep] = useState<CreateCourseSteps>(CreateCourseSteps.SelectBaseCourseStep)

  const navigate = useNavigate()
  const {enqueueSnackbar} = useSnackbar()

  useEffect(() => {
    const loadBaseCourses = async () => {
      try {
        const userCourses = await ApiSingleton.coursesApi.coursesGetAllUserCourses()
        if (!userCourses.length) setActiveStep(CreateCourseSteps.AddCourseInfoStep)
        setBaseCourses(userCourses)
      }
      catch (e) {
        setActiveStep(CreateCourseSteps.AddCourseInfoStep)
        setBaseCourses([])
        console.error("Ошибка при загрузке курсов лектора:", e)
        enqueueSnackbar("Не удалось загрузить существующие курсы", {variant: "warning", autoHideDuration: 4000})
      }
    };

    loadBaseCourses()
  }, [])

  const handleBack = () => setActiveStep(activeStep - 1)
  const handleNext = () => setActiveStep(activeStep + 1)

  const selectBaseCourseHandleNext = () => {
    const baseCourse = baseCourseIndex !== undefined ? baseCourses![baseCourseIndex] : undefined
    setCourseName(baseCourse?.name || "")
    setGroupName(baseCourse?.groupName || "")
    handleNext()
  }

  const selectBaseCourseHandleSkip = () => {
    setBaseCourseIndex(undefined)
    selectBaseCourseHandleNext()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const courseViewModel = {
      name: courseName,
      groupName: groupName,
      isOpen: true,
      baseCourseId: baseCourseIndex !== undefined ? baseCourses![baseCourseIndex].id : undefined,
    }
    try {
      setCourseIsLoading(true)
      const courseId = await ApiSingleton.coursesApi.coursesCreateCourse(courseViewModel)
      navigate(`/courses/${courseId}/editHomeWorks`)
    }
    catch (e) {
      console.error("Ошибка при создании курса:", e)
      const responseErrors = await ErrorsHandler.getErrorMessages(e as Response)
      enqueueSnackbar(responseErrors[0], {variant: "error"})
    }

    setCourseIsLoading(false)
  }

  const handleStep = (step: CreateCourseSteps) => {
    switch (step) {
      case CreateCourseSteps.SelectBaseCourseStep:
        return <SelectBaseCourse
          baseCourses={baseCourses!}
          baseCourseIndex={baseCourseIndex}
          setBaseCourseIndex={setBaseCourseIndex}
          handleNext={selectBaseCourseHandleNext}
          handleSkip={selectBaseCourseHandleSkip}
        />
      case CreateCourseSteps.AddCourseInfoStep:
        return <AddCourseInfo
          courseName={courseName}
          groupName={groupName}
          courseIsLoading={courseIsLoading}
          setCourseName={setCourseName}
          setGroupName={setGroupName}
          handleBack={handleBack}
        />
      default:
        console.error(`Шаг создания курса неопределён: ${step}`)
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
  return baseCourses ? (
    <Container component="main" maxWidth="sm">
      <div className={classes.paper}>
        <GroupIcon
          fontSize="large"
          style={{ color: "white", backgroundColor: "#ecb50d" }}
          className={classes.avatar}
        />
        <Typography component="h1" variant="h5">
          Создать курс
        </Typography>
        <form onSubmit={handleSubmit} className={classes.form}>
          <Stepper alternativeLabel activeStep={activeStep}>
            {stepLabels.map((label, step) => {
              const optionalLabel = stepIsOptional(step) ? (
                <Typography variant="caption">
                  Опционально
                </Typography>
              ) : undefined
              return (
                <Step key={label} style={{ textAlign: "center" }}>
                  <StepLabel optional={optionalLabel}>{label}</StepLabel>
                </Step>
              )
            })}
          </Stepper>
          {handleStep(activeStep)}
        </form>
      </div>
    </Container>
  ) : (
    <div className="container">
      <p>Загрузка...</p>
      <CircularProgress/>
    </div>
  )
}

export default CreateCourse
