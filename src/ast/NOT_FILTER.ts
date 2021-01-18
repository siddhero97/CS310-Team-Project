import {FilterFactory} from "./FilterFactory";
import {AstFilter} from "./AstFilter";
import {ISection} from "../model/Course";
import {Extractor} from "./Extractor";

export  class NOT extends  AstFilter {
    private extraFilter: AstFilter;
    public convert(filterObject: object) {
        this.extraFilter = FilterFactory.factory(Extractor.extractValueObject(filterObject), this.objects);
    }

    protected customFilterFunction(object: object): boolean {
        let isInside: boolean = false;
        if (!(this.extraFilter instanceof Array)) {
            if (this.extraFilter.performFilter(object)[0] === true) {
                isInside = false;
            } else {
                isInside = true;
            }
        }
        return isInside;
    }
}
