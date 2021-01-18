import Validator from "../model/Validator";
import {ISection} from "../model/Course";

export default class CourseTranslator {
    public RawToSectionList(jsonArray: any): Promise<ISection[]> {
        let sections: Array<Promise<ISection>> = jsonArray.map((jsonCourse: any) => {
            return this.RawJsonToCourse(jsonCourse);
        });

        return Promise.all(sections)
            .then((courses) => {
            return courses.filter((c) => c);
        });
    }

    public SectionListToJson(sections: ISection[], id: string, appendId: boolean, columns: string[] = ["dept", "id",
        "avg", "instructor", "title", "pass", "fail", "audit", "year", "uuid"]): Promise<any> {
        const ValidColumns: string[] = ["dept", "id", "avg", "instructor", "title", "pass", "fail",
            "audit", "year", "uuid"]; // need to become enum in future
        const FilteredColumns: string[] = columns.filter((c: string) => {
            return ValidColumns.includes(c);
        });
        let jsonSection: any = sections.map((section: any) => {
            let item: any = {};
            FilteredColumns.forEach((column: string) => {
                item[column] = section[column];
            });
            return item;
        });
        return Promise.resolve(jsonSection);
    }

    private RawJsonToCourse(json: any): Promise<ISection> {
        let validator: Validator = new Validator();
        let section: ISection;
        return validator.validJsonSection(json)
            .then((result: boolean) => {
            if (!result) {
                return Promise.resolve(null);
            } else {
                let year: number = this.getYear(json.Section, json.Year);
                section = {
                    dept: this.toString(json.Subject),
                    id: this.toString(json.Course),
                    avg: this.toNumber(json.Avg),
                    instructor: this.toString(json.Professor),
                    title: this.toString(json.Title),
                    pass: this.toNumber(json.Pass),
                    fail: this.toNumber(json.Fail),
                    audit: this.toNumber(json.Audit),
                    uuid: this.toString(json.id),
                    year: year
                };
                return Promise.resolve(section);
            }
        });
    }

    private getYear(section: any, year: any): number {
        if (section != null && typeof section === "string" && section === "overall") {
            return 1900;
        }
        return this.toNumber(year);
    }

    // throws error if cannot be translated to string
    private toString(value: any): string {
        if (typeof value === "string") {
            return value;
        }
        if (typeof value === "number") {
            return value.toString();
        }
        return "";
    }

    // throws error if cannot be translated to number
    private toNumber(value: any): number {
        // if (value === null || value === undefined) {
        //     throw new Error("value cannot be null");
        // }
        if (typeof value === "number") {
            return value;
        }
        // if (!isNaN(value)) {
        return Number(value);
        // }
        // throw new Error(value + " cannot be translated to number");
    }
}
