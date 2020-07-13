import { Machine, interpret, INTERPRETER_STATUS } from '../xstate';

let power = 0;
const POWER_ENOUGH_FOR_BULB = 100;
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
        TOGGLE: {
          target: 'lit',
          cond: () => {
            return power >= POWER_ENOUGH_FOR_BULB;
          }
        },
      },
    },
    broken: {},
  },
};

describe('light bulb machine cond', () => {
  let machine = null;
  let service = null;

  beforeEach(() => {
    machine = Machine(fsmConfig);
    service = interpret(machine);
    service.start();
  });

  afterEach(() => {
    service.stop();
    machine = null;
    service = null;
  });

  it('should not change to `lit` state when power zero (cond false)', () => {
    service.send('TOGGLE');
    expect(service.state.value).toBe('unlit');
  });

  it('should change to `lit` state when power enough (cond true)', () => {
    power = POWER_ENOUGH_FOR_BULB;
    service.send('TOGGLE');
    expect(service.state.value).toBe('lit');
  });
});