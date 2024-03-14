import React, {useState} from 'react';
import {styled, ListItem, ListItemText, Checkbox, List} from '@material-ui/core';


export interface StudentItem {
    id : string; // == name + surname ?
    name : string;
    surname : string;
}

interface StudentStatsListProps {
    mates : StudentItem[];
    onStudentSelection : (studentId : string) => void;
}

const ScrollableList = styled(List) ({
        border: '2px solid #4054b4', // primary ??
        borderRadius: '4px',
        maxHeight: '350px',
        overflow: 'auto',
        padding: '5px'
    }
)

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
        <ScrollableList>
            {props.mates.map(({id, name, surname}) => (
                <ListItem disableGutters>
                    <Checkbox
                        color="primary"
                        edge="start" tabIndex={-1}
                        checked={checked.indexOf(id) !== -1}
                        onClick={() => handleCheckboxChange(id)}/>
                    <ListItemText>{name + ' ' + surname}</ListItemText>
                </ListItem>
                )
            )}
        </ScrollableList>
    )
}

export default StudentCheckboxList;