function createMachine({ initial, states }) {
  const machine = {
    initialState: initial,
    transition: (state, event) => states[state].on[event]
  };

  return machine;
}

const lightBulbMachine = createMachine({
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
});

console.log(lightBulbMachine.initialState);
console.log(lightBulbMachine.transition('lit', 'BREAK'));
console.log(lightBulbMachine.transition('break', 'TOGGLE'));