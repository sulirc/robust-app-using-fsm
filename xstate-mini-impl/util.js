export function toArray(item) {
  return item === undefined ? [] : [].concat(item);
}

export function isString(o) {
  return typeof o === 'string';
}

export function isFunction(o) {
  return typeof o === 'function';
}

export function toActionObject(action, actionMap = {}) {
  action = isString(action) && actionMap[action] ?
    actionMap[action] : action;

  if (isString(action)) {
    return {
      type: action
    };
  } else if (isFunction(action)) {
    return {
      type: action.name,
      exec: action
    }
  } else {
    return action;
  }
}

export function toEventObject(event) {
  return isString(event) ? { type: event } : event;
}