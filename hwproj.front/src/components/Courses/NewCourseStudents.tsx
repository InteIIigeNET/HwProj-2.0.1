import * as React from 'react';
import {AccountDataDto, CourseViewModel} from '../../api/';
import Button from '@material-ui/core/Button'
import ApiSingleton from "../../api/ApiSingleton";
import {FC} from "react";
import {Divider} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {makeStyles} from "@material-ui/styles";

interface INewCourseStudentsProps {
    course: CourseViewModel,
    students: AccountDataDto[],
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
    const studentsLength = props.students.length

    if (studentsLength === 0) {
        return (
            <div>
                Нет новых заявок в курс.
            </div>
        )
    }
    return (
        //TODO: add user separator
        <div style={{width: "300px"}}>
            {props.students.map((cm, i) => (
                <div>
                    <div>
                        <Typography>
                            {cm.surname} {cm.name}
                        </Typography>
                    </div>
                    <div className={classes.item}>
                        <div>
                            <Button
                                onClick={() => acceptStudent(cm.userId!)}
                                color="primary"
                                variant="contained"
                                size="small"
                            >
                                Принять
                            </Button>
                        </div>
                        <div>
                            <Button
                                onClick={() => rejectStudent(cm.userId!)}
                                color="primary"
                                variant="contained"
                                size="small"
                            >
                                Отклонить
                            </Button>
                        </div>
                    </div>
                    {i < studentsLength - 1 ? <Divider style={{marginTop: 15, marginBottom: 10}}/> : null}
                </div>
            ))}
        </div>
    )
}

export default NewCourseStudents
