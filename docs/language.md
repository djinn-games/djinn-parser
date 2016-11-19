# The Djinn language

Djinn is a programming language designed to code videogames.

A "Hello, World!" program in Djinn looks like this:

```
PROGRAM hello
BEGIN
    log("hello")
END
```

Djinn is a **case insensitive** language. This means that the following code would be equivalent to the previous example:

```
program hello
begin
    log("hello")
end
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

Since Djinn is a **case insensitive** language, all `radius`, `Radius`, `RaDiUS` would refer to the same thing.

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
6 | `=` | Assignment | any | any | Right-to-left


### Variables and constants

Djinn is a **static** language. Variables and constants are **typed** and must be declared before their use.

The **difference between variables and constants** is that constants must be initialised with a value, and this value will be immutable. Variables, on the other hand, can change their value after being declared.

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

Variables do not need to be initialised when declared. If so, a **default value** will be assigned to them:

- `int` and `float`: `0`
- `str`: `""` (empty string)
- `bool`: `false`

After being declared, variables and constants can be used in expressions by referring to their name. Examples:

```
2 * PI * radius
```

Variables can also have their value modified by using the **assignment operator** `=`. Examples:

```
radius = 5
```

## Sentences

### Conditional sentences

<!--
### Scope
TODO -->
