import React, {FC} from "react";
import {SystemInfo} from "../../api";
import ApiSingleton from "../../api/ApiSingleton";
import {
    Table, TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
} from "@mui/material";
import {useEffect, useState} from "react";
import {DotLottieReact} from "@lottiefiles/dotlottie-react";


interface ISystemInfoState {
    isLoaded: boolean;
    isApiGatewayAvailable: boolean;
    systemStatus: SystemInfo[];
}

const SystemInfoComponent: FC = () => {
    const [systemInfo, setSystemInfo] = useState<ISystemInfoState>({
        isLoaded: false,
        isApiGatewayAvailable: true,
        systemStatus: []
    })

    const getSystemStatus = async () => {
        try {
            const status = await ApiSingleton.systemApi.systemStatus()
            setSystemInfo({
                isLoaded: true,
                isApiGatewayAvailable: true,
                systemStatus: status
            })
        } catch {
            setSystemInfo({
                isLoaded: true,
                isApiGatewayAvailable: false,
                systemStatus: []
            })
        }
    }

    useEffect(() => {
        getSystemStatus()
    }, [])

    const {isLoaded, isApiGatewayAvailable, systemStatus} = systemInfo;
    return (<div className={"container"}><Box
        justifyContent="center"
    >
        {isLoaded
            ? <TableContainer style={{marginTop: 15}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Сервис</TableCell>
                            <TableCell align="right">Доступность</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow key={"Api Gateway"}>
                            <TableCell component="th" scope="row">
                                Api Gateway
                            </TableCell>
                            <TableCell align="right">{isApiGatewayAvailable ? "✅" : "⛔"}</TableCell>
                        </TableRow>
                        {systemStatus.map((status) => (
                            <TableRow key={status.service}>
                                <TableCell component="th" scope="row">
                                    {status.service}
                                </TableCell>
                                <TableCell align="right">{status.isAvailable ? "✅" : "⛔"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            : <Box sx={{minWidth: 150, marginTop: 15}}>
                <DotLottieReact
                    src="https://lottie.host/fae237c0-ae74-458a-96f8-788fa3dcd895/MY7FxHtnH9.lottie"
                    loop
                    autoplay
                />
                <p>Пингуем сервера...</p>
            </Box>}
    </Box>
    </div>)
}

export default SystemInfoComponent;
