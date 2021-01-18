import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import * as JSZip from "jszip";
import CourseTranslator from "../translator/CourseTranslator";
import {ISection} from "./Course";
import {IRooms} from "./Rooms";
import GetWebData from "./GetWebData";
import RoomTranslator from "../translator/RoomTranslator";
import HtmlParser from "./HtmlParser";

export default class UnzipFolder {
    public LoadRawDataCourses(id: string, content: string): Promise<Array<Promise<ISection[]>>> {
        const jsZip = new JSZip();
        let courseTranslator: CourseTranslator = new CourseTranslator();
        let coursesPromises: Array<Promise<ISection[]>> = [];
        let files: any = [];
        return JSZip.loadAsync(content, {base64: true}).then(function (zip) {
            zip.folder("courses").forEach(function (relativePath, file) {
                files.push(file);
            });
        }).then(() => {
            coursesPromises = files.map((file: any) => {
                return file.async("text").then(function (course: any) {
                    try {
                        const jsonArray = JSON.parse(course).result;
                        return courseTranslator.RawToSectionList((jsonArray));
                    } catch (e) {
                        return Promise.reject(new InsightError());
                    }
                });
            });
        }).then(() => {
            return coursesPromises;
        }).catch((error: any) => {
            throw new InsightError(error);
        });
    }

    public LoadRawDataRooms(id: string, content: string): Promise<Array<Promise<IRooms[]>>> {
        const htmlParser = new HtmlParser();
        const jsZip = new JSZip();
        const parse5 = require("parse5");
        const that = this;
        return jsZip.loadAsync(content, {base64: true}).then(function (zip) {
            return zip.folder("rooms").file("index.htm")
                .async("text").then(function (overview: any) {
                try {
                    const document = parse5.parse(overview);
                    let tables = htmlParser.FindNodeName(document, "table");
                    let result: Array<Promise<Array<Promise<IRooms[]>>>> = [];
                    for (let t of tables) {
                        result.push(that.ParseIndexTable(t, content));
                    }
                    return Promise.all(result).then((r) => {
                        let flatPromises = [].concat.apply([], r);
                        return flatPromises;
                    });
                } catch (e) {
                    return Promise.reject("File Cannot be parsed " + e);
                }
            });
        }).catch((e) => {
            return Promise.reject(new InsightError(e));
        });
    }

    private ParseIndexTable(document: any, content: string): Promise<Array<Promise<IRooms[]>>> {
        const htmlParser = new HtmlParser();
        let tbody = htmlParser.FindNodeName(document, "tbody");
        let result: Array<Promise<Array<Promise<IRooms[]>>>> = [];
        for (let t of tbody) {
            result.push(this.ParseIndexTbody(t, content));
        }
        return Promise.all(result).then((r) => {
            let flatPromises = [].concat.apply([], r);
            return flatPromises;
        }).catch((error: any) => {
            return Promise.reject(error);
        });
    }

    private ParseIndexTbody(document: any, content: string): Promise<Array<Promise<IRooms[]>>> {
        const htmlParser = new HtmlParser();
        let buildingRow = htmlParser.FindNodeName(document, "tr");
        let parsedBuildings = buildingRow.map((row: any) => {
            return this.ParseRawBuilding(content, row).then((rooms) => {
                return rooms;
            }).catch((e) => {
                return [];
            });
        });
        return Promise.resolve(parsedBuildings);
    }

