function debounce(fn, wait) {
  let timer: NodeJS.Timeout
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(null, args)
    }, wait)
  }
}

export default debounce
