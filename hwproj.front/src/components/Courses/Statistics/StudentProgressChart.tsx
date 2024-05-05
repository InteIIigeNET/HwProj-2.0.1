import React, {useMemo, useState} from 'react';
import {
    Solution,
    CourseViewModel,
    HomeworkViewModel,
    StatisticsCourseMatesModel,
    StatisticsCourseMeasureSolutionModel,
    StatisticsCourseTasksModel
} from "../../../api/";
import StudentStatsTooltip from './StudentStatsTooltip';
import Utils from "../../../services/Utils";

import {CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

interface IStudentProgressChartProps {
    selectedStudents: string[];
    course: CourseViewModel;
    homeworks: HomeworkViewModel[];
    solutions: StatisticsCourseMatesModel[];
    bestStudentSolutions: StatisticsCourseMeasureSolutionModel[];
    averageStudentSolutions: StatisticsCourseMeasureSolutionModel[];
}

interface ITaskChartView {
    title: string;
    receiveRating?: number;
    maxRating: number;
}

interface IChartPoint {
    id?: string;
    date: string; // {день}.{месяц}
    totalRatingValue: number | null;
    tasks: ITaskChartView[];
}

const chartColors = {
    axis: 'rgb(200, 200, 200)',
    tooltipBorder: 'rgb(232, 232, 232)'
}

const StudentProgressChart: React.FC<IStudentProgressChartProps> = (props) => {
    const [mouseHoverState, setMouseHoverState] = useState("");
    const [highlightStudent, setHighlightStudent] = useState("");
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
        for (let i = 0; i < string.length; ++i) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        return hash;
    }
    const getRandomColorWithMinBrightness = (string: string) => {
        return `hsl(${hashCode(string) % 360}, 100%, 70%)`;
    }
    const [straightAStudent, averageStudent] = ['Круглый отличник', 'Средний студент']
    const courseHomeworks = props.homeworks.filter(hw => hw.tasks && hw.tasks.length > 0);
    const courseTasks = courseHomeworks.map(hw => hw.tasks!)
        .flat().sort((x, y) => compareDates(x.publicationDate!, y.publicationDate!));
    const solutions = props.solutions.filter(solution =>
        props.selectedStudents.includes(solution.id!))
    const averageStudentSolutions = props.averageStudentSolutions
        .sort((x, y) => compareDates(x.publicationDate!, y.publicationDate!));

    const measureStudentSolutionsLine = (publicationDates: string[], studentId: string, solutions: StatisticsCourseMeasureSolutionModel[]) => {
        return solutions.reduce<[number, IChartPoint[]]>(([total, points], solution, index) => {
            const totalRating = total + solution.rating!;
            const task = courseTasks.find(t => t.id === solution.taskId)!;
            const taskView = {title: task.title!, maxRating: task.maxRating!, receiveRating: solution.rating!};
            const indexTasksWithSameDate = points.findIndex(p => p.date === publicationDates[index]);

            if (indexTasksWithSameDate === -1) {
                points.push({
                    id: studentId, date: publicationDates[index],
                    totalRatingValue: +totalRating.toFixed(2), tasks: [taskView]
                });
            } else {
                const currentPoint = points[indexTasksWithSameDate];
                points[indexTasksWithSameDate] = {
                    id: studentId, date: publicationDates[index],
                    totalRatingValue: +totalRating.toFixed(2), tasks: [...currentPoint.tasks, taskView]
                }
            }

            return [totalRating, points];
        }, [0, []])[1];
    }

    const straightAStudentSolutionDates = props.bestStudentSolutions.map(s =>
        Utils.renderDateWithoutHours(new Date(s.publicationDate!)));
    const straightAStudentLine = measureStudentSolutionsLine(straightAStudentSolutionDates, straightAStudent, props.bestStudentSolutions);

    const averageStudentSolutionDates = averageStudentSolutions.map(s =>
        Utils.renderDateWithoutHours(new Date(s.publicationDate!)));
    const averageStudentLine = measureStudentSolutionsLine(averageStudentSolutionDates, averageStudent, averageStudentSolutions);

    const deadlineDates = Array.from(new Set(courseTasks.filter(t => t.hasDeadline!)
        .map(task => Utils.renderDateWithoutHours(task.deadlineDate!))));

    // для каждого студента отсортировали и сгруппировали задачи по дню последнего решения
    const studentTasks = new Map(solutions.map(cm => {
        const studentId = cm.name + ' ' + cm.surname;
        const tasks = cm.homeworks!.filter(hw => hw.tasks && hw.tasks.length > 0)
            .map(hw => hw.tasks!).flat().filter(t => t.solution && t.solution.length > 0)

        tasks.sort((x, y) => {
            const xLastSolutionDate = x.solution!.slice(-1)[0].publicationDate!;
            const yLastSolutionDate = y.solution!.slice(-1)[0].publicationDate!;
            return compareDates(xLastSolutionDate, yLastSolutionDate);
        })

        const tasksGroupedByLastSolution = new Map<String, StatisticsCourseTasksModel[]>()
        tasks.forEach(task => {
            const lastSolution = task.solution!.filter(s => s.state != Solution.StateEnum.NUMBER_0).slice(-1)[0];
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

            const points: IChartPoint[] = taskGroups.map(tasks => {
                const date = Utils.renderDateWithoutHours(tasks[0].solution!.slice(-1)[0].publicationDate!);
                const tasksChartView: ITaskChartView[] = tasks.map(task => {
                    const lastSolution = task.solution!.filter(s => s.state != Solution.StateEnum.NUMBER_0).slice(-1)[0];
                    totalStudentRating += lastSolution.rating ? lastSolution.rating : 0;
                    const taskView = courseTasks.find(t => t.id === task.id)!;

                    return {title: taskView.title!, receiveRating: lastSolution.rating!, maxRating: taskView.maxRating!}
                })

                return {id: studentId, date, totalRatingValue: totalStudentRating, tasks: tasksChartView};
            })

            studentCharts.set(studentId, points);
        })

    const studentChartsArray = Array.from(studentCharts.entries()).map(([_, line]) => line);

    const startCourseDate = courseHomeworks.map(hw => Utils.renderDateWithoutHours(hw.publicationDate!))
        .sort(compareStringFormatDates)[0];

    const characteristicDates = new Set<string>(
        [startCourseDate,
            ...deadlineDates,
            ...straightAStudentLine.map(p => p.date),
            ...averageStudentLine.map(p => p.date),
            ...studentChartsArray.flat().map(p => p.date)]
    );
    const finishCourseDate = Array.from(characteristicDates).sort(compareStringFormatDates).slice(-1)[0];

    let maximumExpectedRating = Math.max(
        straightAStudentLine.slice(-1)[0].totalRatingValue!,
        ...studentChartsArray.map(line => {
            return line.length > 0 ? line.slice(-1)[0].totalRatingValue! : 0;
        })
    );

    // дозаполняем все линии значениями во всех точках домена
    if (props.homeworks.length > 0) {
        studentCharts.forEach((line, studentId) => {
            const dates = line.map(p => p.date)

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
    }

    const deadlineDateFormat = [...deadlineDates, startCourseDate, finishCourseDate]
        .sort(compareStringFormatDates).filter(item => item);
    const lineColors = useMemo(() => new Map<string, string>
    (Array.from(studentCharts.keys()).map(student => {
        const color = student === straightAStudent ? '#2cba00' : (
            student === averageStudent ? '#FFA756' : getRandomColorWithMinBrightness(student)
        );
        return [student, color];
    })), [props]);

    return (
        <ResponsiveContainer height={360} width='99%'>
            <ComposedChart margin={{right: 15, top: 5, bottom: 5}}>
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
                       ticks={deadlineDateFormat.length != 0 ? deadlineDateFormat : ['']}
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
                        onClick={_ => setHighlightStudent(studentName)}
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
                        strokeWidth={studentName === highlightStudent ? 5 : 3}
                        legendType={studentName === straightAStudent || studentName === averageStudent ? 'diamond' : 'line'}
                        connectNulls/>
                })}

            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default StudentProgressChart;
