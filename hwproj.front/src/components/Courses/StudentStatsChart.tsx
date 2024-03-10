import * as React from 'react';
import {CourseViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from "../../api/";
import { IStudentStatsProps } from './StudentStatsTable';
//import {LineChart, ResponsiveChartContainer, LinePlot, ScatterPlot, AllSeriesType} from "@mui/x-charts";
import Utils from "../../services/Utils";

import {ComposedChart, ResponsiveContainer, Line, Scatter, XAxis, YAxis, Tooltip, Legend, Cell} from 'recharts';


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
    date : Date; // number - ?
    totalRatingValue : number;
    tasks : ITaskChartView[];
}

const StudentStatsChart : React.FC<IStudentStatsChartProps> = (props) => {
    
    const homeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const tasks = [...new Set(homeworks.map(hw => hw.tasks!).flat())]
    const solutions = props.solutions.filter(solution => 
        props.selectedStudents.includes(solution.id!))
    
    const deadlinePoints = new Map<Date, IChartPoint>();
    let totalRating = 0;
    
    tasks.forEach(task => {
        const deadlineDate = task.deadlineDate!;
        //deadlineDate.setHours(0, 0, 0, 0);
        totalRating += task.maxRating!;
        if (!deadlinePoints.has(deadlineDate)) {
            deadlinePoints.set(deadlineDate, 
                {date : deadlineDate, totalRatingValue : totalRating, tasks : []})
        }
        const updatedTasks = [...deadlinePoints.get(deadlineDate)!.tasks, {title: task.title!, maxRating : task.maxRating!}];
        deadlinePoints.set(deadlineDate, {date : deadlineDate, totalRatingValue : totalRating, tasks : updatedTasks})
    })
    
    const solutionPoints = new Map<string, IChartPoint[]>();
    const customDatesEqual = (firstDate : Date, secondDate : Date) => (
        firstDate.getMonth() === secondDate.getMonth() && firstDate.getDay() === secondDate.getDay()
    )
    
    solutions.forEach(cm => {
        const studentId = cm.surname! + " " + cm.name!;
        cm.homeworks!.forEach(hw => {
            hw.tasks!.forEach(task => {
                if (task.solution && task.solution.length > 0) {
                    const lastSolution = task.solution!.slice(-1)[0];
                    const currentDate = new Date(lastSolution.publicationDate!);
                    currentDate.setHours(0, 0, 0, 0);
                    
                    if (!solutionPoints.has(studentId)) {
                        solutionPoints.set(studentId, [{date : currentDate, totalRatingValue : 0, tasks : [], id : studentId}])
                    }
                    const studentSolutionPoints = solutionPoints.get(studentId)!
                    const taskView = tasks.find(t => t.id === task.id)!
                    const myTask = {title : taskView.title!, maxRating : lastSolution.rating!};
                    
                    const updateStudentSolutionPoints = studentSolutionPoints.map(point => {
                        const solutionDate = new Date(point.date);
                        solutionDate.setHours(0, 0, 0, 0);
                        
                        if (customDatesEqual(solutionDate, currentDate)) {
                            const updatedRaiting = point.totalRatingValue! + lastSolution.rating!;
                            return {date : solutionDate, totalRatingValue : updatedRaiting, id : studentId, 
                                tasks : [...point.tasks, myTask]}
                        } else {
                            return point;
                        }
                    })
                    
                    if (!studentSolutionPoints.find(point => {
                        const date = new Date(point.date);
                        return customDatesEqual(date, currentDate)
                    })) {
                        const totalRating = studentSolutionPoints.filter(p => p.date < currentDate)
                            .reduce((sum, p) => sum + p.totalRatingValue, 0)
                        updateStudentSolutionPoints.push({date: currentDate, 
                                totalRatingValue: totalRating + lastSolution.rating!, tasks : [myTask], id: studentId})
                    }
                    
                    solutionPoints.set(studentId, updateStudentSolutionPoints);
                }
            })
        })
    })
    
    const solutionArray = Array.from(solutionPoints.entries()).map(([_, s]) => s).flat();
    const deadlineArray = Array.from(deadlinePoints.entries()).map(([_, s]) => s).flat();
    
    const customDateCompare = (x : Date, y : Date) => {
        if (x.getMonth() === y.getMonth()) {
            return x.getDay() - y.getDay();
        } else {
            return y.getMonth() - x.getMonth();
        }
    }
    
    const startCourseDate = homeworks[0].publicationDate!.valueOf();
    const currentCourseDate = Date.now();
    
    let xAxisCount = 0;
    return (
        <ResponsiveContainer height={350} width={'99%'} >
            <ComposedChart>
                <YAxis dataKey="totalRatingValue"/>
                <XAxis dataKey="date" allowDuplicatedCategory={false}
                       tickFormatter={(date : Date, _) => (Utils.renderDateWithoutHours(date))}/>

                <Scatter data={deadlineArray}/>
                <Tooltip/>

                {Array.from(solutionPoints.entries()).map(([_, p]) => {
                    p.sort((x, y) => customDateCompare(x.date, y.date) ).reverse().forEach(v => console.log(v.date));
                    return <Line dataKey="totalRatingValue" data={p} stroke="#f088FE"/>
                })}
                
                
                
            </ComposedChart>
        </ResponsiveContainer>
    )
}

// 
export default StudentStatsChart;