import {
  toTransitionObject, toActionObject, toEventObject, toArray, isString, isFunction
} from './util';

const INIT_EVENT = { type: 'xstate.init' };
const ASSIGN_ACTION = 'xstate.assign';

function createMatcher(value) {
  return stateValue => value === stateValue;
}

function createUnchangedState(value, context) {
  return {
    value,
    context,
    actions: [],
    changed: false,
    matches: createMatcher(value)
  };
}

export function assign(assignment) {
  return {
    type: ASSIGN_ACTION,
    assignment
  }
}

export function execActions(state, event) {
  state.actions.forEach(({ exec }) => {
    exec && exec(state.context, event);
  });
}

// 通过约定的状态机配置，生产一个有限状态机
// 状态机定义如下：
// - 定义一：有限的状态
// - 定义二：有限的事件
// - 定义三：一个初始状态
// - 定义四：给定当前状态 + 事件，可以得出下个状态的变换器
// - 定义五：若干个（或无）的最终状态
export function createMachine(fsmConfig, options = {}) {
  function getCombinedActions({ states, initial }) {
    const entryAction = states[initial].entry;
    return toArray(
      entryAction
    ).map(action => toActionObject(action, options.actions));
  }

  function getContext() {
    return fsmConfig.context || {};
  }

  const machine = {
    _options: options,
    config: fsmConfig,
    // 实现定义三 - 一个初始状态节点
    initialState: {
      // 状态值
      value: fsmConfig.initial,
      // 事件
      actions: getCombinedActions(fsmConfig),
      // 上下文
      context: getContext(),
      // 状态匹配判断方法
      matches: createMatcher(fsmConfig.initial)
    },
    // 实现定义四 - 变换器
    transition: (state, event) => {
      const { value, context } = isString(state) ?
        { value: state, context: getContext() } : state;

      const eventObject = toEventObject(event);
      const stateConfig = fsmConfig.states[value];

      if (stateConfig.on) {
        // 根据事件类型取得对应的变换器
        const transitions = toArray(stateConfig.on[eventObject.type]);

        for (const transtion of transitions) {
          // 实际上没有任何变换器、或使用 undefined 中断了变换器
          if (transtion === undefined) {
            return createUnchangedState(value, context);
          }

          const { target = value, actions = [], cond = () => true } = toTransitionObject(transtion);

          let nextContext = context;

          // 条件守护，只要满足一个变换器，直接退出
          if (cond(context, eventObject)) {
            // 判断上下文是否被修改
            let assigned = false;
            // 获取下个状态对象节点
            const nextStateConfig = fsmConfig.states[target];
            const allActions = []
              // 依次进行当前状态的 Exit Action、当前状态的 Action 集合、下个状态的 Entry Action
              .concat(
                stateConfig.exit, actions, nextStateConfig.entry
              )
              // 过滤假值
              .filter(a => a)
              // 寻找 Action 配置，返回统一格式的 Action 对象
              .map(action => toActionObject(action, machine._options.actions))
              // 内部事件，支持 assign 函数修改上下文
              .filter(action => {
                if (action.type === ASSIGN_ACTION) {
                  assigned = true;

                  let tmpContext = Object.assign({}, nextContext);
                  if (isFunction(action.assignment)) {
                    tmpContext = action.assignment(nextContext, eventObject);
                  } else {
                    Object.keys(action.assignment).forEach(key => {
                      const assignment = action.assignment[key];
                      tmpContext[key] = isFunction(assignment) ? assignment(nextContext, eventObject) : assignment
                    });
                  }

                  nextContext = tmpContext;
                  return false;
                }
                return true;
              });

            return {
              value: target,
              context: nextContext,
              actions: allActions,
              changed: target !== value || allActions.length > 0 || assigned,
              matches: createMatcher(target)
            };
          }

        }
      }

      // 状态节点未注册任何变换器、条件守护未满足，导致停留在原本的状态节点
      return createUnchangedState(value, context);
    }
  };

  return machine;
}

// 状态机服务的状态
export const INTERPRETER_STATUS = {
  NotStarted: 0,
  Running: 1,
  Stopped: 2
};

// 将 Machine 解释为一个状态机服务，应用于实际生产环境
export function interpret(machine) {
  let state = machine.initialState;
  let status = INTERPRETER_STATUS.NotStarted;

  // 用以订阅状态机服务
  const listeners = new Set();
  const service = {
    _machine: machine,
    send(event) {
      // 状态机服务未启动时，不允许发送事件
      if (status !== INTERPRETER_STATUS.Running) {
        return;
      }
      // 通过变换器更新状态
      state = machine.transition(state, event);
      // 执行当前状态的所有 Action（Action 集合在 Machine 中已进行计算）
      execActions(state, toEventObject(event));
      listeners.forEach((listener) => listener(state));

      return service;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(state);

      return {
        unsubscribe: () => listeners.delete(listener)
      };
    },
    // 状态机服务启动
    start: () => {
      status = INTERPRETER_STATUS.Running;
      execActions(state, INIT_EVENT);
      return service;
    },
    // 状态机服务暂停
    stop: () => {
      status = INTERPRETER_STATUS.Stopped;
      listeners.clear();
      return service;
    },
    get state() {
      return state;
    },
    get status() {
      return status;
    }
  };

  return service;
}

export const Machine = createMachine;