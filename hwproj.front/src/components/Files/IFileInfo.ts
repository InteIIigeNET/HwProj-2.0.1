export interface IFileInfo {
    file?: File;
    type?: string;
    name: string;
    sizeInBytes: number;
    s3Key?: string;
}
