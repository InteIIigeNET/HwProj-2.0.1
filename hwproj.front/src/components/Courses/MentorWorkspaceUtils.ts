import {AccountDataDto, CourseViewModel, GroupViewModel, HomeworkViewModel, WorkspaceViewModel} from "@/api";

export interface SelectedCourseView {
    courseHomeworks: HomeworkViewModel[];
    courseStudents: AccountDataDto[];
    courseGroups: GroupViewModel[];
    selectedHomeworks: HomeworkViewModel[];
    selectedStudents: AccountDataDto[];
    selectedGroups: GroupViewModel[];
}

export const getSelectedCourseView = (
    course: CourseViewModel,
    mentorWorkspace: WorkspaceViewModel
): SelectedCourseView => {
    const courseGroups = course.groups?.filter(g => g.name?.trim()) ?? [];

    const selectedGroups = (mentorWorkspace.groups?.length === courseGroups.length
            ? []
            : mentorWorkspace.groups ?? []
        )
        .filter(g => g.name?.trim());

    const selectedGroupsStudents = selectedGroups.flatMap(g => g.studentsIds ?? []);
    const selectedStudentWithoutGroups = mentorWorkspace.students
        ?.filter(st => !selectedGroupsStudents.includes(st.userId!)) ?? [];
    const allCourseStudentsCount = (course.acceptedStudents?.length ?? 0) + (course.newStudents?.length ?? 0);
    const selectedStudents = selectedStudentWithoutGroups.length === allCourseStudentsCount
        ? []
        : selectedStudentWithoutGroups;

    const availableHomeworks = selectedGroups.length > 0
        ? course.homeworks?.filter(h => !h.groupId || selectedGroups.some(g => g.id === h.groupId))
        : course.homeworks;
    const selectedHomeworks = mentorWorkspace.homeworks?.length === availableHomeworks?.length
        ? []
        : mentorWorkspace.homeworks ?? [];

    return {
        courseHomeworks: course.homeworks ?? [],
        courseStudents: course.acceptedStudents ?? [],
        courseGroups,
        selectedHomeworks,
        selectedStudents: selectedStudents.filter(s => !selectedGroups.some(g => g.studentsIds?.includes(s.userId!))),
        selectedGroups,
    };
}
