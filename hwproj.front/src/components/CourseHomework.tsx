import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import { HomeworkViewModel, HomeworksApi} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router";
import Homework from './Homework';
import { Typography } from '@material-ui/core';

interface ICourseHomeworkProps {
    id: number
}

interface ICourseHomeworkState {
    isLoaded: boolean,
    homeworks: number[]
}

export default class CourseHomework extends React.Component<ICourseHomeworkProps, ICourseHomeworkState> {
    constructor(props : ICourseHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            homeworks: []
        };
    }

    public render() {
        const { isLoaded, homeworks} = this.state;

        if (isLoaded) {
                let listItems = homeworks.map(homeworkId => <ListItem>
                        <Homework id={homeworkId} />
                    </ListItem>).reverse();
                
                return (
                    <div>
                        {listItems.length > 0 &&
                            <Typography variant='h5'>Задачи</Typography>
                        }
                        <List>
                            {listItems}
                        </List>
                    </div>
                )
        }

        return <h1>loading...</h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getCourseHomeworks(this.props.id)
            .then(homeworks => this.setState({
                isLoaded: true,
                homeworks: homeworks.map(hw => hw.id!)
            }));
    }
}