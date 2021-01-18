import {ISection, ISectionMField} from "./Course";
import {ModelUtil} from "./ModelUtil";
import {IRoomsSField} from "./Rooms";

export class ApplyParser {

   private static readonly APPLY_TOKENS: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM" ];
   private static readonly  APPLY_TOKENS_NUMBER: string[] = ["MAX", "MIN", "AVG", "SUM" ];

    private static validateApplyComponent(applyComponent: any, expectedId: string, kindCourses: boolean): object {
        interface IResult { isValid: boolean; applyToken: string; }
        let FAILING_CASE: IResult = {isValid: false, applyToken: " "};
        if (!(applyComponent instanceof  Object) ||
            (Object.keys(applyComponent).length !== 1) || (Object.values(applyComponent).length !== 1)) {
            return  FAILING_CASE;
        }
        if (applyComponent instanceof  Array) {
            return FAILING_CASE;
        }
        let applyRule = Object.keys(applyComponent)[0];
        if (ApplyParser.validateApplyRule(applyRule) === false) {
            return FAILING_CASE;
        }
        let applyObject = Object.values(applyComponent)[0];
        if (!(applyObject instanceof  Object)) {
            return  FAILING_CASE;
        }
        if ((Object.keys(applyObject).length !== 1) || (Object.values(applyObject).length !== 1)) {
            return  FAILING_CASE;
        }
        let applyToken = Object.keys(applyObject)[0];
        if (typeof  applyToken !== "string") {
            return  FAILING_CASE;
        }
        if (!this.APPLY_TOKENS.includes(String(applyToken))) {
            return FAILING_CASE;
        }
        let applyKey = Object.values(applyObject)[0];
        if (typeof  applyKey !== "string") {
            return FAILING_CASE;
        }
        let applyFieldNumeric: boolean = this.APPLY_TOKENS_NUMBER.includes(String(applyToken));
        let fieldComponents = applyKey.split("_");
        if (fieldComponents.length !== 2) {
            return FAILING_CASE;
        }
        if (fieldComponents[0] !== expectedId) {
            return FAILING_CASE;
        }
        let applyField: any = fieldComponents[1];
        let PASSING_CASE: IResult = {isValid: true, applyToken: applyRule};
        return  applyFieldNumeric ? this.checkWhetherFieldIsNumber(applyField, kindCourses)
            ? PASSING_CASE : FAILING_CASE :
            this.checkWhetherFieldExist(applyField, kindCourses) ? PASSING_CASE : FAILING_CASE;
    }

    public static validateApply(applyValue: any, id: string, kindCourses: boolean): object {
        interface IResult {isValid: boolean; applyTokens: string[]; }
        let FAILING_CASE: IResult  = {isValid: false, applyTokens: null};
        let applyTokens: string[] = [];
        if (!applyValue) {
            return FAILING_CASE;
        }
        // console.log(columns);
        if (!Array.isArray(applyValue)) {
            return FAILING_CASE;
        }
        if (applyValue.length === 0) {
            return FAILING_CASE;
        }
        let parsedApplyComponent: object;
        let applyToken: string;
        for (let applyComponent of applyValue) {
            parsedApplyComponent = ApplyParser.validateApplyComponent(applyComponent, id, kindCourses);
            if (Object.values(parsedApplyComponent)[0] === false) {
                return  FAILING_CASE;
            } else {
                applyToken = Object.values(parsedApplyComponent)[1];
                if (applyTokens.includes(applyToken)) {
                   return FAILING_CASE;
                }
                applyTokens.push(Object.values(parsedApplyComponent)[1]);
            }
        }
        let PASSING_CASE: IResult = {isValid: true, applyTokens: applyTokens};
        return  PASSING_CASE;
    }

    private static checkWhetherFieldIsNumber(applyField: string, isKindCourses: boolean): boolean {
        let sampleInterface = ModelUtil.getNumberInterface(isKindCourses);
        if (!(applyField in sampleInterface)) {
            return  false;
        } else {
            return true;
        }
    }

    private static checkWhetherFieldExist(applyField: string, isKindCourses: boolean): boolean {
        let sampleInterface = ModelUtil.getKindInterface(isKindCourses);
        if (!(applyField in sampleInterface)) {
            return  false;
        } else {
            return true;
        }
    }

    private static validateApplyRule(applyRule: string) {
        let FAILING_CASE: boolean = false;
        let PASSING_CASE: boolean = true;
        if (typeof applyRule !== "string") {
            return  FAILING_CASE;
        }
        if (applyRule.includes("_")) {
            return FAILING_CASE;
        }
        if (applyRule.length === 0) {
            return FAILING_CASE;
        }
        return PASSING_CASE;
    }
}
