export type Spy = {
  (...args: any[]): any|void
  calls: { args: any[], returnValue: any }[]
}

export function spy (fn: (...args: any[]) => any) {
  let calls = []
  let f = <Spy>((...args: any[]) => {
    const returnValue = fn(...args)
    calls.push({ args, returnValue })
    return returnValue
  })
  f.calls = calls
  return f
}
