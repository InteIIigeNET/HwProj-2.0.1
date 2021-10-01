import {Accordion, AccordionDetails, AccordionSummary, Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ApiSingleton from 'api/ApiSingleton';
import * as React from 'react';
import {HomeworkTaskViewModel} from "../../api";
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
            <div style={{width: '100%'}}>
                {this.props.tasks
                    .sort((t1, t2) => new Date(t1.publicationDate!).getTime() - new Date(t2.publicationDate!).getTime())
                    .map((task: any) => {
                        return (
                            <Task
                                task={task}
                                forStudent={this.props.forStudent}
                                forMentor={this.props.forMentor}
                                onDeleteClick={() => this.props.onDelete()}
                                isExpanded={false}
                                showForCourse={true}
                            />
                        )
                }).reverse()}
            </div>
        )
    }
}