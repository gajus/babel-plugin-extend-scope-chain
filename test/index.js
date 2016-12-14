// @flow

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

test('function declaration (program body): assigns id to a global', (t): void => {
  const actual = transform('function foo() {}');
  const expected = 'function foo() {} window.foo = foo';

  t.true(actual === expected);
});

test('variable declartion (program body) (without a value): removes the declaration', (t): void => {
  const actual = transform('var foo;');
  const expected = '';

  t.true(actual === expected);
});

test('variable declartion (program body) (without a value): replaces all reference paths (identifier)', (t): void => {
  const actual = transform('var foo; foo();');
  const expected = 'window.foo();';

  t.true(actual === expected);
});

test('variable declartion (program body) (without a value): replaces all reference paths (member expression)', (t): void => {
  const actual = transform('var foo; foo.bar();');
  const expected = 'window.foo.bar();';

  t.true(actual === expected);
});

test('variable declartion (program body) (with a value): replaces the declaration', (t): void => {
  const actual = transform('var foo = "bar";');
  const expected = 'window.foo = "bar"';

  t.true(actual === expected);
});

test('variable declartion (program body) (assignment expression): replaces the declaration', (t): void => {
  const actual = transform('var foo = bar = "baz";');
  const expected = 'window.foo = window.bar = "baz"';

  t.true(actual === expected);
});

test('global "foo" assignment expression', (t): void => {
  const actual = transform('foo = "bar";');
  const expected = 'window.foo = "bar";';

  t.true(actual === expected);
});

test('global "foo.bar" assignment expression', (t): void => {
  const actual = transform('foo.bar = "baz";');
  const expected = 'window.foo.bar = "baz";';

  t.true(actual === expected);
});

test('options.globals whitelist', (t): void => {
  const actual = transform('foo.bar = "baz";', {
    globals: [
      'foo'
    ]
  });
  const expected = 'foo.bar = "baz";';

  t.true(actual === expected);
});

test('options.export', (t): void => {
  const actual = transform('foo.bar = "baz";', {
    export: true,
    globals: [
      'foo'
    ]
  });
  const expected = 'module.exports = function () { foo.bar = "baz"; }';

  t.true(actual === expected);
});

test('options.export wraps non-expression statements', (t): void => {
  const actual = transform('var a = a || null', {
    export: true
  });
  const expected = 'module.exports = function () { window.a = window.a || null; }';

  t.true(actual === expected);
});
