import * as React from 'react';
import {
    ResponsiveContainer, ReferenceArea, Legend,
    Bar, XAxis, YAxis, ComposedChart, BarChart,
    ReferenceLine, Tooltip, ReferenceDot, Scatter, XAxisProps
} from 'recharts';
import { HomeworkViewModel, StatisticsCourseMatesModel } from '../../api';
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
import {useRef} from "react";
interface IStudentPunctualityChartProps {
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel;
}

interface IStudentAttempt {
    fill? : string;
    // должно быть макс значения для дельты от дедлайна
    xAxisPosition: number;
    yAxisPosition: number | null; // нужно выбрать диапазон, допустим [-14, 14]
    yAxisPositionDeadline?: number
}

interface ISectorTitleProps {
    sectorTitle: string;
    x1: number;
    x2: number;
    numberOfItems: number;
}

const StudentPunctualityChart : React.FC<IStudentPunctualityChartProps> = (props) => {
    const MAXIMUM_DEVIATION = 10;
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
        .sort((x, y) => {
            const [xDate, yDate] = [x.publicationDate!, y.publicationDate!];
            return xDate > yDate ? 1 : (yDate > xDate ? -1 : 0);
        })
    
    const deviationFromDeadlineDate = (solutionPublicationDate : Date, publicationDate : Date, deadlineDate : Date) => {
        const msecInDay = 1000 * 3600 * 24;
        const timeToSolutionInDays = (deadlineDate.getTime() - publicationDate.getTime()) / msecInDay;
        const differenceInDays = (deadlineDate.getTime() - solutionPublicationDate.getTime()) / msecInDay;
        const coefficient = timeToSolutionInDays / MAXIMUM_DEVIATION;
        return ( Math.abs(differenceInDays) > MAXIMUM_DEVIATION 
            ? MAXIMUM_DEVIATION * Math.sign(differenceInDays) : differenceInDays) * coefficient;
    }
    
    const solveAttempts : IStudentAttempt[] = [];
    const referenceLinesXAxis : number[] = [];
    const deadlinesRepresentation = new Map<number, string>();
    const sectors : ISectorTitleProps[] = [];
    let count = 0;
    
    props.solutions.homeworks!.forEach(hw => {
        hw.tasks!.forEach(task => {
            const deadlineDate = tasks.find(t => t.id === task.id)!.deadlineDate!;
            const publicationDate = tasks.find(t => t.id === task.id)!.publicationDate!;
            const maxRating = tasks.find(t => t.id === task.id)!.maxRating!;
            const title = tasks.find(t => t.id === task.id)!.title!;
            const x1 = count;
            let isDeadlinePassed = false;
            count += 1;
            task.solution!.forEach(solution => {
                const deviation = deviationFromDeadlineDate(solution.publicationDate!, publicationDate, deadlineDate);
                const color = 
                    StudentStatsUtils.calculateLastRatedSolutionInfo([solution], maxRating).color;

                if (deviation < 0 && !isDeadlinePassed) {
                    deadlinesRepresentation.set(count, Utils.renderDateWithoutHours(deadlineDate));
                    solveAttempts.push({xAxisPosition: count, yAxisPosition: null, yAxisPositionDeadline: 0})
                    isDeadlinePassed = true;
                    count += 1;
                }
                
                solveAttempts.push({fill : color, xAxisPosition: count, yAxisPosition: deviation})
                count += 1;
            })
            
            if (!isDeadlinePassed) {
                deadlinesRepresentation.set(count, Utils.renderDateWithoutHours(deadlineDate));
                solveAttempts.push({xAxisPosition: count, yAxisPosition: null, yAxisPositionDeadline: 0})
                count += 1;
            }
            
            sectors.push({x1, x2: count, sectorTitle: title, numberOfItems: 0})
            referenceLinesXAxis.push(count);
            solveAttempts.push({xAxisPosition: count, yAxisPosition: null})
        })
    })
    
    return (
        <div style={{height: '350', width: '100%', overflowX: 'auto', overflowY: "hidden"}}
             onScroll={(e) => {
                 let ele = (document.getElementsByClassName("recharts-yAxis") as HTMLCollectionOf<HTMLElement>)[0];
                 console.log((e.target as HTMLTextAreaElement).scrollLeft);
                 console.log(ele);
                 ele.style.transform = "translateX("+(e.target as HTMLTextAreaElement).scrollLeft+"px);";
                 ele.style.backgroundColor = "red";
             }}>
            <ComposedChart data={solveAttempts} height={300} width={1400}
                           margin={{top: 5, right: 5, bottom: 5, left: 5}}>
                <XAxis dataKey="xAxisPosition"
                       ticks={Array.from(deadlinesRepresentation.keys())}
                       tickFormatter={tick => deadlinesRepresentation.get(tick)!}
                       padding={{left: 10}}
                />
                
                <YAxis domain={[-MAXIMUM_DEVIATION, MAXIMUM_DEVIATION]}
                       style={{transform: "translate(0, 0)"}}
                />
                
                <Tooltip/>
                {/*<XAxis orientation="top" xAxisId="titles" tickLine={false} axisLine={false}/>*/}
                
                <ReferenceLine y={0} strokeWidth={0.5}/>

                {referenceLinesXAxis.map(x => (
                    <ReferenceLine x={x} strokeWidth={0.5}/>
                ))}

                <Scatter dataKey="yAxisPositionDeadline" shape="cross" color="red"/>

                <Bar dataKey="yAxisPosition" barSize={30}/>
            </ComposedChart>
        </div>
    )
}

export default StudentPunctualityChart;