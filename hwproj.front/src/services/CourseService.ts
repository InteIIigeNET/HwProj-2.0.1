import { CourseViewModel } from './../api/courses/api';
import ApiSingleton from "../api/ApiSingleton"


export default class CourseService {

    async addHomework(homework: any, courseId: number) {
        let tasksId = []
        for (let task of homework.tasks) {
            const id = await this.addTask({
                title: task.title,
                description: task.description,
                maxRating: task.maxRating,
            })
            tasksId.push(id)
        }
        const responseHomework = await fetch("http://localhost:3001/homeworks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: homework.title,
                description: homework.description,
                date: homework.date,
                courseId: courseId,
                tasks: tasksId
            })
        })
        const data = await responseHomework.json()
        const course = await this.getCourseById(courseId)
        
        const newHomeworks = course.homeworks
        newHomeworks.push(data.id)

        await fetch("http://localhost:3001/courses/" + courseId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: course.name,
                groupName: course.groupName,
                isOpen: true,
                isCompleted: false,
                course: course.course,
                mentor: course.mentor,
                courseMates: course.courseMates,
                homeworks: newHomeworks,
            })
        })
    }

    async addCourse(courseViewModel: any) {
        await fetch("http://localhost:3001/courses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(courseViewModel)
        })
    }

    async addTask(task: any) {
        const response = await fetch("http://localhost:3001/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        })
        const data = await response.json()
        return data.id;
    }

    async getCourseById(courseId: number) {
        const responseCourse = await fetch("http://localhost:3001/courses/" + courseId)
        const course = await responseCourse.json()
        return course;
    }

    async getHomeworksByCourseId(courseId: number) {
        const course = await this.getCourseById(courseId)
        const homeworks = await ApiSingleton.homeworkService.getAllHomeworks()
        const courseHomeworks = course.homeworks.map((hw: any) => {
            let homework
            for (let item of homeworks){
                if (item.id == hw) {
                    homework = item
                }
            }
            return homework
        })
        const allTasks = await ApiSingleton.taskService.getAllTasks()
        for (let homeWork of courseHomeworks) {
            let courseTasks = homeWork.tasks.map((taskId: any) => {
                let currentTask
                allTasks.forEach((element: any) => {
                    if (element.id == taskId){
                        currentTask = element
                    }    
                });
                return currentTask
            })
            homeWork.tasks = courseTasks
        }
        return courseHomeworks
    }

    async deleteCourseById(courseId: number) {
        const course = await this.getCourseById(courseId)
        course.homeworks.map((hw: any) => {
            ApiSingleton.homeworkService.deleteHomeworkByHomeworkId(hw)
        })
        await fetch("http://localhost:3001/courses/" + courseId, {
            method: "DELETE"
        })
    }

    async updateCourseById(courseId: number, courseModel: any) {
        const course = await this.getCourseById(courseId)
        
        await fetch("http://localhost:3001/courses/" + courseId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: courseModel.name,
                groupName: courseModel.groupName,
                isOpen: courseModel.isOpen,
                isCompleted: courseModel.isCompleted,
                course: course.course,
                mentor: course.mentor,
                courseMates: course.courseMates,
                homeworks: course.homeworks,
            })
        })
    }

    async getAllCourses() {
        const response = await fetch("http://localhost:3001/courses")
        const courses = await response.json()
        return courses
    }

    async getCourseByHomeworkId(homeworkId: number) {
        const courses = await this.getAllCourses()
        const course = courses.filter((course: any) => {
            let isContain = false
            course.homeworks.map((id: any) => {
                if (id == homeworkId) {
                    isContain = true
                }
            })
            return isContain
        }).shift()
        return course
    }

    async updateStudent(courseId: number, courseModel: any) {
        await fetch("http://localhost:3001/courses/" + courseId, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(courseModel)
        })
    }
}

