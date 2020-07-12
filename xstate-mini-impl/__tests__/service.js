import { Machine, interpret, INTERPRETER_STATUS } from '../xstate';

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

describe('light bulb machine service', () => {
  let machine = null;
  let service = null;

  beforeEach(() => {
    machine = Machine(fsmConfig);
    service = interpret(machine);
  });

  afterEach(() => {
    machine = null;
    service = null;
  });

  it('should begin at `NotStarted` status', () => {
    expect(service.status).toBe(INTERPRETER_STATUS.NotStarted);
  });

  it('should not receive any event at `NotStarted` status', () => {
    service.send('TOGGLE');
    expect(service.state.value).not.toBe('lit');
  });

  it('should not change to `lit` state when service started and receive `TOGGLE` event', () => {
    service.start();
    service.send('TOGGLE');
    expect(service.state.value).toBe('lit');
  });

  it('should change `unlit` -> `lit` -> `broken` when sending valid event', () => {
    service.start();
    expect(service.state.value).toBe('unlit');
    service.send('TOGGLE');
    expect(service.state.value).toBe('lit');
    service.send('BREAK');
    expect(service.state.value).toBe('broken');
  });

  it('should not change state when service stop', () => {
    service.start();
    expect(service.state.value).toBe('unlit');
    service.send('TOGGLE');
    expect(service.state.value).toBe('lit');
    service.stop();
    service.send('TOGGLE');
    expect(service.state.value).toBe('lit');
  });
});