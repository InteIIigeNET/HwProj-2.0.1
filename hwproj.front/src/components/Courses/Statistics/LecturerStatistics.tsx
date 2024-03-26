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
    const statistics : StatisticsLecturersModel[] = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdLecturersGet(1)
    setStatistics(statistics)
  }
  useEffect(() => {
    getStatistics()
  }, []);

  const totalNumberOfCheckedSolutions = statistics.reduce(
      (total, stat) => total + stat.numberOfCheckedSolutions, 0);

  return <Dialog open={true} onClose={() => props.onClose()}>
    <DialogTitle style = {{width: '500px'}}>
       Статистика лекторов
    </DialogTitle>
    <DialogContent>
      <div className="horizontal-bar">
        {statistics.map((s, index) => (
            <div key={index} style={{marginBottom: 15}}>
              <b>{s.lecturer?.surname} {s.lecturer?.name} {s.lecturer?.middleName}</b>
              <div>
                <div
                    style={{
                      display: 'flex',
                      height: 20,
                      border: '1px solid black',
                    }}
                >
                  <div
                      style={{
                        width: `${(s.numberOfCheckedSolutions / totalNumberOfCheckedSolutions) * 100}%`,
                        backgroundColor: '#3f51b5',
                      }}
                  ></div>
                  <div
                      style={{
                        flex: '1',
                        backgroundColor: 'white',
                      }}
                  ></div>
                </div>

              </div>
              <div style={{textAlign: 'left'}}>
                Проверил решений: {s.numberOfCheckedSolutions}
              </div>
            </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
}

export default LecturerStatistics;
