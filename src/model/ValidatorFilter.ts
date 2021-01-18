import {ModelUtil} from "./ModelUtil";
export default  class ValidatorFilter {
    public static comparisions: string[] = ["AND", "OR", "GT", "EQ", "LT", "IS", "NOT"];
    public static nestedComparisions: string[] = ["AND", "OR"];
    public static not: string = "NOT";
    public static sComparision: string[] = ["IS"];
    public static mComparision: string[] = ["GT", "EQ", "LT"];

    public processFilter(filterObject: any, id: string, kindCourses: boolean): boolean {
        // TODO
        let that: ValidatorFilter = this;
        const falseCase = false;
        //   let filterEntries = Object.entries(filterObject[0]);
        let key = Object.keys(filterObject)[0];
        if (!key) {
            return falseCase;
        }
        let value = Object.values(filterObject)[0];
        if (!value) {
            return falseCase;
        }
        if (!that.validateKey(key)) {
            return falseCase;
        } else if (ValidatorFilter.nestedComparisions.includes(key)) {
            return that.validateCompoundEntry(value, id, kindCourses);
        } else if (ValidatorFilter.not === key) {
            return that.validateNot(value, id, kindCourses);
        } else if (ValidatorFilter.mComparision.includes(key)) {
            return that.validateComparision(value, id, kindCourses);
        } else if (ValidatorFilter.sComparision.includes(key)) {
            return that.validateIS(value, id, kindCourses);
        }
        return true;
    }

    public validateCompoundEntry(value: any, id: string, kindCourses: boolean): boolean {
        //  TODO
        let key: any = value[0];
        type returnedVal = boolean;
        let trueCase: returnedVal = true;
        let falseCase: returnedVal = false;
        let that: ValidatorFilter = this;
        let filterValue: any[] = value;
        if (!filterValue) {
            return falseCase;
        } else if (!Array.isArray(filterValue)) {
            return falseCase;
        } else if (filterValue.length === 0) {
            return falseCase;
        }
        for (let filter of value) {
            if (!filter) {
                return falseCase;
            }
            if (typeof filter !== "object") {
                return falseCase;
            } else if (filter instanceof Array) {
                return falseCase;
            }
            if (Object.keys(filter).length !== 1) {
                return falseCase;
            }
            if (Object.values(filter).length !== 1) {
                return falseCase;
            }
            //    filteredCase = (new AND_FILTER()).processFilter(filter);
            if (that.processFilter(filter, id, kindCourses) === false) {
                return falseCase;
            }
        }
        return trueCase;
    }

    public validateKey(key: any): boolean {
        type returnedVal = boolean;
        let trueCase: returnedVal = true;
        let falseCase: returnedVal = false;
        let that: ValidatorFilter = this;
        if (!key) {
            return falseCase;
        }
        if (typeof key !== "string") {
            return falseCase;
        } else if (!ValidatorFilter.comparisions.includes(key)) {
            return falseCase;
        }
        return trueCase;
    }

    private validateNot(filterEntry: any, id: string, kindCourses: boolean): boolean {
        // TODO
        // let notComponent = filterEntry[1]["NOT"];
        const falseCase: boolean = false;
        const trueCase: boolean = true;
        if (!filterEntry) {
            return falseCase;
        }
        if (typeof filterEntry !== "object") {
            return falseCase;
        } else if (filterEntry instanceof Array) {
            return falseCase;
        }
        let result = this.processFilter(filterEntry, id, kindCourses);
        if (result === false) {
            return false;
        }
        if (Object.keys(filterEntry).length !== 1) {
            return falseCase;
        }
        if (Object.values(filterEntry).length !== 1) {
            return falseCase;
        }
        return result;
        return trueCase;
    }

