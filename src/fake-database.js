export default class FakeDatabase {
  constructor() {
    this.db = Object.create(null);
    this.create();
  }

  createRandomId() {
    return Math.random().toString(16).slice(2, 10);
  }

  queryMore(array) {
    return array.map(a => ({
      title: a,
      description: 'Browser extensions give people a way to take control of how they experience the web. This week Apple has announced that Safari is adopting a web-based API for browser extensions similar to Firefox’s WebExtensions API, making it easy to build once and run in multiple browsers. Developers can get started',
      id: this.createRandomId()
    }))
  }

  create() {
    const data = {
      a: ['abandon', 'apple', 'appear', 'abide', 'able'],
      b: ['book', 'bread', 'beef'],
      c: ['card', 'cook', 'chicken'],
      d: ['dog', 'dock', 'dragon', 'direct', 'distance'],
      _: ['default']
    };

    Object.keys(data).forEach(key => {
      data[key] = this.queryMore(data[key]);
    });

    this.db = data;
  }

  get(key) {
    return this.db[key] || this.db['_'];
  }
}