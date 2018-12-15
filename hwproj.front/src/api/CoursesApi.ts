import axios from 'axios'
import { ICourse, ICreateCourseModel, IUpdateCourseModel} from '../models/Course'
import buildCoursesApiUrl from '../utils/urlBuilder'

export default class CoursesApi {
    public static async getAllCourses() : Promise<ICourse[]> {
        return await axios.get(buildCoursesApiUrl('courses/'))
            .then(res => res.data, error => []);
    }

    public static async getCourse(id: number) : Promise<ICourse> {
        return await axios.get(buildCoursesApiUrl(`courses/${id}`))
            .then(res => res.data, error => null);
    }

    public static async createCourse(course: ICreateCourseModel, mentorId: string) : Promise<number> {
        return await axios.post(buildCoursesApiUrl(`courses/?mentorId=${mentorId}`), course)
            .then(res => res.data.id, error => NaN);
    }

    public static async deleteCourse(id: number) : Promise<boolean> {
        return await axios.delete(buildCoursesApiUrl(`courses/${id}`))
            .then(res => res.status === 200, error => false);
    }

    public static async updateCourse(course: IUpdateCourseModel, id: number) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/update/${id}`), course)
            .then(res => res.status === 200, error => false);
    }

    public static async signInCourse(courseId: number, userId: string) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/sign_in_course/${courseId}?userId=${userId}`))
            .then(res => res.status === 200, error => false);
    }

    public static async acceptStudent(courseId: number, userId: string) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/accept_student/${courseId}?userId=${userId}`))
            .then(res => res.status === 200, error => false);
    }

    public static async rejectStudent(courseId: number, userId: string) : Promise<boolean> {
        return await axios.post(buildCoursesApiUrl(`courses/reject_student/${courseId}?userId=${userId}`))
            .then(res => res.status === 200, error => false);
    }

    public static async getStudentCourses(userId: string) : Promise<number[]> {
        return await axios.get(buildCoursesApiUrl(`courses/student_courses/${userId}`))
            .then(res => res.data, error => []);
    }

    public static async getMentorCourses(userId: string) : Promise<number[]> {
        return await axios.get(buildCoursesApiUrl(`courses/mentor_courses/${userId}`))
            .then(res => res.data, error => []);
    }
}