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
    date : Date; // скорее всего в string
    totalRatingValue : number | null;
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

    const customDateCompare = (x : Date, y : Date) => {
        if (x.getMonth() === y.getMonth()) {
            return x.getDay() - y.getDay();
        } else {
            return y.getMonth() - x.getMonth();
        }
    }
    
    const solutionDatesForALlMates = new Set<Date>();
    
    solutions.forEach(cm => {
        const studentId = cm.surname! + " " + cm.name!;
        cm.homeworks!.forEach(hw => {
            hw.tasks!.forEach(task => {
                if (task.solution && task.solution.length > 0) {
                    const lastSolution = task.solution!.slice(-1)[0];
                    const currentDate = new Date(lastSolution.publicationDate!);
                    currentDate.setHours(0, 0, 0, 0);
                    solutionDatesForALlMates.add(currentDate);
                    
                    if (!solutionPoints.has(studentId)) {
                        solutionPoints.set(studentId, [{date : currentDate, totalRatingValue : 0, tasks : [], id : studentId}])
                    }
                    const studentSolutionPoints = solutionPoints.get(studentId)!
                    const taskView = tasks.find(t => t.id === task.id)!
                    const myTask = {title : taskView.title!, maxRating : lastSolution.rating!};
                    
                    const updateStudentSolutionPoints = studentSolutionPoints.map(point => {
                        const solutionDate = new Date(point.date);
                        //solutionDate.setHours(0, 0, 0, 0);
                        
                        if (customDatesEqual(solutionDate, currentDate)) {
                            const updatedRaiting = point.totalRatingValue! + lastSolution.rating!;
                            return {date : currentDate, totalRatingValue : updatedRaiting, id : studentId, 
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
                            .reduce((sum, p) => sum + p.totalRatingValue!, 0)
                        updateStudentSolutionPoints.push({date: currentDate, 
                                totalRatingValue: totalRating + lastSolution.rating!, tasks : [myTask], id: studentId})
                    }

                    updateStudentSolutionPoints.sort((x, y) => customDateCompare(x.date, y.date)).reverse();
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
    const mockLineForConsideringAllDares = Array.from(solutionDatesForALlMates).map(d => ({date: d, tasks: []}))
    
    solutionPoints.forEach((line, _) => {
        const dates = line.map(point => point.date);
        const diff = Array.from(solutionDatesForALlMates).filter(d => dates.every(x => !customDatesEqual(d, x)))
        diff.forEach(date => line.push({date : date, id: line[0].id, tasks: [], totalRatingValue: null}))
        line = line.sort((x, y) => customDateCompare(x.date, y.date)).reverse()
    })
    
    return (
        <ResponsiveContainer height={350} width={'99%'} >
            <ComposedChart>
                <YAxis dataKey="totalRatingValue"/>
                <XAxis dataKey="date" 
                       allowDuplicatedCategory={false}
                       tickFormatter={(date : Date, _) => (Utils.renderDateWithoutHours(date))}
                />
                <Tooltip />
                <Legend />
                
                <Line dataKey="totalRatingValue" legendType="none" data={mockLineForConsideringAllDares.sort
                ((x, y) => customDateCompare(x.date, y.date)).reverse()}/>

                 {Array.from(solutionPoints.entries()).map(([_, p]) => {
                    return <Line dataKey="totalRatingValue" data={p} stroke={getRandomColor()} connectNulls/>
                }) }
                
            </ComposedChart>
        </ResponsiveContainer>
    )
}

// 
export default StudentStatsChart;

/*
const data1 = [
        {id:"adsf", tasks:[], totalRatingValue: 14, date: new Date(2024, 2, 4, 0, 0)},
        {id:"adsf", tasks:[], totalRatingValue: 24, date: new Date(2024, 2, 18, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: null, date: new Date(2024, 3, 1, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: null, date: new Date(2024, 3, 10, 0, 0)},
        {id:"adsf", tasks:[], totalRatingValue: 48, date: new Date(2024, 3, 15, 0, 0)},
    ]

    const data2 = [
        {id:"adsff", tasks:[], totalRatingValue: 5, date: new Date(2024, 2, 4, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: 20, date: new Date(2024, 2, 18, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: 39, date: new Date(2024, 3, 1, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: 45, date: new Date(2024, 3, 10, 0, 0)},
        {id:"adsff", tasks:[], totalRatingValue: 50, date: new Date(2024, 3, 17, 0, 0)},
    ]
 */