import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';
import { AccountDataDto, CourseMateViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import {FC} from "react";


interface IStudentAssignmentProps {
    courseId : number,
    mentors : AccountDataDto[],
    acceptedStudents: AccountDataDto[]
}

const StudentsAssignment : FC<IStudentAssignmentProps> = (props) => {

   const assignStudent = async (courseId : number, mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(courseId, mentorId, studentId);
   }

   const studentNames : string[] = props.acceptedStudents.map(student => student.surname + " " + student.name);
   const mentorsNames : string[] = props.mentors.map(mentor => mentor.surname + " " + mentor.name);
   
   return (
         <div>
            <Stack>
                {mentorsNames.map(fullName => 
                    <Autocomplete
                        disablePortal
                        id= " combo-box-demo"
                        options={studentNames}
                        sx ={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} 
                        label = {fullName} />}                         
                    />) //TODO : onchange event
                }
                    
            </Stack>
         </div>
   )

}
export default StudentsAssignment