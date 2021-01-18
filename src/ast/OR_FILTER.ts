import {AstFilter} from "./AstFilter";
import {ISection} from "../model/Course";
import {RecursiveFilter} from "./RecursiveFilter";

export class OR extends RecursiveFilter {
    protected extraFilters: AstFilter[];
    protected customFilterFunction(object: object): boolean {
        let resultBoolean: boolean = false;
        for (let filter of this.extraFilters) {
                resultBoolean = filter.performFilter(object)[0];
                if (resultBoolean === true) {
                    return resultBoolean;
                }
            }
        return  resultBoolean;
    }

}
