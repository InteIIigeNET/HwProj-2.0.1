import React, {useState, useMemo} from 'react';
import {CourseViewModel, HomeworkViewModel, 
    StatisticsCourseMatesModel, StatisticsCourseTasksModel } from "../../api/";
import StudentStatsTooltip from './StudentStatsTooltip';
import Utils from "../../services/Utils";

import {ComposedChart, CartesianGrid,
        ResponsiveContainer,
        Line, XAxis, YAxis, 
        Tooltip, Legend}
    from 'recharts';

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

interface IAveragePoint {
    taskMaxRating: number;
    averageRating: number;
    date: number;
    numberOfStudents: number;
}

const chartColors = {
    axis: 'rgb(200, 200, 200)',
    tooltipBorder: 'rgb(232, 232, 232)'
}

const StudentStatsChart : React.FC<IStudentStatsChartProps> = (props) => {
    const [mouseHoverState, setMouseHoverState] = useState("");

    const compareStringFormatDates = (x: string, y: string) => {
        const [xDay, xMonth] = x.split('.').map(s => Number.parseInt(s));
        const [yDay, yMonth] = y.split('.').map(s => Number.parseInt(s));

        if (xMonth === yMonth) {
            return xDay - yDay;
        } else {
            return xMonth - yMonth;
        }
    }

    const compareDates = (x: Date, y: Date) => {
        return compareStringFormatDates(Utils.renderDateWithoutHours(x), Utils.renderDateWithoutHours(y));
    }

    const hashCode = (string: string) => {
        let hash = 0;
        for (var i = 0; i < string.length; ++i) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        return hash;
    }

    const getRandomColorWithMinBrightness = (string: string) => {
        return `hsl(${hashCode(string) % 360}, 100%, 70%)`;
    }

    const [straightAStudent, averageStudent] = ['Круглый отличник', 'Усредненная по курсу']
    const courseHomeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const courseTasks = courseHomeworks.map(hw => hw.tasks!)
        .flat().sort((x, y) => compareDates(x.publicationDate!, y.publicationDate!));
    const solutions = props.solutions.filter(solution =>
        props.selectedStudents.includes(solution.id!))

    var totalRating = 0;
    const deadlinePoints = new Map<string, IChartPoint>();
    
    const straightAStudentLine: IChartPoint[] = [];
    const averageStudentLine: IChartPoint[] = [];

    courseTasks.forEach(task => {
        totalRating += task.maxRating!;
        const deadlineDateToString = Utils.renderDateWithoutHours(task.deadlineDate!); // тут опрометчиво, т.к. даты дедлайна может не быть
        if (!deadlinePoints.has(deadlineDateToString)) {
            deadlinePoints.set(deadlineDateToString,
                {date: deadlineDateToString, totalRatingValue: totalRating, tasks: []})
        }
        const updatedTasks = [...deadlinePoints.get(deadlineDateToString)!.tasks, {
            title: task.title!,
            maxRating: task.maxRating!
        }];
        deadlinePoints.set(deadlineDateToString, {
            date: deadlineDateToString,
            totalRatingValue: totalRating,
            tasks: updatedTasks
        })

        const publicationDateToString = Utils.renderDateWithoutHours(task.publicationDate!);
        const taskView = {title: task.title!, maxRating: task.maxRating!, receiveRating: task.maxRating!};
        const indexTasksWithSameDate = straightAStudentLine.findIndex(p => p.date === publicationDateToString);
        if (indexTasksWithSameDate === -1) {
            straightAStudentLine.push({
                id: straightAStudent, totalRatingValue: totalRating,
                date: publicationDateToString, tasks: [taskView]
            })
        } else {
            const currentPoint = straightAStudentLine[indexTasksWithSameDate];
            straightAStudentLine[indexTasksWithSameDate] = {
                id: currentPoint.id, date: currentPoint.date,
                totalRatingValue: totalRating, tasks: [...currentPoint.tasks, taskView]
            }
        }

    })
    const deadlinePointsArray = Array.from(deadlinePoints.entries()).map(([_, p]) => p)
    
    const averageByTask = new Map<string, IAveragePoint>();
    
    // для каждого студента отсортировали сгруппировали задачи по дню последнего решения
    const studentTasks = new Map(solutions.map(cm => {
        const studentId = cm.name! + ' ' + cm.surname!;
        const tasks = cm.homeworks!.filter(hw => hw.tasks && hw.tasks.length > 0)
            .map(hw => hw.tasks!).flat().filter(t => t.solution && t.solution.length > 0)
        
        tasks.sort((x, y) => {
            const xLastSolutionDate = x.solution!.slice(-1)[0].publicationDate!;
            const yLastSolutionDate = y.solution!.slice(-1)[0].publicationDate!;
            return compareDates(xLastSolutionDate, yLastSolutionDate);
        })
        
        const tasksGroupedByLastSolution = new Map<String, StatisticsCourseTasksModel[]>()
        tasks.forEach(task => {
            const lastSolution = task.solution!.slice(-1)[0];
            
            const publicationDate = Utils.renderDateWithoutHours(lastSolution.publicationDate!);
            
            if (!tasksGroupedByLastSolution.has(publicationDate)) {
                tasksGroupedByLastSolution.set(publicationDate, []);
            }
            
            const tasksWithSameDate = tasksGroupedByLastSolution.get(publicationDate)!;
            
            tasksGroupedByLastSolution.set(publicationDate, [...tasksWithSameDate, task]);
        })
        
        const groupedTasksToArray = Array.from(tasksGroupedByLastSolution.entries())
            .map(([_, tasks]) => tasks);
        
        return [studentId, groupedTasksToArray];
    }))
    
    const studentCharts = new Map([[straightAStudent, straightAStudentLine], 
        [averageStudent, averageStudentLine]]);
    
    Array.from(studentTasks.entries())
        .forEach(([studentId, taskGroups]) => {
            let totalStudentRating = 0;
            
            const points : IChartPoint[] = taskGroups.map(tasks => {
                const date = Utils.renderDateWithoutHours(tasks[0].solution!.slice(-1)[0].publicationDate!);
                const tasksChartView : ITaskChartView[] = tasks.map(task => {
                    const lastSolution = task.solution!.slice(-1)[0];
                    totalStudentRating += lastSolution.rating ? lastSolution.rating : 0;
                    const taskView = courseTasks.find(t => t.id === task.id)!;
                    
                    return {title: taskView.title!, receiveRating: lastSolution.rating!, maxRating: taskView.maxRating!}
                })
                
                return {id: studentId, date, totalRatingValue: totalStudentRating, tasks: tasksChartView};
            })
            
            studentCharts.set(studentId, points);
        })

    const studentChartsArray = Array.from(studentCharts.entries()).map(([_, line]) => line);
    const allSolutions = props.solutions.filter(cm => cm.homeworks && cm.homeworks.length > 0);
    
    const tasksSortedByPublicationDate = allSolutions.map(cm => cm.homeworks!).flat()
        .filter(hw => hw.tasks && hw.tasks.length > 0).map(hw => hw.tasks!)
        .flat().filter(task => task.solution && task.solution.length > 0)
        .sort((x, y) => {
            const xLastSolutionDate = x.solution!.slice(-1)[0].publicationDate!;
            const yLastSolutionDate = y.solution!.slice(-1)[0].publicationDate!;
            return compareDates(xLastSolutionDate, yLastSolutionDate);
        })
    
    tasksSortedByPublicationDate.forEach(task => {
        const lastSolution = task.solution!.slice(-1)[0];
        const taskView = courseTasks.find(t => t.id === task.id)!;
        const title = taskView.title!;
        const dateToMs = new Date(lastSolution.publicationDate!).getTime();
        if (!averageByTask.has(title)) {
            averageByTask.set(title, {taskMaxRating: taskView.maxRating!,averageRating: 0, date: 0, numberOfStudents: 0})
        }
        const averagePoint = averageByTask.get(title)!;
        const numberOfStudents = averagePoint.numberOfStudents;
        const averageRating = averagePoint.averageRating + (lastSolution.rating ? lastSolution.rating :  0) / allSolutions.length;
        averageByTask.set(title, {
            taskMaxRating: taskView.maxRating!,
            averageRating: +averageRating.toFixed(2),
            date: (averagePoint.date * numberOfStudents + dateToMs) / (numberOfStudents + 1),
            numberOfStudents: numberOfStudents + 1
        })
    })
    
    
    totalRating = 0
    averageByTask.forEach((point, title) => {
        const date = Utils.renderDateWithoutHours(new Date(point.date));
        const indexTasksWithSameDate= averageStudentLine.findIndex(p => p.date === date);
        const taskView = {maxRating: point.taskMaxRating, receiveRating: point.averageRating, title};
        totalRating += point.averageRating;
        
        if (indexTasksWithSameDate === -1) {
            averageStudentLine.push({id: averageStudent, date, totalRatingValue: +totalRating.toFixed(2),tasks: [taskView]});
        } else {
            const currentPoint = averageStudentLine[indexTasksWithSameDate];
            averageStudentLine[indexTasksWithSameDate] = {
                id: averageStudent, date, 
                totalRatingValue: +totalRating.toFixed(2), 
                tasks: [...currentPoint.tasks, taskView]
            }
        }
    })
    
    studentCharts.set(averageStudent, averageStudentLine);

    const startCourseDate = courseHomeworks.map(hw => Utils.renderDateWithoutHours(hw.publicationDate!))
        .sort(compareStringFormatDates)[0];
    
    const characteristicDates = new Set<string>(
        [startCourseDate, 
            ...deadlinePointsArray.map(p => p.date),
            ...straightAStudentLine.map(p => p.date),
            ...averageStudentLine.map(p => p.date),
        ...studentChartsArray.flat().map(p => p.date)]
    );
    const finishCourseDate = Array.from(characteristicDates).sort(compareStringFormatDates).slice(-1)[0];
    
    var maximumExpectedRating = Math.max(
        ...deadlinePointsArray.map(p => p.totalRatingValue!),
        ...studentChartsArray.map(line => line.slice(-1)[0].totalRatingValue!)
    );

    // дозаполняем все линии значениями во всех точках домена
    studentCharts.forEach(line => {
        const dates = line.map(p => p.date)
        const studentId = line[0].id!;

        if (!dates.includes(startCourseDate)) {
            line.push({id: studentId, date: startCourseDate, totalRatingValue: 0, tasks: []});
        }
        if (!dates.includes(finishCourseDate)) {
            const lastRating = line.map(p => p.totalRatingValue!).sort((x, y) => x - y).slice(-1)[0];
            line.push({id: studentId, date: finishCourseDate, totalRatingValue: lastRating, tasks: []})
        }

        const diff = Array.from(characteristicDates).filter(d => dates.every(x => x !== d))
        diff.forEach(date => line.push({date, id: studentId, tasks: [], totalRatingValue: null}))
        line = line.sort((x, y) => compareStringFormatDates(x.date, y.date))
    })

    const lineColors = useMemo(() => new Map<string, string>
    (Array.from(studentCharts.entries()).map(([student, _]) => {
        const color = student === straightAStudent ? '#2cba00' : (
            student === averageStudent ? '#FFA756' : getRandomColorWithMinBrightness(student)
        );
        return [student, color];
    })), [props]);
    
    return (
        <ResponsiveContainer height={350} width='99%'>
            <ComposedChart margin={{right: 15, top: 5}}>
                <YAxis dataKey="totalRatingValue"
                       domain={[0, maximumExpectedRating + (50 - maximumExpectedRating % 50)]}
                       stroke={chartColors.axis}
                       strokeWidth={0.5}
                       tickLine={false}
                />
                <XAxis dataKey="date"
                       allowDuplicatedCategory={false}
                       domain={Array.from(characteristicDates).sort(compareStringFormatDates)}
                       stroke={chartColors.axis}
                       strokeWidth={0.5}
                       ticks={[...deadlinePointsArray.map(p => p.date), startCourseDate, finishCourseDate]
                           .sort(compareStringFormatDates)}
                       tickLine={false}
                />
                <CartesianGrid vertical={false} strokeWidth={0.3}/>
                
                <Tooltip
                    active={mouseHoverState !== ""}
                    content={<StudentStatsTooltip activeId={mouseHoverState}/>}
                    wrapperStyle={
                        {
                            borderRadius: 3,
                            border: `solid 0.5px ${chartColors.tooltipBorder}`,
                            overflow: 'hidden'
                        }}
                />
                <Legend/>

                {Array.from(studentCharts.entries()).map(([studentName, line]) => {
                    return <Line
                        activeDot={{
                            onMouseOver: () => {
                                setMouseHoverState(line[0].id!);
                            },
                            onMouseLeave: () => {
                                setMouseHoverState("");
                            }
                        }}
                        strokeDasharray={studentName === straightAStudent || studentName === averageStudent ? '4' : '0'}
                        name={studentName}
                        dataKey="totalRatingValue"
                        data={line}
                        isAnimationActive={false}
                        stroke={lineColors.get(studentName)}
                        strokeWidth={2}
                        legendType={studentName === straightAStudent || studentName === averageStudent ? 'diamond' : 'line'}
                        connectNulls/>
                })}

            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default StudentStatsChart;
