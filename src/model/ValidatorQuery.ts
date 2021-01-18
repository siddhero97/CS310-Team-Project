import {ModelUtil} from "./ModelUtil";
import {ApplyParser} from "./ApplyParser";
import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";
import {ValidateOrder} from "./ValidateOrder";
import Log from "../Util";

export  class ValidatorQuery {
    private groupBy: string[];
    private groupAndApply: string[];
    private groupId: string;
    private  map: Map<string, InsightDataset>;
    private kindCourses: boolean;
    public validatePerformQuery(query: any, ids: string[], map: Map<string, InsightDataset>): any {
        interface IResult {isValid: boolean; id: string; kindCourses: boolean; }
        this.map = map;
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        let keys = Object.keys(query);
        let values = Object.values(query);
        Log.info(query);
        Log.info(JSON.stringify(query));
        if (keys.length !== 2) {
            if (keys.length !== 3) {
                return FAILING_CASE;
            }
        } else if (keys[0] !== "WHERE") {
            return FAILING_CASE;
        } else if (keys[1] !== "OPTIONS") {
            return FAILING_CASE;
        } else if (typeof query !== "object") {
            return FAILING_CASE;
        } else if (query instanceof Array) {
            return FAILING_CASE;
        }
        if (values.length !== 2) {
            if (values.length !== 3) {
                return  FAILING_CASE;
            } else  if (keys[2] !== "TRANSFORMATIONS") {
                return FAILING_CASE;
            }
        }
        let result: any;
        const queryElement = query["OPTIONS"];
        if (query["TRANSFORMATIONS"]) {
            result = this.validateTransformations(query["TRANSFORMATIONS"], ids);
            if (result["isValid"] === false) {
                return  FAILING_CASE;
            }
            if (Object.values(this.validateOptions(queryElement, this.groupAndApply, true))[0] === false) {
                return FAILING_CASE;
            }
        } else {
            result = this.validateOptions(queryElement, ids, false);
        }
        if (result["isValid"] && this.validateWhere(query["WHERE"], result["id"])) {
            Log.info("returned " + result["isValid"]);
            return result;
        }
        return FAILING_CASE;
    }

    public validateTransformations(transformations: any, ids: string[]) {
        interface IResult {isValid: boolean; id: string; }
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        if (!(transformations instanceof Object)) {
            return FAILING_CASE;
        } else if (transformations instanceof  Array) {
            return FAILING_CASE;
        } else {
            let keys = Object.keys(transformations);
            if (keys[0] !== "GROUP") {
                return FAILING_CASE;
            } else if (keys[1] !== "APPLY") {
                return FAILING_CASE;
            } else if (keys.length !== 2) {
                return FAILING_CASE;
            }
            let values = Object.values(transformations);
            if (!Array.isArray(values[0])) {
                return FAILING_CASE;
            }
            if (!Array.isArray(values[1])) {
                return FAILING_CASE;
            } else if (values.length !== 2) {
                return FAILING_CASE;
            }
            let groupValue: any = values[0];
            let groupResult: IResult = this.validateGroups(groupValue, ids);
            let applyValue: any = values[1];
            if (groupResult["isValid"] === true) {
                let applyResult = ApplyParser.validateApply(applyValue, groupResult["id"], this.kindCourses);
                let applyResultIsValid: boolean = Object.values(applyResult)[0];
                let applyResultArray: string[] = Object.values(applyResult)[1];
                if (applyResultIsValid) {
                    this.groupAndApply = this.groupBy.concat(applyResultArray);
                    return  groupResult;
                } else {
                    return FAILING_CASE;
                }
            } else {
                return FAILING_CASE;
            }
        }
    }

    public validateWhere(where: any, id: string): boolean {
        let whereKeys = Object.keys(where);
        type result_type = boolean;
        const PASSING_CASE: result_type = true;
        const FAILING_CASE: result_type = false;
        if (typeof where !== "object") {
            return FAILING_CASE;
        }
        if (whereKeys.length > 1) {
            return  FAILING_CASE;
        }
        let whereValues = Object.values(where);
        if (whereKeys.length !== 0 ) {
            if (whereValues.length > 1) {
                return  FAILING_CASE;
            }
        }
        return PASSING_CASE;
    }

