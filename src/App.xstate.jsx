import React, { useState, useEffect } from 'react';
import { useMachine } from '@xstate/react';
import galleryMachine from './galleryMachine';
import classNames from 'classnames';
import './App.css';

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
