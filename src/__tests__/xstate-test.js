/**
 * Integration test with xstate
 */
import React from 'react';
import user from '@testing-library/user-event';
import { Machine, assign } from 'xstate';
import { render, wait, act, cleanup } from '@testing-library/react';
import { build, fake, sequence } from 'test-data-bot';
import { createModel } from '@xstate/test';
import { fetchDictWordsByTag as mockFetchDictWorksByTag } from '../utils';
import App from '../App.xstate';
import fs from 'fs';

const createFakeWord = build('words').fields({
  id: sequence(s => `FAKE_CARD_ID_${s}`),
  title: fake(f => f.lorem.word()),
  description: fake(f => f.lorem.sentence()),
});

const FAKE_TAG = 'FAKE_TAG_NAME';
const FAKE_DATA = [createFakeWord(), createFakeWord()];
const ERROR_MSG = 'Server error, please retry later';

jest.mock('../utils');

beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.clearAllMocks();
  console.log.mockRestore();
  cleanup();
});

let galleryMachine = Machine(
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
          src: 'fetchService',
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
            expect(mockFetchDictWorksByTag).toHaveBeenCalledWith(FAKE_TAG);

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
            cond: ctx => ctx.items.length > 0,
          },
        },
        meta: {
          test: async ({ getByTestId }) => {
            expect(mockFetchDictWorksByTag).toHaveBeenCalledWith(FAKE_TAG);

            await wait(() => {
              expect(getByTestId('words-container')).toBeInTheDocument();
            });
          },
        },
      },
      photo: {
        on: {
          EXIT_PHOTO: {
            target: 'mock-end-fake-{gallery}',
            actions: 'unsetPhoto',
          },
        },
        meta: {
          test: async ({ getByTestId }) => {
            await wait(() => {
              expect(getByTestId('zoom-container')).toBeInTheDocument();
            });
          },
        },
      },
      // Force xstate test algo to test EXIT_PHOTO
      'mock-end-fake-{gallery}': {},
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

const galleryModel = createModel(galleryMachine).withEvents({
  SEARCH: {
    exec: async ({ getByTestId }) => {
      const button = getByTestId('btn-search');
      const input = getByTestId('search-input');

      await act(async () => {
        await user.type(input, FAKE_TAG);
        user.click(button);
      });
    },
    cases: [
      {
        type: 'SEARCH',
        query: FAKE_TAG,
      },
    ],
  },
  CANCEL_SEARCH: {
    exec: async ({ getByTestId }) => {
      const button = getByTestId('btn-cancel');

      await act(async () => {
        user.click(button);
      });
    },
  },
  'done.invoke.fetchDictWordsByTag': {
    exec: () => {},
    cases: [{ type: 'done.invoke.fetchDictWordsByTag', data: FAKE_DATA }],
  },
  'error.platform.fetchDictWordsByTag': {
    exec: () => {},
    cases: [{ type: 'error.platform.fetchDictWordsByTag', data: ERROR_MSG }],
  },
  SELECT_PHOTO: {
    exec: async ({ getByTestId }) => {
      const container = getByTestId('words-container');

      await act(async () => {
        user.click(container.children[0]);
      });
    },
    cases: [{ type: 'SELECT_PHOTO', item: FAKE_DATA[0] }],
  },
  EXIT_PHOTO: {
    exec: async ({ getByTestId }) => {
      const container = getByTestId('zoom-container');

      await act(async () => {
        user.click(container.children[0]);
      });
    },
  },
});

describe('gallery app', () => {
  // getSimplePathPlans
  // getShortestPathPlans
  const testPlans = galleryModel.getSimplePathPlans();

  testPlans.forEach(plan => {
    plan.paths.forEach(path => {
      it(path.description, async () => {
        let mock = 0;
        const { loadingStates, events } = getMockResultByFuturePath(path);
        mockFetchDictWorksByTag.mockImplementation(() => {
          return new Promise((resolve, reject) => {
            // Delay for display loading UI
            setTimeout(() => {
              try {
                const type = events[loadingStates[mock++].index];
                if (type === 'error.platform.fetchDictWordsByTag') {
                  reject(null);
                } else {
                  resolve(FAKE_DATA);
                }
              } catch {
                resolve(FAKE_DATA);
              }
            }, 100);
          });
        });

        const container = render(<App />);
        await path.test(container);
      });
    });
  });

  it('should have full coverage', () => {
    // console.info('coverage details:\n', galleryModel.getCoverage());
    return galleryModel.testCoverage({
      filter: stateNode => !!stateNode.meta,
    });
  });
});

function getMockResultByFuturePath(path) {
  const loadingStates = path.segments
    .map((segment, i) => {
      const v = segment.state.value;
      if (v === 'loading') {
        return { value: v, index: i };
      }
    })
    .filter(Boolean);
  const events = path.segments.map(s => s.event.type);
  return { loadingStates, events };
}
