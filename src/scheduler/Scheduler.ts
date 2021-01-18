import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";
import {SchedulerUtil} from "./SchedulerUtil";
import Log from "../Util";

export default class Scheduler implements IScheduler {
    private tuples: Array<[SchedRoom, SchedSection, TimeSlot]>;
    private remainingSections: SchedSection[];
    private sortedRooms: SchedRoom[];
    private remainingSectionsIterator: any;
    private schedulerUtil: SchedulerUtil;
    private TIMESLOT_ARRAY: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
        "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
        "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
        "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
        "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        //  public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection]> {
        this.schedulerUtil = new SchedulerUtil();
        this.remainingSections = [];
        this.sortedRooms = [];
        this.tuples = new Array<[SchedRoom, SchedSection, TimeSlot]>();
        if (!sections) {
            return this.tuples;
        }
        if (!rooms) {
            return this.tuples;
        }
        if (sections.length === 0) {
            return this.tuples;
        }
        if (rooms.length === 0) {
            return this.tuples;
        }
        this.remainingSections = this.schedulerUtil.objectSortSection(sections);
        this.sortedRooms = this.schedulerUtil.objectSortRooms(rooms);

        return this.scheduleHelper();
    }

    public scheduleHelper(): Array<[SchedRoom, SchedSection, TimeSlot]>  {
        this.remainingSectionsIterator = this.remainingSections.values();
        let nextSectionElement = this.remainingSectionsIterator.next();
        let nextSection: SchedSection;
        let isAdded: boolean = false;
        let tuple: [SchedRoom, SchedSection, TimeSlot];
        for (let sortedRoom of this.sortedRooms) {
            if (isAdded) {
                nextSectionElement = this.remainingSectionsIterator.next();
            }
            if (nextSectionElement.done === true) {
                break;
            }
            for (let timeSlot of this.TIMESLOT_ARRAY) {
                if (nextSectionElement.done === true) {
                    isAdded = false;
                    break;
                }
                nextSection = nextSectionElement.value;
                if (this.schedulerUtil.timeSlotMapHas(nextSection, timeSlot)) {
                    isAdded = false;
                    continue;
                }
                while (!this.schedulerUtil.addSection(nextSection, timeSlot, sortedRoom)) {
                    isAdded = false;
                    nextSectionElement = this.remainingSectionsIterator.next();
                    if (nextSectionElement.done === true) {
                        return  this.tuples;
                    }
                    nextSection = nextSectionElement.value;
                }
                tuple = [sortedRoom, nextSection, timeSlot];
                this.tuples.push(tuple);
                nextSectionElement = this.remainingSectionsIterator.next();
                isAdded = true;
            }
        }
        return this.tuples;
    }
}
