import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { fetchDictWordsByTag } from './utils';
import './App.css';

function RawFullApp() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [photo, setPhoto] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const booleanRef = useRef();

  useEffect(() => {
    booleanRef.current = {
      isLoading,
      isError,
      isCancelled,
      isPhotoMode,
    };
  });

  function handleInput(e) {
    setQuery(e.target.value);
  }

  function handleSubmit(e) {
    if (booleanRef.current.isLoading) {
      return;
    }

    if (booleanRef.current.isPhotoMode) {
      return;
    }

    setIsError(false);
    setIsLoading(true);
    setIsCancelled(false);
    fetchDictWordsByTag(query)
      .then(data => {
        if (booleanRef.current.isCancelled) {
          return;
        }
        setIsLoading(false);
        setIsError(false);
        setItems(data);
      })
      .catch(err => {
        if (booleanRef.current.isCancelled) {
          return;
        }
        console.error(err);
        setIsLoading(false);
        setIsError(true);
      });
  }

  function handleCancel(e) {
    setIsError(false);
    setIsLoading(false);
    setIsCancelled(true);
  }

  function handleItemSelect(item) {
    setPhoto(item);
    setIsPhotoMode(true);
  }

  function handleItemUnselect() {
    setPhoto({});
    setIsPhotoMode(false);
  }

  return (
    <div className="app">
      <div className="form-container">
        <input
          type="text"
          placeholder="Search words by ur tags"
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
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        )}
        {isLoading && (
          <button className="btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>
      {isLoading && <p className="loading-spin">Loading...</p>}

      {isPhotoMode ? (
        <div className="zoom-container">
          <div className="word-full-card" onClick={() => handleItemUnselect()}>
            <p className="title">{photo.title}</p>
            <p className="desc">{photo.description}</p>
          </div>
        </div>
      ) : (
        <div className="words-container">
          {items.map(item => (
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
    </div>
  );
}

export default RawFullApp;
