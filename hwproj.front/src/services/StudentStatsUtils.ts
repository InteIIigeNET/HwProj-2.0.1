import {Solution} from "../api";
import {colorBetween} from "./JsUtils";

export default class StudentStatsUtils {

    static getCellBackgroundColor = (state: Solution.StateEnum | undefined,
                                     rating: number | undefined, maxRating: number,
                                     isFirstTry: boolean): string => {
        if (state == Solution.StateEnum.NUMBER_0)
            return isFirstTry ? "#d0fcc7" : "#afeeee"
        return rating !== undefined
            ? colorBetween(0xff0000, 0x2cba00, rating / maxRating * 100)
            : "#ffffff"
    }

    static calculateLastRatedSolutionInfo(solutions: Solution[], taskMaxRating: number) {
        const ratedSolutions = solutions!.filter(x => x.state != Solution.StateEnum.NUMBER_0)
        const ratedSolutionsCount = ratedSolutions.length
        const isFirstUnratedTry = ratedSolutionsCount === 0
        const lastSolution = solutions!.slice(-1)[0]
        const lastRatedSolution = ratedSolutions.slice(-1)[0]

        return {
            lastRatedSolution: lastRatedSolution,
            color: lastSolution === undefined
                ? "#ffffff"
                : StudentStatsUtils.getCellBackgroundColor(lastSolution.state, lastSolution.rating, taskMaxRating, isFirstUnratedTry),
            ratedSolutionsCount, lastSolution
        }
    }
}
