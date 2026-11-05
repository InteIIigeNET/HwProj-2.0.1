export interface RatingStorageKey {
    taskId: number,
    studentId: string,
    solutionId: number | undefined
}

export interface RatingStorageValue {
    points: number,
    comment: string,
    requiresRevision?: boolean
}

export class RatingStorage {
    private static getKeyString = ({solutionId, studentId, taskId}: RatingStorageKey) => {
        const commentKey = solutionId ? `${solutionId}` : `${taskId}/${studentId}`
        const pointsKey = `${commentKey}/points`
        const requiresRevisionKey = `${commentKey}/requiresRevision`
        return {pointsKey, commentKey, requiresRevisionKey}
    }
    static tryGet = (key: RatingStorageKey) => {
        const {pointsKey, commentKey, requiresRevisionKey} = RatingStorage.getKeyString(key)
        const points = localStorage.getItem(pointsKey)
        const comment = localStorage.getItem(commentKey)
        const requiresRevision = localStorage.getItem(requiresRevisionKey)
        return points != null || comment != null || requiresRevision != null
            ? {
                points: Number(points),
                comment,
                requiresRevision: requiresRevision == null ? undefined : requiresRevision === "true"
            }
            : null;
    }

    static clean = (key: RatingStorageKey) => {
        const {pointsKey, commentKey, requiresRevisionKey} = RatingStorage.getKeyString(key)
        localStorage.removeItem(pointsKey)
        localStorage.removeItem(commentKey)
        localStorage.removeItem(requiresRevisionKey)
    }

    static set = (key: RatingStorageKey, {comment, points, requiresRevision}: RatingStorageValue) => {
        const {pointsKey, commentKey, requiresRevisionKey} = RatingStorage.getKeyString(key)
        localStorage.setItem(pointsKey, points.toString())
        localStorage.setItem(commentKey, comment)
        if (requiresRevision === undefined) localStorage.removeItem(requiresRevisionKey)
        else localStorage.setItem(requiresRevisionKey, requiresRevision.toString())
    }
}
