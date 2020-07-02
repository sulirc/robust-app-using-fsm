import React, { useState } from 'react';
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
  const [state, send] = useMachine(galleryMachine);
  const [query, setQuery] = useState('');

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
      <div className="form-container" data-testid="form-screen">
        <input
          data-testid="search-input"
          type="text"
          placeholder="Search For Words"
          onChange={handleInput}
        />
        <button
          data-testid="search-button"
          className={classNames('btn-search', {
            'is-loading': state.matches('loading'),
          })}
          onClick={handleSubmit}
        >
          {SEARCH_TEXT[state.value] || 'Search'}
        </button>
        {state.matches('loading') && (
          <button
            data-testid="cancel-button"
            className="btn-cancel"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>
      {state.matches('loading') && <p className="loading-spin">Loading...</p>}
      {state.matches('gallery') && (
        <div className="words-container">
          {state.context.items.map(item => (
            <div
              data-testid="word-card"
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
          <div
            data-testid="word-full-card"
            className="word-full-card"
            onClick={() => handleItemUnselect()}
          >
            <p className="title">{state.context.photo.title}</p>
            <p className="desc">{state.context.photo.description}</p>
          </div>
        </div>
      )}

      <p className="current-state">Current state: {state.value}</p>
    </div>
  );
}

export default App;
