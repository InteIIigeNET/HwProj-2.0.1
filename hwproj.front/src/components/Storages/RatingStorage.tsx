export interface RatingStorageKey {
    taskId: number,
    studentId: string,
    solutionId: number | undefined
}

export interface RatingStorageValue {
    points: number,
    comment: string
}

export class RatingStorage {
    private static getKeyString = ({solutionId, studentId, taskId}: RatingStorageKey) => {
        const commentKey = solutionId ? `${solutionId}` : `${taskId}/${studentId}`
        const pointsKey = `${commentKey}/points`
        return {pointsKey, commentKey}
    }
    static tryGet = (key: RatingStorageKey) => {
        const {pointsKey, commentKey} = RatingStorage.getKeyString(key)
        const points = localStorage.getItem(pointsKey)
        const comment = localStorage.getItem(commentKey)
        return points !== null || comment !== null
            ? {points: Number(points), comment}
            : null;
    }

    static clean = (key: RatingStorageKey) => {
        const {pointsKey, commentKey} = RatingStorage.getKeyString(key)
        localStorage.removeItem(pointsKey)
        localStorage.removeItem(commentKey)
    }

    static set = (key: RatingStorageKey, {comment, points}: RatingStorageValue) => {
        const {pointsKey, commentKey} = RatingStorage.getKeyString(key)
        localStorage.setItem(pointsKey, points.toString())
        localStorage.setItem(commentKey, comment)
    }
}
