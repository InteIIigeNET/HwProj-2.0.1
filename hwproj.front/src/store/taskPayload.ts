import type {ActionOptions, CriterionViewModel, HomeworkTaskViewModel, HomeworkViewModel, PostTaskViewModel} from '@/api';
import {CriterionType} from '@/api';
import {BonusTag} from '@/components/Common/HomeworkTags';

export const isRegularCriterion = (criterion: CriterionViewModel) => criterion.type !== CriterionType.NUMBER_1;

export const buildTaskPayload = (
    task: HomeworkTaskViewModel,
    homework: HomeworkViewModel,
    actionOptions?: ActionOptions,
): PostTaskViewModel => {
    const criteria = task.criteria || [];
    const regularCriteria = criteria.filter(isRegularCriterion);
    const maxRating = regularCriteria.length > 0
        ? regularCriteria.reduce((sum, criterion) => sum + (criterion.maxPoints || 0), 0)
        : (task.maxRating ?? 0);
    const isBonusExplicit = (task.tags || []).includes(BonusTag) && !(homework.tags || []).includes(BonusTag);
    const publicationDate = task.publicationDate ?? homework.publicationDate;

    return {
        title: task.title!,
        description: task.description || '',
        isBonusExplicit,
        maxRating,
        actionOptions,
        criteria,
        hasDeadline: task.hasDeadline,
        isDeadlineStrict: task.isDeadlineStrict,
        publicationDate: task.publicationDateNotSet ? undefined : publicationDate,
        deadlineDate: task.deadlineDateNotSet ? undefined : task.deadlineDate,
    };
};