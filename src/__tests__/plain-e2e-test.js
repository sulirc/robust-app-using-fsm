import 'expect-puppeteer';
import { Machine, assign } from 'xstate';
import { createModel } from '@xstate/test';
import { createFakeWord } from './util';

const FAKE_TAG = 'a';
const FAKE_DATA = [createFakeWord(), createFakeWord()];
const ERROR_MSG = 'Server error, please retry later';

describe('Gallery App', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
  });

  it('should display "google" text on page', async () => {
    await page.type('[data-testid="search-input"]', FAKE_TAG);
    await page.click('[data-testid="btn-search"]');
  });
});
