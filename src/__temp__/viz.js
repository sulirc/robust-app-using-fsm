/* eslint-disable */

/**
 * Copy paste to https://xstate.js.org/viz/
 */
function sleep(t = 1000) {
  return new Promise(r => setTimeout(r, t));
}


async function fetchDictWordsByTag() {
  await sleep(2000);
  throw new Error('Server error, please retry later');
  // return [{
  //   title: 'doggy',
  //   description: 'Hello doggy, u are qute',
  //   id: '#id'
  // }];
}

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