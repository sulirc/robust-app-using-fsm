import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { Machine, assign } from 'xstate';
import classNames from 'classnames';
import { fetchDictWordsByTag } from './utils';
import './App.css';

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

function App() {
  const SEARCH_TEXT = {
    loading: 'Searching...',
    error: 'Try search again',
    start: 'Search',
  };
  const [state, send, service] = useMachine(galleryMachine);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const subscription = service.subscribe(state => {
      console.log('subscribing gallery state: ', state.value);
    });

    return subscription.unsubscribe;
  }, [service]);

  function handleCancel(e) {
    send('CANCEL_SEARCH');
  }

  function handleSubmit(e) {
    send({
      type: 'SEARCH',
      query,
    });
  }

  function handleItemSelect(item) {
    send({
      type: 'SELECT_PHOTO',
      item,
    });
  }

  function handleItemUnselect() {
    send('EXIT_PHOTO');
  }

  function handleInput(e) {
    setQuery(e.target.value);
  }

  return (
    <div className="App">
      <div className="form-container">
        <input
          type="text"
          placeholder="Search For Words"
          onChange={handleInput}
        />
        <button
          className={classNames('btn-search', {
            'is-loading': state.matches('loading'),
          })}
          onClick={handleSubmit}
        >
          {SEARCH_TEXT[state.value] || 'Search'}
        </button>
        {state.matches('loading') && (
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
      {state.matches('loading') && <p className="loading-spin">Loading...</p>}
      {state.matches('gallery') && (
        <div className="words-container">
          {state.context.items.map(item => (
            <div
              className="word-card"
              key={item.id}
              onClick={() => handleItemSelect(item)}
            >
              {item.title}
            </div>
          ))}
        </div>
      )}
      {state.matches('photo') && (
        <div className="zoom-container">
          <div className="word-full-card" onClick={() => handleItemUnselect()}>
            <p className="title">{state.context.photo.title}</p>
            <p className="desc">{state.context.photo.descriptions}</p>
          </div>
        </div>
      )}

      <p className="current-state">Current state: {state.value}</p>
    </div>
  );
}

export default App;
