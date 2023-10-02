import Autocomplete from '@mui/material/Autocomplete';
import { AccountDataDto, AssignmentsViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import { FC } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@material-ui/core";
import { useState } from "react";

interface IStudentAssignmentProps {
    course: CourseViewModel,
    mentors: AccountDataDto[],
    acceptedStudents: AccountDataDto[],
    assignments: AssignmentsViewModel[],
    userId: string,
}

interface IAssignmentsState {
    assignments: AssignmentsViewModel[]
}

const StudentsAssignment: FC<IStudentAssignmentProps> = (props) => {
    const [assignmentsState, setAssignmentsState] = useState<IAssignmentsState>({
        assignments: props.assignments
    })

    const {assignments} = assignmentsState;

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
    
    const findAssignmentByMentor = (mentorId: string | null) => assignments.find(a => a.mentorId === mentorId)

    const addStudentAssignment = (mentorId: string | null, studentId: string) => {
        const mentorsStudents = findAssignmentByMentor(mentorId)
        if (mentorsStudents == undefined) {
            assignments.push({
                mentorId: mentorId,
                studentIds: [studentId]
            })
        } else { 
            mentorsStudents.studentIds!.push(studentId)
        }
    }

    const removeStudentAssignment = (mentorId: string | null, studentId: string) => {
        const mentorsAssignments = findAssignmentByMentor(mentorId)
        mentorsAssignments!.studentIds!.splice(mentorsAssignments!.studentIds!.findIndex(a => a === studentId), 1)
        if (mentorsAssignments?.studentIds?.length === 0) {
            assignments.splice(assignments!.findIndex(a => a === mentorsAssignments), 1)
        }
    }

    const assignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentPut(props.course.id!, mentorId, studentId)

        removeStudentAssignment(null, studentId)
        addStudentAssignment(mentorId, studentId)

        setCurrentAssignmentsState()
    }

    const deassignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdDeassignStudentDelete(props.course.id!, studentId)

        removeStudentAssignment(mentorId, studentId)
        addStudentAssignment(null, studentId)

        setCurrentAssignmentsState()
    }

    const createFullNameWithEmail = (user: AccountDataDto) => user.surname + " " + user.name + " / " + user.email;

    const createAutocompleteDefaultValue = (mentorId: string | null) => {
        const mentorsAssignments = findAssignmentByMentor(mentorId)

        return mentorsAssignments == undefined 
                ? [] 
                : props.acceptedStudents.filter(student => mentorsAssignments?.studentIds?.includes(student.userId!))
    }

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
                        [props.mentors.find(m => m.userId === props.userId)!, ...props.mentors.filter(m => m.userId !== props.userId)]
                            .map((mentor, index) => (
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
                                        options={createAutocompleteDefaultValue(null)}
                                        getOptionLabel={(option: AccountDataDto | string) => createFullNameWithEmail(option as AccountDataDto)}
                                        onChange={(event, value, reason, detail) => {
                                            if (reason === "selectOption")
                                            {
                                                assignStudent(mentor.userId!, (value[value.length - 1] as AccountDataDto).userId!)
                                            }
                                            else if (reason === "removeOption") {
                                                deassignStudent(mentor.userId!, (detail!.option as AccountDataDto).userId!);
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