    public validateColumns(options: any, optionsKeys: any,
                           length: number, ids: string[], transformationsFlag: boolean) {
        interface IResult {
            isValid: boolean;
            id: string;
        }

        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        let columns = Object.values(options)[0];
        if (!columns) {
            return FAILING_CASE;
        }
        if (!Array.isArray(columns)) {
            return FAILING_CASE;
        }
        if (columns.length === 0) {
            return FAILING_CASE;
        }
        if (typeof columns[0] !== "string") {
            return FAILING_CASE;
        }
        let columnComponentsResult;
        if (transformationsFlag) {
            columnComponentsResult =  this.validateColumnComponents(columns, transformationsFlag, ids);
            if (Object.values(columnComponentsResult)[0] === false) {
                return FAILING_CASE;
            }
        } else {
            columnComponentsResult = this.validateColumnComponents(columns, transformationsFlag, ids);
        }

        if (Object.values(columnComponentsResult)[0] === true) {
            if (ValidateOrder.validateOrder(optionsKeys, columns, options, length) === true) {
                return columnComponentsResult;
            } else {
                return  FAILING_CASE;
            }
        } else {
            return  FAILING_CASE;
        }
    }

    public validateColumnComponents(columns: any, transformationFlag: boolean, ids?: string[]): object {
        interface IResult {isValid: boolean; id: string; }
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        if (transformationFlag === false) {
            return this.validateArrayComponents(columns, ids);
        } else {
            for (let column of columns) {
                if (typeof column !== "string") {
                    return  FAILING_CASE;
                }
                if (!this.groupAndApply.includes(column)) {
                    return  FAILING_CASE;
                }
            }
            let PASSING_CASE: IResult = ModelUtil.createPassingCase(this.groupId, this.kindCourses);
            return PASSING_CASE;
        }
    }

    public validateArrayComponents(columns: any, ids: string[]) {
        let columnComponent;
        let field: string;
        interface IResult {isValid: boolean; id: string; }
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        let columnsSeparator = columns[0].split("_");
        if (columnsSeparator.length !== 2) {
            return FAILING_CASE;
        }
        let columnId = columnsSeparator[0];
        if (!ids.includes(columnId)) {
            return  FAILING_CASE;
        }
        let kind: InsightDatasetKind = this.map.get(columnId).kind;
        this.kindCourses = (kind === InsightDatasetKind.Courses);
        let RESULT_CASE: IResult = ModelUtil.createPassingCase(columnId, this.kindCourses);
        let sampleInterface = ModelUtil.getKindInterface(this.kindCourses);
        for (let column of columns) {
            if (!column) {
                return FAILING_CASE;
            }
            if (typeof column !== "string") {
                return FAILING_CASE;
            }
            columnComponent = column.split("_");
            if (columnComponent.length !== 2) {
                return FAILING_CASE;
            }
            if (columnComponent[0] !== columnId) {
                return FAILING_CASE;
            }
            field = columnComponent[1];
            if (!(field in sampleInterface)) {
                return FAILING_CASE;
            }
        }
        return RESULT_CASE;
    }

    public validateOptions(options: any, ids: string[], transformationsFlag: boolean) {
        interface IResult {isValid: boolean; id: string; }
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        if (!options) {
            return FAILING_CASE;
        }
        if (typeof options !== "object") {
            return FAILING_CASE;
        }
        let optionsKeys = Object.keys(options);
        let length: number = optionsKeys.length;
        if (length > 2) {
            return FAILING_CASE;
        }
        let optionsValues = Object.values(options);
        length = optionsValues.length;
        if (length > 2) {
            return FAILING_CASE;
        }
        if (optionsKeys[0] !== "COLUMNS") {
            return FAILING_CASE;
        }
        return this.validateColumns(options, optionsKeys, length, ids, transformationsFlag);

    }

    private validateGroups(groupValue: object, ids: string[]) {
        interface IResult {isValid: boolean; id: string; }
        let FAILING_CASE: IResult = ModelUtil.createFailingCase();
        if (!groupValue) {
            return FAILING_CASE;
        }
        if (!Array.isArray(groupValue)) {
            return FAILING_CASE;
        }
        if (groupValue.length === 0) {
            return FAILING_CASE;
        }
        if (typeof groupValue[0] !== "string") {
            return FAILING_CASE;
        }
        let groupComponentsResult = this.validateArrayComponents(groupValue, ids);
        if (groupComponentsResult["isValid"] === false) {
            return FAILING_CASE;
        } else {
            this.groupBy = groupValue;
            this.groupId = Object.values(groupComponentsResult)[1];
            return groupComponentsResult;
        }
    }
}
