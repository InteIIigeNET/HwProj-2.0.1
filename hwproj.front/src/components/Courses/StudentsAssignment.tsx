import Autocomplete from '@mui/material/Autocomplete';
import { AccountDataDto, AssignmentViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import { FC } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { useState } from "react";
import { Assignment, Padding } from '@mui/icons-material';

interface IStudentAssignmentProps {
    course: CourseViewModel,
    mentors: AccountDataDto[],
    acceptedStudents: AccountDataDto[],
    assignments: AssignmentViewModel[]
}

// TODO: after assignment change current course state  + fix filters to make it faster  
const StudentsAssignment: FC<IStudentAssignmentProps> = (props) => {

    const freeStudents = props.acceptedStudents
        .filter(student => props.assignments
            .find(assignment => assignment.studentId === student.userId) === undefined);

    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black",
        borderBottom: "1px solid black"
    }

    const [courseState, setCourseState] = useState<CourseViewModel>(props.course);

    const assignStudent = async (mentorId: string, studentId: string) =>
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(courseState.id!, mentorId, studentId);

    const createFullName = (user: AccountDataDto) => user.surname + " " + user.name;

    const createFullNameWithEmail = (user: AccountDataDto) => user.surname + " " + user.name + " " + user.email;

    const filterAssignedStudents = (students: AccountDataDto[], mentorId: string) =>
        students.filter(student => courseState.courseMates?.find(cm => cm.studentId === student.userId)?.mentorId !== mentorId)

    return (
        <div>
            <TableContainer style={{ maxHeight: 600 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell style={{
                                ...fixedColumnStyles,
                                zIndex: -4,
                                color: "",
                                borderLeft: "1px solid black",
                                borderTop: "1px solid black"
                            }}
                                align="center"
                                padding="none"
                                component="td">
                                Преподаватели
                            </TableCell>
                            <TableCell style={{
                                ...fixedColumnStyles,
                                zIndex: -4,
                                color: "",
                                borderLeft: "1px solid black",
                                borderTop: "1px solid black"
                            }}
                                align="center"
                                padding="none"
                                component="td">
                                Участники курса
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {freeStudents.map((student, index) => (
                            <TableRow key={index} hover style={{ height: 35 }}>
                                <TableCell
                                    style={{ ...fixedColumnStyles,paddingLeft : 30, paddingBottom:20, borderLeft: "1px solid black" }}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row">
                                    <Autocomplete
                                        freeSolo
                                        options={[]}
                                        sx={{ width: "100%", height: 40, overflow: 'hidden' }}
                                        renderInput={(params) => <TextField {...params}  label=" Выберите преподавателя "/>}
                                    />
                                </TableCell>
                                <TableCell
                                    style={{ ...fixedColumnStyles}}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row"
                                >
                                    {createFullNameWithEmail(student)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>

                </Table>
            </TableContainer>
        </div>
    )
    // return (
    //     <div>
    //         <Box sx={{ flexGrow: 1, p: 2 }}>
    //             <Grid
    //                 container
    //                 spacing={2}
    //                 sx={{
    //                     '--Grid-borderWidth': '1px',
    //                     borderTop: 'var(--Grid-borderWidth) solid',
    //                     borderLeft: 'var(--Grid-borderWidth) solid',
    //                     borderColor: 'divider',
    //                     '& > div': {
    //                         borderRight: 'var(--Grid-borderWidth) solid',
    //                         borderBottom: 'var(--Grid-borderWidth) solid',
    //                         borderColor: 'divider',
    //                     },
    //                 }}>
    //                 {props.mentors.map(current =>
    //                     <Grid {...{ xs: 12, sm: 6, md: 4, lg: 5 }} minHeight={200} minWidth={300}>
    //                         <Autocomplete
    //                             disablePortal
    //                             options={filterAssignedStudents(props.acceptedStudents, current.userId!)}
    //                             getOptionLabel={(option) => createFullName(option)}
    //                             onChange={(event, value: AccountDataDto | null) => {
    //                                 if (value) {
    //                                     assignStudent(current.userId!, value!.userId!)

    //                                     courseState.courseMates!.find(cm => cm.studentId === value!.userId)!.mentorId! = current.userId!
    //                                     setCourseState(prevState => ({...prevState}))
    //                                     }
    //                                 }
    //                             }
    //                             sx={{ width: 300 }}
    //                             renderInput={(params) => <TextField {...params}
    //                                 label={createFullName(current)} />}
    //                         /> </Grid>)                   }
    //             </Grid>
    //         </Box>
    //     </div>
    // )

}
export default StudentsAssignment