import { Machine } from '../xstate';

let globalAssigned = '~UNSET';
let numAssigned = [];

const fsmConfig = {
  id: 'lightBulb',
  initial: 'unlit',
  states: {
    lit: {
      on: {
        BREAK: 'broken',
        TOGGLE: {
          target: 'lit',
          actions: [() => {
            globalAssigned = '~VALUE';
          }],
        },
      },
    },
    unlit: {
      exit: () => {
        numAssigned.push(0);
      },
      on: {
        BREAK: {
          target: 'broken',
          actions: [
            () => {
              numAssigned.push(1);
            },
            () => {
              numAssigned.push(2);
            },
          ]
        },
        TOGGLE: 'lit',
      },
    },
    broken: {
      entry: () => {
        numAssigned.push(3);
      }
    },
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
    const nextState = machine.transition('lit', 'TOGGLE');
    nextState.actions.forEach(a => a.exec());
    expect(globalAssigned).toEqual('~VALUE');
  });

  it('should trigger at sequence `state.exit` -> `state.actions` -> `nextState.entry`', () => {
    expect(numAssigned).toHaveLength(0);
    const nextState = machine.transition('unlit', 'BREAK');
    nextState.actions.forEach(a => a.exec());
    expect(numAssigned).toEqual([0, 1, 2, 3])
  });
});