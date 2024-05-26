import * as React from 'react';
import {Bar, ComposedChart, ReferenceLine, Scatter, Text, Tooltip, XAxis, YAxis, ZAxis} from 'recharts';
import { Tooltip as MuiTooltip } from '@mui/material';
import {Solution, HomeworkViewModel,  StatisticsCourseMatesModel} from '../../../api';
import StudentStatsUtils from "../../../services/StudentStatsUtils";
import Utils from "../../../services/Utils";
import {Payload, ValueType} from "recharts/types/component/DefaultTooltipContent";
import {useState} from "react";

interface IStudentPunctualityChartProps {
    index: number;
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel;
    sectorSizes: number[]
}

interface IStudentAttempt {
    fill? : string;
    link? : string;
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
    dates : Map<number, number>;
    attemptRepresentation: Map<number, [IDatesDeviation, string, boolean]>;
}

interface ICustomXAxisProps {
    [key: string]: any;
    sectors: Map<number, ISectorProps>
}

type DeadlineRepresentation = Map<number, number>
type SectorRepresentation = Map<number, [number, ISectorProps]>

const chartColors = {
    axis: 'rgb(200, 200, 200)', 
    scatter: 'rgb(200, 200, 200)',
    axisLabel: 'rgb(126, 126, 126)',
    tooltipBorder: 'rgb(232, 232, 232)'
}
const MAXIMUM_DEVIATION = 10;
const MINIMUM_DEVIATION = 1 / 12;
const EMPTY_SECTOR_LETTER_SIZE = 8;
const BAR_LETTER_SIZE = 4;

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

const CustomXAxisTick = (props : ICustomXAxisProps) => {
    const { x, y, payload, sectors} = props;
    const [open, setOpen] = useState(false);
    const sector = sectors.get(payload.value)
    const maxWordSize = EMPTY_SECTOR_LETTER_SIZE + BAR_LETTER_SIZE * (sector?.barsAmount ?? 0)
    const title = sector?.title ?? ""
    const customTitle = title.split(' ').slice(0, 3).map((word : string) =>
    {
        if (word.length > maxWordSize) {
            return word.slice(0, maxWordSize-2) + '..'
        }
        return word;
    }).join(' ');

    const isClipped = (title.split(' ').length > 3) || title.split(' ')
        .some(word => word.length > maxWordSize)
    
    return (
        <MuiTooltip open={open && isClipped} title={title} arrow
                    onMouseEnter={() => setOpen(true)}
                    onMouseLeave={() => setOpen(false)}
                    placement="top">
            <g transform={`translate(${x},${y})`}>
                <Text x={0} y={3} width={20} textAnchor='start' fill={chartColors.axisLabel}
                      verticalAnchor='middle' fontSize={12}
                >
                    {customTitle}
                </Text>
            </g>
        </MuiTooltip>
    )
}

const CustomTooltip: React.FC<ICustomTooltipProps> = (props) => {
    const formatValueToText = () => {
        if (props.payload![0].name === 'scatter') {
            return 'День дедлайна'
        } else {
            const [actuallyDeviation, rating, isRate] = props.attemptRepresentation.get(props.label!)!;
            const deviationToMs = actuallyDeviation.value * 1000 * 3600 * 24;
            const MsPerMinute = 60000;
            const sentDeviationDeadline = Utils.pluralizeDateTime(Math.abs(deviationToMs));

            const isCountedFromRating = actuallyDeviation.measure === "RatingDate";
            const measure = isCountedFromRating  ? 'последней проверки' : 'дедлайна';
            const deviation = (Math.abs(deviationToMs / MsPerMinute) < 1) ? `Сдано ${isCountedFromRating ? 'сразу после последней проверки' : 'ровно в срок'}`
                : (deviationToMs < 0
                    ? `Сдано через ${sentDeviationDeadline} после ${measure}`
                    : `Сдано за ${sentDeviationDeadline} до дедлайна`);
            const rate = isRate ? <><strong>Баллов</strong>: {rating}</> : <>Ещё не проверено</>;
            
            return <p style={{margin: 0}}>{deviation} <br/>{rate}</p>
        }
    }
        
    if (props.active && props.payload && props.payload.length) {
        const dateTicks = props.dates.get(props.label!);
        return (
            <div style={{borderRadius: 3, overflow: 'hidden', fontSize: '13px', color:'rgb(90,94,98)'}}>
                <p style={{backgroundColor: `${chartColors.tooltipBorder}`, fontWeight: 'bold',
                    textAlign: 'center', marginTop: '0px', marginBottom: '0px'}}
                >
                    {dateTicks && Utils.renderReadableDateWithoutTime(new Date(dateTicks))}
                </p>
                <p style={{ margin: '3px 5px 3px 5px'}}>{formatValueToText()}</p>
            </div>
        )
    }

    return null;
}

