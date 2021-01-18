import {ISection, ISectionMField, ISectionSField} from "./Course";
import {IRooms, IRoomsMField, IRoomsSField} from "./Rooms";
import {fail} from "assert";
import Log from "../Util";

export class ModelUtil {
    public static createPassingCase(columnId: string, kindCourses: boolean) {
        interface IResult {
            isValid: boolean;
            id: string;
            kindCourses: boolean;
        }

        let PASSING_CASE: IResult = {isValid: true, id: columnId, kindCourses: kindCourses};
        return PASSING_CASE;
    }

    public static createFailingCase() {
        interface IResult {
            isValid: boolean;
            id: string;
            kindCourses: boolean;
        }

        let FAILING_CASE: IResult = {isValid: false, id: " ", kindCourses: false};
        return FAILING_CASE;
    }

    public static getKindInterface(kindCourses: boolean): ISection | IRooms {
        if (kindCourses) {
            let result: ISection;
            result = {
                dept: "string", id: "string", avg: 0,
                instructor: " string", title: "string", pass: 0,
                fail: 0, audit: 0, uuid: "string", year: 9
            };
            return result;
        } else {
            let result: IRooms;
            result = {
                fullname: "string", shortname: "string", number: "string",
                address: " string", lat: 0, lon: 0,
                seats: 0, type: "string", furniture: "string", href: "string", name: "string"
            };
            return result;
        }
    }

    public static getStringInterface(kindCourses: boolean): ISectionSField | IRoomsSField {
        if (kindCourses) {
            let result: ISectionSField;
            result = {
                dept: "string", id: "string",
                instructor: " string", title: "string", uuid: "string"
            };
            return result;
        } else {
            let result: IRoomsSField;
            result = {
                fullname: "string", shortname: "string", number: "string",
                address: " string",
                type: "string", furniture: "string", href: "string", name: "string"
            };
            return result;
        }
    }

    public static getNumberInterface(kindCourses: boolean): ISectionMField | IRoomsMField {
        if (kindCourses) {
            let result: ISectionMField;
            result = {
                avg: 0, pass: 0,
                fail: 0, audit: 0, year: 9
            };
            return result;
        } else {
            let result: IRoomsMField;
            result = {
                lat: 0, lon: 0,
                seats: 0,

            };
            return result;
        }
    }

    public static customArray(length: number) {
       let arrayTrue: boolean[] = new Array(length);
       arrayTrue.fill(true);
       return arrayTrue;
    }
}


