import * as React from 'react';
import {
    Bar, XAxis, YAxis, ComposedChart, Text,
    ReferenceLine, Tooltip, Scatter, ZAxis
} from 'recharts';
import { HomeworkViewModel, StatisticsCourseMatesModel } from '../../../api';
import StudentStatsUtils from "../../../services/StudentStatsUtils";
import Utils from "../../../services/Utils";
import {Payload, ValueType} from "recharts/types/component/DefaultTooltipContent";
interface IStudentPunctualityChartProps {
    index: number;
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel;
}

interface IStudentAttempt {
    fill? : string;
    xAxisPosition: number;
    yAxisPosition: number | null;
    yAxisPositionDeadline?: number
}

interface IDatesDeviation {
    value: number;
    measure: "RatingDate" | "DeadlineDate"
}

interface ISectorProps {
    title : string;
    barsAmount: number;
}

interface ICustomTooltipProps {
    active? : boolean;
    payload? : Payload<ValueType, string | number>[] | undefined;
    label? : number;
    deadlineRepresentation : Map<number, string>;
    actuallyDeviation: Map<number, IDatesDeviation>;
}

const chartColors = {
    axis: 'rgb(200, 200, 200)', 
    scatter: 'rgb(200, 200, 200)',
    axisLabel: 'rgb(126, 126, 126)',
    tooltipBorder: 'rgb(232, 232, 232)'
}
const MAXIMUM_DEVIATION = 10;

const CustomYAxisTick = (props : any) => {
    const { x, y, payload } = props;
    
    return (
        <g>
            <text x={x+13} y={y} dy="0.355em" textAnchor='start' fill={chartColors.axis}>
                {Math.abs(parseInt(payload.value))}
            </text>
        </g>
    )
}

const CustomXAxisTick = (props : any) => {
    const { x, y, payload, sectors} = props;
    
    const maxWordSize = MAXIMUM_DEVIATION + 4 * sectors.get(payload.value)!.barsAmount
    const customTitle = sectors.get(payload.value)!.title.split(' ').map((word : string) => 
        {
            if (word.length > maxWordSize) {
            return word.slice(0, maxWordSize-2) + '..'
            }
            return word;
        }).join(' ');
    
    
    return (
        <g transform={`translate(${x},${y})`}>
            <Text x={0} y={3} width={20} textAnchor='start' fill={chartColors.axisLabel}
                  verticalAnchor='middle' fontSize={12.5}
            >
                {customTitle}
            </Text>
        </g>
    )
}

const CustomTooltip : React.FC<ICustomTooltipProps> = (props) => {
    const formatValueToText = () => {
        if (props.payload![0].name === 'scatter') {
            return 'День дедлайна'
        } else {
            const actuallyDeviation = props.actuallyDeviation.get(props.label!)!;
            const dateToMs = actuallyDeviation.value * 1000 * 3600 * 24;
            const sentDeviationDeadline = Utils.pluralizeDateTime(Math.abs(dateToMs));

            const isCountedFromRating = actuallyDeviation.measure === "RatingDate";
            const measure = isCountedFromRating  ? 'последней проверки' : 'дедлайна';
            return (Math.abs(dateToMs / 60000) < 1) ? `Сдано ${isCountedFromRating ? 'сразу после последней проверки' : 'ровно в срок'}`
                : (dateToMs < 0 
                    ? `Сдано через ${sentDeviationDeadline} после ${measure}`
                    : `Сдано за ${sentDeviationDeadline} до дедлайна`);
        }
    }
        
    if (props.active && props.payload && props.payload.length) {
        const formatDate = props.deadlineRepresentation.get(props.label!);
        const numberDate = formatDate ? Date.parse(formatDate.split('.').reverse().join('/')) : undefined;
        return (
            <div style={{borderRadius: 3, overflow: 'hidden', fontSize: '13px', color:'rgb(90,94,98)'}}>
                <p style={{backgroundColor: `${chartColors.tooltipBorder}`, fontWeight: 'bold',
                    textAlign: 'center', marginTop: '0px', marginBottom: '0px'}}
                >
                    {numberDate && Utils.renderReadableDateWithoutTime(new Date(numberDate))}
                </p>
                <p style={{ margin: '3px 5px 3px 5px'}}>{formatValueToText()}</p>
            </div>
        )
    }

    return null;
}

