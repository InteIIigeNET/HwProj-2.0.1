import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import { AccountDataDto, CourseMateViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import {FC} from "react";


interface IStudentAssignmentProps {
    course : CourseViewModel,
    mentors : AccountDataDto[],
    acceptedStudents: AccountDataDto[]
}

// TODO: after assignment change current course state  + fix filters to make it faster  
const StudentsAssignment : FC<IStudentAssignmentProps> = (props) => {

   const courseMates : CourseMateViewModel[] | undefined = props.course.courseMates;

   const assignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(props.course.id!, mentorId, studentId);
   }

   const createFullName = (user : AccountDataDto) => user.surname + " " + user.name;

   const filterAssignedStudents = (students : AccountDataDto[], mentorId : string) =>
        students.filter(student => courseMates?.find(cm => cm.studentId === student.userId)?.mentorId !== mentorId)
   
   return (
         <div>
            <Stack>
                {props.mentors.map(current => 
                    <Autocomplete
                        disablePortal
                        id= " combo-box-demo"
                        options = {filterAssignedStudents(props.acceptedStudents, current.userId!)}
                        getOptionLabel= {(option) => createFullName(option)!}
                        onChange = {(event, value : AccountDataDto) => {
                            alert(value.userId);
                            assignStudent(current.userId!, value.userId!)}}
                        sx ={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} 
                        label = {createFullName(current)} />}                   
                    />) //TODO : onchange event
                }
                    
            </Stack>
         </div>
   )

}
export default StudentsAssignment