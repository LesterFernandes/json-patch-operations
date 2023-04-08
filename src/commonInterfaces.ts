export type IOperationType = "add" | "replace";

export interface IPatch {
  op: IOperationType;
  path: string;
  value: Record<string, unknown> | string;
}

export type TContext <T> = {
  data: T;
  isFetching: boolean;
}