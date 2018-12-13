import axios from 'axios'
import ICourse from '../models/Course'

export default class CoursesApi {
    public static async getAllCourses() : Promise<ICourse[]> {
        return await axios.get('https://localhost:44399/api/courses')
        .then(res => res.data);
    }
}