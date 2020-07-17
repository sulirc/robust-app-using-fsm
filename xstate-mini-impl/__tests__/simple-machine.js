import { Machine } from '../xstate';

const fsmConfig = {
  id: 'lightBulb',
  initial: 'unlit',
  states: {
    lit: {
      on: {
        BREAK: 'broken',
        TOGGLE: 'unlit',
      },
    },
    unlit: {
      on: {
        BREAK: 'broken',
        TOGGLE: 'lit',
      },
    },
    broken: {},
  },
};

describe('light bulb pure machine', () => {
  let machine = null;

  beforeEach(() => {
    machine = Machine(fsmConfig);
  });

  afterEach(() => {
    machine = null;
  });

  it('should enter initial state `unlit`', () => {
    const { initialState } = machine;
    expect(initialState.value).toEqual(fsmConfig.initial);
  });

  it('should return `lit` state after sent event `TOGGLE`', () => {
    const nextState = machine.transition(fsmConfig.initial, 'TOGGLE')
    expect(nextState.value).toEqual('lit');
  });

  it('should return `broken` state after sent event `BREAK`', () => {
    const nextState = machine.transition(fsmConfig.initial, 'BREAK')
    expect(nextState.value).toEqual('broken');
  });

  it('should not change to any state when light bulb broken', () => {
    const nextState = machine.transition('broken', 'TOGGLE');
    expect(nextState.value).toEqual('broken');
  });
})
