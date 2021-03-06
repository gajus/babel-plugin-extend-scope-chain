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

### assignment in [program](https://github.com/babel/babel/tree/master/packages/babel-types#program) scope

Input:

```js
var foo = "bar";
```

Output:

```js
window.foo = "bar";
```

## Motivation

To bundle external scripts.

A specific use case for which this was developed is to bundle external
supply-side platform (SSP) scripts into the main script. This enables us
to decrease the amount of HTTP requests that are required to start
[header bidding](https://www.appnexus.com/en/publishers/header-bidding).

The problem is that all vendor scripts assume that the script is loaded asynchronously, using script tags, e.g.

```js
const scriptElement = document.createElement('script');
scriptElement.async = true;
scriptElement.src = '//script.js';
document.head.appendChild(scriptElement);
```

This assumption allows them to write code such as:

```js
var foo = foo || 'bar';
```

In the above example, if `foo` is not set, `window.foo` becomes `{}`.

We want to bundle and delay these script execution, i.e.

```js
function loadVendorFoo () {
  var foo = foo || 'bar';
}
```

The above code breaks, because now `foo` is isolated to `loadVendorFoo` scope, i.e. in the above code `foo` will always equal "bar".

Using this transpiler, we namespace all global variable declarations using `window` object, i.e. our script becomes:

```js
function loadVendorFoo () {
  var foo = window.foo = window.foo || 'bar';
}
```

## Configuration

|Name|Type|Description|Default|
|---|---|---|---|
|`globals`|`Array<string>`|Names of global variables that must not be namespaced.|`['window']`|
|`export`|`boolean`|Wraps the script body in a function and exports the function using `module.exports`.|`false`|
