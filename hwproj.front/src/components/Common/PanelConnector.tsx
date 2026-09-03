import {FC} from "react";
import {Box} from "@mui/material";

const defaultColor = "#c4cad2"

interface IPanelConnectorProps {
    // Цвета концов перемычки: сверху — рамка карточки, от которой она отходит, снизу — акцент той,
    // к которой ведёт. По умолчанию оба конца серые, как обычная рамка панели
    from?: string,
    to?: string,
}

/**
 * Вертикальная перемычка между карточками, которые продолжают друг друга: условие → вкладки,
 * вкладки → решение, решение → оценка. Без неё нижняя карточка выглядит подвешенной в воздухе,
 * а с ней страница читается как одна ветка. Ставится между карточками в колонке (flex column):
 * сама задаёт зазор между ними, поэтому свои отступы карточкам не нужны.
 */
export const PanelConnector: FC<IPanelConnectorProps> = ({from, to}) => (
    <Box
        sx={{
            alignSelf: "flex-start",
            ml: "22px", // по центру иконок в шапках карточек
            width: 2,
            height: 20,
            flexShrink: 0,
            borderRadius: "1px",
            backgroundImage: `linear-gradient(to bottom, ${from ?? defaultColor}, ${to ?? from ?? defaultColor})`,
        }}
    />
)
