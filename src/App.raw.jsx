import React, { useState } from 'react';
import classNames from 'classnames';
import { fetchDictWordsByTag } from './utils';
import './App.css';

function RawApp() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  function handleInput(e) {
    setQuery(e.target.value);
  }

  function handleSubmit(e) {
    e.persist();
    e.preventDefault();

    setIsError(false);
    setIsLoading(true);
    fetchDictWordsByTag(query)
      .then(res => {
        setIsLoading(false);
        setItems(res.data || []);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
        setIsError(true);
      });
  }

  return (
    <div className="app">
      <div className="form-container">
        <input
          type="text"
          placeholder="Search For Words"
          onChange={handleInput}
        />
        {isError ? (
          <button className="btn-search" onClick={handleSubmit}>
            Try search again
          </button>
        ) : (
          <button
            className={classNames('btn-search', {
              'is-loading': isLoading,
            })}
            onClick={handleSubmit}
          >
            { isLoading ? 'Searching...' : 'Search' }
          </button>
        )}
      </div>
      {isLoading && <p className="loading-spin">Loading...</p>}
      <div className="words-container">
        {items.map(item => (
          <div className="word-card" key={item.id}>
            {item.title}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RawApp;
