import * as React from "react";
import {IconButton, Divider, List, ListItem, Tooltip} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface IHelpPopoverChartInfoProps {
    chartName: 'progress' | 'punctuality';
}

const HelpPopoverChartInfo: React.FC<IHelpPopoverChartInfoProps> = (prop) => {
    const popoverContent = (listItems: JSX.Element[], headerText: string) => (
        <div style={{padding: 10, fontSize: 14}}>
            <p style={{marginBottom: 0, textAlign: 'center'}}>{headerText}</p>
            <Divider orientation='horizontal'
                     style={{paddingTop: 3, paddingBottom: 3, marginLeft: -10, marginRight: -10}}/>

            <List sx={{listStyleType: 'disclosure-closed', pl: 3}}>
                {listItems.map((item, index) => (
                    <ListItem key={index} sx={{display: 'list-item', padding: 0}}>
                        {item}
                    </ListItem>
                ))}
            </List>
        </div>
    )
    const progressPopoverItems = [
        (<p style={{margin: 0}}>По горизонтали - временной диапазон курса<br/> По вертикали - общее количество баллов
        </p>),
        (<p style={{margin: 0}}>Учитывается лишь последнее решение студента</p>),
        (<p style={{margin: 0}}><span style={{color: '#2cba00', fontSize: 15}}>Круглый отличник</span> сдает
            задачи в день публикации на максимальный балл</p>),
        (<p style={{margin: 0}}><span style={{color: '#FFA756', fontSize: 15}}> Средний студент </span> сдает задачи
            на средний балл в усредненную дату сдачи</p>)

    ]
    const punctualityPopoverItems = [
        (<p style={{margin: 0}}>Каждый сектор - задача на курсе, для которой был назначен дедлайн</p>),
        (<p style={{margin: 0}}>Точками отмечены даты дедлайнов</p>),
        (<p style={{margin: 0}}>Столбцы отвечают за попытки сдачи задачи</p>),
        (<p style={{margin: 0}}>Высота столбца - отклонение от даты дедлайна или последней проверки</p>),
        (<p style={{margin: 0}}>Столбец расположен в нижней полуплоскости, если решение было сдано после дедлайна</p>)
    ]

    const progressPopoverHeader = 'Успеваемость студентов';
    const punctualityPopoverHeader = 'Пунктуальность студентов';
    const tooltipTitle = prop.chartName === 'progress'
        ? popoverContent(progressPopoverItems, progressPopoverHeader)
        : popoverContent(punctualityPopoverItems, punctualityPopoverHeader);

    return (
        <Tooltip title={tooltipTitle} arrow placement={"right-end"}>
            <IconButton>
                <HelpOutlineIcon style={{color: 'rgb(100, 100, 100)'}}/>
            </IconButton>
        </Tooltip>
    )
}

export default HelpPopoverChartInfo;