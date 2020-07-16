import { fetchDictWordsByTag } from './utils';
import { Machine, assign } from 'xstate';

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
        src: (context, _) => fetchDictWordsByTag(context.query),
        onDone: {
          target: 'gallery',
          actions: 'setItems',
        },
        onError: {
          target: 'error',
        },
      },
      on: {
        CANCEL_SEARCH: [
          { target: 'gallery', cond: ctx => ctx.items.length > 0 },
          { target: 'start' },
        ],
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
          cond: ctx => ctx.items.length > 0
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
      query: (_, event) => event.query
    }),
    setItems: assign({
      items: (_, event) => event.data
    }),
    setPhoto: assign({
      photo: (_, event) => event.item,
    }),
    unsetPhoto: assign({
      photo: () => ({}),
    }),
  },
});

export default galleryMachine;