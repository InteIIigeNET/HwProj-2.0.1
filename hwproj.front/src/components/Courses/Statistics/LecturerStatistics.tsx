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

    return <Dialog open={true} onClose={() => props.onClose()} PaperProps={{
        sx: {width: '100%'},
    }}>
        <DialogTitle style={{textAlign: 'center',}}>
            Статистика проверенных решений
        </DialogTitle>
        <DialogContent>
            <Grid container spacing={2}>
                {statistics.sort((a, b) => b.numberOfCheckedSolutions! - a.numberOfCheckedSolutions!).map((s, index) => (
                    <Grid item xs={12} key={index}>
                        <div style={{
                            display: 'flex',
                            height: 20,
                        }}>
                            <div
                                style={{
                                    display: 'flex',
                                    width: '90%',
                                    border: '1px solid black',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${(s.numberOfCheckedSolutions! / totalNumberOfCheckedSolutions) * 100}%`,
                                        backgroundColor: '#3f51b5',
                                    }}
                                ></div>
                                <div
                                    style={{
                                        flex: '1',
                                        backgroundColor: 'white',
                                    }}></div>
                            </div>
                            <div style={{
                                width: '10%',
                                marginLeft: 10,
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                            }}>
                                {((s.numberOfCheckedSolutions! / totalNumberOfCheckedSolutions) * 100).toFixed(1)}%
                                / {s.numberOfCheckedSolutions}
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
