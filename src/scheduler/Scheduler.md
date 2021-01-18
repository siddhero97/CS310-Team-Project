# Scheduler
Using greedy algorithm. \
Priority 1: enrollment (maximize) \
Priority 2: distance (minimize) 
## Part 1: sorting
### sections: courses_pass + courses_fail + courses_audit (descending order) \
We want to maximize enrollment(number of people).
### rooms: rooms_seats(descendingOrder), haversineFormula(rooms_lat,rooms_lon) (ascending order)
The larger sections will need larger rooms. Henceforth, the rooms_seats is given first priority. 
After this, we sort according to rooms_lat and rooms_lon to get the locations which are closer together.

## Part 2: Fields
remainingSections: SchedSection[] \
timeSlotMap: Map<String, TimeSlot[]>

### Part 3: Actual Algorithm
let  tuples: Array<[SchedRoom, SchedSection, TimeSlot]> = new Array<[SchedRoom, SchedSection, TimeSlot]>(); \
for each sortedRoom of sortedRooms { \
iterator = create iterator with remaining sections \
remainingSection = iterator.first() \
if(sectionAllocatable(selectedRoom,remainingSection)) { \
for each timeSlot of timeSlots \
        if(!timeSlotMapHas(remainingSection)) { \
        timeSlotMapAdd(timeSlot,remainingSection)\
        tuples.add([remainingSection,sortedRoom,timeSlot])
        remainingSections.remove(remainingSection);
        } \
        remainingSection = iterator.next() \
} \
 } \
 }\
\

### Part 4: RunTimeAnalysis
s: number of sortedRooms \
t: number of  ItemSlots\
Total RunTime: O(stlogs) 

