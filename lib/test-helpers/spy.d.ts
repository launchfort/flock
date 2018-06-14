export declare type Spy = {
    (...args: any[]): any | void;
    calls: {
        args: any[];
        returnValue: any;
    }[];
};
export declare function spy(fn: (...args: any[]) => any): Spy;
