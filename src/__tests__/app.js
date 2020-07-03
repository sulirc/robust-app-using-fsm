/**
 * Integration test
 */

import React from 'react';
import App from '../App.xstate';
import { render } from '@testing-library/react';

test('App should render search `input` & `button`', () => {
  const { getByText, getByPlaceholderText } = render(<App />);

  expect(getByText(/search/i)).toBeInTheDocument();
  expect(getByPlaceholderText(/Search words by ur tags/i)).toBeInTheDocument();
});