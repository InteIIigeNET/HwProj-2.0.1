
export default class SolutionService {

    async addSolution(solutionModel: any) {
        await fetch("http://localhost:3001/solutions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(solutionModel)
        })
    }

    async getAllSolutions() {
        const response = await fetch("http://localhost:3001/solutions")
        const solutions = await response.json()
        return solutions
    }

    async getSolutionsByTaskIdAndStudentId(taskId: number, studentId: number) {
        const solutions = await this.getAllSolutions()
        const requiredSolutions = solutions.filter((sl: any) => sl.taskId == taskId && sl.studentId == studentId)
        return requiredSolutions
    }

    async getSolutionBySolutionId(solutionId: number) {
        const response = await fetch("http://localhost:3001/solutions/" + solutionId)
        const solution = await response.json()
        return solution
    }

    async acceptSolutionBySolutionId(solutionId: number) {
        const solution = await this.getSolutionBySolutionId(solutionId)
        await fetch("http://localhost:3001/solutions/" + solutionId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                taskId: solution.taskId,
                studentId: solution.studentId,
                githubUrl: solution.githubUrl,
                comment: solution.comment,
                state: "Accepted"
            })
        })
    }

    async rejectSolutionBySolutionId(solutionId: number) {
        const solution = await this.getSolutionBySolutionId(solutionId)
        await fetch("http://localhost:3001/solutions/" + solutionId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                taskId: solution.taskId,
                studentId: solution.studentId,
                githubUrl: solution.githubUrl,
                comment: solution.comment,
                state: "Rejected"
            })
        })
    }
}