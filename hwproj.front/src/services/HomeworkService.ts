import ApiSingleton  from '../api/ApiSingleton';

export default class HomeworkService {

    async getHomeworkById(homeworkId: number) {
        const homeworks = await this.getAllHomeworks()
        const homework = homeworks.filter((hw: any) => hw.id == homeworkId).shift()
        return homework
    }

    async getAllHomeworks() {
        const homeworkResponse = await fetch("http://localhost:3001/homeworks")
        const homeworks = homeworkResponse.json()
        return homeworks 
    }

    async updateHomeworkByHomeworkId(homeworkId: number, homeworkModel: any) {
        const homework = await this.getHomeworkById(homeworkId)
        
        await fetch("http://localhost:3001/homeworks/" + homeworkId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: homeworkModel.title,
                description: homeworkModel.description,
                date: homework.date,
                courseId: homework.courseId,
                tasks: homework.tasks,
            })
        })
    }

    async deleteHomeworkByHomeworkId(homeworkId: number) {
        const homework = await this.getHomeworkById(homeworkId)
        homework.tasks.map((task: any) => {
            ApiSingleton.taskService.deleteTaskByTaskId(task)
        })
        const course = await ApiSingleton.courseService.getCourseById(homework.courseId)
        await fetch("http://localhost:3001/homeworks/" + homeworkId, {
            method: "DELETE"
        })

        const newHomeworks = course.homeworks.filter((hw: any) => hw != homeworkId)
        await fetch("http://localhost:3001/courses/" + course.id, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: course.name,
                groupName: course.groupName,
                isOpen: course.isOpen,
                isCompleted: course.isCompleted,
                course: course.course,
                mentor: course.mentor,
                courseMates: course.courseMates,
                homeworks: newHomeworks,
            })
        })
    }
}