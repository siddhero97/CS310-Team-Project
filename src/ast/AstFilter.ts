import Log from "../Util";
export abstract class AstFilter {
    protected  objects: object[];
    private booleanArray: boolean[];
   public constructor(filterObject: object, objects: object[]) {
       this.objects = objects;
       this.booleanArray = new Array<any>(this.objects.length);
       this.convert(filterObject);
    }

    protected abstract convert(filterObj: object): void;
    public performFilter(object?: object): boolean[] {
        if (object) {
            return  [this.customFilterFunction(object)];
        }
        Log.info("In AstFilter gets to before objects.map");
        for (let i = 0; i < this.objects.length; i++) {
            this.booleanArray[i] = this.customFilterFunction(this.objects[i]);
        }
        Log.info("In AstFilter gets to after objects.map");
        return this.booleanArray;
    }

    protected abstract customFilterFunction(object: object): boolean;
}
