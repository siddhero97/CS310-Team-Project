import {AstFilter} from "./AstFilter";
import {ISection} from "../model/Course";
import {Extractor} from "./Extractor";
import {IRooms, IRoomsSField} from "../model/Rooms";

export class IS extends  AstFilter {

    protected  expectedValue: string;
    private containsAstrix: boolean;
    protected field: string;
    private withoutAsterix: string;
    private firstAsterix: boolean;
    private lastAsterix: boolean;
    public convert(filterObject: object) {
        this.field = Extractor.extractField(filterObject);
        this.expectedValue = Extractor.extractValueString(filterObject);
        this.containsAstrix = (String(this.expectedValue).indexOf("*") !== -1);
        if (this.containsAstrix === true) {
           this.extractWithoutAsterix();
        }
    }

    public extractWithoutAsterix(): void {
        this.firstAsterix = (this.expectedValue.charAt(0) === "*");
        this.lastAsterix = (this.expectedValue.charAt(this.expectedValue.length - 1) === "*");

        if  (this.expectedValue === "*") {
            this.withoutAsterix =  "";
        } else if (this.firstAsterix && this.lastAsterix) {
            this.withoutAsterix = this.expectedValue.substring(1, this.expectedValue.length - 1);
        } else if (this.firstAsterix) {
            this.withoutAsterix = this.expectedValue.substring(1, this.expectedValue.length);
        } else if (this.lastAsterix) {
            this.withoutAsterix = this.expectedValue.substring(0, this.expectedValue.length - 1);
        }
    }

    protected customFilterFunction(object: object): boolean {
        let isInside: boolean = false;
        let actualValue: string = Extractor.extractActualValueString(object, this.field);
        if (this.containsAstrix === false) {
            isInside = (this.expectedValue === actualValue);
        } else {
            isInside = this.filterAsterix(actualValue);
        }
        return isInside;
    }

    private filterAsterix(actualValue: string) {
        let isInside: boolean = false;
        if (this.withoutAsterix === "") {
            isInside = true;
        } else if (this.firstAsterix && this.lastAsterix) {
            isInside = actualValue.includes(this.withoutAsterix);
        } else if (this.firstAsterix) {
            isInside = (actualValue.substring(actualValue.length -
                this.withoutAsterix.length, actualValue.length) === this.withoutAsterix);
        } else {
            isInside = (actualValue.substring(0, this.withoutAsterix.length) === this.withoutAsterix);
        }
        return isInside;
    }
}
