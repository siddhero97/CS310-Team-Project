import Log from "../Util";
import {Decimal} from "decimal.js";
import {Extractor} from "../ast/Extractor";
import {ResultTooLargeError} from "../controller/IInsightFacade";

export  class PerformTransformations {
    private static amap: Map<string, object[]>;
    public static performTransformations(filteredBooleans: boolean[], objects: object[], groupBy: any, apply: any) {
        this.amap = new Map<string, object[]>();
        let filteredObjects: object[] = [];
        let groupByStringArray: string[] = groupBy;
        let groupKeys: any[] = [];
        let obj: any;
        let groupField: string;
        let groupObjects: object[];
        filteredBooleans.map((value: boolean, index: number, array: boolean[]) => {
                if (value === true) {
                    for (let group of groupByStringArray) {
                        groupField = String(String(group).split("_")[1]);
                        obj = JSON.parse(JSON.stringify(objects[index]));
                        groupKeys.push(obj[groupField]);
                    }
                    groupObjects = this.amap.get(JSON.stringify(groupKeys));
                    if (!groupObjects) {
                        groupObjects = [];
                    }
                    groupObjects.push(obj);
                    this.amap.set(JSON.stringify(groupKeys), groupObjects);

                    groupKeys = [];
                }
            }
        );
        if (this.amap.size > Extractor.getMax()) {
            throw  new ResultTooLargeError("After grouping there are too many results; Not worth applying ");
        }
        filteredObjects = this.performApply(apply);
        return filteredObjects;
    }

    private static getApplyKeys(apply: any): string[] {
        let applyKeys: string[] = [];
        let applyToken: string;
        for (let applyObject of apply) {
            applyToken = String(Object.keys(applyObject)[0]);
            applyKeys.push(applyToken);
        }
        return applyKeys;
    }

    private static performApplyToken(applyKey: string, applyObject: any, groupedArray: any[]): any {
        let groupedResult: any;
        let applyToken: string = String(Object.keys(applyObject)[0]);
        let columnKey: string = String(Object.values(applyObject)[0]);
        // [, "COUNT", "SUM" ]
        switch (applyToken) {
            case "AVG":
                groupedResult = this.performAvg(applyToken, columnKey, applyKey, groupedArray);
                break;
            case "MIN":
                groupedResult = this.performMin(applyToken, columnKey, applyKey, groupedArray);
                break;
            case "MAX":
                groupedResult = this.performMax(applyToken, columnKey, applyKey, groupedArray);
                break;
            case "COUNT":
                groupedResult = this.performCount(applyToken, columnKey, applyKey, groupedArray);
                break;
            case "SUM":
                groupedResult = this.performSum(applyToken, columnKey, applyKey, groupedArray);
                break;
        }
        return groupedResult;
    }

    private static performAvg(applyToken: string, columnKey: string, applyKey: string, groupedArray: string[]): any {
            let groupArray = Object.values(groupedArray)[0];
            let count: number = groupArray.length;
            let total: Decimal = new Decimal(0);
            let columnField: string = columnKey.split("_")[1];
            let groupObject;
            for (let groupElement of groupArray) {
                    groupObject = JSON.parse(JSON.stringify(groupElement));
                    total = total.add(new Decimal(groupObject[columnField]));
            }
            let avg: number = total.toNumber() / count;
            let result: number = Number(Number(avg).toFixed(2));
            groupObject = JSON.parse(JSON.stringify(groupArray[0]));
            groupObject[applyKey] = result;
            return  groupObject;
    }

    private static performMin(applyToken: string, columnKey: string, applyKey: string, groupedArray: string[]): any {
        let groupArray = Object.values(groupedArray)[0];
        let groupObject;
        let min: number = 0;
        let set: Set<any> = new Set<any>();
        for (let groupElement of groupArray) {
            groupObject = JSON.parse(JSON.stringify(groupElement));
            set.add(groupObject[Extractor.extractKey(columnKey)]);
        }
        min = Math.min(... set);
        groupObject = JSON.parse(JSON.stringify(groupArray[0]));
        groupObject[applyKey] = min;
        return  groupObject;
    }

    private static performMax(applyToken: string, columnKey: string, applyKey: string, groupedArray: string[]): any {
        let groupArray = Object.values(groupedArray)[0];
        let groupObject;
        let max: number = 0;
        let set: Set<any> = new Set<any>();
        for (let groupElement of groupArray) {
            groupObject = JSON.parse(JSON.stringify(groupElement));
            set.add(groupObject[Extractor.extractKey(columnKey)]);
        }
        max = Math.max(... set);
        groupObject = JSON.parse(JSON.stringify(groupArray[0]));
        groupObject[applyKey] = max;
        return  groupObject;
    }

    private static performCount(applyToken: string, columnKey: string,
                                applyKey: string, groupedArray: string[]): any {
        let groupArray = Object.values(groupedArray)[0];
        let groupObject;
        let count: number = 0;
        let set: Set<any> = new Set<any>();
        for (let groupElement of groupArray) {
            groupObject = JSON.parse(JSON.stringify(groupElement));
            set.add(groupObject[Extractor.extractKey(columnKey)]);
        }
        count = set.size;
        groupObject = JSON.parse(JSON.stringify(groupArray[0]));
        groupObject[applyKey] = count;
        return  groupObject;
    }

    private static performSum(applyToken: string, columnKey: string, applyKey: string, groupedArray: string[]): any {
        let groupArray = Object.values(groupedArray)[0];
        let total: Decimal = new Decimal(0);
        let columnField: string = columnKey.split("_")[1];
        let groupObject;
        for (let groupElement of groupArray) {
            groupObject = JSON.parse(JSON.stringify(groupElement));
            total = total.add(new Decimal(groupObject[columnField]));
        }
        let totalNumber: number = Number(Number((total.toNumber())).toFixed(2));
        groupObject = JSON.parse(JSON.stringify(groupArray[0]));
        groupObject[applyKey] = totalNumber;
        return  groupObject;
    }

    private static performApply(apply: any): any {
        let applyKey: string;
        let applyObject: any;
        let groupedArray: any[];
        let appliedObject: any;
        let allApplyObject: any;
        let filteredObjects: object[] = [];
        for (let entry of this.amap.entries()) {
            groupedArray = Array(Object.values(entry)[1]);
            for (let applyElement of apply) {
                applyKey = Object.keys(applyElement)[0];
                applyObject = Object.values(applyElement)[0];
                appliedObject = JSON.parse(JSON.stringify(this.performApplyToken(applyKey, applyObject, groupedArray)));
                if (!allApplyObject) {
                    allApplyObject = appliedObject;
                } else {
                    allApplyObject[applyKey] = appliedObject[applyKey];
                }
            }
            filteredObjects = filteredObjects.concat(allApplyObject);
            allApplyObject = null;
            // Log.info(entry);
        }
        return filteredObjects;
    }
}
