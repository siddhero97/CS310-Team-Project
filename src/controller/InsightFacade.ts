import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, InsightError, NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import Validator from "../model/Validator";
import {ISection} from "../model/Course";
import QueryHandler from "../model/QueryHandler";
import FilterParser from "../model/FilterParser";
import {PresentResults} from "../model/PresentResults";
import {FilterFactory} from "../ast/FilterFactory";
import {SortSection} from "../model/SortSection";
import ReadWriteDisk from "../model/ReadWriteDisk";
import {PopulateSections} from "../model/PopulateSections";
import {IRooms} from "../model/Rooms";
import UnzipFolder from "../model/UnzipFolder";
import {ModelUtil} from "../model/ModelUtil";

export default class InsightFacade implements IInsightFacade {
    private mapInsightDataset: Map<string, InsightDataset> = new Map<string, InsightDataset>();
    private mapSections: Map<string, ISection[]> = new Map<string, ISection[]>();
    private mapRooms: Map<string, IRooms[]> = new Map<string, IRooms[]>();
    private mapIdToFileName: Map<string, string> = new Map<string, string>();
    private readWriteDisk = new ReadWriteDisk();
    private unzipFolder = new UnzipFolder();
    private validator = new Validator();

    constructor() {
        // Log.trace("InsightFacadeImpl::init()");
        const readWriteDisk = new ReadWriteDisk();
        const idsInfo = JSON.parse(readWriteDisk.readIds());
        if (!idsInfo) {
            return;
        }
        idsInfo.forEach((obj: any) => {
            this.mapIdToFileName.set(obj.id, obj.fileName);
            let dataset: InsightDataset = {id: obj.id, numRows: obj.numRows, kind: obj.kind};
            this.mapInsightDataset.set(obj.id, dataset);
        });
    }

    public loadDataFromCache(fileName: string): Promise<string> {
        if (!ReadWriteDisk.FileExistInData(fileName)) {
            return Promise.reject(fileName);
        }
        const curr = this;
        return this.readWriteDisk.ReadFile(fileName).then((content: string) => {
            const jsonArray = JSON.parse(content);
            Log.info(JSON.parse(JSON.stringify(jsonArray.content)));
            curr.addDataToMap(jsonArray.id, jsonArray.content, jsonArray.kind);
        }).then(() => {
            return Promise.resolve(fileName);
        }).catch((error: any) => {
            return Promise.reject(error);
        });
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (!this.validator.addDatasetValid(id, content, kind)) {
            return Promise.reject(new InsightError("we have a problem with either id, content or kind "));
        }
        // Log.info("Id exists = " + this.mapInsightDataset.has(id));
        if (this.hasID(id)) {
            return Promise.reject(new InsightError(id, "doesn't skit"));
        }
        return this.AddRawData(id, content, kind);
    }

    private AddRawData(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        if (kind === InsightDatasetKind.Courses) {
            return this.AddRawDataSections(id, content);
        } else {
            return this.AddRawDataRooms(id, content);
        }
    }

    private AddRawDataRooms(id: string, content: string): Promise<string[]> {
        let roomsPromises: Array<Promise<IRooms[]>> = [];
        let flatRooms: IRooms[] = [];
        return this.unzipFolder.LoadRawDataRooms(id, content).then(function (data: any) {
            roomsPromises = data;
        }).then(() => {
            return Promise.all(roomsPromises).then((rooms: IRooms[][]) => {
                flatRooms = [].concat.apply([], rooms);
                if (flatRooms.length === 0) {
                    throw new InsightError("No rooms");
                }
                this.addDataToMap(id, flatRooms, InsightDatasetKind.Rooms);
                return this.addDataToDisk(id, flatRooms, InsightDatasetKind.Rooms).then(() => {
                    return Promise.resolve(this.allIds());
                });
            });
        }).catch((e) => {
            return Promise.reject(new InsightError(e));
        });
    }

