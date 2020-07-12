import { Machine, interpret, INTERPRETER_STATUS } from '../xstate';

let globalAssigned = '~UNSET';

const fsmConfig = {
  id: 'lightBulb',
  initial: 'unlit',
  states: {
    lit: {
      on: {
        BREAK: {
          target: 'broken',
          actions: [() => {
            globalAssigned = '~BROKEN';
          }],
        },
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

describe('light bulb machine actions', () => {
  let machine = null;

  beforeEach(() => {
    machine = Machine(fsmConfig);
  });

  afterEach(() => {
    machine = null;
  });

  it('should trigger action when on `BREAK` event', () => {
    expect(globalAssigned).toEqual('~UNSET');
    const nextState = machine.transition('lit', 'BREAK');
    nextState.actions.forEach(a => a.exec());
    expect(globalAssigned).toEqual('~BROKEN');
  });
});