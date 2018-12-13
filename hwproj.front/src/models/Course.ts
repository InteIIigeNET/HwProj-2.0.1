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