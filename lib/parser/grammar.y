/*
Heavily inspired by div2js grammar at
https://github.com/delapuente/div2js/blob/master/src/grammar.y
*/

%{
  // js helper functions here
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

'('                 { return '('; }
')'                 { return ')'; }

{NAME}                                  { return 'NAME'; }
({QUOTE}{QUOTE})|({QUOTE}.*?{QUOTE})    { return 'STRING_LITERAL'; }
{DIGIT}+                                { return 'INT_LITERAL'; }
{DIGIT}+\.{DIGIT}+                      { return 'FLOAT_LITERAL'; }

/lex

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

postfix_expression
    : atomic_expression
    | '(' expression ')' {
        $$ = $2;
    }
    ;

atomic_expression
    : literal
    ;

literal
    : int_literal
    /*
    | str_literal
    | float_literal
    | bool_literal
    */
    ;

int_literal
    : INT_LITERAL
    {
        $$ = {
            type: 'Literal',
            line: @1.first_line,
            dataType: 'int',
            value: parseInt($1, 10)
        }
    }
    ;

%%
