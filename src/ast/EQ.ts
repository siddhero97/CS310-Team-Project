import {ISection} from "../model/Course";
import {Extractor} from "./Extractor";
import {LCComparision} from "./LCComparision";
import {IRooms} from "../model/Rooms";

export  class EQ extends LCComparision {

    protected customFilterFunction(object: object): boolean {
        let isInside: boolean = false;
        let actualValue: number = Extractor.extractActualValueNumber(object, this.field);
        if (actualValue === this.expectedValue) {
            isInside = true;
        }
        return isInside;
    }
}
