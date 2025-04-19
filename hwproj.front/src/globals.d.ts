declare interface Window {
    ym: (
        counterId: number,
        event: string,
        path: string,
        params?: Record<string, any>
    ) => void;
}