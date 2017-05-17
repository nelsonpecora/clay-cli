const lib = require('./config'),
  config = require('home-config');

describe('rest', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(config, 'load');
  });

  afterEach(() => {
    sandbox.restore();
    // reset env variables
    delete process.env.CLAY_DEFAULT_KEY;
    delete process.env.CLAY_DEFAULT_SITE;
  });

  describe('get', () => {
    const fn = lib.get;

    it('throws error if unknown section', () => {
      config.load.returns({});
      expect(() => fn('foo.bar')).to.throw('Cannot get foo.bar: Unknown section "foo"');
    });

    it('returns null if undefined value', () => {
      config.load.returns({ keys: {} });
      expect(fn('keys.foo')).to.equal(null);
    });

    it('gets keys', () => {
      config.load.returns({ keys: { foo: 'bar' }});
      expect(fn('keys.foo')).to.equal('bar');
    });

    it('gets sites', () => {
      config.load.returns({ sites: { foo: 'bar' }});
      expect(fn('sites.foo')).to.equal('bar');
    });
  });

  describe('set', () => {
    const fn = lib.set;

    it('throws error if unknown section', () => {
      config.load.returns({});
      expect(() => fn('foo.bar')).to.throw('Cannot save foo.bar: Unknown section "foo"');
    });

    it('saves keys', () => {
      config.load.returns({ keys: {}, save: sandbox.spy() });
      fn('keys.foo', 'bar');
      expect(config.load().save).to.have.been.called;
    });

    it('saves sites', () => {
      config.load.returns({ sites: {}, save: sandbox.spy() });
      fn('sites.foo', 'bar');
      expect(config.load().save).to.have.been.called;
    });
  });

  describe('getKey', () => {
    const fn = lib.getKey;

    it('gets key from config', () => {
      config.load.returns({ keys: { foo: 'bar' }});
      expect(fn('foo')).to.equal('bar');
    });

    it('passes through key if not in config', () => {
      config.load.returns({ keys: {}});
      expect(fn('foo')).to.equal('foo');
    });

    it('gets key from default env variable', () => {
      process.env.CLAY_DEFAULT_KEY = 'foo';
      expect(fn()).to.equal('foo');
    });

    it('returns null if no default env variable', () => {
      // no env variable set
      expect(fn()).to.equal(null);
    });
  });

  describe('getSite', () => {
    const fn = lib.getSite;

    it('gets site from config', () => {
      config.load.returns({ sites: { foo: 'http://domain.com' }});
      expect(fn('foo')).to.equal('http://domain.com');
    });

    it('passes through site if not in config', () => {
      config.load.returns({ sites: {}});
      expect(fn('http://domain.com')).to.equal('http://domain.com');
    });

    it('gets site from default env variable', () => {
      process.env.CLAY_DEFAULT_SITE = 'http://domain.com';
      expect(fn()).to.equal('http://domain.com');
    });

    it('returns null if no default env variable', () => {
      // no env variable set
      expect(fn()).to.equal(null);
    });

    it('normalizes site protocol from config', () => {
      config.load.returns({ sites: {
        ssl: 'https://domain.com',
        antipattern: '//domain.com',
        domain: 'domain.com',
        local: 'localhost'
      }});
      expect(fn('ssl')).to.equal('https://domain.com');
      expect(fn('antipattern')).to.equal('http://domain.com');
      expect(fn('domain')).to.equal('http://domain.com');
      expect(fn('local')).to.equal('http://localhost');
    });

    it('normalizes site trailing slash from config', () => {
      config.load.returns({ sites: {
        withslash: 'http://domain.com/',
        noslash: 'http://domain.com'
      }});
      expect(fn('withslash')).to.equal('http://domain.com');
      expect(fn('noslash')).to.equal('http://domain.com');
    });
  });
});