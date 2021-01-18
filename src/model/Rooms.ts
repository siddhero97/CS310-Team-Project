export interface IRooms {
    readonly fullname: string;
    readonly shortname: string;
    readonly number: string;
    readonly address: string;
    readonly lat: number;
    readonly lon: number;
    readonly seats: number;
    readonly type: string;
    readonly furniture: string;
    readonly href: string;
    readonly name: string;
}

export interface IRoomsSField {

    readonly fullname: string;
    readonly shortname: string;
    readonly number: string;
    readonly address: string;
    readonly type: string;
    readonly furniture: string;
    readonly href: string;
    readonly name: string;
}
export interface IRoomsMField {
    readonly lat: number;
    readonly lon: number;
    readonly seats: number;
}
