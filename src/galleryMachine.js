
import { fetchDictWordsByTag } from './utils';
import { Machine, assign } from 'xstate';

const galleryMachineOptions = {
  actions: {
    setQuery: assign({
      query: (context, event) => event.query,
    }),
    setItems: assign({
      items: (context, event) => event.data.data,
    }),
    setPhoto: assign({
      photo: (context, event) => event.item,
    }),
    unsetPhoto: assign({
      photo: (context, event) => ({}),
    }),
  },
};

const galleryMachine = Machine(
  {
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
          SEARCH: 'loading',
        },
      },
      gallery: {
        on: {
          SEARCH: 'loading',
          SELECT_PHOTO: {
            target: 'photo',
            actions: 'setPhoto',
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
  },
  galleryMachineOptions
);

export default galleryMachine;