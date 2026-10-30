import {useHomeworkEditing} from './storeHooks/homeworkEditorHooks';
import {useTaskEditing} from './storeHooks/taskEditorHooks';

export const useCourseActions = () => {
    const homework = useHomeworkEditing();
    const task = useTaskEditing();
    return {
        createHomework: homework.createHomework,
        startHomeworkEdit: homework.startHomeworkEdit,
        patchHomeworkDraft: homework.patchHomeworkDraft,
        saveHomework: homework.saveHomework,
        cancelHomeworkEdit: homework.cancelHomeworkEdit,
        deleteHomework: homework.deleteHomework,

        createTask: task.createTask,
        startTaskEdit: task.startTaskEdit,
        patchTaskDraft: task.patchTaskDraft,
        saveTask: task.saveTask,
        cancelTaskEdit: task.cancelTaskEdit,
        deleteTask: task.deleteTask,

        addCriterion: task.addCriterion,
        updateCriterion: task.updateCriterion,
        removeCriterion: task.removeCriterion,
    };
};