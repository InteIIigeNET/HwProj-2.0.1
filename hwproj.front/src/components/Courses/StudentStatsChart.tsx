import * as React from 'react';
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import { IStudentStatsProps } from './StudentStatsTable';
//import {LineChart, ResponsiveChartContainer, LinePlot, ScatterPlot, AllSeriesType} from "@mui/x-charts";
import Utils from "../../services/Utils";

import {ComposedChart, ResponsiveContainer, Line, Scatter, XAxis, YAxis, Tooltip, Legend, Cell, ReferenceLine} from 'recharts';

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
    maxRating: number;
}

interface IChartPoint {
    id? : string;
    date : string; // represents {day}.{month}
    totalRatingValue : number | null;
    tasks : ITaskChartView[];
}

const StudentStatsChart : React.FC<IStudentStatsChartProps> = (props) => {
    
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
    const solutions = props.solutions.filter(solution => 
        props.selectedStudents.includes(solution.id!))
    
    const deadlinePoints = new Map<string, IChartPoint>();
    let totalRating = 0;
    
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
    
    const solutionPoints = new Map<string, IChartPoint[]>();
    
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
    
    const solutionDatesForALlMates = new Set<string>();
    
    solutions.forEach(cm => {
        const studentId = cm.surname! + " " + cm.name!;
        cm.homeworks!.forEach(hw => {
            hw.tasks!.forEach(task => {
                if (task.solution && task.solution.length > 0) {
                    const lastSolution = task.solution!.slice(-1)[0];
                    const currentDateToString = Utils.renderDateWithoutHours(lastSolution.publicationDate!);
                    solutionDatesForALlMates.add(currentDateToString);
                    
                    if (!solutionPoints.has(studentId)) {
                        solutionPoints.set(studentId, [{date : currentDateToString, totalRatingValue : 0, tasks : [], id : studentId}])
                    }
                    const studentSolutionPoints = solutionPoints.get(studentId)!
                    const taskView = tasks.find(t => t.id === task.id)!
                    const myTask = {title : taskView.title!, maxRating : lastSolution.rating!};
                    
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
                        const totalRating = studentSolutionPoints.filter(p => 
                            compareStringFormatDates(p.date, currentDateToString) < 0)
                            .reduce((sum, p) => sum + p.totalRatingValue!, 0)
                        updateStudentSolutionPoints.push({date: currentDateToString, 
                                totalRatingValue: totalRating + lastSolution.rating!, tasks : [myTask], id: studentId})
                    }
                    
                    solutionPoints.set(studentId, updateStudentSolutionPoints);
                }
            })
        })
    })

    const getRandomColor = () => {
        return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
    }
    
    const startCourseDate = homeworks[0].publicationDate!.valueOf();
    const currentCourseDate = Date.now();
    
    solutionPoints.forEach((line, _) => {
        const dates = line.map(point => point.date);
        const diff = Array.from(solutionDatesForALlMates).filter(d => dates.every(x => x != d))
        diff.forEach(date => line.push({date : date, id: line[0].id, tasks: [], totalRatingValue: null}))
        line = line.sort((x, y) => compareStringFormatDates(x.date, y.date))
    })
    
    return (
        <ResponsiveContainer height={350} width={'99%'} >
            <ComposedChart>
                <YAxis dataKey="totalRatingValue"/>
                <XAxis dataKey="date" 
                       allowDuplicatedCategory={false}
                />
                <Tooltip />
                <Legend />

                 {Array.from(solutionPoints.entries()).map(([studentName, line]) => {
                    return <Line 
                        name={studentName}
                        dataKey="totalRatingValue" 
                        data={line} 
                        stroke={getRandomColor()} 
                        connectNulls/>
                }) }
                
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default StudentStatsChart;
