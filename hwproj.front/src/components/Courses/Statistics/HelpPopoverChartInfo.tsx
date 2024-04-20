import React, { useState } from 'react';
import { IconButton, Popover, Divider, List, ListItem} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface IHelpPopoverChartInfoProps {
    chartName: 'progress' | 'punctuality';
}

const HelpPopoverChartInfo : React.FC<IHelpPopoverChartInfoProps> = (prop) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    
    const handleClick = (event : React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    }
    const handleClose = () => {
        setAnchorEl(null);
    }
    const open = Boolean(anchorEl);
    
    const popoverContent = (listItems : JSX.Element[], headerText: string) => (
        <div style={{width: 350, padding: 10, fontSize: 14, color: 'rgb(90,94,98)'}}>
            <p style={{marginBottom: 0, textAlign: 'center'}}>{headerText}</p>
            <Divider orientation='horizontal' style={{paddingTop: 3, paddingBottom: 3, marginLeft: -10, marginRight: -10}}/>

            <List sx={{listStyleType: 'disclosure-closed', pl: 3}}>
                {listItems.map(item => (
                    <ListItem sx={{display: 'list-item', padding: 0}}>
                        {item}
                    </ListItem>
                ))}
            </List>
        </div>
    )
    const progressPopoverItems = [
        (<p style={{margin: 0}}>Ось абцисс - временной диапазон курса<br/> Ось ординат - общее количество баллов</p>),
        (<p style={{margin: 0}}>Учитывается лишь последнее решение студента</p>),
        (<p style={{margin: 0}}><span style={{color: '#2cba00', fontSize: 15}}>Круглый отличник</span> - сдача всех
            задач в день публикации на максимальный балл</p>),
        (<p style = {{margin: 0}}><span style={{color: '#FFA756', fontSize: 15}}> Средний </span> - 
            для каждой задачи вычисляется средний балл на курсе и усредненная дата публикации среди сдавших студентов;</p>)
        
    ]
    const punctualityPopoverItems = [
        (<p style={{margin: 0}}>Каждый сектор представляет отдельную задачу курса, для которой был назначен дедлайн</p>),
        (<p style={{margin: 0}}>Точками отмечены даты дедлайнов</p>),
        (<p style={{margin: 0}}>Столбцы отвечают за попытки сдачи задачи и расположены в хронологическом порядке по дате публикации решений</p>),
        (<div style={{margin: 0}}>
            <p style={{margin: 0}}>Высота столбца - отклонение от даты дедлайна или последней проверки</p>
            <List sx={{listStyleType: 'disc', pl: 3, pt: 0, pb: 0}}>
                <ListItem sx={{display: 'list-item', padding: 0}}>
                    Верхняя полуплоскость - за сколько времени до дедлайна сдано решение
                </ListItem>
                <ListItem sx={{display: 'list-item', padding: 0}}>
                    Нижняя полуплоскость - через сколько времени после дедлайна или последней проверки 
                    (если она была совершена после дедлайна) было сдано решение
                </ListItem>
            </List>
        </div>),
        (<p style={{margin: 0}}>Цвет характеризует балл студента за задачу (аналогично таблице)</p>)
    ]
    
    const progressPopoverHeader = 'График представляет собой визуальное отображение успеваемости студентов';
    const punctualityPopoverHeader = 'График представляет собой визуальное отображение пунктуальности студентов';
    
    return (
        <>
            <IconButton onClick={handleClick}>
                <HelpOutlineIcon style={{color: 'rgb(100, 100, 100)'}}/>
            </IconButton>
            <Popover open={open} anchorEl={anchorEl} onClose={handleClose}
                     anchorOrigin={{vertical: 'center', horizontal: 'right'}}
                     transformOrigin={{vertical: 'center', horizontal: 'left'}}
                     
            >
                {prop.chartName === 'progress' &&
                    popoverContent(progressPopoverItems, progressPopoverHeader)
                }
                {prop.chartName === 'punctuality' &&
                    popoverContent(punctualityPopoverItems, punctualityPopoverHeader)
                }
            </Popover>
        </>
    )
}

export default HelpPopoverChartInfo;