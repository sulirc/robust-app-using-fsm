import React, { useState } from 'react';
import SearchInput from './components/SearchInput';
import { fetchPhotosByTags } from './utils';
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
  const [galleryState, setGalleryState] = useState('gallery');
  // const [query, setQuery] = useState('');
  const [context, setContext] = useState({
    items: [],
    query: '',
  });

  function transition(action) {
    const currentGalleryState = galleryState;
    const nextGalleryState = galleryMachine[currentGalleryState][action.type];

    if (nextGalleryState) {
      const nextContext = service(nextGalleryState, action);
      setGalleryState(nextGalleryState);
      setContext({
        ...context,
        ...nextContext,
      });
    }
  }

  function service(nextState, action) {
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

  function search(query) {
    const encodedQuery = encodeURIComponent(query);

    setTimeout(() => {
      fetchPhotosByTags(encodedQuery)
        .then(data => {
          transition({ type: 'SEARCH_SUCCESS', items: data.items });
        })
        .catch(error => {
          transition({ type: 'SEARCH_FAILURE', error });
        });
    }, 1000);
  }

  return (
    <div className="App">
      <div className="form-container">
        <SearchInput
          onSearch={text => {
            transition({
              type: 'SEARCH',
              query: text,
            });
          }}
        />
      </div>
      <div className="gallery-container">

      </div>
    </div>
  );
}

export default App;
