import React, {FC, useEffect, useState} from "react";
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@material-ui/core";
import {Paper, createStyles, Theme} from "@material-ui/core";
import TaskStudentCell from "../Tasks/TaskStudentCell";
import ApiSingleton from "../../api/ApiSingleton";
import {withStyles} from '@material-ui/styles';
import {RouteComponentProps} from "react-router-dom";
import Typography from "@material-ui/core/Typography";


interface IDetailedStatisticsProps {
    course: CourseViewModel
}

interface IDetailedStatisticsState {

}

const DetailedStatistics: FC<IDetailedStatisticsProps> = (props) => {
    /*const [detailedStatState, setDetailedStatState] = useState<IDetailedStatisticsProps>({
        studentsWithoutGroup: [],
        groups: [],
    })

    useEffect(() => {
        getGroupsInfo()
    }, [])

    const getGroupsInfo = async () => {
        const group = await ApiSingleton.courseGroupsApi.apiCourseGroupsByCourseIdGetCourseDataGet(+courseId)
        const students = group.studentsWithoutGroup?.map((st) => {
            return {
                id: st.id!,
                name: st.name!,
                surname: st.surname!,
                middleName: st.middleName!,
            }
        })
        const groupsInfo = await Promise.all(group.groups!.map(async(g) => {
            const groupMates = await Promise.all(g.groupMates!.map( async (gm) => {
                const student = await ApiSingleton.accountApi.apiAccountGetUserDataByUserIdGet(gm.studentId!)
                return {
                    name: student.name!,
                    surname:  student.surname!,
                    middleName:  student.middleName!,
                    email:  student.email!,
                    role: student.role!,
                }
            }))
            return {
                id: g.id!,
                courseId: g.courseId!,
                name: g.name!,
                groupMates: groupMates!,
            }
        }))

        setGroupState({
            studentsWithoutGroup: students,
            groups: groupsInfo,
        })
    }*/

    return (
        <>
        </>
    )
}

export default DetailedStatistics