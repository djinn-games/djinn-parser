/*
Heavily inspired by div2js grammar at
https://github.com/delapuente/div2js/blob/master/src/grammar.y
*/

%{
function uopExpr(op, right) {
    return {
        type: 'OperationExpression',
        right: right,
        operator: op
    };
}

function bopExpr(op, left, right) {
    return {
        type: 'OperationExpression',
        left: left,
        right: right,
        operator: op
    };
}
%}

%lex
%options case-insensitive

ALPHA   [a-zñç]
DIGIT   [0-9]
NAME    [a-zñç][0-9a-zñc_]*
QUOTE   [\"]

%%

'#'.*[^(\r?\n)]*    { /* ignore comments */ }
[' '\t]+            { /* ignore whitespace */ }
(\r?\n)             { return 'EOL'; }
<<EOF>>             { return 'EOF'; }

'BEGIN'             { return 'BEGIN'; }
'END'               { return 'END'; }
'false'             { return 'FALSE'; }
'PROGRAM'           { return 'PROGRAM'; }
'true'              { return 'TRUE'; }

'+'                 { return '+'; }
'-'                 { return '-'; }
'*'                 { return '*'; }
'/'                 { return '/'; }
'%'                 { return '%'; }
'MOD'               { return '%'; }

','                 { return ','; }
'('                 { return '('; }
')'                 { return ')'; }

{NAME}                                  { return 'NAME'; }
({QUOTE}{QUOTE})|({QUOTE}.*?{QUOTE})    { return 'STRING_LITERAL'; }
{DIGIT}+\.{DIGIT}+                      { return 'FLOAT_LITERAL'; }
{DIGIT}+                                { return 'INT_LITERAL'; }

/lex

// operators sorted by priority from bottom to top
%left '+' '-'
%left '*' '/' '%'
%left UOP // see http://dinosaur.compilertools.net/bison/bison_8.html

%start program_unit

%%

air
    : /* nothing at all */
    | air EOL
    ;

id
    : NAME
    {
        $$ = {
            type: 'Identifier',
            name: $1,
            line: @1.first_line
        }
    }
    ;

program_unit
    : air program air EOF {
        $$ = $2;
        return $$;
    }
    ;

program
    : PROGRAM id EOL air body
    {
        $$ = {
            type: 'Program',
            name: $2,
            body: $5,
            line: @1.first_line
        };
    }
    ;

body
    : BEGIN EOL sentence_list END
    {
        $$ = {
            type: 'Body',
            sentences: $3,
            line: @1.first_line
        };
    }
    ;

sentence_list
    : air
    {
        $$ = [];
    }
    | air sentence
    {
        $$ = [$2]
    }
    | air sentence EOL sentence_list
    {
        $4.splice(0, 0, $2); // add sentence to sentence_list array
        $$ = $4;
    }
    ;

sentence
    : expression
    {
        $$ = {
            type: 'ExpressionSentence',
            expression: $1,
            line: @1.first_line
        }
    }
    ;

expression
    : postfix_expression
    ;

expression_list
    : /* empty list */
    {
        $$ = []
    }
    | postfix_expression
    {
        $$ = [$1];
    }
    | expression_list ',' postfix_expression
    {
        $1.push($3);
        $$ = $1;
    }
    ;

postfix_expression
    : '(' postfix_expression ')'
    {
        $$ = $2;
    }
    | atomic_expression
    | operation_expression
    | call_expression
    ;

atomic_expression
    : literal
    ;

literal
    : int_literal
    | float_literal
    | bool_literal
    | str_literal
    ;

int_literal
    : INT_LITERAL
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'int',
            value: parseInt($1, 10)
        };
    }
    ;

float_literal
    : FLOAT_LITERAL
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'float',
            value: parseFloat($1)
        };
    }
    ;

bool_literal
    : TRUE
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'bool',
            value: true
        };
    }
    | FALSE
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'bool',
            value: false
        };
    }
    ;

str_literal
    : STRING_LITERAL
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'str',
            value: JSON.parse($1)
        };
    }
    ;

operation_expression
    /* sign */
    : '+' postfix_expression %prec UOP
        { $$ = uopExpr('plus', $2); $$.line = @1.first_line; }
    | '-' postfix_expression %prec UOP
        { $$ = uopExpr('minus', $2); $$.line = @1.first_line; }
    /* arith */
    | postfix_expression '+' postfix_expression
        { $$ = bopExpr('add', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '-' postfix_expression
        { $$ = bopExpr('sub', $1, $3); $$.line = @1.first_line; }
    ;

call_expression
    : id '(' expression_list ')'
    {
        $$ = {
            type: 'CallExpression',
            callee: $1,
            args: $3,
            line: @1.first_line
        };
    }
    ;

%%
