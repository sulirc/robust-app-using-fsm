import { build, fake, sequence } from 'test-data-bot';

export const createFakeWord = build('words').fields({
  id: sequence(s => `FAKE_CARD_ID_${s}`),
  title: fake(f => f.lorem.word()),
  description: fake(f => f.lorem.sentence()),
});
