import Autocomplete from '@mui/material/Autocomplete';
import { AccountDataDto, AssignmentViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import { FC } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";

interface IStudentAssignmentProps {
    course: CourseViewModel,
    mentors: AccountDataDto[],
    acceptedStudents: AccountDataDto[],
    assignments: AssignmentViewModel[],
    onUpdate: () => void,
}

const StudentsAssignment: FC<IStudentAssignmentProps> = (props) => {

    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black",
        borderBottom: "1px solid black"
    }

    const assignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(props.course.id!, mentorId, studentId)
        props.onUpdate()
    }

    const deassignStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdDeassignStudentByStudentIdDelete(props.course.id!, studentId);
        props.onUpdate();
    }

    const createFullName = (user: AccountDataDto) => user.surname + " " + user.name;

    const createFullNameWithEmail = (user: AccountDataDto) => user.surname + " " + user.name + " " + user.email;

    const createAutocompleteInputInfo = (studentId: string) => {
        const assignment = props.assignments.find(assignment => assignment.studentId === studentId);
        return assignment === undefined
            ? "Выберите преподавателя"
            : createFullName(props.mentors.find(mentor => mentor.userId === assignment.mentorId)!)
    }

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
                        {props.acceptedStudents.map((student, index) => (
                            <TableRow key={index} hover style={{ height: 35 }}>
                                <TableCell
                                    style={{
                                        ...fixedColumnStyles,
                                        padding: 10,
                                        borderLeft: "1px solid black"
                                    }}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row">
                                    <Autocomplete
                                        freeSolo
                                        options={props.mentors}
                                        sx={{ width: "100%", height: 40, overflow: 'hidden' }}
                                        getOptionLabel={(option: AccountDataDto | string) => createFullName(option as AccountDataDto)}
                                        onChange={(event, value: AccountDataDto | null | string, reason) => {
                                            if (reason === "selectOption") {
                                                assignStudent((value as AccountDataDto).userId!, student.userId!)
                                            }
                                            else if (reason === "clear") {
                                                deassignStudent(student.userId!);
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label={createAutocompleteInputInfo(student.userId!)} />}
                                    />
                                </TableCell>
                                <TableCell
                                    style={{ ...fixedColumnStyles }}
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
}
export default StudentsAssignment