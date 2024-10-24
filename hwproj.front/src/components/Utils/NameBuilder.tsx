export default class NameBuilder {
    static getUserFullName(
        name: string | undefined,
        surname: string | undefined,
        middleName: string | undefined
    ) {
        return [surname, name, middleName]
            .filter(Boolean)
            .join(' ');
    }

    static getCourseFullName(
        courseName: string,
        groupName: string | undefined,
    ) {
        return courseName + (groupName?.length != 0 ? " / " + groupName : "")
    }
}