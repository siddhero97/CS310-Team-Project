import {ISection} from "../model/Course";

export class Extractor {

    public static extractKey(field: string): string {
        return field.split("_")[1];
    }

    public static extractValueObject(filterObject: object): object {
        return  Object.values(filterObject)[0];
    }

    public static extractValueObjects(filterObject: object): object[] {
        return  Object.values(filterObject)[0];
    }

    public static extractField(filterObject: object): string {
        let valueComponent = Extractor.extractValueObject(filterObject);
        let field = Object.keys(valueComponent)[0];
        return  field.split("_")[1];
    }

    public  static  extractValueString(filterObject: object): string {
        let valueComponent = Extractor.extractValueObject(filterObject);
        let field = Object.values(valueComponent)[0];
        return  String(field);
    }

    public  static  extractValueNumber(filterObject: object): number {
        let valueComponent = Extractor.extractValueObject(filterObject);
        let field = Object.values(valueComponent)[0];
        return  Number(field);
    }

    public static getMax(): number {
        const MAX_LENGTH: number = 5000;
        return  MAX_LENGTH;
    }

    public static extractActualValueString(object: object, field: string): string {
        return String(JSON.parse(JSON.stringify(object))[field]);
      //  return Object(section)[field];
    }

    public static extractActualValueNumber(object: object, field: string): number {
        return Number(JSON.parse(JSON.stringify(object))[field]);
    }
}
