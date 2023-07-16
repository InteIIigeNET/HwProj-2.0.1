import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { AccountDataDto, CourseMateViewModel, CourseViewModel } from 'api';
import ApiSingleton from 'api/ApiSingleton';
import React from 'react';
import {FC} from "react";
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import {useState} from "react";

interface IStudentAssignmentProps {
    course : CourseViewModel,
    mentors : AccountDataDto[],
    acceptedStudents: AccountDataDto[]
}

// TODO: after assignment change current course state  + fix filters to make it faster  
const StudentsAssignment : FC<IStudentAssignmentProps> = (props) => {

   const courseMates : CourseMateViewModel[] | undefined = props.course.courseMates;

   const [courseState, setCourseState] = useState<CourseViewModel>(props.course);

   const assignStudent = async (mentorId: string, studentId: string) => {
        await ApiSingleton.coursesApi.apiCoursesByCourseIdAssignStudentByStudentIdByMentorIdPut(props.course.id!, mentorId, studentId);
   }

   const createFullName = (user : AccountDataDto) => user.surname + " " + user.name;

   const filterAssignedStudents = (students : AccountDataDto[], mentorId : string) =>
        students.filter(student => courseMates?.find(cm => cm.studentId === student.userId)?.mentorId !== mentorId)
   
   return (
         <div>
            <Box sx={{ flexGrow: 1, p: 2 }}>
            <Grid 
            container
            spacing={2}
            sx={{
                '--Grid-borderWidth': '1px',
                borderTop: 'var(--Grid-borderWidth) solid',
                borderLeft: 'var(--Grid-borderWidth) solid',
                borderColor: 'divider',
                '& > div': {
                    borderRight: 'var(--Grid-borderWidth) solid',
                    borderBottom: 'var(--Grid-borderWidth) solid',
                    borderColor: 'divider',
                },
            }}>
                {props.mentors.map(current => 
                    <Grid {...{ xs: 12, sm: 6, md: 4, lg: 5 }} minHeight={200} minWidth={300}>
                    <Autocomplete
                        disablePortal
                        id= " combo-box-demo"
                        options = {filterAssignedStudents(props.acceptedStudents, current.userId!)}
                        getOptionLabel= {(option) => createFullName(option)!}
                        onChange = {(event, value : AccountDataDto | null) => {
                            assignStudent(current.userId!, value?.userId!)
                            const newCourseMates = courseMates
                            newCourseMates!.find(cm => cm.studentId === value?.userId)!.mentorId! = current.userId!
                            setCourseState(prevState => ({
                                ...prevState,
                                courseMates : newCourseMates,
                            }))
                        }}
                        sx ={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} 
                        label = {createFullName(current)} />}                   
                    /> </Grid>) //TODO : onchange event
                }
            </Grid>
            </Box>
         </div>
   )

}
export default StudentsAssignment