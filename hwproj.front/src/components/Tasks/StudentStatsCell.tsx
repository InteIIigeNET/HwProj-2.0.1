import * as React from "react";
import {FC} from "react";
import TableCell from "@material-ui/core/TableCell";
import {useNavigate} from "react-router-dom";
import {SolutionDto} from "api";
import {Chip, Stack, Tooltip} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
import {grey} from "@material-ui/core/colors";
import "../Courses/Styles/StudentStatsCell.css";

interface ITaskStudentCellProps {
    studentId: string;
    taskId: number;
    forMentor: boolean;
    userId: string;
    taskMaxRating: number;
    isBestSolution: boolean;
    solutions?: SolutionDto[];
    disabled?: boolean;
}

const StudentStatsCell: FC<ITaskStudentCellProps & { borderLeftColor?: string }> = (props) => {
    const navigate = useNavigate()
    const {solutions, taskMaxRating, forMentor} = props

    const cellState = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating, props.disabled)

    const {ratedSolutionsCount, solutionsDescription} = cellState;

    const tooltipTitle = ratedSolutionsCount === 0
        ? solutionsDescription
        : solutionsDescription
        + (props.isBestSolution ? "\n Первое решение с лучшей оценкой" : "")
        + `\n\n${Utils.pluralizeHelper(["Проверена", "Проверены", "Проверено"], ratedSolutionsCount)} ${ratedSolutionsCount} ${Utils.pluralizeHelper(["попытка", "попытки", "попыток"], ratedSolutionsCount)}`;

    const result = cellState.lastRatedSolution === undefined
        ? ""
        : <Stack direction="row" spacing={0.3} justifyContent={"center"} alignItems={"center"}>
            <div>{cellState.lastRatedSolution.rating!}</div>
            <Chip color={"default"} size={"small"} label={ratedSolutionsCount}/>
        </Stack>;

    const solutionUrl = forMentor
        ? `/task/${props.taskId}/${props.studentId}`
        : `/task/${props.taskId}`

    const openInNewTab = () => window.open(solutionUrl, '_blank', 'noopener,noreferrer');

    const handleCellClick = (e: React.MouseEvent) => {
        if (props.disabled) return;

        // Ctrl/Cmd + клик — открываем в новой вкладке
        if (e.ctrlKey || e.metaKey) {
            openInNewTab();
        } else {
            navigate(solutionUrl);
        }
    };

    // Средняя кнопка мыши — открываем в новой вкладке
    const handleCellAuxClick = (e: React.MouseEvent) => {
        if (props.disabled || e.button !== 1) return;

        e.preventDefault();
        openInNewTab();
    };

    return (
        <Tooltip arrow disableInteractive enterDelay={100}
                 title={<span style={{whiteSpace: 'pre-line'}}>{tooltipTitle}</span>}>
            <TableCell
                onClick={handleCellClick}
                onAuxClick={handleCellAuxClick}
                onMouseDown={e => {
                    if (!props.disabled && e.button === 1) e.preventDefault();
                }}
                className={props.isBestSolution ? "glow-cell" : ""}
                component="td"
                padding="none"
                variant={"body"}
                scope="row"
                align="center"
                style={{
                    backgroundColor: cellState.color,
                    borderLeft: `1px solid ${props.borderLeftColor || grey[300]}`,
                    cursor: props.disabled ? "default" : "pointer",
                }}>
                {result}
            </TableCell>
        </Tooltip>
    );
};

export default StudentStatsCell;
