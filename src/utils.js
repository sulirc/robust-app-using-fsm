import FakeDatabase from './fake-database';

const db = new FakeDatabase();

export function sleep(t = 1000) {
  return new Promise(r => setTimeout(r, t));
}

export async function fetchDictWordsByTag(tag, delay = 2000) {
  console.info(`Fetch words by tag: ${tag}; `, new Date())

  await sleep(delay);

  if (Math.random() > 0) {
    return db.get(tag);
    // return [{
    //   title: 'doggy',
    //   description: 'Hello doggy, u are qute',
    //   id: '#id'
    // }]
  } else {
    throw new Error('Server error, please retry later');
  }
}
