import type {HomeworkTaskViewModel, HomeworkViewModel} from '@/api';
import {buildTaskPayload, isRegularCriterion} from './taskPayload';

const getTimestamp = (date: Date | undefined, notSet?: boolean) =>
    date == null || notSet ? undefined : new Date(date).getTime();

const isInvalidDate = (timestamp: number | undefined) =>
    timestamp !== undefined && !Number.isFinite(timestamp);

const isBefore = (date: number | undefined, other: number | undefined) =>
    date !== undefined && other !== undefined && date < other;

export const getTaskValidation = (
    task: HomeworkTaskViewModel,
    homework: HomeworkViewModel,
) => {
    const {maxRating, criteria = []} = buildTaskPayload(task, homework);
    const criteriaHasErrors = criteria.some(criterion =>
        !criterion.name
        || !Number.isFinite(criterion.maxPoints)
        || (criterion.maxPoints ?? 0) <= 0
        || (!isRegularCriterion(criterion)
            && (!criterion.arguments || !Number.isFinite(new Date(criterion.arguments).getTime())))
    );
    const homeworkPublication = getTimestamp(
        homework.publicationDate,
        homework.publicationDateNotSet,
    );
    const homeworkDeadline = getTimestamp(homework.deadlineDate, homework.deadlineDateNotSet);
    const taskPublication = getTimestamp(task.publicationDate, task.publicationDateNotSet);
    const taskDeadline = getTimestamp(task.deadlineDate, task.deadlineDateNotSet);
    const publication = taskPublication ?? homeworkPublication;
    const deadline = taskDeadline ?? homeworkDeadline;
    const datesHasErrors = (task.hasDeadline === true && taskDeadline === undefined)
        || isInvalidDate(publication)
        || isInvalidDate(deadline)
        || isBefore(taskPublication, homeworkPublication)
        || isBefore(deadline, publication);
    const hasErrors = !task.title
        || !Number.isFinite(maxRating)
        || maxRating <= 0
        || maxRating > 100
        || criteriaHasErrors
        || datesHasErrors;

    return {hasErrors, criteriaHasErrors, datesHasErrors};
};

export const getHomeworkValidation = (homework: HomeworkViewModel) => {
    const publication = getTimestamp(homework.publicationDate, homework.publicationDateNotSet);
    const deadline = getTimestamp(homework.deadlineDate, homework.deadlineDateNotSet);
    const hasErrors = !homework.title
        || (homework.hasDeadline === true && deadline === undefined)
        || isInvalidDate(publication)
        || isInvalidDate(deadline)
        || isBefore(deadline, publication);
    const taskHasErrors = (homework.tasks ?? []).some(
        task => getTaskValidation(task, homework).hasErrors,
    );

    return {hasErrors, taskHasErrors};
};