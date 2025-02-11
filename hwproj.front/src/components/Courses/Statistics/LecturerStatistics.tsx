import {FC, useEffect, useState} from "react";
import {StatisticsLecturersModel} from "../../../api";
import ApiSingleton from "../../../api/ApiSingleton";
import {Dialog, DialogContent, DialogTitle, Typography, Grid, Tooltip, Chip} from "@mui/material";
import * as React from "react";
import {CircularProgress} from "@material-ui/core";

const LecturerStatistics: FC<{
    courseId: number
    onClose: () => void
}> = (props) => {

    const [isLoading, setIsLoading] = useState(true);
    const [statistics, setStatistics] = useState<StatisticsLecturersModel[]>([])

    const getStatistics = async () => {
        const statistics: StatisticsLecturersModel[] = await ApiSingleton.statisticsApi.statisticsGetLecturersStatistics(props.courseId)
        setStatistics(statistics)
        setIsLoading(false);
    }
    useEffect(() => {
        getStatistics()
    }, []);

    const totalNumberOfCheckedSolutions = statistics.reduce(
        (total, stat) => total + stat.numberOfCheckedSolutions!, 0);

    return <Dialog open={true} fullWidth maxWidth="md" onClose={() => props.onClose()}>
        <DialogTitle style={{textAlign: 'center'}}>
            Статистика проверенных решений
        </DialogTitle>
        <DialogContent>
            {isLoading ? (
                <div className="container">
                    <p>Загрузка...</p>
                    <CircularProgress/>
                </div>
            ) : (
                <Grid container spacing={2}>
                    {totalNumberOfCheckedSolutions ? (
                        statistics.sort((a, b) => b.numberOfCheckedSolutions! - a.numberOfCheckedSolutions!).map((s, index) => (
                            <Grid item xs={12} key={index}>
                                <Tooltip arrow title={<div style={{fontSize: 13}}>
                                    <Chip
                                        label={s.numberOfCheckedSolutions}
                                        size={"small"}
                                        style={{
                                            backgroundColor: '#96d7ff',
                                            marginRight: 3,
                                            marginTop: 3,
                                            color: "white"
                                        }}
                                    /> решений проверено всего
                                    <br/>
                                    <Chip
                                        label={s.numberOfCheckedUniqueSolutions}
                                        size={"small"}
                                        style={{
                                            backgroundColor: '#3f51b5',
                                            marginRight: 3,
                                            marginTop: 4,
                                            color: "white"
                                        }}
                                    /> уникальных решений (без учета попыток)
                                </div>}>
                                    <div style={{
                                        display: 'flex',
                                    }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                width: '86%',
                                                border: '1px solid black',
                                                height: 25,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${(s.numberOfCheckedSolutions! / totalNumberOfCheckedSolutions) * 100}%`,
                                                    backgroundColor: '#96d7ff',
                                                    height: '100%',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${s.numberOfCheckedSolutions ?
                                                            (s.numberOfCheckedUniqueSolutions! / s.numberOfCheckedSolutions!) * 100 : 0}%`,
                                                        backgroundColor: '#3f51b5',
                                                        height: '100%',
                                                    }}
                                                ></div>
                                            </div>
                                            <div
                                                style={{
                                                    flex: '1',
                                                    backgroundColor: 'white',
                                                }}></div>
                                        </div>
                                        <div style={{
                                            width: '10%',
                                            paddingLeft: 10,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            <Typography style={{wordSpacing: '0.2em'}}>
                                                {((s.numberOfCheckedSolutions! / totalNumberOfCheckedSolutions) * 100).toFixed(1)}%
                                                | <b>{s.numberOfCheckedSolutions}</b> | <b>{s.numberOfCheckedUniqueSolutions}</b> |
                                            </Typography>
                                        </div>
                                    </div>
                                </Tooltip>

                                <Typography>
                                    {s.lecturer!.surname} {s.lecturer!.name} {s.lecturer!.middleName}
                                </Typography>
                            </Grid>
                        ))) : (
                        <Grid item xs={12}>
                            <Typography style={{textAlign: 'center'}}>
                                На курсе пока нет проверенных решений.
                            </Typography>
                        </Grid>
                    )}
                </Grid>)}
        </DialogContent>
    </Dialog>
}

export default LecturerStatistics;
