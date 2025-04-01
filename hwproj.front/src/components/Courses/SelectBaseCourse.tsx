import {FC, ChangeEvent} from "react"
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  Typography,
} from "@material-ui/core";
import {CoursePreviewView} from "api";
import NameBuilder from "../Utils/NameBuilder";

interface ISelectBaseCourseProps {
  baseCourses: CoursePreviewView[];
  baseCourseIndex?: number;
  setBaseCourseIndex: (index?: number) => void;
  handleSkip: () => void;
  handleNext: () => void;
}

const SelectBaseCourse: FC<ISelectBaseCourseProps> = (props: ISelectBaseCourseProps) => {
  const baseCourses = props.baseCourses

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.persist()
    const index = +e.target.value || undefined
    props.setBaseCourseIndex(index)
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          select
          label="Базовый курс"
          fullWidth
          variant="outlined"
          value={props.baseCourseIndex}
          onChange={handleChange}
        >
          {!baseCourses.length &&
            <MenuItem>
              <Typography>
                Базовых курсов не найдено &#128532;<br/>
                Попробуйте создать курс с нуля
              </Typography>
            </MenuItem>
          }
          {baseCourses.map((course, index) =>
            <MenuItem value={index}>
              <Typography style={{ fontSize: "20px" }}>
                {NameBuilder.getCourseFullName(course.name!, course.groupName)}
              </Typography>
            </MenuItem>
          ).reverse()}
        </TextField>
      </Grid>
      <Grid item style={{ marginTop: 8, display: "flex", justifyContent: "flex-end", width: "100%" }}>
        <Button
          variant="text"
          color="inherit"
          size="large"
          style={{ marginRight: 8 }}
          onClick={props.handleSkip}
        >
          Пропустить
        </Button>
        <Button
          variant="outlined"
          color="primary"
          size="large" 
          onClick={props.handleNext}
        >
          Далее
        </Button>
      </Grid>
    </Grid>
  )
}

export default SelectBaseCourse
