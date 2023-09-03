import * as React from "react";
import {useState, FC, useEffect} from "react";
import TableCell from "@material-ui/core/TableCell";
import {useNavigate} from "react-router-dom";
import {Solution} from "api";
import {Chip, Stack, Tooltip} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";

interface ITaskStudentCellProps {
    studentId: string;
    taskId: number;
    forMentor: boolean;
    userId: string;
    taskMaxRating: number;
    solutions?: Solution[];
}

const StudentStatsCell: FC<ITaskStudentCellProps> = (props) => {
    const navigate = useNavigate()
    const {solutions, taskMaxRating, forMentor} = props
    const [cellState, setCellState] = useState({
        ...StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating)
    })

    useEffect(() => setCellState({...StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating)}),
        [props.studentId, props.taskId]
    )

    const {ratedSolutionsCount, solutionsDescription} = cellState;

    const tooltipTitle = ratedSolutionsCount === 0
        ? solutionsDescription
        : solutionsDescription + `\n\n${Utils.pluralizeHelper(["Проверена", "Проверены", "Проверено"], ratedSolutionsCount)} ${ratedSolutionsCount} ${Utils.pluralizeHelper(["попытка", "попытки", "попыток"], ratedSolutionsCount)}`;

    const result = cellState.lastRatedSolution === undefined
        ? ""
        : <Stack direction="row" spacing={0.3} justifyContent={"center"} alignItems={"center"}>
            <div>{cellState.lastRatedSolution.rating!}</div>
            <Chip color={"default"} size={"small"} label={ratedSolutionsCount}/>
        </Stack>;

    return (
        <Tooltip arrow disableInteractive enterDelay={2000}
                 title={<span style={{whiteSpace: 'pre-line'}}>{tooltipTitle}</span>}>
            <TableCell
                onClick={() => forMentor
                    ? navigate(`/task/${props.taskId}/${props.studentId}`)
                    : navigate(`/task/${props.taskId}`)}
                component="td"
                padding="none"
                scope="row"
                align="center"
                style={{backgroundColor: cellState.color, borderStyle: "none none ridge ridge", cursor: "pointer"}}>
                {result}
            </TableCell>
        </Tooltip>
    );
};

export default StudentStatsCell;