    private AddRawDataSections(id: string, content: string): Promise<string[]> {
        let coursesPromises: Array<Promise<ISection[]>> = [];
        let flatCourses: any = [];
        return this.unzipFolder.LoadRawDataCourses(id, content).then(function (data) {
            coursesPromises = data;
        }).then(() => {
            return Promise.all(coursesPromises).then((courses: ISection[][]) => {
                flatCourses = [].concat.apply([], courses); // check what this means
                if (flatCourses.length === 0) {
                    throw new InsightError();
                }
                this.addDataToMap(id, flatCourses, InsightDatasetKind.Courses);
                return this.addDataToDisk(id, flatCourses, InsightDatasetKind.Courses).then(() => {
                    return Promise.resolve(this.allIds());
                });
            });
        }).catch((e) => {
            return Promise.reject(new InsightError(e));
        });
    }

    public removeDataset(id: string): Promise<string> {
        if (this.validator.validateRemoveDataset(id) === false) {
            return Promise.reject(new InsightError());
        } else if (this.hasID(id) === false) {
            return Promise.reject(new NotFoundError());
        }
        try {
            this.removeID(id);
        } catch (e) {
            return Promise.reject(new InsightError(e));
        }
        return Promise.resolve(id);
    }

    public performQuery(query: any): Promise<any[]> {
        const that = this; // Log.info("Begin performQuery courses in mapRooms == " + this.mapRooms.has("rooms"));
        if (!query) {
            return Promise.reject(new InsightError("query is null and undefined ", query));
        } else if (typeof query !== "object") {
            return Promise.reject(new InsightError("query is not an object ", query));
        } else if (query instanceof Array) {
            return Promise.reject(new InsightError("query is an array ", query));
        }
        let resultParser: any = (new QueryHandler()).handleQuery(query, that.allIds(), that.mapInsightDataset);
        if (resultParser === false) {
            // Log.info("============================================================");
            // Log.info("file for id exists === " + ReadWriteDisk.FileExistInData(
            //     this.readWriteDisk.getFilesToWriteIdsFileName()));
            return Promise.reject(new InsightError("query is invalid, resultParser === false", query));
        } else if (resultParser === null) {
            return Promise.reject(new InsightError("query is invalid, resultParser === null",  query));
        }
        let emptyWhere: boolean = (new FilterParser()).isEmptyWhere(query["WHERE"]);
        let objects: object[] = [];
        return that.allSections(resultParser["id"]).then((data) => {
            objects = data;
            if (!objects) {
                return Promise.resolve([]);
            }
            let column = Object.values(query)[1];
            let columnComponents: string[] = Object.values(column)[0];
            let filteredBooleans: any = emptyWhere ? ModelUtil.customArray(objects.length) :
                FilterFactory.factory(query["WHERE"], objects).performFilter();
            let transformations = Object.values(query)[2];
            let filteredSections: object[];
            filteredSections = PopulateSections.populateSections(filteredBooleans, objects, transformations);
            let sortedSection: object[] =
                (new SortSection()).sortSection(filteredSections, query["OPTIONS"]["ORDER"]);
            // Log.info("End performQuery courses in mapRooms == "
            //     + this.mapRooms.has("rooms") + "\n =================================================== \n ");
            // Log.info("file for id exists === " + ReadWriteDisk.FileExistInData(
            //     this.readWriteDisk.getFilesToWriteIdsFileName()));
            return PresentResults.presentResults(sortedSection, columnComponents);
        }).catch((e) => {
            if (e instanceof  ResultTooLargeError) {
                return Promise.reject(new ResultTooLargeError(e));
            } else {
                return Promise.reject(new InsightError(e));
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve(this.allDatasets());
    }

    private addDataToDisk(id: string, sections: ISection[] | IRooms[], kind: InsightDatasetKind): Promise<string> {
        const fs = require("fs");
        let filename: string = "d_" + id.replace(/[^0-9a-z]/gi, "");
        let i: number = 1;
        while (fs.existsSync("./data/" + filename + i)) {
            i++;
        }
        this.mapIdToFileName.set(id, filename + i);
        // let content = JSON.stringify(sections);
        let json = {id: id, kind: kind, content: sections};
        this.readWriteDisk.AddIdOnDisk(id, filename + i, kind, sections.length);
        return this.readWriteDisk.WriteToDisk(filename + i, JSON.stringify(json)).then((f: string) => {
            return Promise.resolve(f);
        }).catch((e) => {
            return Promise.reject(new InsightError(e));
        });
    }


    private addDataToMap(id: string, sections: ISection[] | IRooms[], kind: InsightDatasetKind): boolean {
        let that: InsightFacade = this;
        let invalid = ((!kind) || ((kind === InsightDatasetKind.Rooms) && (this.mapRooms.has(id))) ||
            ((kind === InsightDatasetKind.Courses) && this.mapSections.has(id)));
        if (invalid) {
            return false;
        }
        let dataset: InsightDataset = {id: id, numRows: sections.length, kind: kind};
        if (!that.mapInsightDataset.has(id)) {
            that.mapInsightDataset.set(id, dataset);
        }
        if (kind === InsightDatasetKind.Courses) {
            that.mapSections.set(id, sections as ISection[]);
        } else {
            that.mapRooms.set(id, sections as IRooms[]);
        }
        return true;
    }

    private removeID(id: string): boolean {
        let that: InsightFacade = this;
        if (that.mapInsightDataset.has(id) === false) {
            return false;
        }
        if (that.mapIdToFileName.has(id)) {
            this.readWriteDisk.removeIdOnDisk(id);
            this.readWriteDisk.DeleteFile(this.mapIdToFileName.get(id));
            that.mapIdToFileName.delete(id);
        }
        if (that.mapSections.has(id)) {
            that.mapSections.delete(id);
        }
        if (that.mapRooms.has(id)) {
            that.mapRooms.delete(id);
        }
        that.mapInsightDataset.delete(id);
        return true;
    }

    private hasID(id: string): boolean {
        if (!this.mapInsightDataset.has(id)) {
            this.updateDatasetsFromFile();
        }
        return this.mapInsightDataset.has(id);
    }

    private updateDatasetsFromFile(): void {
        let readIds: string = this.readWriteDisk.readIds();
        const idsInfo = JSON.parse(readIds);
        if (!idsInfo) {
            return;
        }
        // Log.info(this.mapInsightDataset.keys());
        idsInfo.forEach((obj: any) => {
            // Log.info(obj.id + " exists = " + this.mapInsightDataset.has(obj.id));
            if (!this.mapInsightDataset.has(obj.id)) {
                this.mapIdToFileName.set(obj.id, obj.fileName);
                let dataset: InsightDataset = {id: obj.id, numRows: obj.numRows, kind: obj.kind};
                this.mapInsightDataset.set(obj.id, dataset);
            }
        });
    }

    private allDatasets(): InsightDataset[] {
        this.updateDatasetsFromFile();
        return Array.from(this.mapInsightDataset.values());
    }

    private allIds(): string[] {
        this.updateDatasetsFromFile();
        return Array.from(this.mapInsightDataset.keys());
    }

    public allSections(id: string): Promise<ISection[] | IRooms[]> {
        if (!this.hasID(id)) {
            return Promise.resolve([]);
        }
        let kind: InsightDatasetKind = this.mapInsightDataset.get(id).kind;
        let isCourses: boolean = (kind === InsightDatasetKind.Courses);
        let data: ISection[] | IRooms[] = [];
        // Log.info("Inside allSections, should loadRoomsFromCache === " + isCourses && !this.mapRooms.has(id));
        if (isCourses ? !this.mapSections.has(id) : !this.mapRooms.has(id)) {
                return this.loadDataFromCache(this.mapIdToFileName.get(id)).then(() => {
                    data = isCourses ? this.mapSections.get(id) : this.mapRooms.get(id);
                    // Log.info(JSON.parse(JSON.stringify(data)));
                    return Promise.resolve(data);
                }).catch((e) => {
                    // Log.info("Load from cache threw error");
                    return Promise.reject(new InsightError(e));
                });
        } else {
            data = isCourses ? this.mapSections.get(id) : this.mapRooms.get(id);
            // Log.info(JSON.parse(JSON.stringify(data)));
        }
        return Promise.resolve(data);
    }
}
