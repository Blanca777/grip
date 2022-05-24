function throttle(fn, wait) {
  let timer: NodeJS.Timeout | null
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(null, args)
        timer = null
      }, wait)
    }
  }
}
export default throttle
