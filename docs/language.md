# The Djinn language

Djinn is a programming language designed to code videogames.

A "Hello, World!" program in Djinn looks like this:

```
PROGRAM hello
BEGIN
    log("hello")
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

### Data types

Simple data types:

- `int`: integer numbers
- `float`: floating point numbers
- `str`: text strings
- `bool`: booleans (`true` or `false`)

### Operators

Djinn features the following operators. The lower the precedence in the chart, the more precedence that operator has. Precedence can be modified by the use of parentheses.

```
2 + 3 * 4   # -> 14
(2 + 3) * 4 # -> 20
```

Precedence | Operator | Description | Input type/s | Returns type | Associativity
--|--|--|--|--|--
1 | `!` | Unary not | `bool` | `bool` | Left-to-right
1 | `+`, `-` | Unary plus/minus sign | `int`, `float` | `int`, `float` | Left-to-right
2 | `*`, `/`| Multiplication and division | `int`, `float` | `int`, `float` | Left-to-right
2 | `%`/`MOD` | Modulus | `int` | `int` | Left-to-right
3 | `+`, `-` | Addition and subtraction | `int`, `float` | `int`, `float` | Left-to-right
3 | `+` | String concatenation | `str` and any | `str` | Left-to-right
4 | `<`, `>` | Relational lower and greater | `int`, `float` | `bool` | Left-to-right
4 | `<=`, `>=` | Relational lower/greater or equal | `int`, `float` | `bool` | Left-to-right
4 | `==`, `!=` | Relational equality or inequality | `int`, `float` | `bool` | Left-to-right
5 | `&&`/`AND`, <code>&#124;&#124;</code>/`OR` | Logical AND and OR | `bool` | `bool` | Left-to-right


<!--

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

### Scope

TODO -->
