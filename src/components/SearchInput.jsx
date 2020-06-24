import React, { useState } from 'react';
import { Paper, InputBase, IconButton } from '@material-ui/core';
import { ImageSearch } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 800,
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
}));

export default function SearchInput({ onSearch }) {
  const [text, setText] = useState('');
  const classes = useStyles();
  const handleSearch = () => {
    onSearch && onSearch(text);
  };

  return (
    <Paper component="form" className={classes.root}>
      <InputBase
        fullWidth
        className={classes.input}
        placeholder="Search For Photos"
        inputProps={{ 'aria-label': 'search for photos' }}
        onChange={e => {
          setText(e.target.value);
        }}
      />
      <IconButton
        type="submit"
        className={classes.iconButton}
        aria-label="search"
        onClick={handleSearch}
      >
        <ImageSearch />
      </IconButton>
    </Paper>
  );
}
