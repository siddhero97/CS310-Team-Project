import {ISection} from "./Course";
import {Extractor} from "../ast/Extractor";
import Log from "../Util";

export  class PresentResults {
    public static presentResults(objects: any[], columns: string[]): Promise<any[]> {
        // Log.info("Inside PresentResults, objects: " + objects.toString());
        let list: any[] = [];
        let object = JSON.parse(JSON.stringify({}));
        for (let section of objects) {
            object = JSON.parse(JSON.stringify({}));
            // Log.info(section.toString());
            for (let column of columns) {
                if (column.includes("_")) {
                    object[column] = section[Extractor.extractKey(column)];
                } else {
                    object[column] = section[column];
                }
            }
            list.push(object);
        }
        return Promise.resolve(list);
    }
}
