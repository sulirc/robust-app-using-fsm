# 服务于某次分享的一个状态机应用示例

## 内容列表

单词卡应用，请求加载卡片列表 + 点击显示卡片详情

- 四种实现方式
  - App.jsx 原生状态机方式
  - App.raw.jsx 简单实现
  - App.raw.full.jsx 进阶需求实现
  - App.xstate.jsx XState 实现
- 两种集成测试
  - npm run test 集成测试
  - npm run test:xst 基于模型测试
- XState 使用指引文件 xstate-guide
- XState 状态机最小实现 xstate-mini-impl

## XState 和 Redux 的区别？

> Stack Overflow 上 XState 作者的回答：[What is an actual difference between redux and a state machine (e.g. xstate)?](https://stackoverflow.com/questions/54482695/what-is-an-actual-difference-between-redux-and-a-state-machine-e-g-xstate)

| 对比项       | Redux                                                                                    | XState                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 状态容器     | Redux 实际上也是一个状态容器，使用 Action 发送到 Reducers 去更新状态                     | XState 也是状态容器，但它分离了有限状态（e.g. "loading"，"success"）和无限状态，或者上下文（e.g. items: [...]） |
| Reducer 对比 | Redux 并没有限定应该如何定义 Reducers，它们只是通过当前状态和输入的事件返回下一个状态    | XState 是“有规则的 Reducers”，定义符合规则的变换器函数来过渡状态                                                |
| 副作用处理   | Redux 并没有内置的处理副作用（side-effects）的实现，依托于社区的 redux-thunk、redux-saga | XState 让副作用显示、可声明                                                                                     |
| 视图化能力   | Redux 没有视图化能力（因为并没有区分有限和无限的状态）                                   | XState 有视图化工具 https://xstate.js.org/viz/                                                                  |
| 序列化能力   | Redux 不可以序列化为 JSON 或其他格式                                                     | XState 可以序列化为 JSON，或者从 JSON 中生成状态机。因此十分便携和可配置。                                      |
| 状态机       | Redux 不是状态机                                                                         | XState 严格参照 W3C SCXML 标准进行开发                                                                          |
| 状态限制     | Redux 依赖开发者自主限制状态变换                                                         | XState 使用状态图定义状态与事件之间的边界                                                                       |
| 层级架构设计 | Redux 鼓励使用单一、全局的原子状态树                                                     | XState 鼓励使用演员模型的方式，因此可以层级化设计多个服务实例进行协作                                           |

实际上 XState 和 Redux 是互不相关的。可以互相集成，也可以任选其一。

综合来看，Redux 可以了解过去（就像[糖果屋](https://zh.wikipedia.org/wiki/%E7%B3%96%E6%9E%9C%E5%B1%8B)里用面包屑作为路径记忆一样），而 XState 却可以预测未来（就像航拍中用摄像头俯瞰地图）。
