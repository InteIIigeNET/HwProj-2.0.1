import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import { Typography } from '@material-ui/core';
import { HomeworkViewModel } from "../api/homeworks/api";
import Homework from './Homework';

interface ICourseHomeworkProps {
    homework: HomeworkViewModel[]
    forMentor: boolean,
    forStudent: boolean,
    onDelete: () => void
}

export default class CourseHomework extends React.Component<ICourseHomeworkProps, {}> {
    constructor(props : ICourseHomeworkProps) {
        super(props);
    }

    public render() {
        let homeworkList = this.props.homework.map(hw =>
            <ListItem key={hw.id}>
                <Homework homework={hw} forStudent={this.props.forStudent} forMentor={this.props.forMentor} onDeleteClick={() => this.props.onDelete()}/>
            </ListItem>).reverse();
        
        return (
            <div>
                {homeworkList.length > 0 &&
                    <Typography variant='h6'>Задачи</Typography>
                }
                <List>
                    {homeworkList}
                </List>
            </div>
        )
    }
}