import * as React from "react";
import {FC} from "react";
import {useNavigate} from "react-router-dom";
import {SolutionDto} from "api";
import {Box, Chip, Stack, TableCell, Tooltip} from "@mui/material";
import StudentStatsUtils from "../../services/StudentStatsUtils";
import Utils from "../../services/Utils";
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
    const {solutions, taskMaxRating, forMentor, disabled} = props

    const cellState = StudentStatsUtils.calculateLastRatedSolutionInfo(solutions!, taskMaxRating, disabled)

    const {ratedSolutionsCount, solutionsDescription} = cellState;

    const tooltipTitle = ratedSolutionsCount === 0
        ? solutionsDescription
        : solutionsDescription
        + (props.isBestSolution ? "\n Первое решение с лучшей оценкой" : "")
        + `\n\n${Utils.pluralizeHelper(["Проверена", "Проверены", "Проверено"], ratedSolutionsCount)} ${ratedSolutionsCount} ${Utils.pluralizeHelper(["попытка", "попытки", "попыток"], ratedSolutionsCount)}`;

    const result = cellState.lastRatedSolution === undefined
        ? ""
        : <Stack direction="row" spacing={0.3} justifyContent={"center"} alignItems={"center"}>
            <Box component={"span"} sx={{fontVariantNumeric: "tabular-nums"}}>
                {cellState.lastRatedSolution.rating!}
            </Box>
            <Chip color={"default"} size={"small"} label={ratedSolutionsCount}/>
        </Stack>;

    const solutionUrl = forMentor
        ? `/task/${props.taskId}/${props.studentId}`
        : `/task/${props.taskId}`

    const openInNewTab = () => window.open(solutionUrl, '_blank', 'noopener,noreferrer');

    const handleCellClick = (e: React.MouseEvent) => {
        if (disabled) return;

        // Ctrl/Cmd + клик — открываем в новой вкладке
        if (e.ctrlKey || e.metaKey) {
            openInNewTab();
        } else {
            navigate(solutionUrl);
        }
    };

    // Средняя кнопка мыши — открываем в новой вкладке
    const handleCellAuxClick = (e: React.MouseEvent) => {
        if (disabled || e.button !== 1) return;

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
                    if (!disabled && e.button === 1) e.preventDefault();
                }}
                className={props.isBestSolution ? "glow-cell" : ""}
                align="center"
                sx={{
                    p: 0,
                    minWidth: 76,
                    backgroundColor: cellState.color,
                    borderLeft: `1px solid ${props.borderLeftColor || "#eceef3"}`,
                    borderBottom: "1px solid #eceef3",
                    cursor: disabled ? "default" : "pointer",
                    transition: "box-shadow .12s",
                    // Подсветка кликабельной ячейки: обводка внутрь, чтобы не спорить с цветовым кодированием оценки
                    ...(disabled ? {} : {"&:hover": {boxShadow: "inset 0 0 0 2px #3f51b5"}}),
                }}>
                {result}
            </TableCell>
        </Tooltip>
    );
};

export default StudentStatsCell;
