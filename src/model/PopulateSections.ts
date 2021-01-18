import {ISection} from "./Course";
import {PerformTransformations} from "./PerformTransformations";
import {Extractor} from "../ast/Extractor";
import {ResultTooLargeError} from "../controller/IInsightFacade";

export class PopulateSections {
    public static populateSections(filteredBooleans: boolean[], objects: object[], transformations: any) {
        let filteredSections: object[] = [];
        if (!transformations) {
         filteredSections = PopulateSections.populateSectionsHelper(filteredBooleans, objects);
         if (filteredSections.length > Extractor.getMax()) {
               throw new ResultTooLargeError("no transformations ");
            }
        } else {
            filteredSections = PerformTransformations.performTransformations(filteredBooleans,
                objects, Object.values(transformations)[0], Object.values(transformations)[1]);
        }
        return filteredSections;
    }

    private static populateSectionsHelper(filteredBooleans: boolean[], objects: object[]) {
        let filteredObject: object[] = [];
        let value: boolean;
        for (let index in filteredBooleans) {
            value = filteredBooleans[index];
            if (value) {
                filteredObject.push(objects[index]);
            }
        }
        return filteredObject;
    }
}
