import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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

                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls="panel1a-content"
                                        id="panel1a-header"
                                        style={{backgroundColor: "AliceBlue"}}
                                    >
                                        <Typography>{task.title!}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Task
                                            task={task}
                                            forStudent={this.props.forStudent}
                                            forMentor={this.props.forMentor}
                                            onDeleteClick={() => this.props.onDelete()}
                                        />
                                    </AccordionDetails>
                                </Accordion>
                            </li>
                        )
                    })}
                </ol>
            </div>
        )
    }
}