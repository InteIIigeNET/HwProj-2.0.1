import {SolutionDto, SolutionState} from "@/api";
import {colorBetween} from "./JsUtils";
import Utils from "./Utils";
import {grey} from "@material-ui/core/colors";

export default class StudentStatsUtils {

    static getRatingColor = (rating: number, maxRating: number) =>
        colorBetween(0xff0000, 0x2cba00, Math.min(rating, maxRating) / maxRating * 100)

    static getCellBackgroundColor = (state: SolutionState | undefined,
                                     rating: number | undefined, maxRating: number,
                                     isFirstTry: boolean): string => {
        if (state === SolutionState.NUMBER_0)
            return isFirstTry ? "#d0fcc7" : "#afeeee"
        return rating !== undefined
            ? StudentStatsUtils.getRatingColor(rating, maxRating)
            : "#ffffff"
    }

    static calculateLastRatedSolution(solutions: SolutionDto[]) {
        const ratedSolutions = solutions!.filter(x => x.state !== SolutionState.NUMBER_0)
        return ratedSolutions.slice(-1)[0]
    }

    static calculateLastRatedSolutionInfo(solutions: SolutionDto[], taskMaxRating: number, disabled: boolean = false) {
        const ratedSolutions = solutions!.filter(x => x.state !== SolutionState.NUMBER_0)
        const ratedSolutionsCount = ratedSolutions.length
        const isFirstUnratedTry = ratedSolutionsCount === 0
        const lastSolution = solutions!.slice(-1)[0]
        const lastRatedSolution = ratedSolutions.slice(-1)[0]

        let solutionsDescription: string
        if (disabled)
            solutionsDescription = "Задача недоступна для этого студента"
        else if (lastSolution === undefined)
            solutionsDescription = "Решение отсутствует"
        else if (isFirstUnratedTry)
            solutionsDescription = "Решение ожидает проверки"
        else if (lastSolution.state !== SolutionState.NUMBER_0)
            solutionsDescription = `${lastSolution.rating}/${taskMaxRating} ${Utils.pluralizeHelper(["балл", "балла", "баллов"], taskMaxRating)}`
        else solutionsDescription = "Последняя оценка — " + `${lastRatedSolution.rating}/${taskMaxRating} ${Utils.pluralizeHelper(["балл", "балла", "баллов"], taskMaxRating)}\nНовое решение ожидает проверки`

        const color = disabled
            ? grey[300]
            : StudentStatsUtils.getCellBackgroundColor(lastRatedSolution.state, lastRatedSolution.rating, taskMaxRating, isFirstUnratedTry)

        return {
            lastRatedSolution: lastRatedSolution,
            color: color,
            ratedSolutionsCount, lastSolution, solutionsDescription
        }
    }
}
