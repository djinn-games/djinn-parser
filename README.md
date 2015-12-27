# djinn-parser

Compiler for [Djinn](https://github.com/djinn-games).

## Usage

This Node module is meant to be consumed by a Djinn VM, such as [djinn-player](https://github.com/djinn-games/djinn-player).

```
var DjinnCompiler = require('djinn-parser');

let compiler = new DjinnCompiler();
compiler.compile(
`PROGRAM hello
BEGIN
  log("Hello World")
END`
);
```

## The syntactic parser

A parser from Djinn code to Djinn AST is included in `lib/parser`. It is both a module, and a runner.

To run the parser, you need to pipe the source code into `stdin`. For instance, to parse an existing program file:

```
cat hello.prg | node lib/parser/index.js
```

Or you can just fill `stdin` yourself:

```
node lib/parser/index.js <<EOF
PROGRAM hello
BEGIN
END
EOF
```

## The semantic analyzer and translator

The `Translator` module semantically analyzes the Djinn AST generated by the parser and outputs JavaScript code to be consumed by a Djinn VM.

You can consume this as a module, or run it from the console.

```
cat hello.prg | node lib/parser/index.js | node lib/translator/index.js
```

## Development

### Testing

Run:

```
npm test
```

If you do changes to the parser and/or the translator, you will have to reset the test fixtures. You can do that by running:

```
npm run fixtures
```

You can also only reset the fixtures of a specific component:

```
npm run fixtures:parser
npm run fixtures:translator
```
