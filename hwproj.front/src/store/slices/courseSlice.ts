import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AccountDataDto, CourseViewModel} from '@/api';
import {loadCoursePage} from '../courseThunks';

export type CurrentCourseMeta = Pick<
  CourseViewModel,
  'id' | 'name' | 'groupName' | 'isCompleted'
>;

export const toCurrentCourseMeta = (
  course: CourseViewModel
): CurrentCourseMeta => ({
  id: course.id,
  name: course.name,
  groupName: course.groupName,
  isCompleted: course.isCompleted,
});

interface CourseState {
  courseId: number | null;
  requestId: string | null;
  scopeId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  warnings: string[];
  isFound: boolean;
  currentCourseMeta: CurrentCourseMeta | null;
  mentors: AccountDataDto[];
  acceptedStudents: AccountDataDto[];
  newStudents: AccountDataDto[];
}

const initialState: CourseState = {
    courseId: null,
    requestId: null,
    scopeId: null,
    status: 'idle',
    error: null,
    warnings: [],
    isFound: false,
    currentCourseMeta: null,
    mentors: [],
    acceptedStudents: [],
    newStudents: [],
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourse(state, action: PayloadAction<CurrentCourseMeta>) {
      state.currentCourseMeta = action.payload;
      state.isFound = true;
    },

    setMentors(state, action: PayloadAction<AccountDataDto[]>) {
      state.mentors = action.payload;
    },
    
    setAcceptedStudents(state, action: PayloadAction<AccountDataDto[]>) {
        state.acceptedStudents = action.payload
    },

    setNewStudents(state, action: PayloadAction<AccountDataDto[]>) {
        state.newStudents = action.payload
    },
  },
  extraReducers: builder => {
    builder.addCase(loadCoursePage.pending, (state, action) => {
      if (!action.meta.arg.refresh || state.courseId !== action.meta.arg.courseId) {
        state.scopeId = action.meta.requestId;
      }
      state.courseId = action.meta.arg.courseId;
      state.requestId = action.meta.requestId;
      state.status = 'loading';
      state.error = null;
      state.warnings = [];
    });
    builder.addCase(loadCoursePage.fulfilled, (state, action) => {
      const {course, warnings} = action.payload;
      state.currentCourseMeta = toCurrentCourseMeta(course);
      state.isFound = true;
      state.mentors = course.mentors ?? [];
      state.acceptedStudents = course.acceptedStudents ?? [];
      state.newStudents = course.newStudents ?? [];
      state.status = 'succeeded';
      state.warnings = warnings;
    });
    builder.addCase(loadCoursePage.rejected, (state, action) => {
      state.status = action.meta.aborted ? 'idle' : 'failed';
      state.error = action.meta.aborted ? null : action.payload ?? 'Не удалось загрузить курс';
    });
  },
});

export const {
  setCourse, 
  setMentors, 
  setAcceptedStudents, 
  setNewStudents,
} = courseSlice.actions;

export default courseSlice.reducer;