import Autocomplete from '@mui/material/Autocomplete';
import { AccountDataDto, AssignmentViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import { FC } from "react";
import Alert from '@mui/material/Alert';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { assign } from 'remarkable/lib/common/utils';
import { useEffect, useState } from "react";
import { Assignment } from '@mui/icons-material';

interface IStudentAssignmentProps {
    course: CourseViewModel,
    mentors: AccountDataDto[],
    acceptedStudents: AccountDataDto[],
    assignments: AssignmentViewModel[],
    userId: string,
}

interface IAssignmentsState {
    assignments: AssignmentViewModel[]
}

const StudentsAssignment: FC<IStudentAssignmentProps> = (props) => {
    const [assignmentsState, setAssignmentsState] = useState<IAssignmentsState>({
        assignments: props.assignments
    })
    
    const setCurrentAssignmentsState = async () => {
        setAssignmentsState((prevState) => ({
            ...prevState
        }))
    }

    const fixedColumnStyles: React.CSSProperties = {
        position: "sticky",
        left: 0,
        background: "white",
        borderRight: "1px solid black",
        borderBottom: "1px solid black"
    }
    
    const assignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(props.course.id!, mentorId, studentId)
        const newAssignment: AssignmentViewModel = {mentorId, studentId}
        props.assignments.push(newAssignment)
        setCurrentAssignmentsState()
    }

    const deassignStudent = async (studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdDeassignStudentByStudentIdDelete(props.course.id!, studentId)
        props.assignments.splice(props.assignments.findIndex(a => a.studentId === studentId), 1)
        setCurrentAssignmentsState()
    }

    const createFullNameWithEmail = (user: AccountDataDto) => user.surname + " " + user.name + " / " + user.email;

    const createAutocompleteDefaultValue = (mentorId: string) => {
        const assignmentStudentIds = props.assignments.filter(a => a.mentorId === mentorId).map(a => a.studentId!)

        return props.acceptedStudents.filter(student => assignmentStudentIds.includes(student.userId!))
    }

    const freeStudents = props.acceptedStudents
    .filter(student => props.assignments
        .find(assignment => assignment.studentId === student.userId) === undefined);

    const UserCellStyle: React.CSSProperties = {
        ...fixedColumnStyles,
        padding: 10,
        borderLeft: "1px solid black",
        backgroundColor: "#eceef8"
    }

    const OtherCellStyle: React.CSSProperties = {
        ...fixedColumnStyles,
        padding: 10,
        borderLeft: "1px solid black",
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
                                Список закрепленных студентов
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                        props.mentors.map((mentor, index) => (
                            <TableRow key={index} hover style={{ height: 65 }}>
                                <TableCell
                                    style={index === 0 ? UserCellStyle : OtherCellStyle}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row">
                                    {createFullNameWithEmail(mentor)}
                                </TableCell>

                                <TableCell
                                    style={{ ...fixedColumnStyles }}
                                    align="center"
                                    padding="checkbox"
                                    component="td"
                                    scope="row"
                                >
                                    <Autocomplete
                                        multiple
                                        disableClearable
                                        freeSolo
                                        options={freeStudents}
                                        getOptionLabel={(option: AccountDataDto | string) => createFullNameWithEmail(option as AccountDataDto)}
                                        onChange={(event, value, reason, detail) => {
                                            if (reason === "selectOption")
                                            {
                                                assignStudent(mentor.userId!, (value[value.length - 1] as AccountDataDto).userId!)
                                            }
                                            else if (reason === "removeOption") {
                                                deassignStudent((detail!.option as AccountDataDto).userId!);
                                            }
                                        }}
                                        defaultValue={createAutocompleteDefaultValue(mentor.userId!)}
                                        sx={{ width: "100%", height: "100%", overflow: 'hidden', paddingLeft: "10px" }}
                                        renderInput={(params) => <TextField {...params}/>}
                                    />
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