import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AccountDataDto, CourseViewModel} from '@/api'
import ApiSingleton from '@/api/ApiSingleton';
import {setHomeworks} from './homeworkSlice';

export const fetchCourseData = createAsyncThunk(
  'course/fetchCourseData',
  async (courseId: number, {dispatch}) => {
    const course = await ApiSingleton.coursesApi.coursesGetCourseData(courseId);
    dispatch(setCourse(course));
    dispatch(setMentors(course.mentors ?? []));
    dispatch(setAcceptedStudents(course.acceptedStudents ?? []));
    dispatch(setNewStudents(course.newStudents ?? []));
    dispatch(setHomeworks(course.homeworks ?? []));

    return course;
  }
);

interface CourseState {
  isFound: boolean;
  isLoading: boolean;
  course: CourseViewModel | null;
  mentors: AccountDataDto[];
  acceptedStudents: AccountDataDto[];
  newStudents: AccountDataDto[];
}

const initialState: CourseState = {
    isFound: false,
    isLoading: false,
    course: null,
    mentors: [],
    acceptedStudents: [],
    newStudents: [],
};

const courseSlice = createSlice({
  name: 'course',
  initialState,
  reducers: {
    setCourse(state, action: PayloadAction<CourseViewModel>) {
      state.course = action.payload;
      state.isFound = true;
      state.isLoading = false;
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

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    resetCourse(state) {
      state.course = null;
      state.isFound = false;
      state.isLoading = false;
      state.mentors = [];
      state.acceptedStudents = [];
      state.newStudents = [];
    },
  },
});

export const {
  setCourse, 
  setMentors, 
  setAcceptedStudents, 
  setNewStudents, 
  setLoading, 
  resetCourse
} = courseSlice.actions;

export default courseSlice.reducer;