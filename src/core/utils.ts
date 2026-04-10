export function objectKeys<TObj extends object>(obj: TObj): Array<keyof TObj> {
  return Object.keys(obj) as Array<keyof TObj>
}

export function objectValues<TObj extends object>(obj: TObj): Array<TObj[keyof TObj]> {
  return Object.values(obj) as Array<TObj[keyof TObj]>
}

export function objectEntries<TObj extends object>(obj: TObj): [keyof TObj, TObj[keyof TObj]][] {
  return Object.entries(obj) as [keyof TObj, TObj[keyof TObj]][]
}
