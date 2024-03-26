import {FC, useEffect, useState} from "react";
import {StatisticsLecturersModel} from "../../../api";
import ApiSingleton from "../../../api/ApiSingleton";
import {Dialog, DialogContent, DialogTitle} from "@mui/material";
import * as React from "react";

const LecturerStatistics: FC<{
  courseId: number
  onClose: () => void
}> = (props) => {

  const [statistics, setStatistics] = useState<StatisticsLecturersModel[]>([])

  const getStatistics = async () => {
    const statistics : StatisticsLecturersModel[] = await ApiSingleton.statisticsApi.apiStatisticsByCourseIdLecturersGet(props.courseId)
    setStatistics(statistics)
  }
  useEffect(() => {
    getStatistics()
  }, []);

  const totalNumberOfCheckedSolutions = statistics.reduce(
      (total, stat) => total + stat.numberOfCheckedSolutions, 0);

  return <Dialog open={true} onClose={() => props.onClose()} PaperProps={{
    sx: {
      width: '100%',
    },
  }}>
    <DialogTitle
        style={{
          textAlign: 'center',
          marginBottom: 10
        }}
    >
       Статистика проверенных решений
    </DialogTitle>
    <DialogContent>
      <div className="horizontal-bar">
        {statistics.map((s, index) => (
            <div key={index} style={{paddingBottom: 20}}>
              <div style={{
                display: 'flex',
                height: 20,
              }}>
                <div
                    style={{
                      display: 'flex',
                      width: '100%',
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
                <div style={{
                  flex: '1',
                  marginLeft: 10,
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}>
                  {((s.numberOfCheckedSolutions / totalNumberOfCheckedSolutions) * 100).toFixed(1)}% / {s.numberOfCheckedSolutions}
                </div>
              </div>
              <b>{s.lecturer?.surname} {s.lecturer?.name} {s.lecturer?.middleName}</b>
            </div>
        ))}
      </div>
    </DialogContent>
  </Dialog>
}

export default LecturerStatistics;
