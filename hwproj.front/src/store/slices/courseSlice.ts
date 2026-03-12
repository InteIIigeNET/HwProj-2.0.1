import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AccountDataDto, CourseViewModel} from '@/api';

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
  isFound: boolean;
  currentCourseMeta: CurrentCourseMeta | null;
  mentors: AccountDataDto[];
  acceptedStudents: AccountDataDto[];
  newStudents: AccountDataDto[];
}

const initialState: CourseState = {
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
});

export const {
  setCourse, 
  setMentors, 
  setAcceptedStudents, 
  setNewStudents,
} = courseSlice.actions;

export default courseSlice.reducer;