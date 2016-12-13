import test from 'ava';
import {
  transform as nativeTransform
} from 'babel-core';
import plugin from '../src';

const transform = (code, options = {}, filename = 'unset.js') => {
  return nativeTransform(code, {
    babelrc: false,
    filename,
    plugins: [
      [
        plugin,
        options
      ]
    ]
  }).code.replace(/\n/g, ' ').replace(/\s+/g, ' ');
};

test('global "foo" assignment expression', (t) => {
  const actual = transform('foo = "bar";');
  const expected = 'window.foo = "bar";';

  t.true(actual === expected);
});

test('global "foo.bar" assignment expression', (t) => {
  const actual = transform('foo.bar = "baz";');
  const expected = 'window.foo.bar = "baz";';

  t.true(actual === expected);
});

test('options.globals whitelist', (t) => {
  const actual = transform('foo.bar = "baz";', {
    globals: [
      'foo'
    ]
  });
  const expected = 'foo.bar = "baz";';

  t.true(actual === expected);
});

test('assignment in file scope', (t) => {
  const actual = transform('var foo = "bar";');
  const expected = 'var foo = window.foo = "bar";';

  t.true(actual === expected);
});

test('options.export', (t) => {
  const actual = transform('foo.bar = "baz";', {
    export: true,
    globals: [
      'foo'
    ]
  });
  const expected = 'module.exports = function () { foo.bar = "baz"; }';

  t.true(actual === expected);
});
