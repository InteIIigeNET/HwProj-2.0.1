import axios from 'axios'
import ICourse from '../models/Course'
import ICreateCourseModel from '../models/Course'
import IUpdateCourseModel from '../models/Course'
import buildCoursesApiUrl from '../utils/urlBuilder'

export default class CoursesApi {
    public static async getAllCourses() : Promise<ICourse[]> {
        return await axios.get(buildCoursesApiUrl('courses'))
            .then(res => res.data);
    }

    public static async getCourse(id: number) : Promise<ICourse> {
        return await axios.get(buildCoursesApiUrl(`courses/${id}`))
            .then(res => res.data);
    }

    public static async createCourse(course: ICreateCourseModel, mentorId: string) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/?mentorId=${mentorId}`), course)
            .then(res => res.status === 200);
    }

    public static async deleteCourse(id: number) : Promise<boolean> {
        return await axios.delete(buildCoursesApiUrl(`courses/${id}`))
            .then(res => res.status === 200);
    }

    public static async updateCourse(course: IUpdateCourseModel, id: number) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/update/${id}`), course)
            .then(res => res.status === 200);
    }
}