    private ParseRawBuilding(content: any, building: any): Promise<IRooms[]> {
        const htmlParser = new HtmlParser();
        const getWebData = new GetWebData();
        let relativeLocation = htmlParser.GetAssociatedRoomFile(content, building);
        relativeLocation = relativeLocation.startsWith("./") ? relativeLocation.substr(2) : relativeLocation;

        let shortName: string = htmlParser.GetTextFromHtml(building, "class",
            "views-field views-field-field-building-code");
        let address: string = htmlParser.GetTextFromHtml(building, "class",
            "views-field views-field-field-building-address");
        let longName: string = htmlParser.GetAttributeAText(building, "class", "views-field views-field-title");
        let lat: number;
        let long: number;
        return getWebData.GeolocationOfBuilding(address).then((result) => {
            if (!result.hasOwnProperty("lat")) {
                return Promise.reject("no latitude");
            }
            if (!result.hasOwnProperty("lon")) {
                return Promise.reject("no longitude");
            }
            lat = result.lat;
            long = result.lon;
        }).then(() => {
            return this.ParseRawRooms(content, longName, shortName, address, lat, long, relativeLocation);
        });
    }

    private ParseRawRooms(content: string, lName: string,  sName: string, address: string, lat: number, lon: number,
                          relativeLocation: string): Promise<IRooms[]> {
        const htmlParser = new HtmlParser();
        return this.GetRawRooms(content, relativeLocation).then((RoomsJson) => {
            let parsedRooms: IRooms[] = [];
            let rooms = htmlParser.FindNodeName(RoomsJson, "table");
            if (rooms.length === 0) {
                return Promise.resolve([]);
            }
            for (let room of rooms) {
                let currParsedRoom = this.ParseRoomTable(room, lName, sName, address, lat, lon);
                parsedRooms = parsedRooms.concat(currParsedRoom);
            }
            return Promise.resolve(parsedRooms);
        }).catch((error: any) => {
           return Promise.reject(error);
        });
    }

    private ParseRoomTable(roomDocument: any, lName: string, sName: string, address: string, lat: number, lon: number):
        IRooms[] {
        const htmlParser = new HtmlParser();
        let parsedIRooms: IRooms[] = [];
        let rooms = htmlParser.FindNodeName(roomDocument, "tbody");
        if (rooms.length === 0) {
            return [];
        }
        for (let room of rooms) {
            let currParsedIRooms = this.ParseRoomTableTbody(room, lName, sName, address, lat, lon);
            parsedIRooms = parsedIRooms.concat(currParsedIRooms);
        }
        return parsedIRooms;
    }

    private ParseRoomTableTbody(roomDocument: any, lName: string, sName: string, address: string, lat: number,
                                lon: number): IRooms[] {
        const htmlParser = new HtmlParser();
        const roomTranslator = new RoomTranslator();
        let rooms = htmlParser.FindNodeName(roomDocument, "tr");
        let parsedRooms: IRooms[] = rooms.map((roomRow) => {
            let roomInfo = htmlParser.GetAttributeAHrefText(roomRow, "class",
                "views-field views-field-field-room-number");
            let href = roomInfo.href;
            let roomNumber = roomInfo.text;
            let furnitureType = htmlParser.FindTextStoredInNodeWithAttribute(roomRow, "class",
                "views-field views-field-field-room-furniture");
            let roomType = htmlParser.FindTextStoredInNodeWithAttribute(roomRow, "class",
                "views-field views-field-field-room-type");
            let roomCapacity = htmlParser.FindTextStoredInNodeWithAttribute(roomRow, "class",
                "views-field views-field-field-room-capacity");
            let room = roomTranslator.dataToRoom(lName, sName, roomNumber, address, lat, lon, roomCapacity,
                roomType, furnitureType, href);
            return room;
        });
        return parsedRooms;
    }

    private GetRawRooms(content: string, filePath: string): Promise<any> {
        const parse5 = require("parse5");
        return JSZip.loadAsync(content, {base64: true}).then(function (zip) {
            return zip.file("rooms/" + filePath)
                .async("text").then(function (overview: any) {
                    try {
                        const document = parse5.parse(overview);
                        return Promise.resolve(document);
                    } catch (e) {
                        return Promise.reject("File Cannot be parsed " + e);
                    }
                });
        }).catch((error: any) => {
            return Promise.reject(error);
        });
    }
}
