import {AstFilter} from "./AstFilter";
import {OR} from "./OR_FILTER";
import {AND} from "./AND";
import {IS} from "./IS_FILTER";
import {NOT} from "./NOT_FILTER";
import {GT} from "./GT";
import {EQ} from "./EQ";
import {LT} from "./LT";
import Log from "../Util";

export class FilterFactory {
    public static factory(filter: object, objects: object[]): AstFilter {
        Log.info("inside factory");
        let key: string = Object.keys(filter)[0];
        Log.info("key is " + key);
     //   let value: object = Object.values(filter)[0];
        let returnFilter: AstFilter;
        switch (key) {
            case "AND":
                returnFilter =  new AND(filter, objects);
                break;
            case "OR":
                returnFilter =  new OR(filter, objects);
                break;
            case "NOT":
                returnFilter =  new NOT(filter, objects);
                break;
            case "GT":
                returnFilter = new GT(filter, objects);
                break;
            case "EQ":
                returnFilter = new EQ(filter, objects);
                break;
            case "LT":
                returnFilter = new LT(filter, objects);
                break;
            case "IS":
                returnFilter = new IS(filter, objects);
                break;
        }
        Log.info("FilterFactory returns");
        return  returnFilter;

    }
}
