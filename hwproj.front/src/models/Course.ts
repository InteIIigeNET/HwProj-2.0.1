import IStudent from './Student'

export interface ICourse
{
    id: number,
    name: string,
    groupName: string,
    isOpen: boolean,
    isComplete: boolean,
    mentorId: string,
    students: IStudent[]
}

export interface ICreateCourseModel
{
    name: string,
    groupName: string,
    isOpen: boolean
}

export interface IUpdateCourseModel
{
    name: string,
    groupName: string,
    isOpen: boolean,
    isComplete: boolean
}