import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography'
import {Navigate, useParams} from 'react-router-dom';
import ApiSingleton from "../../api/ApiSingleton";
import {Grid, Box, Divider} from '@mui/material';
import {FC, useEffect, useState} from "react";
import Container from "@material-ui/core/Container";
import makeStyles from "@material-ui/styles/makeStyles";
import EditIcon from "@material-ui/icons/Edit";
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import Link from "@material-ui/core/Link";
import Lecturers from "./Lecturers";
import {AccountDataDto} from "../../api";
import CalculateIcon from '@mui/icons-material/Calculate';
import CodeWindow from '../CodeWindow';

interface IEditCourseState {
    isLoaded: boolean,
    name: string,
    groupName?: string,
    isCompleted: boolean,
    mentors: AccountDataDto[],
    edited: boolean,
    deleted: boolean,
    lecturerEmail: string;
}

interface ITokenState {
    isOpen: boolean,
    token: string,
}

const useStyles = makeStyles((theme) => ({
    logo: {
        display: "flex",
        justifyContent: "center",
    },
    paper: {
        marginTop: theme.spacing(3),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        marginTop: theme.spacing(3),
        width: '100%'
    },
    controls: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    item: {
        marginTop: theme.spacing(2),
    },
    button: {
        fontSize: '0.9rem',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    }
}))

