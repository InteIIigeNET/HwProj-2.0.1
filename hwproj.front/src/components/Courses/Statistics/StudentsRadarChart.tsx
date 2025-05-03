import {HomeworkViewModel, StatisticsCourseMatesModel, StatisticsCourseMeasureSolutionModel} from "@/api";
import {Unstable_RadarChart as RadarChart} from '@mui/x-charts/RadarChart';
import {FC} from "react";
import StudentStatsUtils from "@/services/StudentStatsUtils";

export const StudentsRadarChart: FC<{
    selectedStudents: string[],
    homeworks: HomeworkViewModel[],
    solutions: StatisticsCourseMatesModel[],
    averageStudent: StatisticsCourseMeasureSolutionModel[]
}> = (props) => {
    const homeworks = props.homeworks
        .filter(h => h.tasks!.length > 0)

    const metrics = homeworks
        .map(x => ({
            name: x.title! + `[id${x.id!}]`,
            id: x.id!,
            max: x.tasks!
                .map(x => x.maxRating!)
                .reduce((a, b) => a + b)
        }))

    const series = props.solutions
        .filter(x => props.selectedStudents.includes(x.id!))
        .map(x => ({
            label: x.surname + " " + x.name,
            fillArea: true,
            data: metrics
                .map(m => x.homeworks!.find(t => t.id === m.id))
                .map(x => x!.tasks!
                    .flatMap(y => StudentStatsUtils.calculateLastRatedSolution(y.solution!)?.rating || 0)
                    .reduce((a, b) => a + b))
        }))

    const averageStudent = {
        label: "Средний студент",
        fillArea: true,
        data: homeworks
            .map(h => h.tasks!
                .map(t => props.averageStudent.find(y => y.taskId === t.id)?.rating || 0)
                .reduce((a, b) => a + b))
    }

    series.push(averageStudent)

    return <RadarChart
        height={400 + (homeworks.length > 10 ? (homeworks.length - 10) * 10 : 0)}
        series={series}
        radar={{
            metrics,
            labelFormatter: (name: string, _) => name.replace(/\[id\d+]/g, "")
        }}
    />
}
