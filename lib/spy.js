function spy (fn = () => {}) {
  f.calls = []
  function f (...args) {
    const returnValue = fn(...args)
    f.calls.push({ args, returnValue })
    return returnValue
  }
  return f
}

exports.spy = spy
