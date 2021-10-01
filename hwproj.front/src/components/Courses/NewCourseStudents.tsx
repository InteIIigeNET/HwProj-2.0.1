import * as React from 'react';
import {CourseViewModel} from '../../api/';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {ListItem, Paper} from "@material-ui/core";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/styles";

interface ICourseMate {
    name: string;
    surname: string;
    middleName: string;
    email: string;
    id: string;
}

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: ICourseMate[],
    onUpdate: () => void,
    courseId: string,
}

const useStyles = makeStyles(theme => ({
    item: {
        width: '200px',
        marginTop: '16px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
}))

const NewCourseStudents: FC<INewCourseStudentsProps> = (props) => {

    const acceptStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesAcceptStudentByCourseIdByStudentIdPost(props.course.id!, studentId)
        props.onUpdate()
    }

    const rejectStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesRejectStudentByCourseIdByStudentIdPost(props.course.id!, studentId)
        props.onUpdate()
    }

    const classes = useStyles()

    if (props.students.length === 0) {
        return (
            <div>
                Нет новых заявок в курс.
            </div>
        )
    }
    return (
        <div style={{width: "300px"}}>
            <div>
                <Typography>
                    Новые заявки на вступление в курс:
                </Typography>
            </div>
            <List>
                {props.students.map((cm, index) => (
                    <ListItem>
                        <div>
                            <div>
                                <Typography>
                                    {cm.surname} {cm.name}
                                </Typography>
                            </div>
                            <div className={classes.item}>
                                <div>
                                    <Button
                                        onClick={() => acceptStudent(cm.id)}
                                        color="primary"
                                        variant="contained"
                                        size="small"
                                    >
                                        Принять
                                    </Button>
                                </div>
                                <div>
                                    <Button
                                        onClick={() => rejectStudent(cm.id!)}
                                        color="primary"
                                        variant="contained"
                                        size="small"
                                    >
                                        Отклонить
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </ListItem>
                ))
                }
            </List>
        </div>
    )
}

export default NewCourseStudents