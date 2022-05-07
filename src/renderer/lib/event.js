class EventEmitter {
  constructor() {
    this.eventList = {}
  }
  on(name, fn) {
    if (this.eventList[name]) {
      this.eventList[name].push(fn)
    } else {
      this.eventList[name] = [fn]
    }
  }
  off(name, fn) {
    let tasks = this.eventList[name]
    if (tasks) {
      let index = tasks.findIndex(f => f === fn)
      if (index >= 0) {
        tasks.splice(index, 1)
      }
    }
  }
  emit(name, ...args) {
    if (this.eventList[name]) {
      this.eventList[name].forEach(fn => {
        fn(...args)
      })
    }
  }
}

export default EventEmitter
