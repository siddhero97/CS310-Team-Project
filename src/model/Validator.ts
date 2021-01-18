import {InsightDatasetKind} from "../controller/IInsightFacade";

export default class Validator {
    public isIdValid(id: string): boolean {
        type returnValue = boolean;
        const FAILING_CASE: returnValue = false;
        const PASSING_CASE: returnValue = true;
        if (!id) {
            return FAILING_CASE;
        } else if (id.includes(".")) {
            return FAILING_CASE;
        } else if (id.includes("_")) {
            return FAILING_CASE;
        } else if (id.includes(" ", 0)) {
            return FAILING_CASE;
        } else if (id.includes(" ", id.length - 1)) {
            return FAILING_CASE;
        } else if (id.length === 0) {
            return FAILING_CASE;
        }
        return PASSING_CASE;
    }

    public addDatasetValid(id: string, content: string, kind: InsightDatasetKind): boolean {
        type returnValue = boolean;
        const FAILING_CASE: returnValue = false;
        const PASSING_CASE: returnValue = true;
        let that: Validator = this;
        if (that.isIdValid(id) === false ) {
            return FAILING_CASE;
        } else if (!content || (content === "")) {
            return FAILING_CASE;
        } else if (!kind) {
            return FAILING_CASE;
        }
        return PASSING_CASE;
    }

    public validJsonSection(section: any): Promise<boolean> {
        if (!section) {
            return Promise.resolve(false);
        }

        // check if year value could be generated
        if ((!section.hasOwnProperty("Section") || section.Section !== "overall") &&
            (!section.hasOwnProperty("Year") || !this.validNumber(section.Year))) {
            return Promise.resolve(false);
        }

        const keysNumber = ["Avg", "Pass", "Fail", "Audit"];
        const keysString = ["Subject", "Course", "Professor", "Title", "id"];

        // check if all other key values exists in raw data
        let allNumberExist = keysNumber.every(function (item) {
            return section.hasOwnProperty(item);
        });
        let allStringExist = keysString.every(function (item) {
            return section.hasOwnProperty(item);
        });
        if (!(allNumberExist && allStringExist)) {
            return Promise.resolve(false);
        }

        // check if all values are of right type
        let self = this;
        let allNumberConvert = keysNumber.every(function (item) {
            return self.validNumber(section[item]);
        });
        let allStringConvert = keysString.every(function (item) {
            return (section[item] != null && section[item] !== undefined);
        });
        if (!(allNumberConvert && allStringConvert)) {
            return Promise.resolve(false);
        }

        return Promise.resolve(true);
    }

    public validNumber(value: any): boolean {
        if (value === null || value === undefined) {
            return false;
        }
        return !isNaN(value);
    }

    public validateRemoveDataset(id: string): boolean {
        let that: Validator = this;
        return that.isIdValid(id);
    }


}
