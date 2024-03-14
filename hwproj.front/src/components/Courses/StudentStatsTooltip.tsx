import * as React from 'react';
import {TooltipProps} from 'recharts';
// for recharts v2.1 and above
import {
    ValueType,
    NameType,
    Payload,
} from 'recharts/types/component/DefaultTooltipContent';

interface ITaskChartView {
    title : string;
    receiveRating?: number;
    maxRating: number;
}

interface IDummyInterface {
    active? : boolean,
    payload? : Payload<ValueType, string | number>[] | undefined
    activeId: string
}
// TooltipProps<ValueType, NameType>
const StudentStatsTooltip : React.FC<IDummyInterface> = (props) => {
    if (props.active! && props.payload && props.payload.length) {
        return (
            <div>
                {
                    props.payload.map(item => {
                        if (item.payload.id! == props.activeId) {
                            return (
                                <div>
                                    <p>{`Общий рейтинг: ${item.value}`}</p>
                                    <p>{'Сданные в этот день задачи:'}</p>
                                    {item.payload.tasks.map((task : ITaskChartView) => {
                                        return <p style={{paddingLeft:"2"}}>{`${task.title}  ${task.receiveRating!}/${task.maxRating}`}</p>
                                    })}
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