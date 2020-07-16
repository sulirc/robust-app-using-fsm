/**
 * Integration test with xstate
 */
import React from 'react';
import user from '@testing-library/user-event';
import { Machine, assign } from 'xstate';
import { render, wait, act } from '@testing-library/react';
import { build, fake, sequence } from 'test-data-bot';
import { createModel } from '@xstate/test';
import { fetchDictWordsByTag } from '../utils';
import App from '../App.xstate';

const createFakeWord = build('words').fields({
  id: sequence(s => `card-${s}`),
  title: fake(f => f.lorem.word()),
  description: fake(f => f.lorem.sentence()),
});

const tag = 'a';
const data = [createFakeWord(), createFakeWord()];

jest.mock('../utils');

beforeEach(() => {
  fetchDictWordsByTag.mockResolvedValue(data);
});

afterEach(() => {
  jest.clearAllMocks();
});

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
        meta: {
          test: async ({ getByTestId }) => {
            expect(getByTestId('btn-search')).toHaveTextContent(/search$/i);
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
        meta: {
          test: async ({ getByText }) => {
            await wait(() => {
              expect(getByText(/loading\.\.\.$/i)).toBeInTheDocument();
            });
          },
        },
      },
      error: {
        on: {
          SEARCH: {
            target: 'loading',
            actions: 'setQuery',
          },
        },
        meta: {
          test: async ({ getByText }) => {
            expect(fetchDictWordsByTag).toHaveBeenCalledWith(tag);
            expect(fetchDictWordsByTag).toHaveBeenCalledTimes(1);

            await wait(() => {
              expect(getByText(/try search again/i)).toBeInTheDocument();
            });
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
            },
          },
        },
        meta: {
          test: async ({ getByTestId }) => {
            expect(fetchDictWordsByTag).toHaveBeenCalledWith(tag);
            expect(fetchDictWordsByTag).toHaveBeenCalledTimes(1);

            await wait(() => {
              expect(getByTestId('words-container')).toBeInTheDocument();
              expect(getByTestId('zoom-container')).not.toBeInTheDocument();
            });
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
        meta: {
          test: async ({ getByTestId }) => {
            await wait(() => {
              expect(getByTestId('words-container')).not.toBeInTheDocument();
              expect(getByTestId('zoom-container')).toBeInTheDocument();
            });
          },
        },
      },
    },
  },
  {
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
  }
);

// Create the model
const galleryModel = createModel(galleryMachine).withEvents({
  SEARCH: async ({ getByTestId }) => {
    const button = getByTestId('btn-search');
    const input = getByTestId('search-input');

    await user.type(input, tag);
    await act(async () => {
      user.click(button);
    });
  },
  CANCEL_SEARCH: async () => {},
  SELECT_PHOTO: async () => {},
  EXIT_PHOTO: async () => {},
  'done.invoke.fetchDictWordsByTag': {
    exec: async () => {},
    cases: [{ type: 'done.invoke.fetchDictWordsByTag', data }],
  },
  'error.platform.fetchDictWordsByTag': {
    exec: async () => {},
    cases: [
      {
        type: 'error.platform.fetchDictWordsByTag',
        data: 'Server error, please retry later',
      },
    ],
  },
});

// Create test plans and run the tests with coverage
describe('gallery app', () => {
  const testPlans = galleryModel.getShortestPathPlans();

  testPlans.forEach(plan => {
    plan.paths.forEach(path => {
      test(path.description, () => {
        const container = render(<App />);
        path.test(container);
      });
    });
  });

  // test('should have full coverage', () => {
  //   return galleryModel.testCoverage();
  // });
});
