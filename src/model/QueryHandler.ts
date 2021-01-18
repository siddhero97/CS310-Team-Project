import FilterParser from "./FilterParser";
import {ValidatorQuery} from "./ValidatorQuery";
import {InsightDataset} from "../controller/IInsightFacade";
import Log from "../Util";

export default  class QueryHandler {
    public handleQuery(query: any, ids: string[], map: Map<string, InsightDataset>): boolean | object {
        let validator: ValidatorQuery = new ValidatorQuery();
        let result = validator.validatePerformQuery(query, ids, map);
        if (result["isValid"] === false) {
            return false;
        }
        if (result === null) {
            return null;
        }
        let parser: FilterParser = new FilterParser();
        if (parser.parseAndValidateFilters(query, result["id"], ids, result["kindCourses"])) {
             return result;
         }
        return false;
    }

}
