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
    isReadingMode: boolean,
    onDelete: () => void
}

const HomeworkTasks: FC<IHomeworkTasksProps> = (props) => {

    return (
        <div style={{width: '100%'}}>
            {props.tasks
                .map((task: any) => {
                    return (
                        <Task
                            task={task}
                            forStudent={props.forStudent}
                            forMentor={props.forMentor}
                            isReadingMode={props.isReadingMode}
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
