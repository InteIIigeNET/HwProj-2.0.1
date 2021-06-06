import ApiSingleton from '../api/ApiSingleton'

export default class TaskService {

    async getTasksByTasksId(tasksId: any) {
        const tasks = await this.getAllTasks()
        const currentTasks = tasksId.map((id: any) => {
            let task
            tasks.forEach((element: any) => {
                if (element.id == id) {
                    task = element
                }
            });
            return task
        })
        return currentTasks
    }

    async addTask(homeworkId: number, taskModel: any) {
        const response = await fetch("http://localhost:3001/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskModel)
        })
        const data = await response.json()

        const homework = await ApiSingleton.homeworkService.getHomeworkById(homeworkId)
        homework.tasks.push(data.id)

        await fetch("http://localhost:3001/homeworks/" + homeworkId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: homework.title,
                description: homework.description,
                date: homework.date,
                courseId: homework.courseId,
                tasks: homework.tasks,
            })
        })
    }

    async getAllTasks() {
        const response = await fetch("http://localhost:3001/tasks")
        const data = await response.json()
        return data
    }

    async getTaskByTaskId(taskId: number) {
        const response = await fetch("http://localhost:3001/tasks/" + taskId)
        const task = await response.json()
        return task
    }

    async getHomeworkByTaskId(taskId: number) {
        const homeworks = await ApiSingleton.homeworkService.getAllHomeworks()
        const homework = homeworks.filter((hw: any) => {
            let desiredHomework = false
            hw.tasks.forEach((element: any) => {
                if (element == taskId) {
                    desiredHomework = true
                }
            });
            return desiredHomework
        }).shift()
        return homework
    }

    async updateTaskByTaskId(taskId: number, taskModel: any) {
        await fetch("http://localhost:3001/tasks/" + taskId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: taskModel.title,
                description: taskModel.description,
                maxRating: taskModel.maxRating,
            })
        })
    }

    async deleteTaskByTaskId(taskId: number) {
        const homework = await this.getHomeworkByTaskId(taskId)
        const response = await fetch("http://localhost:3001/tasks/" + taskId, {
            method: "DELETE"
        })
        
        const newTasks = homework.tasks.filter((task: any) => taskId != task)

        await fetch("http://localhost:3001/homeworks/" + homework.id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: homework.title,
                description: homework.description,
                date: homework.date,
                courseId: homework.courseId,
                tasks: newTasks,
            })
        })
    }
}