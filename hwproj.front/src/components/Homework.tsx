import * as React from 'react';
import ListItem from '@material-ui/core/ListItem';
import List from '@material-ui/core/List';
import Link from '@material-ui/core/Link';
import { HomeworkViewModel, HomeworksApi} from "../api/homeworks/api";
import {RouteComponentProps} from "react-router";
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Task from './Task';
import AddTask from'./AddTask'
import HomeworkTasks from './HomeworkTasks'

interface IHomeworkProps {
    id: number
}

interface IHomeworkState {
    isLoaded: boolean,
    isFound: boolean,
    homework: HomeworkViewModel,
    createTask: boolean
}

export default class Course extends React.Component<IHomeworkProps, IHomeworkState> {
    constructor(props : IHomeworkProps) {
        super(props);
        this.state = {
            isLoaded: false,
            isFound: false,
            homework: {},
            createTask: false
        };
    }

    public render() {
        const { isLoaded, isFound, homework, createTask } = this.state;

        if (isLoaded) {
            if (isFound) {
                return (
                    <div>
                        <Typography variant="subtitle1" gutterBottom>
                            <b>{homework.title}</b> {homework.date}
                            <br />
                            {homework.description}
                        </Typography>
                        
                        {createTask && 
                            <div>
                                <HomeworkTasks id={this.props.id} />
                                <AddTask
                                id={homework.id!}
                                onAdding={() => this.setState({createTask: false})} />
                            </div>
                        }
                        {!createTask &&
                            <div>
                                <HomeworkTasks id={this.props.id} />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => { this.setState({createTask: true })}}>Добавить задачу</Button>
                            </div>
                        }
                    </div>
                )
            }
        }

        return <h1>loading...</h1>
    }

    componentDidMount(): void {
        let api = new HomeworksApi();
        api.getHomework(this.props.id)
            .then(res => res.json())
            .then(data => this.setState({
                isLoaded: true,
                isFound: true,
                homework: data
            }))
            .catch(err => this.setState({
                isLoaded: true,
                isFound: false
            }));
    }
}