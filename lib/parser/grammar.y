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

%%

'#'.*[^(\r?\n)]*    { /* ignore comments */ }
[' '\t]+            { /* ignore whitespace */ }
(\r?\n)             { return 'EOL'; }
<<EOF>>             { return 'EOF'; }

'BEGIN'             { return 'BEGIN'; }
'END'               { return 'END'; }
'PROGRAM'           { return 'PROGRAM'; }

{NAME}              { return 'NAME'; }

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
    ;

%%
