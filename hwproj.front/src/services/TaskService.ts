
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

    async getAllTasks() {
        const response = await fetch("http://localhost:3001/tasks")
        const data = await response.json()
        return data
    }
}