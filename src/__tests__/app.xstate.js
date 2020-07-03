

// import React from 'react';
// import App from '../App.xstate';
// import { render, fireEvent, cleanup, waitFor } from '@testing-library/react';
// import { Machine, assign } from 'xstate';
// import { createModel } from '@xstate/test';

// describe('gallery app', () => {
//   const options = {
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
//   };

//   const galleryMachine = Machine({
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
//         // meta: {
//         //   test: ({ getByTestId }) => {
//         //     // assert.ok(getByTestId('search-input').value === 'd');
//         //   }
//         // }
//       },
//       loading: {
//         invoke: {
//           id: 'fetchDictWordsByTag',
//           src: (context, event) => Promise.resolve([{
//             title: 'doggy',
//             description: 'Hello doggy, u are qute',
//             id: '#id'
//           }]),
//           onDone: {
//             target: 'gallery',
//             actions: 'setItems',
//           },
//           onError: {
//             target: 'error',
//           },
//         },
//         on: {
//           CANCEL_SEARCH: 'gallery',
//         },
//         // meta: {
//         //   test: ({ getByTestId }) => {
//         //     assert.ok(getByTestId('form-screen'));
//         //   }
//         // }
//       },
//       error: {
//         on: {
//           SEARCH: {
//             target: 'loading',
//             actions: 'setQuery',
//           },
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
//           },
//         },
//       },
//       photo: {
//         on: {
//           EXIT_PHOTO: {
//             target: 'gallery',
//             actions: 'unsetPhoto',
//           },
//         },
//       },
//     },
//   }, options);

//   const testModel = createModel(galleryMachine, {
//     events: {
//       SEARCH: {
//         exec: async ({ getByTestId }, event) => {
//           fireEvent.change(getByTestId('search-input'), {
//             target: { value: 'a' }
//           });
//           fireEvent.click(getByTestId('search-button'));
//         },
//         // cases: [{
//         //   query: 'a'
//         // }]
//       },
//       'done.invoke.fetchDictWordsByTag': {
//         cases: [{
//           data: [{
//             title: 'doggy',
//             description: 'Hello doggy, u are qute',
//             id: '#id'
//           }]
//         }]
//       },
//       'error.platform.fetchDictWordsByTag': {
//         cases: [{
//           data: null
//         }]
//       },
//       CANCEL_SEARCH: async ({ getByTestId }) => {
//         fireEvent.click(getByTestId('cancel-button'));
//       },
//       SELECT_PHOTO: async ({ getByTestId, getAllByTestId }) => {
//         await waitFor(() => {
//           return expect(getByTestId('word-card')).toBeInTheDocument();
//         })
//         fireEvent.click(getByTestId('word-card'));
//       },
//       EXIT_PHOTO: async ({ getByTestId }) => {
//         fireEvent.click(getByTestId('word-full-card'));
//       }
//     }
//   });

//   const testPlans = testModel.getSimplePathPlans();

//   testPlans.forEach(plan => {
//     describe(plan.description, () => {
//       afterEach(cleanup);

//       plan.paths.forEach(path => {
//         it(path.description, () => {
//           const rendered = render(<App />);
//           return path.test(rendered);
//         });
//       });
//     });
//   });

//   // it('coverage', () => {
//   //   testModel.testCoverage();
//   // });
// })