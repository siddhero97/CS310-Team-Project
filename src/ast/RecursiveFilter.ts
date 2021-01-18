import {AstFilter} from "./AstFilter";
import {FilterFactory} from "./FilterFactory";
import {Extractor} from "./Extractor";

export abstract class RecursiveFilter extends AstFilter {
    protected extraFilters: AstFilter[];
    protected convert(filterObjects: object) {
        let temp: AstFilter;
        // let result: AstFilter[] = [];
        this.extraFilters = [];
        let andComponents: object[] = Extractor.extractValueObjects(filterObjects);
        for (let filterObject of andComponents) {
            temp = FilterFactory.factory(filterObject, this.objects);
            this.extraFilters.push(temp);
        }
    }
}
