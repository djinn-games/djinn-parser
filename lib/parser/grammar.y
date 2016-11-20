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
'BREAK'             { return 'BREAK'; }
'bool'              { return 'BOOL'; }
'CONST'             { return 'CONST'; }
'ELSE'              { return 'ELSE'; }
'ELSEIF'            { return 'ELSEIF'; }
'END'               { return 'END'; }
'false'             { return 'FALSE'; }
'float'             { return 'FLOAT'; }
'IF'                { return 'IF'; }
'int'               { return 'INT'; }
'LOOP'              { return 'LOOP'; }
'PROGRAM'           { return 'PROGRAM'; }
'REPEAT'            { return 'REPEAT'; }
'str'               { return 'STRING'; }
'true'              { return 'TRUE'; }
'UNTIL'             { return 'UNTIL'; }

'+'                 { return '+'; }
'-'                 { return '-'; }
'*'                 { return '*'; }
'/'                 { return '/'; }
'%'                 { return '%'; }
'MOD'               { return '%'; }

'<='                { return '<='; }
'>='                { return '>='; }
'=='                { return '=='; }
'!='                { return '!='; }
'<'                 { return '<'; }
'>'                 { return '>'; }
'AND'               { return '&&'; }
'&&'                { return '&&'; }
'OR'                { return '||'; }
'||'                { return '||'; }
'NOT'               { return '!'; }
'!'                 { return '!'; }
'='                 { return '='; }

','                 { return ','; }
'('                 { return '('; }
')'                 { return ')'; }

{NAME}                                  { return 'NAME'; }
({QUOTE}{QUOTE})|({QUOTE}.*?{QUOTE})    { return 'STRING_LITERAL'; }
{DIGIT}+\.{DIGIT}+                      { return 'FLOAT_LITERAL'; }
{DIGIT}+                                { return 'INT_LITERAL'; }

/lex

// operators sorted by priority from bottom to top
%right '='
%left '&&' '||'
%left '>' '<' '>=' '<=' '==' '!='
%left '+' '-'
%left '*' '/' '%'
%left '!' UOP // see http://dinosaur.compilertools.net/bison/bison_8.html

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
            name: $1.toLowerCase(),
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
        };
    }
    | if_sentence {
        $$ = {
            type: 'IfSentence',
            if: $1,
            line: @1.first_line
        };
    }
    | loop_sentence
    | break_sentence
    | repeat_sentence
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
    | var_const_declaration
    | assignment_expression
    ;

atomic_expression
    : id
    | literal
    ;

// -----------------------------------------------------------------------------
// literals
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// expressions
// -----------------------------------------------------------------------------

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
    | postfix_expression '*' postfix_expression
        { $$ = bopExpr('mul', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '/' postfix_expression
        { $$ = bopExpr('div', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '%' postfix_expression
        { $$ = bopExpr('mod', $1, $3); $$.line = @1.first_line; }
    /* comparison */
    | postfix_expression '>' postfix_expression
        { $$ = bopExpr('gt', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '<' postfix_expression
        { $$ = bopExpr('lt', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '>=' postfix_expression
        { $$ = bopExpr('gte', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '<=' postfix_expression
        { $$ = bopExpr('lte', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '==' postfix_expression
        { $$ = bopExpr('eq', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '!=' postfix_expression
        { $$ = bopExpr('neq', $1, $3); $$.line = @1.first_line; }
    /* logical */
    | postfix_expression '||' postfix_expression
        { $$ = bopExpr('or', $1, $3); $$.line = @1.first_line; }
    | postfix_expression '&&' postfix_expression
        { $$ = bopExpr('and', $1, $3); $$.line = @1.first_line; }
    | '!' postfix_expression
        { $$ = uopExpr('not', $2); $$.line = @1.first_line; }
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

var_const_declaration
    : var_declaration
    | const_declaration
    ;

var_declaration
    : datatype id '=' postfix_expression
    {
        $$ = {
            type: 'VarDeclaration',
            dataType: $1,
            id: $2,
            init: $4,
            line: @1.first_line
        };
    }
    | datatype id
    {
        $$ = {
            type: 'VarDeclaration',
            dataType: $1,
            id: $2,
            line: @1.first_line
        };
    }
    ;

const_declaration
    : CONST datatype id '=' postfix_expression
    {
        $$ = {
            type: 'ConstDeclaration',
            dataType: $2,
            id: $3,
            init: $5,
            line: @1.first_line
        };
    }
    ;

datatype
    : INT { $$ = 'int'; }
    | STRING { $$ = 'str'; }
    | FLOAT { $$ = 'float'; }
    | BOOL { $$ = 'bool'; }
    ;

assignment_expression
    : id '=' postfix_expression
    {
        $$ = {
            type: 'AssignmentExpression',
            operator: $2,
            left: $1,
            right: $3,
            line: @1.first_line
        }
    }
    ;

// -----------------------------------------------------------------------------
// conditionals
// -----------------------------------------------------------------------------

if_sentence
    : IF '(' expression ')' sentence_list END
    {
        $$ = {
            condition: $3,
            consequent: $5,
            alternates: [],
            line: @1.first_line
        };
    }
    | IF '(' expression ')' sentence_list ELSE sentence_list END
    {
        $$ = {
            condition: $3,
            consequent: $5,
            alternates: [$7],
            line: @1.first_line
        };
    }
    | IF '(' expression ')' sentence_list elseif_list END
    {
        $$ = {
            condition: $3,
            consequent: $5,
            alternates: $6,
            line: @1.first_line
        };
    }
    | IF '(' expression ')' sentence_list elseif_list ELSE sentence_list END
    {
        $$ = {
            condition: $3,
            consequent: $5,
            alternates: $6.concat([$8]),
            line: @1.first_line
        };
    }
    ;

elseif_list
    :elseif_unit
    {
        $$ = [[$1]]
    }
    | elseif_list elseif_unit
    {
        $1.push([$2])
        $$ = $1;
    }
    ;

elseif_unit
    : ELSEIF '(' expression ')' sentence_list
    {
        $$ = {
            type: 'IfSentence',
            if: {
                condition: $3,
                consequent: $5,
                alternates: []
            },
            line: @1.first_line
        };
    }
    ;

// -----------------------------------------------------------------------------
// loops
// -----------------------------------------------------------------------------

break_sentence
    : BREAK
    {
        $$ = {
            type: 'BreakSentence',
            line: @1.first_line
        };
    }
    ;

loop_sentence
    : LOOP sentence_list END
    {
        $$ = {
            type: 'LoopSentence',
            sentences: $2,
            line: @1.first_line
        };
    }
    ;

repeat_sentence
    : REPEAT sentence_list UNTIL '(' expression ')'
    {
        $$ = {
            type: 'RepeatUntilSentence',
            sentences: $2,
            test: $5,
            line: @1.first_line
        };
    }
    ;

%%
