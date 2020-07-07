import { Machine, assign } from 'xstate';

function sleep(t = 1000) {
  return new Promise(r => setTimeout(r, t));
}


async function fetchDictWordsByTag() {
  await sleep(2000);
  // return [{
  //   title: 'doggy',
  //   description: 'Hello doggy, u are qute',
  //   id: '#id'
  // }];
  throw new Error('Server error, please retry later');
}

// eslint-disable-next-line no-unused-vars
const galleryMachine = Machine({
  id: 'gallery-demo',
  initial: 'start',
  context: {
    items: [],
    photo: {},
    query: '',
  },
  states: {
    start: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: 'setQuery',
        },
      },
    },
    loading: {
      invoke: {
        id: 'fetchDictWordsByTag',
        src: (context, event) => fetchDictWordsByTag(context.query),
        onDone: {
          target: 'gallery',
          actions: 'setItems',
        },
        onError: {
          target: 'error',
        },
      },
      on: {
        CANCEL_SEARCH: 'gallery',
      },
    },
    error: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: 'setQuery',
        },
      },
    },
    gallery: {
      on: {
        SEARCH: {
          target: 'loading',
          actions: 'setQuery',
        },
        SELECT_PHOTO: {
          target: 'photo',
          actions: 'setPhoto',
          cond: (context, _) => {
            return context.items.length > 0;
          }
        },
      },
    },
    photo: {
      on: {
        EXIT_PHOTO: {
          target: 'gallery',
          actions: 'unsetPhoto',
        },
      },
    },
  },
}, {
  actions: {
    setQuery: assign({
      query: (_, event) => event.query,
    }),
    setItems: assign({
      items: (_, event) => event.data,
    }),
    setPhoto: assign({
      photo: (_, event) => event.item,
    }),
    unsetPhoto: assign({
      photo: () => ({}),
    }),
  },
});