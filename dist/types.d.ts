export interface Migration {
    version: number;
    queries: string[];
}
