# The Djinn language

Djinn is a programming language designed to code videogames.

A "Hello, World!" program in Djinn looks like this:

```
PROGRAM hello
BEGIN
    print("hello")
END
```

## Basics

### Comments

Comments in Djinn are created with the `#` character.

```
# this is a comment
2 + 2 # adds numbers
```

### Identifiers

Identifiers are used to name functions, variables, etc. An identifier can be made from the characters `a-z`, `ç`, `ñ`, `_` and digits. They must begin with an alphabetic character.

Some **valid** identifiers are: `health`, `bad_guy3`, `caçaha`, `piñata`. Some **invalid** identifier examples are: `_life`, `3a`, `日本`.

### The program block

All Djinn programs must have one –and only one– program block. It has the syntax:

```
PROGRAM <id>
BEGIN
    <sentences>
END
```

### Variables

Djinn is a **static** languages. Variables and constants are **typed** and must be declared before their use.

#### Declaring variables and constants

Syntax:

```
<basic type> <id>
<basic type> <id> = <expression>
CONST <basic type> <id> = <expression>
```

Examples:

```
INT an_integer_var
STR some_string = "waka waka"
CONST FLOAT PI = 3.141592
```

#### Simple types

- `int`: integer numbers
- `float`: floating point numbers
- `str`: text strings

### Scope

TODO
