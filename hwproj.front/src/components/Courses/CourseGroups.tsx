import {FC, useEffect} from "react";
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Grid,
    Typography,
    Alert,
    Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {AccountDataDto, NamedGroupViewModel} from "@/api";

interface ICourseGroupsProps {
    courseStudents: AccountDataDto[];
    groups: NamedGroupViewModel[];
    onGroupsUpdate: () => void;
}

const CourseGroups: FC<ICourseGroupsProps> = (props) => {
    const {courseStudents, groups, onGroupsUpdate} = props;

    useEffect(() => {
        onGroupsUpdate();
    }, []);

    const getStudentName = (userId: string) => {
        const student = courseStudents.find(s => s.userId === userId);
        if (!student) {
            return userId;
        }
        const nameParts = [student.surname, student.name, student.middleName].filter(Boolean);
        return `${nameParts.join(" ") || student.email}`;
    };

    return (
        <Grid container direction={"column"} spacing={2} sx={{ paddingBottom: 18 }}>
            <Grid item>
                <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
                    <Typography variant="h6">
                        Группы курса
                    </Typography>
                </Stack>
            </Grid>

            {groups.length === 0 &&
                <Grid item>
                    <Alert severity="info">
                        На курсе пока нет групп.
                    </Alert>
                </Grid>
            }

            <Grid item container spacing={2} direction={"column"}>
                {groups.map(group => {
                    const name = group.name!;
                    const studentsIds = group.studentsIds || [];

                    return (
                        <Grid item xs={12} key={group.id}>
                            <Accordion>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography variant="h6">
                                        {name}
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {studentsIds.length > 0 ? (
                                        <Stack direction={"column"} spacing={0.5} width={"100%"} sx={{ paddingLeft: 2 }}>
                                            {studentsIds.map(id => (
                                                <Typography key={id} variant="body1">
                                                    {getStudentName(id)}
                                                </Typography>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Typography variant="body2" color="textSecondary">
                                            В группе пока нет участников.
                                        </Typography>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        </Grid>
                    );
                })}
            </Grid>
        </Grid>
    );
};

export default CourseGroups;
