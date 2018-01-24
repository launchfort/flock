class EventDispatcher {
  constructor (target = this) {
    this.target = target
    this.listenerMap = Object.create(null)
  }

  willTrigger (eventType) {
    return eventType in this.listenerMap
  }

  addEventListener (eventType, listener) {
    const listeners = this.listenerMap[eventType] || []
    listeners.push(listener)
    this.listenerMap[eventType] = listeners
    return this
  }

  removeEventListener (eventType, listener) {
    const listeners = this.listenerMap[eventType]
    if (listeners) {
      listeners.splice(listeners.indexOf(listener))
      if (listeners.length === 0) {
        delete this.listenerMap[eventType]
      }
    }
    return this
  }

  removeAllEventListeners (eventType = null) {
    if (eventType) {
      delete this.listenerMap[eventType]
    } else {
      this.listenerMap = Object.create(null)
    }
  }

  dispatch (event) {
    let defaultPrevented = false
    let stopPropagation = false
    event = Object.assign({}, event, {
      target: this.target,
      get defaultPrevented () {
        return defaultPrevented
      },
      preventDefault () {
        defaultPrevented = true
      },
      stopPropagation () {
        stopPropagation = true
      },
      stopImmediatePropagation () {
        stopPropagation = true
      }
    })
    let listeners = this.listenerMap[event.type]

    if (listeners && listeners.length) {
      listeners = listeners.slice().reverse()
      while (listeners.length) {
        listeners.pop()(event)
        if (stopPropagation) {
          break
        }
      }
    }
  }
}

exports.EventDispatcher = EventDispatcher
