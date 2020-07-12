import { toArray, isString } from './util';
import { toActionObject } from 'xstate/lib/actions';

export function createMatcher(value) {
  return stateValue => value === stateValue;
}

// 通过约定的状态机配置，生产一个有限状态机
// 状态机定义如下：
// - 定义一：有限的状态
// - 定义二：有限的事件
// - 定义三：一个初始状态
// - 定义四：给定当前状态 + 事件，可以得出下个状态的变换器
// - 定义五：若干个（或无）的最终状态
export function createMachine(fsmConfig, options) {
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
    transitions(state, event) {
      const { value, context } = isString(state) ?
        { value: state, context: getContext() } : state;

      
    }
  };

  return machine;
}

// 将 Machine 解释为一个服务，应用于实际生产环境
export function interpret(machine) {

}

export const Machine = createMachine;