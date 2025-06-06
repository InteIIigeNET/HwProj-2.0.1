import * as React from 'react';
import {
    ValueType,
    Payload,
} from 'recharts/types/component/DefaultTooltipContent';
import {List, ListItem} from '@mui/material';
import { getTip } from "../../Common/HomeworkTags"
import Utils from "../../../services/Utils";

export interface ITaskChartView {
    title : string;
    receiveRating?: number;
    maxRating: number;
    tags: string[];
}

interface ITooltipProps {
    active? : boolean,
    payload? : Payload<ValueType, string | number>[] | undefined
    activeId: string
}

const StudentStatsTooltip : React.FC<ITooltipProps> = (props) => {
    if (props.active! && props.payload && props.payload.length) {
        return (
            <div style={{fontSize: 11, color: '#666', backgroundColor: 'rgba(255, 255, 255, 0.9)'}}>
                {
                    props.payload.map((item, index) => {
                        if (item.payload.id! == props.activeId) {
                            const tasks = item.payload.tasks;
                            return (
                                <div key={index}>
                                    <p style={{fontWeight: 'bold', textAlign: 'center', padding: 3, marginBottom: 0, backgroundColor: 'rgba(232, 232, 232, 0.8)'}}>
                                        {Utils.renderReadableDateWithoutTime(new Date(item.payload.date))}
                                    </p>
                                    
                                    <p style={{margin: '3px 5px 2px 5px'}}>Баллов на текущий момент: <b>{item.value}</b></p>
                                    <p style={{margin: '3px 5px 0px 5px'}}>
                                        {tasks.length ? "Сданные в этот день задачи" : "Нет сданных задач"}
                                    </p>
                                    
                                    <List sx={{listStyleType: 'disc', pl: 3, pt: 0}}>
                                        {tasks.map((task : ITaskChartView, index: number) => {
                                            return <ListItem sx={{display: 'list-item', padding: 0}} key={index}>
                                                <p style={{marginTop: 2, marginBottom: 2, marginRight: 5}}>
                                                    {task.title}{getTip(task)}{` `}
                                                    <b>{+task.receiveRating!.toFixed(2)}/{task.maxRating}</b>
                                                </p>
                                            </ListItem>
                                        })}
                                    </List>
                                </div>
                            )
                        }
                    })
                }
            </div>
        )
    }
    
    return null;
}

export default StudentStatsTooltip;