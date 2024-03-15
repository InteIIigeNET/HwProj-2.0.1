import React, {useState} from 'react';
import {styled, ListItem, ListItemText, Checkbox, List} from '@mui/material';
import {FormControl, InputLabel, MenuItem, Select} from '@mui/material';
import {OutlinedInput} from "@mui/material";


export interface StudentItem {
    id : string; // == name + surname ?
    name : string;
    surname : string;
}
interface StudentStatsListProps {
    mates : StudentItem[];
    onStudentSelection : (studentId : string) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const StudentCheckboxList : React.FC<StudentStatsListProps> = (props) => {
    const [checked, setChecked] = useState(new Array<string>())

    const handleCheckboxChange = (studentId : string) => {
        props.onStudentSelection(studentId);

        const currentIndex = checked.indexOf(studentId);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(studentId);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    }
    
    return (
        <FormControl fullWidth>
            <InputLabel>Выбрать студентов</InputLabel>
            <Select
                multiple
                size={"medium"}
                value={checked.map(id => props.mates.find(student => student.id === id)!)}
                renderValue={selected => {
                    console.log(selected);
                    if (selected.length === 0) {
                        return <em>Выбрать студентов</em>;
                    }
                    
                    return selected.map(student => student.name + ' ' + student.surname).join(', ');
                }}
                input={<OutlinedInput label="Выбрать студентов"/>}
                MenuProps={{
                    PaperProps: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
                        },
                    },
                }}
            >
                {props.mates.map(({id, name, surname}) => (
                    <MenuItem key={id} value={name + ' ' + surname}>
                        <Checkbox
                            color="primary"
                            edge="start" tabIndex={-1}
                            checked={checked.indexOf(id) !== -1}
                            onClick={() => handleCheckboxChange(id)}
                        />
                        <ListItemText>{name + ' ' + surname}</ListItemText>
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
}

export default StudentCheckboxList;