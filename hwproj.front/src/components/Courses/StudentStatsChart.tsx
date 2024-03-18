import React, {useState, useCallback, memo, useMemo} from 'react';
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import { IStudentStatsProps } from './StudentStatsTable';
import StudentStatsTooltip from './StudentStatsTooltip';
import Utils from "../../services/Utils";

import {ComposedChart,
        ResponsiveContainer,
        Line, Scatter, CartesianGrid,
        XAxis, YAxis, Tooltip, Legend,
        ReferenceLine, ReferenceDot}
    from 'recharts';
import {Payload, ValueType} from "recharts/types/component/DefaultTooltipContent";

interface IStudentStatsChartProps {
    selectedStudents: string[];
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    isMentor: boolean;
    userId: string;
    solutions: StatisticsCourseMatesModel[];
}

interface ITaskChartView {
    title : string;
    receiveRating?: number;
    maxRating: number;
}

interface IChartPoint {
    id? : string;
    date : string; // represents {day}.{month}
    totalRatingValue : number | null;
    tasks : ITaskChartView[];
}

const StudentStatsChart : React.FC<IStudentStatsChartProps> = (props) => {
    const [mouseHoverState, setMouseHoverState] = useState("");

    const compareStringFormatDates = (x : string, y : string) => {
        const [xDay, xMonth] = x.split('.').map(s => Number.parseInt(s));
        const [yDay, yMonth] = y.split('.').map(s => Number.parseInt(s));

        if (xMonth === yMonth) {
            return xDay - yDay;
        }
        else {
            return xMonth - yMonth;
        }
    }
    
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
    const solutions = props.solutions.filter(solution => 
        props.selectedStudents.includes(solution.id!))

    const straightAStudent : IChartPoint[] = [];
    var straightAStudentTotalValue = 0;
    
    // предварительно сортируем по дню публикации
    tasks.sort((x, y) => {
        const xDateString = Utils.renderDateWithoutHours(x.publicationDate!);
        const yDateString = Utils.renderDateWithoutHours(y.publicationDate!);
        return compareStringFormatDates(xDateString, yDateString);
    }).forEach(task => {
        straightAStudentTotalValue += task.maxRating!;
        const renderTaskDate = Utils.renderDateWithoutHours(task.publicationDate!);
        const indexTasksWithSameDate =  straightAStudent.findIndex(p => p.date === renderTaskDate);
        const taskView = {title: task.title!, maxRating: task.maxRating!, receiveRating: task.maxRating!};
        if (indexTasksWithSameDate === -1) {
            straightAStudent.push({id: "Круглый отличник", totalRatingValue: straightAStudentTotalValue, 
                date: renderTaskDate, tasks: [taskView]})
        } else {
            const currentPoint = straightAStudent[indexTasksWithSameDate];
            straightAStudent[indexTasksWithSameDate] = {id: currentPoint.id, date: currentPoint.date, 
                totalRatingValue: straightAStudentTotalValue, tasks: [...currentPoint.tasks, taskView]}
        }
    })
    
    const hashCode = (string: string) => {
        let hash = 0;
        for (var i = 0; i < string.length; ++i) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return hash;
    }

    const getRandomColorWithMinBrightness = (minBrightness: number, string : string) => {
        return `hsl(${hashCode(string) % 360}, 100%, 70%)`;
    }

    var totalRating = 0;
    const deadlinePoints = new Map<string, IChartPoint>();
    
    tasks.forEach(task => {
        const deadlineDateToString = Utils.renderDateWithoutHours(task.deadlineDate!);
        totalRating += task.maxRating!;
        if (!deadlinePoints.has(deadlineDateToString)) {
            deadlinePoints.set(deadlineDateToString, 
                {date : deadlineDateToString, totalRatingValue : totalRating, tasks : []})
        }
        const updatedTasks = [...deadlinePoints.get(deadlineDateToString)!.tasks, {title: task.title!, maxRating : task.maxRating!}];
        deadlinePoints.set(deadlineDateToString, {date : deadlineDateToString, totalRatingValue : totalRating, tasks : updatedTasks})
    })
    const deadlinePointsArray = Array.from(deadlinePoints.entries()).map(([_, p]) => p)
    
    const characteristicDates = new Set<string>();
    deadlinePoints.forEach(point => characteristicDates.add(point.date))
    straightAStudent.forEach(point => characteristicDates.add(point.date))

    const solutionPoints = new Map<string, IChartPoint[]>([['Круглый отличник', straightAStudent]]);

    solutions.forEach(cm => {
        const studentId = cm.name! + ' ' + cm.surname!;
        cm.homeworks!.forEach(hw => {
            hw.tasks!.forEach(task => {
                if (task.solution && task.solution.length > 0) {
                    const lastSolution = task.solution!.slice(-1)[0];
                    const currentDateToString = Utils.renderDateWithoutHours(lastSolution.publicationDate!);
                    characteristicDates.add(currentDateToString);
                    
                    if (!solutionPoints.has(studentId)) {
                        solutionPoints.set(studentId, [{date : currentDateToString, totalRatingValue : 0, tasks : [], id : studentId}])
                    }
                    const studentSolutionPoints = solutionPoints.get(studentId)!
                    const taskView = tasks.find(t => t.id === task.id)!
                    
                    const myTask : ITaskChartView = {title : taskView.title!, receiveRating : lastSolution.rating!, maxRating: taskView.maxRating!};
                    
                    const updateStudentSolutionPoints = studentSolutionPoints.map(point => {
                        
                        if (point.date === currentDateToString) {
                            const updatedRaiting = point.totalRatingValue! + lastSolution.rating!;
                            return {date : currentDateToString, totalRatingValue : updatedRaiting, id : studentId, 
                                tasks : [...point.tasks, myTask]}
                        } else {
                            return point;
                        }
                    })
                    
                    if (!studentSolutionPoints.find(point => (point.date === currentDateToString))) {
                        const totalRating = Math.max(...studentSolutionPoints.filter(p => 
                            compareStringFormatDates(p.date, currentDateToString) < 0)
                            .map(p => p.totalRatingValue!));
                        updateStudentSolutionPoints.push({date: currentDateToString, 
                                totalRatingValue: totalRating + lastSolution.rating!, tasks : [myTask], id: studentId})
                    }
                    
                    solutionPoints.set(studentId, updateStudentSolutionPoints);
                }
            })
        })
    })
    
    const startCourseDate = homeworks.map(hw => Utils.renderDateWithoutHours(hw.publicationDate!))
        .sort(compareStringFormatDates)[0];
    characteristicDates.add(startCourseDate);
    
    const finishCourseDate = Array.from(characteristicDates).sort(compareStringFormatDates).slice(-1)[0];
    var maximumExpectedRating = Math.max(...deadlinePointsArray.map(p => p.totalRatingValue!));
    
    solutionPoints.forEach(line => {
        // добавляем начальные и конечные даты
        const dates = line.map(p => p.date)
        
        if (!dates.includes(startCourseDate)) {
            line.push({id: line[0].id, date: startCourseDate, totalRatingValue: 0, tasks: []});
        }

        if (!dates.includes(finishCourseDate)) {
            const lastRating = line.map(p => p.totalRatingValue!).sort((x, y) => x - y).slice(-1)[0];
            line.push({id: line[0].id, date: finishCourseDate, totalRatingValue: lastRating, tasks: []})
        }
        const diff = Array.from(characteristicDates).filter(d => dates.every(x => x !== d))
        diff.forEach(date => line.push({date : date, id: line[0].id, tasks: [], totalRatingValue: null}))
        line = line.sort((x, y) => compareStringFormatDates(x.date, y.date))
        maximumExpectedRating = Math.max(maximumExpectedRating, line.slice(-1)[0].totalRatingValue!);
    })
    
    const lineColors = useMemo(() => new Map<string, string>
        (Array.from(solutionPoints.entries()).map(([student, _]) =>
    {
        const color = student === 'Круглый отличник' ? '#2cba00' : getRandomColorWithMinBrightness(0.3, student);
        return [student, color];
    })), [props]);
    
    return (
        <ResponsiveContainer height={350} width='99%' >
            <ComposedChart margin={{right:15, top: 5}}>
                <YAxis dataKey="totalRatingValue"
                       domain={[0, maximumExpectedRating+(50 - maximumExpectedRating % 50)]}
                       stroke='#4054b4'/>
                <XAxis dataKey="date"
                       allowDuplicatedCategory={false}
                       domain={Array.from(characteristicDates).sort(compareStringFormatDates)}
                       stroke='#4054b4'
                       ticks={[...deadlinePointsArray.map(p => p.date), startCourseDate, finishCourseDate]
                           .sort(compareStringFormatDates)}
                />
                <Tooltip
                    active={mouseHoverState !== ""}
                    content={<StudentStatsTooltip activeId={mouseHoverState}/>}
                    wrapperStyle={
                        {background: "white", color: "#333", borderRadius: 9,
                            border: "solid 1px #9E9E9E", boxShadow: "1px 3px 1px #9E9E9E"}}
                />
                <Legend/>

                 {Array.from(solutionPoints.entries()).map(([studentName, line]) => {
                     return <Line
                         activeDot={{
                             onMouseOver: () => {
                                 setMouseHoverState(line[0].id!);
                             },
                             onMouseLeave: () => {
                                 setMouseHoverState("");
                             }
                         }}
                         strokeDasharray={studentName === 'Круглый отличник' ? '4' : '0'}
                         name={studentName}
                         dataKey="totalRatingValue"
                         data={line}
                         isAnimationActive={false}
                         stroke={lineColors.get(studentName)}
                         legendType={studentName === 'Круглый отличник' ? 'diamond' : 'line'}
                         connectNulls/>
                }) }
                
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default StudentStatsChart;
