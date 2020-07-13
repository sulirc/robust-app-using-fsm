在学习状态机实现原理之前，我们先了解状态机的五个定义如下：

- 定义一：有限的状态
- 定义二：有限的事件
- 定义三：一个初始状态
- 定义四：变换器（给定当前状态 + 事件，可以得出下个状态）
- 定义五：若干个（或无）的最终状态

然后我们依据状态机的定义进行逐个分析。

## 定义解读

### 定义一：有限的状态

状态机之所以这样命名，大略都可以理解为管理“状态”的机器。从工业生产可用性的角度来看，任何事物都是可以**近似**看做有限的状态的。

怎么理解呢？比如一杯水的温度可以算作它的状态，理论上温度的值是无限的，比如我可以说水的温度从 30° 升到了 30.0001° 也算是状态变化，但是我们在普遍场景下，对水的温度精度并不会要求很高。

因此我们可以定义为水的每 1° 就是一个状态，并且我们只关注 0° ~ 100°。因此水的温度状态就只有 100 个，从而表达了**有限**的概念。

对于设计实现来说，我们拿灯泡举例子，假设灯泡有亮、不亮、坏掉三个状态，我们仅仅用一个数组就可以表达完这个事情。

```js
const lightBulbStates = ['LIT', 'UNLIT', 'BROKEN'];
```

当然，在实际开发中，我们也可以用哈希表或者 enum 枚举所有状态。

```js
const lightBulbStates = {
  lit: 'LIT',
  unlit: 'UNLIT',
  broken: 'BROKEN',
};
```

### 定义二：有限的事件

什么是事件？

举个例子：比如说小明心如止水地在工作，突然隔壁同事给了他一巴掌，小明气炸了，准备撸起袖子去打架。

这里小明就是一个状态机，他从**心如止水**的状态，转换到了**气炸了**的状态，全因发生了**被同事扇了一巴掌**的事件，并且产生了**准备去干架**的行为副作用。公式如下：

心如止水（状态） + 被扇一巴掌（事件） = 气炸了（新的状态）+ 准备干架（副作用）。

当然同事之间还是要团结友爱啦，君子动口不动手，我们要以理服人，是吧。

基于上述的例子，我们进行抽象，总结得出公式如下：

```
state + event = newState + effect
```

因此，因为状态是有限的，所以当然事件也是有限的。就比如图有三个顶点，点之间的连线如果有向，那也只有六条线（2 ^ 3 = 6），这很好理解。

再结合到我们的灯泡状态机来看，它的事件有如下几种：

```
unlit + TOGGLE = lit + effect
lit + TOGGLE = unlit + effect
unlit + BREAK = broken + effect
lit + BREAK = broken + effect
```

我们整理一下，用 JavaScript 对象来表述这个事情：

```js
const lightBulbEventMap = {
  unlit: {
    on: {
      TOGGLE: 'lit',
      BREAK: 'broken',
    },
  },
  lit: {
    on: {
      TOGGLE: 'unlit',
      BREAK: 'broken',
    },
  },
  broken: {},
};
```

这样状态与事件之间的关系就一目了然了。

### 定义三：一个初始状态

盘古开天、女娲造人、伊甸园里的亚当夏娃，万事万物都有一个初始状态。就像人的一生也会从呱呱落地开始，到化作一抔黄土结束，整个过程是随时间流逝而不断变换的，我们不可能直接绕过开始，直接到中间某个节点。

对于状态机来说也是如此。灯泡买回来一般处于未点亮的状态（正常来说）。因此，我们还是用 JavaScript 对象来表述这个事情：

```js
const lightBulbMachine = {
  initial: 'unlit',
  states: {
    unlit: {
      on: {
        TOGGLE: 'lit',
        BREAK: 'broken',
      },
    },
    lit: {
      on: {
        TOGGLE: 'unlit',
        BREAK: 'broken',
      },
    },
    broken: {},
  },
};
```

### 定义四：变换器（给定当前状态 + 事件，可以得出下个状态）

其实到这里我们已经把灯泡的状态、事件都定义完了。但我们仍然需要给出变换器的实现，用以实现状态与状态之前的过渡。

变换器实现复杂么？不，一点也不。请看：

```js
function transition(state, event) {
  return machine.states[state].on[event];
}
```

然后我们可以用变换器函数对灯泡的状态进行运算

```js
const newState = transition('unlit', 'TOGGLE'); // lit
```

或者~

```js
const newState = transition('lit', 'BREAK'); // broken
```

假如灯泡坏了，我们还是想点亮它，怎么办？

```js
const newState = transition('broken', 'TOGGLE'); // Throw error
```

状态机告诉你，痴心妄想！

### 定义五：若干个（或无）的最终状态

前面说到万事万物都有起点，所以按道理来说，应该也必然有终点。但是考虑到实际应用中，其实抽象来说未必需要一个终点。就比如网站用户可以登录、漫游、退出、再登录、再漫游等等，它并没有一个实际的终点。

但是也可以有终点。比如 Promise 请求，从 init 到 pending，再返回 resolve 代表成功，或者 reject 代表失败。它有两个终点。

比如人从出生到逝去，宏观上来说，分别对应着初始状态、最终状态。

我们还是回到我们的灯泡状态机，broken 就是它的最终状态。状态机一旦抵达到最终的状态，就相当于结束了。

```js
const lightBulbMachine = {
  initial: 'unlit',
  states: {
    // ...
    broken: {
      type: 'final',
    },
  },
};
```

## 状态机最简单实现

来，让我们实现一个状态机吧！

```js
function createMachine({ initial, states }) {
  const machine = {
    initialState: initial,
    transition: (state, event) => states[state].on[event]
  };

  return machine;
}
```

同学们肯定会觉得，就这么简单么？其实本质上就这样。虽然如此简单的实现，是绝对不能支撑起我们复杂的业务场景需求的。但是一旦只要明白了本质，扩展的实现理解起来也不会很困难。

## 副作用

上文的状态机实现其实本质上是个纯函数，但我们仔细观察上文提到过的公式。

```
state + event = newState + effect
```

关于副作用我们却只字未提。在大型的应用中，副作用是到处存在的，比如网络请求、本地日志存储、错误输出、DOM 操作、数据库写入、事件注册监听。

纯函数可以提高我们代码的质量，但是却不能表达复杂的业务。

状态机也是如此。状态机可以通过注册活动（Activities）、上下文（context）、订阅状态机服务（Service.subscribe）等方式进行表达副作用。

这些都可以去 [XState Docs](https://xstate.js.org/docs/) XState 官网进行学习了解。

## 源码解读

这里贴上了最简单的状态机实现（@xstate/fsm）的注释。除了包含了上述最基本的五个定义、还有扩展上下文（context）、条件守护（cond）、状态机解释服务（service）等。

对状态机更进一步实现感兴趣的同学可以阅读。

```js
// xstate.js
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
// - 定义四：变换器（给定当前状态 + 事件，可以得出下个状态）
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
```

```js
// util.js
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

export function toTransitionObject(transition) {
  return isString(transition) ? { target: transition } : transition;
}
```