const EditCourse: FC = () => {
    const {courseId} = useParams()

    const [courseState, setCourseState] = useState<IEditCourseState>({
        isLoaded: false,
        name: "",
        groupName: "",
        isCompleted: false,
        mentors: [],
        edited: false,
        deleted: false,
        lecturerEmail: "",
    })

    const [tokenState, setTokenState] = useState<ITokenState>({
        isOpen: false,
        token: '',
    })

    const [isOpenYamlCode, setIsOpenYamlCode] = useState<boolean>(false)

    const yamlTemplate = 
        `name: Send solution to hwproj.ru

    on:
        workflow_run:
            workflows: [<Worflows>] # Список workflow, которые должны пройти успешно
            types:
            - completed

    jobs:

        send_request:
            runs-on: ubuntu-latest
            env:
                TOKEN: <Token> # Подставить токен
                GITHUB_LOGIN: <GithubLogin> # Подставить ГитХаб-логин студента
                TASKID: <TaskId> # Подставить ID задачи
                SOLUTION_URL: <SolutionUrl> # Подставить ссылку на репозиторий
            steps:
            - name: Send Request        
            - run: |
                response=$(curl -o /dev/null -s -w "%{http_code}" -X POST \\
                https://hwproj.ru/automatic \\
                -H 'Content-Type: application/json' \\
                -H "Authorization: Bearer $TOKEN" \\
                -d '{
                    "GithubId": $GITHUB_LOGIN,
                    "SolutionUrl": $SOLUTION_URL,
                    "TaskId": $TASKID
                    }')
                if [[ "$response" =~ ^2 ]]; then
                    echo "Request successful"
                else
                    echo "Request failed with status $response"
                    cat response.txt
                    exit 1
                fi`


    useEffect(() => {
        getCourse()
    }, [])

    const getCourse = async () => {
        const course = await ApiSingleton.coursesApi.apiCoursesByCourseIdGet(+courseId!)
        setCourseState((prevState) => ({
            ...prevState,
            isLoaded: true,
            name: course.name!,
            groupName: course.groupName!,
            isOpen: course.isOpen!,
            isCompleted: course.isCompleted!,
            mentors: course.mentors!,
        }))
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const courseViewModel = {
            name: courseState.name,
            groupName: courseState.groupName,
            isOpen: true,
            isCompleted: courseState.isCompleted
        };

        await ApiSingleton.coursesApi.apiCoursesUpdateByCourseIdPost(+courseId!, courseViewModel)
        setCourseState((prevState) => ({
            ...prevState,
            edited: true,
        }))
    }

    const onOpenYamlCode = () => {
        setIsOpenYamlCode(true)
    }

    const onCloseYamlCode = () => {
        setIsOpenYamlCode(false)
    }

    const onOpenToken = async () => {
        const token = (await ApiSingleton.coursesApi.apiCoursesGetTokenByCourseIdGet(+courseId!)).value?.accessToken
        setTokenState((prevState) => ({
            ...prevState,
            isOpen: true,
            token: token!,
        }))
    }

    const onCloseToken = () => {
        setTokenState((prevState) => ({
            ...prevState,
            isOpen: false,
            token: '',
        }))
    }

    const classes = useStyles()

    if (courseState.isLoaded) {
        if (courseState.edited) {
            return <Navigate to={'/courses/' + courseId}/>
        }

        if (courseState.deleted) {
            return <Navigate to='/'/>
        }

        if (!courseState.mentors.filter((mentor) =>
            mentor.email === ApiSingleton.authService.getUserEmail())) {
            return (
                <Typography variant='h6' gutterBottom>
                    Только преподаватель может редактировать курс
                </Typography>
            )
        }

        return (
            <Container maxWidth='lg' style={{width: '60%'}}>
                <Grid container spacing={3} direction='row'>
                    <Grid item xs={2}>
                    <Box style={{marginTop: "40px"}} display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                            <Link
                                component="button"
                                style={{ color: '#212529', textDecoration: 'none' }}
                                onClick={() => window.location.assign('/courses/' + courseId)}
                            >
                                <Typography variant="body1">Назад к курсу</Typography>
                            </Link>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box display="flex" justifyContent="center" mb={3} style={{marginTop: "100px"}}>
                            <EditIcon style={{ color: 'red', marginRight: '0.5rem' }} />
                            <Typography variant="h5">Редактировать курс</Typography>
                        </Box>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                className={classes.item}
                                margin="normal"
                                fullWidth
                                required
                                label="Название курса"
                                variant="outlined"
                                value={courseState.name}
                                onChange={(e) => {
                                    e.persist()
                                    setCourseState((prevState) => ({
                                        ...prevState,
                                        name: e.target.value
                                    }))
                                }}
                            />
                            <TextField
                                className={classes.item}
                                label="Номер группы"
                                variant="outlined"
                                margin="normal"
                                fullWidth
                                value={courseState.groupName}
                                onChange={(e) => {
                                    e.persist()
                                    setCourseState((prevState) => ({
                                        ...prevState,
                                        groupName: e.target.value
                                    }))
                                }}
                            />
                                <Grid>
                                    <FormControlLabel
                                        style={{margin: 0}}
                                        control={
                                            <Checkbox
                                                defaultChecked
                                                color="primary"
                                                checked={courseState.isCompleted}
                                                onChange={(e) => {
                                                    e.persist()
                                                    setCourseState((prevState) => ({
                                                        ...prevState,
                                                        isCompleted: e.target.checked
                                                    }))
                                                }}
                                            />
                                        }
                                        label="Завершённый курс"
                                    />
                                </Grid>
                            <Grid className={classes.item} style={{alignItems: 'center'}}>
                                <Button
                                    color="primary"
                                    variant="contained"
                                    style={{textTransform: 'none'}}
                                    startIcon={<EditIcon />}
                                    className={classes.button}
                                    type="submit">
                                    Редактировать курс
                                </Button>

                                <Divider textAlign="left" style={{marginTop: '1.5rem', marginBottom: '1.5rem'}}>
                                    <Typography color="textSecondary">Токены</Typography>
                                </Divider>

                                <Button
                                    className={classes.button}
                                    style={{textTransform: 'none'}}
                                    color="primary"
                                    startIcon={<ConfirmationNumberIcon />}
                                    onClick={onOpenToken}
                                    >
                                    Получить токен для отправки решений
                                </Button>
                                
                                <Button
                                    className={classes.button}
                                    style={{textTransform: 'none', marginTop: '0.7rem'}}
                                    color="primary"
                                    startIcon={<CalculateIcon />}
                                    onClick={onOpenYamlCode}
                                    >
                                    Сгенерировать yaml код для отправки решений
                                </Button>
                            </Grid>
                        </form>
                    </Grid>
                    <Grid item xs={4} style={{marginTop: "20px"}}>
                        <Lecturers
                            update={getCourse}
                            mentors={courseState.mentors}
                            courseId={courseId!}
                            isEditCourse={true}
                        />
                    </Grid>

                </Grid>
                <CodeWindow
                    onClose={onCloseYamlCode}
                    open={isOpenYamlCode}
                    code={yamlTemplate}
                    language="yaml"/>
                <CodeWindow 
                    onClose={onCloseToken}
                    open={tokenState.isOpen}
                    code={tokenState.token}
                    language="yaml"
                    title="Secret Token"
                />
            </Container>
        );
    }

    return (
        <div>

        </div>
    )
}

export default EditCourse
