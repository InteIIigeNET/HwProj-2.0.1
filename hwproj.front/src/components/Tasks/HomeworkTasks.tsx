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
                .sort((t1, t2) => new Date(t1.publicationDate!).getTime() - new Date(t2.publicationDate!).getTime())
                .map((task: any) => {
                    return (
                        <div style={{marginTop: "15px"}}>
                            <Task
                                task={task}
                                forStudent={props.forStudent}
                                forMentor={props.forMentor}
                                isReadingMode={props.isReadingMode}
                                onDeleteClick={() => props.onDelete()}
                                isExpanded={false}
                                showForCourse={true}
                            />
                        </div>
                    )
                }).reverse()}
        </div>
    )
}

export default HomeworkTasks
