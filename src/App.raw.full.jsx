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
  const [isCanceled, setIsCanceled] = useState(false);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const booleanRef = useRef();

  useEffect(() => {
    booleanRef.current = {
      isLoading,
      isError,
      isCanceled,
      isPhotoMode
    };
  });

  function handleInput(e) {
    setQuery(e.target.value);
  }

  function handleSubmit(e) {
    if (booleanRef.current.isLoading) {
      return;
    }

    if(booleanRef.current.isPhotoMode) {
      return;
    }

    setIsError(false);
    setIsLoading(true);
    setIsCanceled(false);
    fetchDictWordsByTag(query)
      .then(res => {
        if (booleanRef.current.isCanceled) {
          return;
        }
        setIsLoading(false);
        setIsError(false);
        setItems(res.data || []);
      })
      .catch(err => {
        if (booleanRef.current.isCanceled) {
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
    setIsCanceled(true);
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
            <p className="desc">{photo.descriptions}</p>
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
