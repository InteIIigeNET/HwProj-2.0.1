import {HomeworkViewModel, StatisticsCourseMatesModel} from "@/api";
import {Unstable_RadarChart as RadarChart} from '@mui/x-charts/RadarChart';
import {FC} from "react";
import StudentStatsUtils from "@/services/StudentStatsUtils";

export const StudentsRadarChart: FC<{
    selectedStudents: string[],
    homeworks: HomeworkViewModel[],
    solutions: StatisticsCourseMatesModel[]
}> = (props) => {
    const metrics = props.homeworks
        .map(x => ({
            name: x.title! + `[id${x.id!}]`,
            id: x.id!,
            max: x.tasks!
                .map(x => x.maxRating!)
                .reduce((a, b) => a + b)
        }))
        .filter(x => x.max > 0)

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

    return <RadarChart
        height={400}
        series={series}
        radar={{
            metrics,
            labelFormatter: (name: string, _) => name.replace(/\[id\d+]/g, "")
        }}
    />
}
