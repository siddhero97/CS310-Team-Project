import {ISectionMField} from "./Course";
import {Extractor} from "../ast/Extractor";
import Log from "../Util";
import {SchedRoom, SchedSection} from "../scheduler/IScheduler";

export class SortSection {
    private sampleMInterface: ISectionMField = {
        avg: 0,
        pass: 0,
        fail: 0, audit: 0, year: 9
    };

    public sortSection(objects: object[], sortBy: any): object[] {
        if (sortBy) {
            return this.sortByNumber(objects, sortBy);
        } else {
            return objects;
        }

    }

    public sortByNumber(objects: object[], sortBy: any): object[] {
        if (typeof sortBy === "string") {
            return this.sort(objects, sortBy);
        } else {
            objects = this.objectsort(objects, sortBy );
            return objects;
        }
    }

    public objectsort(objects: object[], sortBy: any): object[] {
        let values: any[] = Object.values(sortBy);
        let jsonObjectA;
        let jsonObjectB;
        let extractedVariableA: string;
        let extractedVariableB: string;
        let field: any;
        let isAscending: boolean = (values[0] === "UP");
        Log.info("isAscending", isAscending);
        let toSort: string;
        let toSortArray: any[] = values[1];
        objects.sort(function (a: object, b: object) {
           jsonObjectA = JSON.parse(JSON.stringify(a));
           jsonObjectB = JSON.parse(JSON.stringify(b));
           let i = 0, result = 0;
           while ((i < toSortArray.length) && (result === 0)) {
                toSort = toSortArray[i];
                if (toSort.includes("_")) {
                    field = Extractor.extractKey(toSort);
                } else {
                    field = toSort;
                }
                extractedVariableA = jsonObjectA[field];
                extractedVariableB = jsonObjectB[field];
                if (extractedVariableA === extractedVariableB) {
                    result = 0;
                } else if (isAscending) {
                    (extractedVariableA > extractedVariableB) ? (result = 1) : (result = -1);
                } else {
                    (extractedVariableA < extractedVariableB) ? (result = 1) : (result = -1);
                }
                i++;
            }
           return result;
        });
        return objects;
    }

    public sort(objects: object[], sortBy?: string): object[] {
        // Log.info("inside regular sort");
        let field: string;
        if (sortBy.includes("_")) {
            field = Extractor.extractKey(sortBy);
        } else {
            field = sortBy;
        }
        let returnedObjects = objects;
        returnedObjects.sort((a: object, b: object) => {
            let jsonObjectA = JSON.parse(JSON.stringify(a));
            let jsonObjectB = JSON.parse(JSON.stringify(b));
            if (jsonObjectA[field] > jsonObjectB[field]) {
                return 1;
            } else {
                return -1;
            }
        });
        return returnedObjects;
    }
}
