import Log from "../Util";

export class ValidateOrder {
    public static validateOrder(optionsKeys: any, columns: any, options: any, length: number): boolean {
        let FAILING_CASE: boolean = false;
        let RESULT_CASE: boolean = true;
        if (length === 2) {
            if (optionsKeys[1] !== "ORDER") {
                return FAILING_CASE;
            }
            let order = options["ORDER"];
            if (typeof order === "string") {
                if (!columns.includes(order)) {
                    return FAILING_CASE;
                }
            } else if (order instanceof  Object) {
                let orderKeys = Object.keys(order);
                if (orderKeys.length !== 2) {
                    return  FAILING_CASE;
                } else if (orderKeys[0] !== "dir") {
                    return  FAILING_CASE;
                } else if (orderKeys[1] !== "keys") {
                    return FAILING_CASE;
                }
                let orderValues = Object.values(order);
                if (orderValues.length !== 2) {
                    return  FAILING_CASE;
                }
                let dir: any = orderValues[0];
                if (typeof dir !== "string") {
                    return FAILING_CASE;
                }
                if ((String(dir) !== "UP") && (String(dir) !== "DOWN")) {
                   return FAILING_CASE;
                }
                if (this.validateKeys(orderValues[1], columns) === FAILING_CASE) {
                    return FAILING_CASE;
                }

            } else {
                return  FAILING_CASE;
            }
        }
        return RESULT_CASE;
    }

    public static validateKeys(keys: any, columns: any) {
        let FAILING_CASE: boolean = false;
        let RESULT_CASE: boolean = true;
        if (!(keys instanceof Array)) {
            return FAILING_CASE;
        }
        if (keys.length < 0 ) {
            return FAILING_CASE;
        }
        for (let key of keys) {
            if (typeof  key !== "string") {
                return FAILING_CASE;
            }
            if (!columns.includes(key)) {
                return FAILING_CASE;
            }
        }
        return RESULT_CASE;
    }
}
