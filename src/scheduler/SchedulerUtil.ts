import {SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import Log from "../Util";
import {ModelUtil} from "../model/ModelUtil";

export class SchedulerUtil {
    public constructor() {
        Log.info("Inside Scheduler Util");
        this.localRooms = [];
    }

    private map: Map<TimeSlot, string[]> = new Map<TimeSlot, string[]>();
    private localRooms: SchedRoom[] = [];
    private localMax: number;

    public computeDistance(room1: SchedRoom, room2: SchedRoom): number {
        // adapted from https://www.movable-type.co.uk/scripts/latlong.html
        let lat1: number = Number(room1["rooms_lat"]);
        let lon1: number = Number(room1["rooms_lon"]);
        let lat2: number = Number(room2["rooms_lat"]);
        let lon2: number = Number(room2["rooms_lon"]);
        let R: number = 6371e3; // metres
        let phi1: number = this.toRadians(lat1);
        let phi2: number = this.toRadians(lat2);
        let deltaPhi: number = this.toRadians(lat2 - lat1);
        let deltaLambda: number = this.toRadians(lon2 - lon1);
        let a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        let d = R * c;
        let D = d / 1372;
        return D;
    }

    public objectSortSection(objects: SchedSection[]): SchedSection[] {
        let jsonObjectA;
        let jsonObjectB;
        let extractedVariableA: string;
        let extractedVariableB: string;
        let  result: number;
        objects.sort(function (a, b) {
            jsonObjectA = JSON.parse(JSON.stringify(a));
            jsonObjectB = JSON.parse(JSON.stringify(b));
            result = 0;
            extractedVariableA = jsonObjectA["courses_pass"] +
                jsonObjectA["courses_fail"] + jsonObjectA["courses_audit"];
            extractedVariableB = jsonObjectB["courses_pass"] + jsonObjectB["courses_fail"] +
                jsonObjectB[ "courses_audit"];
            (extractedVariableA < extractedVariableB) ? (result = 1) : (result = -1);
            return result;
            });
        return objects;
    }

    public objectSortRooms(objects: SchedRoom[]): SchedRoom[] {
        let jsonObjectA;
        let jsonObjectB;
        let extractedVariableA: string;
        let extractedVariableB: string;
        let field: any;
        let  result;
        const that: SchedulerUtil = this;
        objects.sort(function (a, b) {
            jsonObjectA = JSON.parse(JSON.stringify(a));
            jsonObjectB = JSON.parse(JSON.stringify(b));
            result = 0;
            field = "rooms_seats";
            extractedVariableA = jsonObjectA[field];
            extractedVariableB = jsonObjectB[field];
            if (extractedVariableA === extractedVariableB) {
                if (that.computeDistance(a, b) < 0.5) {
                    result = -1;
                } else {
                    result = 1;
                }
            } else {
                (extractedVariableA < extractedVariableB) ? (result = 1) : (result = -1);
            }
            return result;
        });
        return objects;
    }

    public  toRadians(num: number) {
        return num * Math.PI / 180;
    }

    public addSection(section: SchedSection, timeSlot: TimeSlot, sortedRoom: SchedRoom): boolean {
        // TODO add section
        let PASSING_CASE: boolean = true;
        let FAILING_CASE: boolean = false;
        let result: boolean = FAILING_CASE;
        let sectionName: string = this.extractSectionName(section);
        let idArray: string[] = this.map.get(timeSlot);
        if (!idArray) {
            idArray = [];
        }
        idArray.push(sectionName);
        let sectionNumPeople: number = this.extractSectionPeople(section);
        let roomsPeople: number = this.extractRoomPeople(sortedRoom);
        if (roomsPeople >= sectionNumPeople) {
            this.map.set(timeSlot, idArray);
            result = PASSING_CASE;
        }
        return result;
    }

    public timeSlotMapHas(section: SchedSection, timeSlot: TimeSlot): boolean {
        let sectionName: string = this.extractSectionName(section);
        let stringArray: string[] = this.map.get(timeSlot);
        let PASSING_CASE: boolean = true;
        let FAILING_CASE: boolean = false;
        if (!stringArray) {
            return FAILING_CASE;
        }
        return stringArray.includes(sectionName);
    }

    private extractSectionName(section: SchedSection): string {
        return String(section["courses_dept"].concat("_").concat(section["courses_id"]));
    }

    private extractSectionPeople(section: SchedSection): number {
        return section["courses_pass"] + section["courses_fail"] + section["courses_audit"];
    }

    private extractRoomPeople(sortedRoom: SchedRoom) {
        return sortedRoom["rooms_seats"];
    }

    public shouldRoomBeReplaced(room: SchedRoom): object {
        // TODO
        interface IResult {shouldBeReplaced: boolean; toBeReplaced: SchedRoom; }
        let FALSE_CASE: IResult  = {shouldBeReplaced: false, toBeReplaced: room};
        let BASE_CASE: IResult = {shouldBeReplaced: true, toBeReplaced: room};
        let RESULT: IResult;
        if (this.localRooms.length < 2) {
            this.localRooms.push(room);
            return FALSE_CASE;
            // false base case
        } else if (this.localRooms.length === 2) {
            this.localMax = this.computeDistance(this.localRooms[0], this.localRooms[1]);
            return FALSE_CASE;
        }
        let localDistance0 = this.computeDistance(this.localRooms[0], room);
        let localDistance1 = this.computeDistance(this.localRooms[1], room);
        if (localDistance0 < this.localMax) {
            this.localRooms = this.localRooms.splice(0, 1);
            RESULT = {shouldBeReplaced: true, toBeReplaced: this.localRooms[0]};
            this.localRooms[0] = room;
        } else if (localDistance1 < this.localMax) {
            this.localRooms = this.localRooms.splice(0, 1);
            RESULT = {shouldBeReplaced: true, toBeReplaced: this.localRooms[1]};
            this.localRooms[1] = room;
        } else {
            RESULT = FALSE_CASE;
        }
        return RESULT;
    }

    public replaceTuples(room: SchedRoom, section: SchedSection,
                         timeSlot: TimeSlot, tuples: Array<[SchedRoom, SchedSection, TimeSlot]>,
                         roomToBeReplaced: SchedRoom):
        Array<[SchedRoom, SchedSection, TimeSlot]>  {
        let returnedTuples:  Array<[SchedRoom, SchedSection, TimeSlot]> =
            tuples;
        let tupleToBeRemoved: [SchedRoom, SchedSection, TimeSlot] = [roomToBeReplaced, section, timeSlot];
        returnedTuples.splice(tuples.indexOf(tupleToBeRemoved), 1);
        let tuplesToBeAdded: [SchedRoom, SchedSection, TimeSlot] = [room, section, timeSlot];
        returnedTuples.push(tuplesToBeAdded);
        return returnedTuples;
    }
}

