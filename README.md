# djinn-parser

Compiler for [Djinn](https://github.com/djinn-games).

## Usage

### Run the parser

A parser from source to AST is included in `lib/parser`. It is both a module, and a runner.

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

## Testing

Run:

```
npm test
```
