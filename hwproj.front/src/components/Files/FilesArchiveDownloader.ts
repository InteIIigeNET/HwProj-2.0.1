import {zip, Zippable} from "fflate";
import ApiSingleton from "@/api/ApiSingleton";
import {IFileInfo} from "./IFileInfo";
import {FileStatus} from "./FileStatus";

// В архив попадают только файлы, которые уже лежат в хранилище
export const getDownloadableFiles = (filesInfo: IFileInfo[]) =>
    filesInfo.filter(f => f.id !== undefined && f.status === FileStatus.ReadyToUse)

// Одинаковые имена внутри архива перезаписали бы друг друга, поэтому дописываем номер: «file (1).txt»
const getUniqueName = (name: string, usedNames: Set<string>) => {
    if (!usedNames.has(name)) return name

    const dotIndex = name.lastIndexOf(".")
    const [base, extension] = dotIndex > 0
        ? [name.slice(0, dotIndex), name.slice(dotIndex)]
        : [name, ""]

    let counter = 1
    while (usedNames.has(`${base} (${counter})${extension}`)) counter++
    return `${base} (${counter})${extension}`
}

// Символы, недопустимые в именах файлов на популярных ОС
const sanitizeFileName = (name: string) => name.replace(/[\\/:*?"<>|]+/g, "_").trim() || "files"

const fetchFileContent = async (fileInfo: IFileInfo) => {
    const url = await ApiSingleton.customFilesApi.getDownloadFileLink(fileInfo.id!)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Не удалось скачать файл ${fileInfo.name}`)
    return new Uint8Array(await response.arrayBuffer())
}

const createArchive = (files: Zippable) => new Promise<Uint8Array>((resolve, reject) =>
    zip(files, (error, data) => error ? reject(error) : resolve(data)))

const saveBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    // Отзываем ссылку асинхронно, иначе часть браузеров не успевает начать скачивание
    setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const downloadFilesArchive = async (filesInfo: IFileInfo[], archiveName: string) => {
    const files = getDownloadableFiles(filesInfo)
    const contents = await Promise.all(files.map(fetchFileContent))

    const usedNames = new Set<string>()
    const zippable: Zippable = {}
    files.forEach((fileInfo, i) => {
        const name = getUniqueName(sanitizeFileName(fileInfo.name), usedNames)
        usedNames.add(name)
        zippable[name] = contents[i]
    })

    const archive = await createArchive(zippable)
    saveBlob(new Blob([archive], {type: "application/zip"}), `${sanitizeFileName(archiveName)}.zip`)
}
