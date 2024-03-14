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

interface IDummyInterface {
    active? : boolean,
    payload? : Payload<ValueType, string | number>[] | undefined
    activeId: string
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
    const getRandomColor = () => {
        return "#" + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, "0");
    }
    
    const getRelativeLuminance = (hexColor : string) => {
        const rgb = parseInt(hexColor.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = rgb & 0xff;
        
        const cRGB = [r / 255, g / 255, b / 255];
        
        const luminance = cRGB.map(v => {
            const vScaled = v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
            return vScaled;
        })
        
        const lum = luminance.reduce((a, b) => a + b, 0) / luminance.length;
        return lum;
    }
    
    const getRandomColorWithMinBrightness = (minBrightness: number) => {
        let color = getRandomColor();
        let relativeLuminance = getRelativeLuminance(color);
        
        while(relativeLuminance < minBrightness) {
            color = getRandomColor();
            relativeLuminance = getRelativeLuminance(color);
        }
        
        return color;
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
    deadlinePoints.forEach(point => solutionDatesForALlMates.add(point.date))

    // сделать стартовую дату для курса (пока что дата публикации саммой ранней дз (как связаны даты дз и даты таск)?) и финальную - наибольшая дата по всем дедайнам/публикациям
    
    const startCourseDate = homeworks.map(hw => Utils.renderDateWithoutHours(hw.publicationDate!))
        .sort((x, y) => compareStringFormatDates(x, y))[0];

    const finishCourseDate = Array.from(solutionDatesForALlMates).sort((x, y) => 
        compareStringFormatDates(x, y)).slice(-1)[0];
    solutionDatesForALlMates.add(startCourseDate);
    solutionPoints.forEach(point => {
        // добавляем начальные и конечные даты
        const dates = point.map(p => p.date)
        if (!dates.includes(startCourseDate)) {
            point.push({id: point[0].id, date: startCourseDate, totalRatingValue: 0, tasks: []});
        }

        if (!dates.includes(finishCourseDate)) {
            console.log(finishCourseDate);
            const lastRating = point.map(p => p.totalRatingValue!).sort((x, y) => x > y ? 1 : (x < y ? -1 : 0)).slice(-1)[0];
            point.push({id: point[0].id, date: finishCourseDate, totalRatingValue: lastRating, tasks: []})
        }
    })
    
    solutionPoints.forEach((line, _) => {
        const dates = line.map(point => point.date);
        const diff = Array.from(solutionDatesForALlMates).filter(d => dates.every(x => x != d))
        diff.forEach(date => line.push({date : date, id: line[0].id, tasks: [], totalRatingValue: null}))
        line = line.sort((x, y) => compareStringFormatDates(x.date, y.date))
    })

    const maximumExpectedRating = Math.max(...Array.from(deadlinePoints.entries())
        .map(([_, p]) => p.totalRatingValue!));
    
    const lineColors = useMemo(()=> new Map<string, string>(Array.from(solutionPoints.entries()).map(([student, _]) =>
    {
        const color = getRandomColorWithMinBrightness(0.3);
        console.log(color);
        return [student, color];
    })), [props]);
    
    return (
        <ResponsiveContainer height={350} width={'99%'} >
            <ComposedChart margin={{right:15, top: 5}}>
                <YAxis dataKey="totalRatingValue" 
                       domain={[0, maximumExpectedRating+10]}
                        stroke='#4054b4'/>
                <XAxis dataKey="date"
                       allowDuplicatedCategory={false}
                       domain={Array.from(solutionDatesForALlMates).sort((x, y) => compareStringFormatDates(x, y))}
                       stroke='#4054b4'
                />
                <Tooltip
                    active={mouseHoverState !== ""}
                    content={<StudentStatsTooltip activeId={mouseHoverState}/>}
                    wrapperStyle={
                        {background: "white", color: "#333", borderRadius: 9,
                            border: "solid 1px #9E9E9E", boxShadow: "1px 3px 1px #9E9E9E"}}
                />
                <Legend />
                
                {Array.from(deadlinePoints.entries()).map(([_, point]) => {
                    return (
                        <>
                            <ReferenceLine x={point.date} stroke="red" strokeDasharray="3 3" alwaysShow/>
                            <ReferenceDot x={point.date} y={point.totalRatingValue!} r={5}
                                          alwaysShow ifOverflow="extendDomain"/>
                        </>
                    ) 
                })}

                 {Array.from(solutionPoints.entries()).map(([studentName, line]) => {
                     console.log(`        ${line[0].id!}`)
                     return <Line
                         activeDot={{
                             onMouseOver: () => {
                                 setMouseHoverState(line[0].id!);
                             },
                             onMouseLeave: () => {
                                 setMouseHoverState("");
                             }
                         }}
                         name={studentName}
                         dataKey="totalRatingValue"
                         data={line}
                         //stroke={getRandomColorWithMinBrightness(0.3)}
                         stroke={lineColors.get(studentName)}
                         connectNulls/>
                }) }
                
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default StudentStatsChart;