const StudentPunctualityChart : React.FC<IStudentPunctualityChartProps> = (props) => {
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
        .sort((x, y) => {
            const [xDate, yDate] = [x.publicationDate!, y.publicationDate!];
            return xDate > yDate ? 1 : (yDate > xDate ? -1 : 0);
        })
    
    const daysDifference = (firstDate: Date, secondDate : Date) => {
        const msecInDay = 1000 * 3600 * 24;
        return (new Date(firstDate).getTime() - new Date(secondDate).getTime()) / msecInDay;
    }
    const getDatesDiff = (solutionPublicationDate: Date, deadlineDate : Date) => {
        const differenceInDays = daysDifference(deadlineDate, solutionPublicationDate);
        return ( Math.abs(differenceInDays) > MAXIMUM_DEVIATION
            ? MAXIMUM_DEVIATION * Math.sign(differenceInDays) : differenceInDays);
    }
    
    const solveAttempts = new Array<IStudentAttempt>();
    const referenceLinesXAxis = new Array<number>();
    const actuallyDeviation = new Map<number, IDatesDeviation>();
    const deadlinesRepresentation = new Map<number, string>();
    const sectors = new Map<number, ISectorProps>();
    
    let count = 0;
    solveAttempts.push({xAxisPosition: count, yAxisPosition: null})
    props.solutions.homeworks!.forEach(hw => {
        hw.tasks!.filter(task => tasks.find(t => t.id === task.id)!.hasDeadline)
            .forEach(task => {
                
            count += 1;
            const deadlineDate = tasks.find(t => t.id === task.id)!.deadlineDate!;
            const maxRating = tasks.find(t => t.id === task.id)!.maxRating!;
            const title = tasks.find(t => t.id === task.id)!.title!;
            let isDeadlinePassed = false;
            
            sectors.set(count, {title, barsAmount: task.solution!.length});
            task.solution!.forEach((solution, index) => {
                const fill = StudentStatsUtils.calculateLastRatedSolutionInfo([solution], maxRating).color;
                const prevSolution = task.solution![index-1];
                const measureDate = prevSolution?.rating && prevSolution?.ratingDate &&
                    prevSolution.ratingDate < solution.publicationDate! && prevSolution.ratingDate > deadlineDate
                    ? prevSolution.ratingDate : deadlineDate;
                const deviation = getDatesDiff(solution.publicationDate!, measureDate);

                if (deviation < 0 && !isDeadlinePassed) {
                    deadlinesRepresentation.set(count, Utils.renderDateWithoutHours(deadlineDate));
                    solveAttempts.push({xAxisPosition: count, yAxisPosition: null, yAxisPositionDeadline: 0})
                    isDeadlinePassed = true;
                    count += 1;
                }
                actuallyDeviation.set(count, {
                    value: daysDifference(measureDate, solution.publicationDate!), 
                    measure: measureDate === prevSolution?.ratingDate ? "RatingDate" : "DeadlineDate"});
                
                solveAttempts.push({fill, xAxisPosition: count, yAxisPosition: deviation})
                count += 1;
            })
            
            if (!isDeadlinePassed) {
                deadlinesRepresentation.set(count, Utils.renderDateWithoutHours(deadlineDate));
                solveAttempts.push({xAxisPosition: count, yAxisPosition: null, yAxisPositionDeadline: 0})
                count += 1;
            }
            referenceLinesXAxis.push(count);
            solveAttempts.push({xAxisPosition: count, yAxisPosition: null})
        })
    })
    
    const [ barSize, barGap] = [ 20, 10];

    return (
        <div style={{height: '300', width: '100%', overflowX: 'auto', overflowY: "hidden", paddingBottom: 7}}
             onScroll={(e) => {
                 let ele = (document.getElementsByClassName("recharts-yAxis") as HTMLCollectionOf<HTMLElement>)[props.index];
                 ele.style.setProperty('transform', "translateX("+(e.target as HTMLTextAreaElement).scrollLeft+"px)", 'important');
             }}>
            
            <ComposedChart data={solveAttempts.sort((x, y) => x.xAxisPosition - y.xAxisPosition)}
                           height={300}
                           width={count * (barSize + barGap)}
                           margin={{top: 5, right: 5, bottom: 10, left: 0}}
                           style={{color: 'red'}}
                           barGap={barGap}
            >
                <XAxis dataKey="xAxisPosition"
                       tickMargin={10}
                       ticks={Array.from(sectors.keys())}
                       tick={<CustomXAxisTick sectors={sectors}/>}
                       padding={{left: 20}}
                       strokeWidth={0.5}
                       stroke={chartColors.axis}
                       tickLine={false}
                />
                <ZAxis range={[30, 31]}/>
                
                <Tooltip 
                    content={ <CustomTooltip 
                        deadlineRepresentation={deadlinesRepresentation}
                        actuallyDeviation={actuallyDeviation}
                    />}
                    wrapperStyle={{border: `solid 1px ${chartColors.tooltipBorder}`, borderRadius: 3, background: 'white'}}
                />
                
                <ReferenceLine y={0} strokeWidth={0.5}/>

                {referenceLinesXAxis.map(x => (
                    <ReferenceLine x={x} strokeWidth={0.5}/>
                ))}

                <Scatter dataKey="yAxisPositionDeadline" shape="circle" fill={chartColors.scatter} name='scatter' />

                <Bar dataKey="yAxisPosition"/>

                <YAxis domain={[-MAXIMUM_DEVIATION, MAXIMUM_DEVIATION]}
                       style={{transform: "translate(0, 0)", backgroundColor: 'white'}}
                       padding={{top: 10, bottom: 20}}
                       tick = {<CustomYAxisTick/>}
                       stroke={chartColors.axis}
                       strokeWidth={0.5}
                       width={0.5}

                />
            </ComposedChart>
        </div>
    )
}

export default StudentPunctualityChart;