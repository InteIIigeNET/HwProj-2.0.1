import type {CourseViewModel, HomeworkTaskViewModel, HomeworkViewModel, StatisticsCourseMatesModel} from '@/api';

export type Serialized<T> = T extends Date ? string
    : T extends (infer Item)[] ? Serialized<Item>[]
        : T extends object ? {[Key in keyof T]: Serialized<T[Key]>}
            : T;

export type StoredCourse = Serialized<CourseViewModel>;
export type StoredHomework = Serialized<HomeworkViewModel>;
export type StoredTask = Serialized<HomeworkTaskViewModel>;
export type StoredStudentSolutions = Serialized<StatisticsCourseMatesModel>;

export const serializeDates = <T>(value: T): Serialized<T> => {
    if (value instanceof Date) {
        return (Number.isFinite(value.getTime()) ? value.toISOString() : value.toString()) as Serialized<T>;
    }
    if (Array.isArray(value)) {
        return value.map(item => serializeDates(item)) as Serialized<T>;
    }
    if (value != null && typeof value === 'object') {
        return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, serializeDates(item)])) as Serialized<T>;
    }
    return value as Serialized<T>;
};

const toDate = (value: string | undefined): Date | undefined => value == null ? undefined : new Date(value);
const taskViews = new WeakMap<StoredTask, HomeworkTaskViewModel>();
const homeworkViews = new WeakMap<StoredHomework, HomeworkViewModel>();

export const toTaskView = (task: StoredTask): HomeworkTaskViewModel => {
    const cached = taskViews.get(task);
    if (cached) return cached;
    const view = {
        ...task,
        publicationDate: toDate(task.publicationDate),
        deadlineDate: toDate(task.deadlineDate),
    };
    taskViews.set(task, view);
    return view;
};

export const toHomeworkView = (homework: StoredHomework): HomeworkViewModel => {
    const cached = homeworkViews.get(homework);
    if (cached) return cached;
    const view = {
        ...homework,
        publicationDate: toDate(homework.publicationDate),
        deadlineDate: toDate(homework.deadlineDate),
        tasks: homework.tasks?.map(toTaskView),
    };
    homeworkViews.set(homework, view);
    return view;
};

export const toStudentSolutionsView = (student: StoredStudentSolutions): StatisticsCourseMatesModel => ({
    ...student,
    homeworks: student.homeworks?.map(homework => ({
        ...homework,
        tasks: homework.tasks?.map(task => ({
            ...task,
            solutions: task.solutions?.map(solution => ({
                ...solution,
                publicationDate: toDate(solution.publicationDate),
                ratingDate: toDate(solution.ratingDate),
            })),
        })),
    })),
});