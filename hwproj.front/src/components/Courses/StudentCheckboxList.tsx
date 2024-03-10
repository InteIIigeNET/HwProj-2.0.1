import React, {useState} from 'react';
import {List, ListItem, ListItemText, Checkbox} from '@material-ui/core';


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
        <List>
            {props.mates.map(({id, name, surname}) => (
                <ListItem disableGutters>
                    <Checkbox
                        edge="start" tabIndex={-1}
                        checked={checked.indexOf(id) !== -1}
                        onClick={() => handleCheckboxChange(id)}/>
                    <ListItemText>{name + ' ' + surname}</ListItemText>
                </ListItem>
                )
            )}
        </List>
    )
}

export default StudentCheckboxList;