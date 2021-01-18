import {InsightDatasetKind} from "../controller/IInsightFacade";
import Log from "../Util";

export default  class ReadWriteDisk {
    /* Assume that everthing is valid except
     */
    public WriteToDisk(fileName: string, content: string): Promise<string> {
        const fs = require("fs");
        return new Promise(function (resolve, reject) {
            fs.writeFile("./data/" + fileName, content, (err: any) => {
                if (err) {
                    reject(err);
                } else {
                    const c = ReadWriteDisk.FileExistInData(fileName);
                    const b = fs.readFileSync("./data/" + fileName, "utf8");
                    resolve(fileName);
                }
            });
        });
    }

    public DeleteFile(fileName: string): string {
        const fs = require("fs");
        return fs.unlinkSync("./data/" + fileName, (err: any) => {
            throw err;
        });
    }

    public ReadFile(fileName: string): Promise<string> {
        const fs = require("fs");
        return new Promise(function (resolve, reject) {
            fs.readFile("./data/" + fileName, "utf8", (err: any, data: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    public readIds(): string {
        const fs = require("fs");
        const fileNameIds = this.getFilesToWriteIdsFileName();
        if (!ReadWriteDisk.FileExistInData(fileNameIds)) {
            return null;
        }
        const data = fs.readFileSync("./data/" + fileNameIds, "utf8");
        if (data === "" || !data) {
            return null;
        }
        return data;
    }

    public getFilesToWriteIdsFileName(): string {
        return "FileToWriteIds";
    }

    public removeIdOnDisk(id: string): void {
        const fs = require("fs");
        const FileToWriteIds: string = this.getFilesToWriteIdsFileName();
        if (!ReadWriteDisk.FileExistInData(FileToWriteIds)) {
            throw new Error("File " + FileToWriteIds + " does not exist");
        }
        let content = JSON.parse(fs.readFileSync("./data/" + FileToWriteIds, "utf8"));
        let finalContent = [];
        for (let obj of content) {
            if (obj.id !== id) {
                finalContent.push(obj);
            }
        }
        fs.writeFileSync("./data/" + FileToWriteIds, JSON.stringify(finalContent));
    }

    public AddIdOnDisk(id: string, fileName: string, kind: InsightDatasetKind, numRows: number): void {
        const fs = require("fs");
        const FileToWriteIds: string = this.getFilesToWriteIdsFileName();
        let content: any = [];
        let newContent = {id: id, fileName: fileName, kind: kind, numRows: numRows};
        if (!ReadWriteDisk.FileExistInData(FileToWriteIds)) {
            content = [newContent];
        } else {
            content = fs.readFileSync("./data/" + FileToWriteIds, "utf8");
            if (content === "" || !content) {
                content = [newContent];
            } else {
                content = JSON.parse(content);
                content.push(newContent);
            }
        }
        return fs.writeFileSync("./data/" + FileToWriteIds, JSON.stringify(content));
    }

    public static FileExistInData(fileName: string): boolean {
        const fs = require("fs");
        let returnValue = fs.existsSync("./data/" + fileName);
        // Log.info("==========================================================");
        // Log.info("File " + fileName + " Exists In Data === " + returnValue);
        return returnValue;
    }

}
