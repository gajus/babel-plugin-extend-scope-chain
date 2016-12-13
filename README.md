# babel-plugin-extend-scope-chain

[![NPM version](http://img.shields.io/npm/v/babel-plugin-extend-scope-chain.svg?style=flat-square)](https://www.npmjs.org/package/babel-plugin-extend-scope-chain)
[![Travis build status](http://img.shields.io/travis/gajus/babel-plugin-extend-scope-chain/master.svg?style=flat-square)](https://travis-ci.org/gajus/babel-plugin-extend-scope-chain)
[![js-canonical-style](https://img.shields.io/badge/code%20style-canonical-blue.svg?style=flat-square)](https://github.com/gajus/canonical)

Namespaces global variable declarations.

* [Example transpilations](#example-transpilations)
* [Motivation](#motivation)
* [Configuration](#configuration)

A lot like using [with statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/with) to add `window` expression to the scope chain, e.g. `with (window) { /* your script */ }`.

## Example transpilations

### global `foo` assignment expression

Input:

```js
foo = "bar";
```

Output:

```js
window.foo = "bar";
```

### global `foo.bar` assignment expression

Input:

```js
foo.bar = "bar";
```

Output:

```js
window.foo.bar = "bar";
```

### assignment in [file](https://github.com/babel/babel/tree/master/packages/babel-types#file) scope

Input:

```js
var foo = "bar";
```

Output:

```js
var foo = window.foo = "bar";
```

## Configuration

|Name|Type|Description|Default|
|---|---|---|---|
|`globals`|`Array<string>`|Names of global variables that must not be namespaced.|`['window']`|
|`export`|`boolean`|Wraps the script body in a function and exports the function using `module.exports`.|`false`|
