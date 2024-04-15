import React, {useState} from 'react';
import { Autocomplete, TextField } from '@mui/material';


export interface StudentItem {
    id : string; // == name + surname ?
    name : string;
    surname : string;
}
interface StudentStatsListProps {
    mates : StudentItem[];
    onStudentSelection : (studentId : string) => void;
}

const StudentCheckboxList : React.FC<StudentStatsListProps> = (props) => {
    const [checked, setChecked] = useState(new Array<string>())
    
    return (
        <Autocomplete
            multiple
            options={props.mates}
            getOptionLabel = {(option) => option.name + ' ' + option.surname}
            filterSelectedOptions
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Выбрать студентов'
                />
            )}
            noOptionsText={'На курсе еще нет студентов'}
            value={props.mates.filter(m => checked.includes(m.id))}
            onChange={(_, values) => {
                const selectedStudentsId = values.map(v => v.id);
                const newSelectChangedStudents = selectedStudentsId.length > checked.length 
                    ? selectedStudentsId.filter(s => !checked.includes(s))
                    : checked.filter(c => !selectedStudentsId.includes(c));
                newSelectChangedStudents.forEach(s => props.onStudentSelection(s));
                setChecked(selectedStudentsId)
            }}
        />
    )
}

export default StudentCheckboxList;