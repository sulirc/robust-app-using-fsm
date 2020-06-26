const DATABASE = {
  a: ['abandon', 'apple', 'appear', 'abide', 'able'],
  b: ['book', 'bread', 'beef'],
  c: ['card', 'cook', 'chicken']
};

export function sleep(t = 1000) {
  return new Promise(r => setTimeout(r, t));
}

export async function fetchDictWordsByTag(tag, delay = 1000) {
  await sleep(delay);

  // mock random error
  if (Math.random() > .3) {
    return { data: DATABASE[tag] };
  } else {
    throw new Error({ data: null, error: 'Server error, please retry later' })
  }
}