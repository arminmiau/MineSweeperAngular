export type Cell = {
    isHidden: boolean;
    isBomb: boolean;
    isFlag: boolean;
    bombsAround: number;
    neighbors: Cell[];
}