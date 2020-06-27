import React, { useState } from 'react';
import useEventCallback from './useEventCallback';
import classNames from 'classnames';
import { fetchDictWordsByTag } from './utils';
import './App.css';

const galleryMachine = {
  start: {
    SEARCH: 'loading',
  },
  loading: {
    SEARCH_SUCCESS: 'gallery',
    SEARCH_FAILURE: 'error',
    CANCEL_SEARCH: 'gallery',
  },
  error: {
    SEARCH: 'loading',
  },
  gallery: {
    SEARCH: 'loading',
    SELECT_PHOTO: 'photo',
  },
  photo: {
    EXIT_PHOTO: 'gallery',
  },
};

function App() {
  const SEARCH_TEXT = {
    loading: 'Searching...',
    error: 'Try search again',
    start: 'Search',
  };
  const [galleryState, setGalleryState] = useState('start');
  const [query, setQuery] = useState('');
  const [context, setContext] = useState({
    items: [],
  });

  function send(nextState, action) {
    switch (nextState) {
      case 'loading':
        search(action.query);
        break;
      case 'gallery':
        if (action.items) {
          return { items: action.items };
        }
        break;
      case 'photo':
        if (action.item) {
          return { photo: action.item };
        }
        break;
      default:
        break;
    }
  }

  const transition = useEventCallback(
    action => {
      const currentGalleryState = galleryState;
      const nextGalleryState = galleryMachine[currentGalleryState][action.type];
      if (nextGalleryState) {
        const nextContext = send(nextGalleryState, action);
        setGalleryState(nextGalleryState);
        setContext({
          ...context,
          ...nextContext,
        });
      }
    },
    [galleryState]
  );

  function search(tag) {
    fetchDictWordsByTag(tag)
      .then(res => {
        transition({ type: 'SEARCH_SUCCESS', items: res.data });
      })
      .catch(err => {
        transition({ type: 'SEARCH_FAILURE' });
      });
  }

  function handleCancel(e) {
    transition({ type: 'CANCEL_SEARCH' });
  }

  function handleSubmit(e) {
    e.persist();
    e.preventDefault();
    transition({ type: 'SEARCH', query });
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
            'is-loading': galleryState === 'loading',
          })}
          onClick={handleSubmit}
        >
          {SEARCH_TEXT[galleryState] || 'Search'}
        </button>
        {galleryState === 'loading' && (
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
      {galleryState === 'loading' && <p className="loading-spin">Loading...</p>}
      <div className="words-container">
        {context.items.map(item => (
          <div className="word-card" key={item.id}>
            {item.title}
          </div>
        ))}
      </div>

      <p className="current-state">Current state: {galleryState}</p>
    </div>
  );
}

export default App;
