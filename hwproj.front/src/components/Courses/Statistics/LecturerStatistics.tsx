import {FC, useEffect, useState} from "react";
import {StatisticsLecturersModel} from "../../../api";
import ApiSingleton from "../../../api/ApiSingleton";
import {Dialog, DialogContent, DialogTitle, Typography, Grid} from "@mui/material";
import * as React from "react";

const LecturerStatistics: FC<{
    courseId: number
    onClose: () => void
}> = (props) => {

    const [statistics, setStatistics] = useState<StatisticsLecturersModel[]>([])

    const getStatistics = async () => {
        const statistics: StatisticsLecturersModel[] = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdLecturersGet(props.courseId)
        setStatistics(statistics)
    }
    useEffect(() => {
        getStatistics()
    }, []);

    const totalNumberOfCheckedSolutions = statistics.reduce(
        (total, stat) => total + stat.numberOfCheckedSolutions!, 0);

    return <Dialog open={true} fullWidth maxWidth="md" onClose={() => props.onClose()}>
        <DialogTitle style={{textAlign: 'center',}}>
            Статистика проверенных решений
        </DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                {statistics.sort((a, b) => b.numberOfCheckedSolutions! - a.numberOfCheckedSolutions!).map((s, index) => (
                    <Grid item xs={12} key={index}>
                        <div style={{
                            display: 'flex',
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    width: '85%',
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
                                            width: `${(s.numberOfCheckedUniqueSolutions! / s.numberOfCheckedSolutions!) * 100}%`,
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
                                {((s.numberOfCheckedSolutions! / totalNumberOfCheckedSolutions) * 100).toFixed(1)}%
                                / {s.numberOfCheckedSolutions} / {s.numberOfCheckedUniqueSolutions}
                            </div>
                        </div>
                        <Typography>
                            {s.lecturer!.surname} {s.lecturer!.name} {s.lecturer!.middleName}
                        </Typography>
                    </Grid>
                ))}
            </Grid>
        </DialogContent>
    </Dialog>
}

export default LecturerStatistics;
