import {Accordion, AccordionDetails, AccordionSummary, Typography} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ApiSingleton from 'api/ApiSingleton';
import * as React from 'react';
import {HomeworkTaskViewModel} from "../../api";
import Task from './Task'
import {FC} from "react";

interface IHomeworkTasksProps {
    tasks: HomeworkTaskViewModel[],
    forMentor: boolean,
    forStudent: boolean,
    onDelete: () => void
}

const HomeworkTasks: FC<IHomeworkTasksProps> = (props) => {

    return (
        <div style={{width: '100%'}}>
            {props.tasks
                .sort((t1, t2) => new Date(t1.publicationDate!).getTime() - new Date(t2.publicationDate!).getTime())
                .map((task: any) => {
                    return (
                        <Task
                            task={task}
                            forStudent={props.forStudent}
                            forMentor={props.forMentor}
                            onDeleteClick={() => props.onDelete()}
                            isExpanded={false}
                            showForCourse={true}
                        />
                    )
                }).reverse()}
        </div>
    )
}

export default HomeworkTasks