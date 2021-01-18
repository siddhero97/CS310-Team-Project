import ValidatorFilter from "./ValidatorFilter";

export default  class FilterParser {
    /* Assume that everthing is valid except
     */
    public parseAndValidateFilters(query: any, id: string, ids: string[], kindCourses: boolean): boolean {
        let FAILING_CASE: returnType = false;
        let where = query["WHERE"];
        if (!where) {
            return FAILING_CASE;
        } else if (typeof where !== "object") {
            return  FAILING_CASE;
        } else if (where instanceof Array) {
            return  FAILING_CASE;
        }
        let that: FilterParser = this;
        type returnType = boolean;
        if (that.isEmptyWhere(where) === true) {
            return true;
        }
      //  let whereEntries = Object.entries(where);
        let filter: ValidatorFilter = new  ValidatorFilter();
        return filter.processFilter(where, id, kindCourses);
    }

    public isEmptyWhere(where: any): boolean {
        return  (Object.entries(where).length === 0);
    }

}
