// script generated by /scripts/make_ast_classes.py
(function($B){

// --- start AST classes
$B.ast_classes = {
Add:'',
And:'',
AnnAssign:'target,annotation,value?,simple',
Assert:'test,msg?',
Assign:'targets*,value,type_comment?',
AsyncFor:'target,iter,body*,orelse*,type_comment?',
AsyncFunctionDef:'name,args,body*,decorator_list*,returns?,type_comment?',
AsyncWith:'items*,body*,type_comment?',
Attribute:'value,attr,ctx',
AugAssign:'target,op,value',
Await:'value',
BinOp:'left,op,right',
BitAnd:'',
BitOr:'',
BitXor:'',
BoolOp:'op,values*',
Break:'',
Call:'func,args*,keywords*',
ClassDef:'name,bases*,keywords*,body*,decorator_list*',
Compare:'left,ops*,comparators*',
Constant:'value,kind?',
Continue:'',
Del:'',
Delete:'targets*',
Dict:'keys*,values*',
DictComp:'key,value,generators*',
Div:'',
Eq:'',
ExceptHandler:'type?,name?,body*',
Expr:'value',
Expression:'body',
FloorDiv:'',
For:'target,iter,body*,orelse*,type_comment?',
FormattedValue:'value,conversion,format_spec?',
FunctionDef:'name,args,body*,decorator_list*,returns?,type_comment?',
FunctionType:'argtypes*,returns',
GeneratorExp:'elt,generators*',
Global:'names*',
Gt:'',
GtE:'',
If:'test,body*,orelse*',
IfExp:'test,body,orelse',
Import:'names*',
ImportFrom:'module?,names*,level?',
In:'',
Interactive:'body*',
Invert:'',
Is:'',
IsNot:'',
JoinedStr:'values*',
LShift:'',
Lambda:'args,body',
List:'elts*,ctx',
ListComp:'elt,generators*',
Load:'',
Lt:'',
LtE:'',
MatMult:'',
Match:'subject,cases*',
MatchAs:'pattern?,name?',
MatchClass:'cls,patterns*,kwd_attrs*,kwd_patterns*',
MatchMapping:'keys*,patterns*,rest?',
MatchOr:'patterns*',
MatchSequence:'patterns*',
MatchSingleton:'value',
MatchStar:'name?',
MatchValue:'value',
Mod:'',
Module:'body*,type_ignores*',
Mult:'',
Name:'id,ctx',
NamedExpr:'target,value',
Nonlocal:'names*',
Not:'',
NotEq:'',
NotIn:'',
Or:'',
Pass:'',
Pow:'',
RShift:'',
Raise:'exc?,cause?',
Return:'value?',
Set:'elts*',
SetComp:'elt,generators*',
Slice:'lower?,upper?,step?',
Starred:'value,ctx',
Store:'',
Sub:'',
Subscript:'value,slice,ctx',
Try:'body*,handlers*,orelse*,finalbody*',
TryStar:'body*,handlers*,orelse*,finalbody*',
Tuple:'elts*,ctx',
TypeIgnore:'lineno,tag',
UAdd:'',
USub:'',
UnaryOp:'op,operand',
While:'test,body*,orelse*',
With:'items*,body*,type_comment?',
Yield:'value?',
YieldFrom:'value',
alias:'name,asname?',
arg:'arg,annotation?,type_comment?',
arguments:'posonlyargs*,args*,vararg?,kwonlyargs*,kw_defaults*,kwarg?,defaults*',
boolop:['And','Or'],
cmpop:['Eq','NotEq','Lt','LtE','Gt','GtE','Is','IsNot','In','NotIn'],
comprehension:'target,iter,ifs*,is_async',
excepthandler:['ExceptHandler'],
expr:['BoolOp','NamedExpr','BinOp','UnaryOp','Lambda','IfExp','Dict','Set','ListComp','SetComp','DictComp','GeneratorExp','Await','Yield','YieldFrom','Compare','Call','FormattedValue','JoinedStr','Constant','Attribute','Subscript','Starred','Name','List','Tuple','Slice'],
expr_context:['Load','Store','Del'],
keyword:'arg?,value',
match_case:'pattern,guard?,body*',
mod:['Module','Interactive','Expression','FunctionType'],
operator:['Add','Sub','Mult','MatMult','Div','Mod','Pow','LShift','RShift','BitOr','BitXor','BitAnd','FloorDiv'],
pattern:['MatchValue','MatchSingleton','MatchSequence','MatchMapping','MatchClass','MatchStar','MatchAs','MatchOr'],
stmt:['FunctionDef','AsyncFunctionDef','ClassDef','Return','Delete','Assign','AugAssign','AnnAssign','For','AsyncFor','While','If','With','AsyncWith','Match','Raise','Try','TryStar','Assert','Import','ImportFrom','Global','Nonlocal','Expr','Pass','Break','Continue'],
type_ignore:['TypeIgnore'],
unaryop:['Invert','Not','UAdd','USub'],
withitem:'context_expr,optional_vars?'
}
// --- end AST classes

// binary operator tokens
var binary_ops = {
    '+': 'Add', '-': 'Sub', '*': 'Mult', '/': 'Div', '//': 'FloorDiv',
    '%': 'Mod', '**': 'Pow', '<<': 'LShift', '>>': 'RShift', '|': 'BitOr',
    '^': 'BitXor', '&': 'BitAnd', '@': 'MatMult'
    }

// boolean operator tokens
var boolean_ops = {'and': 'And', 'or': 'Or'}

// comparison operator tokens
var comparison_ops = {
    '==': 'Eq', '!=': 'NotEq', '<': 'Lt', '<=': 'LtE', '>': 'Gt', '>=': 'GtE',
    'is': 'Is', 'is_not': 'IsNot', 'in': 'In', 'not_in': 'NotIn'}

var unary_ops = {unary_inv: 'Invert', unary_pos: 'UAdd', unary_neg: 'USub'}

var op_types = $B.op_types = [binary_ops, boolean_ops, comparison_ops, unary_ops]

var _b_ = $B.builtins

var ast = $B.ast = {}

for(var kl in $B.ast_classes){
    var args = $B.ast_classes[kl],
        js = ''
    if(typeof args == "string"){
        js = `ast.${kl} = function(${args.replace(/[*?]/g, '')}){
`
        if(args.length > 0){
            for(var arg of args.split(',')){
                if(arg.endsWith('*')){
                   arg = arg.substr(0, arg.length - 1)
                   js += ` this.${arg} = ${arg} === undefined ? [] : ${arg}
`
                }else if(arg.endsWith('?')){
                   arg = arg.substr(0, arg.length - 1)
                   js += ` this.${arg} = ${arg}
`
                }else{
                    js += ` this.${arg} = ${arg}
`
                }
            }
        }
        js += '}'
    }else{
        js = `ast.${kl} = [${args.map(x => 'ast.' + x).join(',')}]
`
    }
    try{
        eval(js)
    }catch(err){
        console.log('error', js)
        throw err
    }
    ast[kl].$name = kl
    if(typeof args == "string"){
        ast[kl]._fields = args.split(',')
    }
}

// Function that creates Python ast instances for ast objects generated by
// method .ast() of classes in py2js.js
$B.ast_js_to_py = function(obj){
    $B.create_python_ast_classes()
    if(obj === undefined){
        return _b_.None
    }else if(Array.isArray(obj)){
        return obj.map($B.ast_js_to_py)
    }else{
        var class_name = obj.constructor.$name,
            py_class = $B.python_ast_classes[class_name],
            py_ast_obj = {
                __class__: py_class
            }
        if(py_class === undefined){
            return obj
        }
        for(var field of py_class._fields){
            py_ast_obj[field] = $B.ast_js_to_py(obj[field])
        }
        py_ast_obj._attributes = $B.fast_tuple([])
        for(var loc of ['lineno', 'col_offset',
                        'end_lineno', 'end_col_offset']){
            if(obj[loc] !== undefined){
                py_ast_obj[loc] = obj[loc]
                py_ast_obj._attributes.push(loc)
            }
        }
        return py_ast_obj
    }
}

$B.ast_py_to_js = function(obj){
    if(obj === undefined || obj === _b_.None){
        return undefined
    }else if(Array.isArray(obj)){
        return obj.map($B.ast_py_to_js)
    }else if(typeof obj == "string"){
        return obj
    }else{
        var class_name = obj.__class__.$infos.__name__,
            js_class = $B.ast[class_name]
        if(js_class === undefined){
            return obj
        }
        var js_ast_obj = new js_class()
        for(var field of js_class._fields){
            if(field.endsWith('?') || field.endsWith('*')){
                field = field.substr(0, field.length - 1)
            }
            js_ast_obj[field] = $B.ast_py_to_js(obj[field])
        }
        for(var loc of ['lineno', 'col_offset',
                        'end_lineno', 'end_col_offset']){
            if(obj[loc] !== undefined){
                js_ast_obj[loc] = obj[loc]
            }
        }
        return js_ast_obj
    }
}

$B.create_python_ast_classes = function(){
    if($B.python_ast_classes){
        return
    }
    $B.python_ast_classes = {}
    for(var klass in $B.ast_classes){
        $B.python_ast_classes[klass] = (function(kl){
            var _fields,
                raw_fields
            if(typeof $B.ast_classes[kl] == "string"){
                if($B.ast_classes[kl] == ''){
                    raw_fields = _fields = []
                }else{
                    raw_fields = $B.ast_classes[kl].split(',')
                    _fields = raw_fields.map(x =>
                        (x.endsWith('*') || x.endsWith('?')) ?
                        x.substr(0, x.length - 1) : x)
                }
            }
            var cls = $B.make_class(kl),
                $defaults = {},
                slots = {},
                nb_args = 0
            if(raw_fields){
                for(var i = 0, len = _fields.length; i < len; i++){
                    var f = _fields[i],
                        rf = raw_fields[i]
                    nb_args++
                    slots[f] = null
                    if(rf.endsWith('*')){
                        $defaults[f] = []
                    }else if(rf.endsWith('?')){
                        $defaults[f] = _b_.None
                    }
                }
            }

            cls.$factory = function(){
                var $ = $B.args(klass, nb_args, $B.clone(slots), Object.keys(slots),
                        arguments, $B.clone($defaults), null, 'kw')
                var res = {
                    __class__: cls,
                    _attributes: $B.fast_tuple([])
                }
                for(var key in $){
                    if(key == 'kw'){
                        for(var key in $.kw.$string_dict){
                            res[key] = $.kw.$string_dict[key][0]
                        }
                    }else{
                        res[key] = $[key]
                    }
                }
                if(klass == "Constant"){
                    res.value = $B.AST.$convert($.value)
                }
                return res
            }
            if(_fields){
                cls._fields = _fields
            }
            cls.__mro__ = [$B.AST, _b_.object]
            cls.__module__ = 'ast'
            return cls
        })(klass)
    }
}

// Map operators to ast type (BinOp, etc.) and name (Add, etc.)
var op2ast_class = $B.op2ast_class = {},
    ast_types = [ast.BinOp, ast.BoolOp, ast.Compare, ast.UnaryOp]
for(var i = 0; i < 4; i++){
    for(var op in op_types[i]){
        op2ast_class[op] = [ast_types[i], ast[op_types[i][op]]]
    }
}

})(__BRYTHON__)
