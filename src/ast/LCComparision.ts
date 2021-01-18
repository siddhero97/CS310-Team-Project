import {AstFilter} from "./AstFilter";
import {Extractor} from "./Extractor";

export abstract class LCComparision extends AstFilter {
    protected  expectedValue: number;
    protected  field: string;
    public convert(filterObj: object): void {
        this.field = Extractor.extractField(filterObj);
        this.expectedValue = Extractor.extractValueNumber(filterObj);
    }
}