    private validateComparision(filterEntry: any, expectedId: string, kindCourses: boolean): boolean {
        //  let filterEntry = filterEntry[1];
        const FALSE_CASE: boolean = false;
        const TRUE_CASE: boolean = true;
        if (!filterEntry) {
            return FALSE_CASE;
        }
        if (typeof filterEntry !== "object") {
            return FALSE_CASE;
        } else if (filterEntry instanceof Array) {
            return FALSE_CASE;
        } /*
        if (Object.keys(filterEntry).length > 1) {
            return  FALSE_CASE;
        }*/
        if (Object.keys(filterEntry).length !== 1) {
            return FALSE_CASE;
        }
        if (Object.values(filterEntry).length !== 1) {
            return FALSE_CASE;
        }
        let key: any = Object.keys(filterEntry)[0];
        if (!key) {
            return FALSE_CASE;
        }
        if (typeof key !== "string") {
            return FALSE_CASE;
        }
        let fieldComponents = key.split("_");
        if (fieldComponents.length !== 2) {
            return FALSE_CASE;
        }
        let id: string = fieldComponents[0];
        if (id !== expectedId) {
            return FALSE_CASE;
        }
        let field: any = fieldComponents[1];
        let sampleInterface: any = ModelUtil.getNumberInterface(kindCourses);
        if (!(field in sampleInterface)) {
            return FALSE_CASE;
        }
        let value = Object.values(filterEntry)[0];
        if (value === null) {
            return FALSE_CASE;
        }
        if (value === undefined) {
            return FALSE_CASE;
        }
        if (typeof value !== "number") {
            return FALSE_CASE;
        }
        if ((Object.keys(filterEntry).length > 1) || (Object.values(filterEntry).length > 1)) {
            return FALSE_CASE;
        }
        return TRUE_CASE;
    }

    private validateIS(filterEntry: any, expectedId: string, kindCourses: boolean): boolean {
        //    let filterEntry = filterEntry[1];
        const FALSE_CASE: boolean = false;
        const TRUE_CASE: boolean = true;
        if (!filterEntry) {
            return FALSE_CASE;
        }
        if (typeof filterEntry !== "object") {
            return FALSE_CASE;
        } else if (filterEntry instanceof Array) {
            return FALSE_CASE;
        }
        let key: any = Object.keys(filterEntry)[0];
        if (!key) {
            return FALSE_CASE;
        }
        if (typeof key !== "string") {
            return FALSE_CASE;
        }
        let fieldComponents = key.split("_");
        if (fieldComponents.length !== 2) {
            return FALSE_CASE;
        }
        let id: string = fieldComponents[0];
        if (id !== expectedId) {
            return FALSE_CASE;
        }
        let field: any = fieldComponents[1];
        let sampleInterface: any = ModelUtil.getStringInterface(kindCourses);
        if (!(field in sampleInterface)) {
            return FALSE_CASE;
        }
        let value = Object.values(filterEntry)[0];
        if (value === null) {
            return FALSE_CASE;
        }
        if (value === undefined) {
            return FALSE_CASE;
        }
        if (typeof value !== "string") {
            return FALSE_CASE;
        }

        if ((Object.keys(filterEntry).length > 1) || (Object.values(filterEntry).length > 1)) {
            return FALSE_CASE;
        }
        return this.handleAsterix(value);
    }

    private handleAsterix(value: string): boolean {
        const FALSE_CASE: boolean = false;
        const TRUE_CASE: boolean = true;
        if (value.includes("*")) {
            if (this.handleAsterisxHelper(value) === FALSE_CASE) {
                return FALSE_CASE;
            }
        }
        return TRUE_CASE;
    }

    private handleAsterisxHelper(value: string): boolean {
        const FALSE_CASE: boolean = false;
        const TRUE_CASE: boolean = true;
        if (value === "*") {
            return TRUE_CASE;
        } else if (value === "**") {
            return FALSE_CASE;
        } else {
            let i: number = 0;
            while (i < value.length) {
                if ((i !== 0) && (i !== value.length - 1)) {
                    if (value.charAt(i) === "*") {
                        return FALSE_CASE;
                    }
                }
                i++;
            }
        }
    }
}
