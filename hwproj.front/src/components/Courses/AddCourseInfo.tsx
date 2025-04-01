import {FC, ChangeEvent} from "react"
import {
  Grid,
  TextField,
  Button,
} from "@material-ui/core";
import {LoadingButton} from "@mui/lab";

interface IAddCourseInfoProps {
  courseName: string;
  groupName: string;
  courseIsLoading: boolean;
  setCourseName: (name: string) => void;
  setGroupName: (name: string) => void;
  handleBack: () => void;
}

const AddCourseInfo: FC<IAddCourseInfoProps> = (props: IAddCourseInfoProps) => {
  const handleCourseNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    props.setCourseName(e.target.value)
  }

  const handleGroupNameChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    e.persist()
    props.setGroupName(e.target.value)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          required
          label="Название курса"
          variant="outlined"
          fullWidth
          value={props.courseName}
          onChange={handleCourseNameChange}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Номер группы"
          variant="outlined"
          fullWidth
          value={props.groupName}
          onChange={handleGroupNameChange}
        />
      </Grid>
      <Grid item style={{ marginTop: 8, display: "flex", justifyContent: "space-between", width: "100%" }}>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={props.handleBack}
        >
          Назад
        </Button>
        <LoadingButton
          type="submit"
          variant="contained"
          size="large"
          style={{ color: "white", backgroundColor: "#3f51b5" }}
          loading={props.courseIsLoading}
        >
          Создать курс
        </LoadingButton>
      </Grid>
    </Grid>
  )
}

export default AddCourseInfo
