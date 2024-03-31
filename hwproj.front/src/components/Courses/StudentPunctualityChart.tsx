import * as React from 'react';
import {
    Bar, XAxis, YAxis, ComposedChart, Text,
    ReferenceLine, Tooltip, Scatter, ZAxis
} from 'recharts';
import { HomeworkViewModel, StatisticsCourseMatesModel } from '../../api';
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
import {Payload, ValueType, NameType} from "recharts/types/component/DefaultTooltipContent";
interface IStudentPunctualityChartProps {
    index: number; // для получения yAxis через className
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel;
}

interface IStudentAttempt {
    fill? : string;
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

interface ICustomTooltipProps {
    active? : boolean;
    payload? : Payload<ValueType, string | number>[] | undefined;
    label? : number;
    deadlineRepresentation : Map<number, string>;
}

const chartColors = {
    axis: 'rgb(200, 200, 200)', 
    scatter: 'rgb(200, 200, 200)',
    axisLabel: 'rgb(126, 126, 126)',
    tooltipBorder: 'rgb(232, 232, 232)'
}

const CustomYAxisTick = (props : any) => {
    const { index, x, y, payload } = props;
    
    return (
        <g>
            
            <text x={x+13} y={y} dy="0.355em" textAnchor='start' fill={chartColors.axisLabel}>
                {Math.abs(parseInt(payload.value))}
            </text>
        </g>
    )
}

const CustomXAxisTick = (props : any) => {
    const { index, x, y, payload, title} = props;
    return (
        <g transform={`translate(${x},${y})`} style={{margin: 5}}>
            <Text x={0} y={3} width={20} textAnchor='middle' 
                  fill={chartColors.axisLabel} verticalAnchor='middle' fontSize={10.5}
            >
                {title.get(payload.value)}
            </Text>
        </g>
    )
}

const CustomTooltip : React.FC<ICustomTooltipProps> = (props) => {
    const formatValueToText = () => {
        if (props.payload![0].name === 'scatter') {
            return 'День дедлайна'
        } else {
            const dateToMs = parseFloat(`${props.payload![0].value!}`) * 1000 * 3600 * 24;
            const sentDeviationDeadline = Utils.pluralizeDateTime(Math.abs(dateToMs));
            
            return (Math.abs(dateToMs / 60000) < 1) ? 'Сдано ровно в срок'
                : (dateToMs < 0 
                    ? `Сдано через ${sentDeviationDeadline} после дедлайна`
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
    const MAXIMUM_DEVIATION = 10;
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
        .sort((x, y) => {
            const [xDate, yDate] = [x.publicationDate!, y.publicationDate!];
            return xDate > yDate ? 1 : (yDate > xDate ? -1 : 0);
        })
    
    const getDatesDiff = (solutionPublicationDate: Date, deadlineDate : Date) => {
        const msecInDay = 1000 * 3600 * 24;
        const differenceInDays = (deadlineDate.getTime() - solutionPublicationDate.getTime()) / msecInDay;
        
        return ( Math.abs(differenceInDays) > MAXIMUM_DEVIATION
            ? MAXIMUM_DEVIATION * Math.sign(differenceInDays) : differenceInDays);
    }
    
    const solveAttempts : IStudentAttempt[] = [];
    const referenceLinesXAxis : number[] = [];
    const deadlinesRepresentation = new Map<number, string>();
    const titleRepresentation = new Map<number, string>();
    const sectors : ISectorTitleProps[] = [];
    let count = 0;
    
    props.solutions.homeworks!.forEach(hw => {
        hw.tasks!.forEach(task => {
            const deadlineDate = tasks.find(t => t.id === task.id)!.deadlineDate!;
            const maxRating = tasks.find(t => t.id === task.id)!.maxRating!;
            const title = tasks.find(t => t.id === task.id)!.title!;
            const x1 = count;
            let isDeadlinePassed = false;
            count += 1;
            task.solution!.forEach(solution => {
                const deviation = getDatesDiff(solution.publicationDate!, deadlineDate);
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

            const averageSectorPosition = x1 + (count - x1) / 2;
            titleRepresentation.set(Math.round(averageSectorPosition), title);
            
            sectors.push({x1, x2: count, sectorTitle: title, numberOfItems: 0})
            referenceLinesXAxis.push(count);
            solveAttempts.push({xAxisPosition: count, yAxisPosition: null})
        })
    })

    return (
        <div style={{height: '300', width: '100%', overflowX: 'auto', overflowY: "hidden", paddingBottom: 7}}
             onScroll={(e) => {
                 let ele = (document.getElementsByClassName("recharts-yAxis") as HTMLCollectionOf<HTMLElement>)[props.index];
                 ele.style.setProperty('transform', "translateX("+(e.target as HTMLTextAreaElement).scrollLeft+"px)", 'important');
             }}>
            
            <ComposedChart data={solveAttempts.sort((x, y) => x.xAxisPosition - y.xAxisPosition)}
                           height={300} width={1400}
                           margin={{top: 5, right: 5, bottom: 5, left: 0}}
                           style={{color: 'red'}}
            >
                <XAxis dataKey="xAxisPosition"
                       tickMargin={10}
                       ticks={Array.from(titleRepresentation.keys())}
                       tick={<CustomXAxisTick title={titleRepresentation}/>}
                       padding={{left: 20}}
                       strokeWidth={0.5}
                       stroke={chartColors.axis}
                />
                <ZAxis range={[30, 31]}/>
                
                <Tooltip 
                    content={ <CustomTooltip deadlineRepresentation={deadlinesRepresentation}/>}
                    wrapperStyle={{border: `solid 1px ${chartColors.tooltipBorder}`, borderRadius: 3, background: 'white'}}
                />
                
                <ReferenceLine y={0} strokeWidth={0.5}/>

                {referenceLinesXAxis.map(x => (
                    <ReferenceLine x={x} strokeWidth={0.5}/>
                ))}

                <Scatter dataKey="yAxisPositionDeadline" shape="circle" fill={chartColors.scatter} name='scatter' />

                <Bar dataKey="yAxisPosition" barSize={30}/>

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