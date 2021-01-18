import {IRooms} from "../model/Rooms";

export default class RoomTranslator {
    public dataToRoom(fName: string, sName: string, num: string, address: string, lat: number, lon: number,
                      seats: string, type: string, furniture: string, href: string) {
        const values = [fName, sName, num, address, lat, lon, seats, type, furniture, href];
        if (values.includes(null) || values.includes(undefined)) {
            return null;
        }
        let name: string =  String(sName).concat("_").concat(num);
        const room: IRooms = {fullname: fName, shortname: sName, number: num, address: address, lat: lat,
        lon: lon, seats: this.toNumber(seats), type: type, furniture: furniture, href: href, name: name};
        return room;
    }

    private toNumber(value: any): number {
        if (typeof value === "number") {
            return value;
        }
        try {
            return Number(value);
        } catch {
            return 0;
        }
    }
}
