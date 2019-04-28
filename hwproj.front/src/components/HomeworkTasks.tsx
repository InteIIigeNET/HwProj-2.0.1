import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import { HomeworkTaskViewModel, HomeworksApi} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router";
import Homework from './Homework';
import { Typography } from '@material-ui/core';
import Task from './Task'

interface IHomeworkTasksProps {
    id: number
}

interface IHomeworkTasksState {
    isLoaded: boolean,
    tasks: number[]
}

export default class HomeworkTasks extends React.Component<IHomeworkTasksProps, IHomeworkTasksState> {
    constructor(props : IHomeworkTasksProps) {
        super(props);
        this.state = {
            isLoaded: false,
            tasks: []
        };
    }

    public render() {
        const { isLoaded, tasks} = this.state;

        if (isLoaded) {
                let listItems = tasks.map(homeworkId => <li>
                        <Task id={homeworkId} />
                    </li>);
                
                return (
                    <div>
                        <ol>
                            {listItems}
                        </ol>
                    </div>
                )
        }

        return <h1>loading...</h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getHomework(this.props.id)
            .then(res => res.json())
            .then(homework => this.setState({
                isLoaded: true,
                tasks: homework.tasks
            }));
    }
}