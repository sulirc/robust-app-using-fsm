class Database {
  constructor() {
    this.db = Object.create(null);
    this.create();
  }

  mapWithId(array) {
    return array.map(a => ({
      title: a,
      id: createId()
    }))
  }

  create() {
    const data = {
      a: ['abandon', 'apple', 'appear', 'abide', 'able'],
      b: ['book', 'bread', 'beef'],
      c: ['card', 'cook', 'chicken'],
      d: ['dog', 'dock', 'dragon', 'direct', 'distance'],
      // default
      _: ['default']
    };

    Object.keys(data).forEach(key => {
      data[key] = this.mapWithId(data[key]);
    });

    this.db = data;
  }

  get(key) {
    return this.db[key] || this.db['_'];
  }
}

const DATABASE = new Database();

export function createId() {
  return Math.random().toString(16).slice(2, 10);
}

export function sleep(t = 1000) {
  return new Promise(r => setTimeout(r, t));
}

function isServerNormal() {
  return Math.random() > .5;
}

export async function fetchDictWordsByTag(tag, delay = 2000) {
  console.info('try fetching...', new Date())
  await sleep(delay);

  if (isServerNormal()) {
    return { data: DATABASE.get(tag) };
  } else {
    throw new Error('Server error, please retry later');
  }
}
