import { Machine, interpret, assign } from '../xstate';

const fsmConfig = {
  id: 'lightBulb',
  initial: 'unlit',
  context: {
    globalAssigned: '~UNSET',
    numAssigned: []
  },
  states: {
    lit: {
      on: {
        BREAK: 'broken',
        TOGGLE: 'unlit',
      },
    },
    unlit: {
      exit: assign((context, event) => ({
        ...context,
        numAssigned: [0]
      })),
      on: {
        BREAK: {
          target: 'broken',
          actions: [
            (context, event) => {
              context.numAssigned.push(1);
            },
            (context, event) => {
              context.numAssigned.push(2);
            },
          ]
        },
        TOGGLE: {
          target: 'lit',
          actions: assign({
            globalAssigned: '~VALUE'
          })
        },
      },
    },
    broken: {
      entry: (context, event) => {
        context.numAssigned.push(3);
      }
    },
  },
};


describe('light bulb machine context assign', () => {
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

  it('should assign context `globalAssigned` when change `unlit` to `lit`', () => {
    expect(service.state.context.globalAssigned).toEqual('~UNSET');
    service.send('TOGGLE');
    expect(service.state.context.globalAssigned).toEqual('~VALUE');
  });

  it('should assign context at sequence `state.exit` -> `state.actions` -> `nextState.entry`', () => {
    service.send('BREAK');
    expect(service.state.context.numAssigned).toEqual([0, 1, 2, 3])
  });
});
