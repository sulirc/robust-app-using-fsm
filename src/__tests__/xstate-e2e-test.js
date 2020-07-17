import 'expect-puppeteer';
import { Machine, assign } from 'xstate';
import { createModel } from '@xstate/test';
import { createFakeWord } from './util';

const FAKE_TAG = 'a';
const FAKE_DATA = [createFakeWord(), createFakeWord()];
const ERROR_MSG = 'Server error, please retry later';

// const galleryMachine = Machine(
//   {
//     id: 'gallery-demo',
//     initial: 'start',
//     context: {
//       items: [],
//       photo: {},
//       query: '',
//     },
//     states: {
//       start: {
//         on: {
//           SEARCH: {
//             target: 'loading',
//             actions: 'setQuery',
//           },
//         },
//         meta: {
//           test: async () => {
//             await page.click('input');
//             await page.type('[data-testid="search-input"]', FAKE_TAG);
//             await page.click('[data-testid="btn-search"]');
//           },
//         },
//       },
//       loading: {
//         invoke: {
//           id: 'fetchDictWordsByTag',
//           src: 'fetchService',
//           onDone: {
//             target: 'gallery',
//             actions: 'setItems',
//           },
//           onError: {
//             target: 'error',
//           },
//         },
//         on: {
//           CANCEL_SEARCH: [
//             { target: 'gallery', cond: ctx => ctx.items.length > 0 },
//             { target: 'start' },
//           ],
//         },
//         meta: {
//           test: async page => {},
//         },
//       },
//       error: {
//         on: {
//           SEARCH: {
//             target: 'loading',
//             actions: 'setQuery',
//           },
//         },
//         meta: {
//           test: async page => {},
//         },
//       },
//       gallery: {
//         on: {
//           SEARCH: {
//             target: 'loading',
//             actions: 'setQuery',
//           },
//           SELECT_PHOTO: {
//             target: 'photo',
//             actions: 'setPhoto',
//             cond: ctx => ctx.items.length > 0,
//           },
//         },
//         meta: {
//           test: async page => {},
//         },
//       },
//       photo: {
//         on: {
//           EXIT_PHOTO: {
//             target: 'mock-end-fake-{gallery}',
//             actions: 'unsetPhoto',
//           },
//         },
//         meta: {
//           test: async page => {},
//         },
//       },
//       // Force xstate test algo to test EXIT_PHOTO
//       'mock-end-fake-{gallery}': {},
//     },
//   },
//   {
//     actions: {
//       setQuery: assign({
//         query: (_, event) => event.query,
//       }),
//       setItems: assign({
//         items: (_, event) => event.data,
//       }),
//       setPhoto: assign({
//         photo: (_, event) => event.item,
//       }),
//       unsetPhoto: assign({
//         photo: () => ({}),
//       }),
//     },
//   }
// );

// const galleryModel = createModel(galleryMachine).withEvents({
//   SEARCH: {
//     exec: async page => {

//     },
//     // cases: [{type: 'SEARCH', query: FAKE_TAG }],
//   },
//   CANCEL_SEARCH: {
//     exec: async page => {},
//   },
//   'done.invoke.fetchDictWordsByTag': {
//     exec: async page => {},
//     // cases: [{ type: 'done.invoke.fetchDictWordsByTag', data: FAKE_DATA }],
//   },
//   'error.platform.fetchDictWordsByTag': {
//     exec: async page => {},
//     // cases: [{ type: 'error.platform.fetchDictWordsByTag', data: ERROR_MSG }],
//   },
//   SELECT_PHOTO: {
//     exec: async page => {},
//     // cases: [{ type: 'SELECT_PHOTO', item: FAKE_DATA[0] }],
//   },
//   EXIT_PHOTO: {
//     exec: async page => {},
//   },
// });

// describe('toggle', () => {
//   // getSimplePathPlans
//   // getShortestPathPlans
//   const testPlans = galleryModel.getSimplePathPlans();

//   beforeAll(async () => {
//     await page.goto('http://localhost:3000');
//   });

//   testPlans.forEach(plan => {
//     describe(plan.description, () => {
//       plan.paths.forEach(path => {
//         it(path.description, async () => {
//           await page.reload();
//           await path.test(page);
//         });
//       });
//     });
//   });

//   // it('should have full coverage', () => {
//   //   return galleryModel.testCoverage();
//   // });
// });
