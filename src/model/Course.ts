
export interface ISection {
    readonly dept: string;
    readonly id: string;
    readonly avg: number;
    readonly instructor: string;
    readonly title: string;
    readonly pass: number;
    readonly fail: number;
    readonly audit: number;
    readonly uuid: string;
    readonly year: number;
}
export interface ISectionSField {

    readonly dept: string;
    readonly id: string;
    readonly instructor: string;
    readonly title: string;
    readonly uuid: string;
}
export interface ISectionMField {
    readonly avg: number;
    readonly pass: number;
    readonly fail: number;
    readonly audit: number;
    readonly year: number;
}