const StudentPunctualityChart : React.FC<IStudentPunctualityChartProps> = (props) => {
    const handleClick = (data : IStudentAttempt) => {
        if (data.link) {
            window.open(data.link, '_blank');
        }
    }
    const daysDifference = (firstDate: Date, secondDate : Date) => {
        const msecInDay = 1000 * 3600 * 24;
        return (new Date(firstDate).getTime() - new Date(secondDate).getTime()) / msecInDay;
    }
    const getDatesDiff = (solutionPublicationDate: Date, deadlineDate : Date) => {
        const differenceInDays = daysDifference(deadlineDate, solutionPublicationDate);
        return (
            Math.abs(differenceInDays) > MAXIMUM_DEVIATION
                ? MAXIMUM_DEVIATION * Math.sign(differenceInDays)
                : (Math.abs(differenceInDays) < MINIMUM_DEVIATION
                    ? MINIMUM_DEVIATION * Math.sign(differenceInDays)
                    : differenceInDays));
    }
    
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
        .filter(t => t.hasDeadline)
        .sort((x, y) => {
            const [xDate, yDate] = [x.publicationDate!, y.publicationDate!];
            return xDate > yDate ? 1 : (yDate > xDate ? -1 : 0);
        })
    
    const studentTaskSolutions = props.solutions.homeworks!.filter(hw => hw.tasks)
        .map(hw => hw.tasks!.filter(task => 
            tasks.find(t => t.id === task.id)?.hasDeadline ?? false)).flat();
    
    const referenceLinesXAxis = studentTaskSolutions.reduce((acc : number[], task, index) => {
        const prevLineIndex = index ? acc[index-1] : 0;
        return [...acc, prevLineIndex + props.sectorSizes[index] + 2];
    }, [])
    
    const sectorRepresentation = studentTaskSolutions.reduce<[SectorRepresentation, number]>
    (([prevSectors, leftBorder], task, i) => {
        const taskView = tasks.find(t => t.id === task.id)!;
        const title = taskView.title!;
        const sector = {title, barsAmount: props.sectorSizes[i]};
        prevSectors.set(task.id!, [leftBorder, sector])
        
        return [prevSectors, leftBorder + sector.barsAmount + 2];
    }, [new Map(), 0])[0];
    
    const sectors = new Map<number, ISectorProps>();
    sectorRepresentation.forEach(([tick, sector], _) => {
        sectors.set(tick, sector);
    })
    
    const taskDeadlines = studentTaskSolutions.reduce<[DeadlineRepresentation, number]>(
        ([deadlines, prev], task, i) => {
            const courseTask = tasks.find(t => t.id === task.id)!;
            const deadlineDate = courseTask.deadlineDate!;
            const dates = [...task.solution!.map(s => s.publicationDate!), deadlineDate];
            const deadlineOrder = dates.sort((x, y) => new Date(x).getTime() - new Date(y).getTime())
                .findIndex(d => new Date(d).getTime() == new Date(deadlineDate).getTime());
            
            deadlines.set(task.id!, prev + deadlineOrder + 1);
            
            return [deadlines, prev + props.sectorSizes[i] + 2]
    }, [new Map(), 0])[0]
    
    const dates = studentTaskSolutions.reduce((acc : Map<number, number>, task) => {
        const leftBorder = sectorRepresentation.get(task.id!)![0];
        const deadlineTick = taskDeadlines.get(task.id!)!;
        const deadlineDate = tasks.find(t => t.id === task.id)!.deadlineDate!;
        acc.set(deadlineTick, new Date(deadlineDate).getTime());
        task.solution!.forEach((solution, index) => {
            const tick = leftBorder + index + 1;
            const actualTick = tick >= deadlineTick ? tick + 1 : tick;
            acc.set(actualTick, new Date(solution.publicationDate!).getTime())
        })
        return acc;
    }, new Map())

    const attemptTooltipRepresentation = new Map<number, [IDatesDeviation, string, boolean]>();
    
    const initial = tasks.length ? [{xAxisPosition: 0, yAxisPosition: null}] : [];
    const solveAttempts = studentTaskSolutions.reduce
    ((attemptAcc : IStudentAttempt[], task, i) => {
        
        const leftBorder = sectorRepresentation.get(task.id!)![0];
        const deadlineTick = taskDeadlines.get(task.id!)!;
        const courseTask = tasks.find(t => t.id === task.id)!;
        const deadlineDate = courseTask.deadlineDate!;
        const maxRating = courseTask.maxRating!;
        const taskSolutions = task.solution!;
        
        const attempts = taskSolutions.reduce((currentAcc : IStudentAttempt[], solution, index) => {
            const tick = leftBorder + index + 1;
            const actualTick = tick >= deadlineTick ? tick + 1 : tick;
            const fill = StudentStatsUtils.calculateLastRatedSolutionInfo([solution], maxRating).color;
            const prevSolution = taskSolutions[index-1];
            
            const measureDate = prevSolution?.rating && prevSolution?.ratingDate &&
            prevSolution.ratingDate < solution.publicationDate! && prevSolution.ratingDate > deadlineDate
                ? prevSolution.ratingDate : deadlineDate;
            const deviation = getDatesDiff(solution.publicationDate!, measureDate);
            const actuallyDeviation : {value: number, measure: "RatingDate" | "DeadlineDate"} = {
                value: daysDifference(measureDate, solution.publicationDate!),
                measure: measureDate === prevSolution?.ratingDate ? "RatingDate" : "DeadlineDate"
            };
            
            const attempt = {fill, xAxisPosition: actualTick, yAxisPosition: deviation, link: solution.githubUrl};
            attemptTooltipRepresentation
                .set(actualTick, [actuallyDeviation, `${solution.rating}/${maxRating}`, solution.state != Solution.StateEnum.NUMBER_0]);
            
            return [...currentAcc, attempt];
        }, [])
        const referenceLineFill : IStudentAttempt = {xAxisPosition: leftBorder + sectors.get(leftBorder)!.barsAmount + 2, yAxisPosition: null};
        const deadlineFill : IStudentAttempt = {xAxisPosition: deadlineTick, yAxisPosition: null, yAxisPositionDeadline: 0};
        const sectorItems = [...attempts, deadlineFill]
            .sort((a, b) => a.xAxisPosition - b.xAxisPosition);
        const trailingFill : IStudentAttempt[] = new Array(props.sectorSizes[i]-task.solution!.length).fill(0)
            .reduce<IStudentAttempt[]>((acc, _, i) => {
                const x = leftBorder + task.solution!.length + 2 + i
                return [...acc, {xAxisPosition: x, yAxisPosition: null}]
            }, [])

        return [...attemptAcc, ...sectorItems, ...trailingFill, referenceLineFill];
    }, initial)
    
    const [ barSize, barGap] = [ 20, 10];

    return (
        <div style={{height: '300', width: '100%', overflowX: 'scroll', overflowY: "hidden", paddingBottom: 7}}
             onScroll={(e) => {
                 let ele = (document.getElementsByClassName("recharts-yAxis") as HTMLCollectionOf<HTMLElement>)[props.index];
                 ele.style.setProperty('transform', "translateX("+(e.target as HTMLTextAreaElement).scrollLeft+"px)", 'important');
             }}>
            
            <ComposedChart data={solveAttempts.sort((x, y) => x.xAxisPosition - y.xAxisPosition)}
                           height={300}
                           width={solveAttempts.length * (barSize + barGap)}
                           margin={{top: 5, right: 5, bottom: 10, left: 0}}
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
                        dates = {dates}
                        attemptRepresentation={attemptTooltipRepresentation}
                    />}
                    wrapperStyle={{border: `solid 1px ${chartColors.tooltipBorder}`, borderRadius: 3, background: 'white', overflow: 'hidden'}}
                />
                
                <ReferenceLine y={0} strokeWidth={0.5}/>

                {referenceLinesXAxis.map(x => (
                    <ReferenceLine x={x} strokeWidth={0.5}/>
                ))}

                <Scatter dataKey="yAxisPositionDeadline" shape="circle" fill={chartColors.scatter} name='scatter' />

                <Bar dataKey="yAxisPosition" onClick={handleClick}/>

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