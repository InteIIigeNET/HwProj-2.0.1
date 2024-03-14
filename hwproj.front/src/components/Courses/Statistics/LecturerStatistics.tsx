import {FC, useEffect, useState} from "react";
import {StatisticsLecturersModel} from "../../../api";
import ApiSingleton from "../../../api/ApiSingleton";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import * as React from "react";

const LecturerStatistics: FC<{
  onClose: () => void
}> = (props) => {

  const [statistics, setStatistics] = useState<StatisticsLecturersModel[]>([])
  const getStatistics = async () => {
    const statistics = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdLecturersGet(1)
    setStatistics(statistics)
  }

  useEffect(() => {
    getStatistics()
  }, []);

  return <Dialog open={true} onClose={() => props.onClose()} aria-labelledby="form-dialog-title">
    <DialogTitle id="form-dialog-title">
       Статистика лекторов
    </DialogTitle>
    <DialogContent>
        {statistics.map(s =>
            <p>{s.lecturer?.name} {s.numberOfCheckedSolutions}</p>)
        }
    </DialogContent>
  </Dialog>
}

export default LecturerStatistics;
