import {ISection} from "../model/Course";
import {RecursiveFilter} from "./RecursiveFilter";

export class AND extends RecursiveFilter {
    protected customFilterFunction(object: object): boolean {
            let resultBoolean: boolean = true;
            for (let filter of this.extraFilters) {
                    resultBoolean = filter.performFilter(object)[0];
                    if (resultBoolean === false) {
                        return resultBoolean;
                    }
                }
            return resultBoolean;
        }
}
