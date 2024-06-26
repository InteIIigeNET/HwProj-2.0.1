import React, {useState} from 'react';
import {Autocomplete, TextField} from '@mui/material';


export interface StudentItem {
    id: string;
    name: string;
    surname: string;
}

interface StudentStatsListProps {
    mates: StudentItem[];
    onStudentsChange: (studentIds: string[]) => void;
}

const StudentCheckboxList: React.FC<StudentStatsListProps> = (props) => {
    const [checked, setChecked] = useState(new Array<string>())

    return (
        <Autocomplete
            multiple
            size={"medium"}
            style={{minWidth: 300}}
            fullWidth
            options={props.mates}
            getOptionLabel={(option) => option.name + ' ' + option.surname}
            filterSelectedOptions
            renderInput={(params) => (
                <TextField
                    {...params}
                    label='Выбрать студентов'
                />
            )}
            noOptionsText={'Нет студентов для выбора'}
            value={props.mates.filter(m => checked.includes(m.id))}
            onChange={(_, values) => {
                const selectedStudentsId = values.map(v => v.id);
                props.onStudentsChange(selectedStudentsId);
                setChecked(selectedStudentsId)
            }}
        />
    )
}

export default StudentCheckboxList;