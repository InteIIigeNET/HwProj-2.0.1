import ApiSingleton from 'api/ApiSingleton';
import * as React from 'react';
import { HomeworkTaskViewModel } from "../../api";
import Task from './Task'

interface IHomeworkTasksProps {
    tasks: HomeworkTaskViewModel[],
    forMentor: boolean,
    forStudent: boolean,
    onDelete: () => void
}

export default class HomeworkTasks extends React.Component<IHomeworkTasksProps, {}> {
    public render() {
        return (
            <div>
                <ol>
                    {this.props.tasks.map((task: any) => {
                        return (
                            <li key={task.id}>
                                <Task
                                    task={task}
                                    forStudent={this.props.forStudent}
                                    forMentor={this.props.forMentor}
                                    onDeleteClick={() => this.props.onDelete()}
                                    />
                            </li>
                        )
                    })}
                </ol>
            </div>
        )
    }
}