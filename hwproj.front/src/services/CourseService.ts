
export default class CourseService {

    async addHomework(homework: any, courseId: number) {
        const responseHomework = await fetch("http://localhost:3001/homeworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(homework)
        })
        const data = await responseHomework.json()
        debugger;
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

    async addTask(task: any) {
        const response = await fetch("http://localhost:3001/tasks", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                
            })
        })
        

    }

    async getCourseById(courseId: number) {
        const responseCourse = await fetch("http://localhost:3001/courses/" + courseId)
        const course = await responseCourse.json()
        return course;
    }

    async getAllHomeworks() {
        const homeworkResponse = await fetch("http://localhost:3001/homeworks")
        const homeworks = homeworkResponse.json()
        return homeworks 
    }

    async getHomeworksByCourseId(courseId: number) {
        const course = await this.getCourseById(courseId)
        const homeworks = await this.getAllHomeworks()
        const courseHomeworks = course.homeworks.map((hw: any) => {
            let homework
            for (let item of homeworks){
                if (item.id == hw) {
                    homework = item
                }
            }
            return homework
        })
        return courseHomeworks
    }
}