import IStudent from './Student'

export default interface ICourse
{
    id: number,
    name: string,
    groupName: string,
    isOpen: boolean,
    isComplete: boolean,
    mentorId: string,
    students: IStudent[]
}

export default interface ICreateCourseModel
{
    name: string,
    groupName: string,
    isOpen: boolean
}

export default interface IUpdateCourseModel
{
    name: string,
    groupName: string,
    isOpen: boolean,
    isComplete: boolean
}