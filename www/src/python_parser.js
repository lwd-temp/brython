var debug = 0

var inf = Number.POSITIVE_INFINITY

function Parser(){
  this.state = {type: 'program', pos: 0}
}

Parser.prototype.feed = function(tokens){
  console.log('grammar', grammar)
  return parse(grammar, tokens)
}

function MemoEntry(match, end){
    this.match = match
    this.position = end
}

var memo = {},
    rules = {}

function clear_memo(){
    for(var key in memo){
        delete memo[key]
    }
}

function get_memo(rule, position){
    if(memo[rule.name] === undefined ||
            memo[rule.name][position] === undefined){
        return null
    }
    var m = memo[rule.name][position]
    if(m.match === FAIL){
        return FAIL
    }
    return m
}

function set_memo(rule, position, value){
    memo[rule.name] = memo[rule.name] || {}
    memo[rule.name][position] = value
}

var FAIL = {name: 'FAIL'},
    FROZEN_FAIL = {name: 'FROZEN_FAIL'}

function LeftRecursion(detected){
    this.type = 'LeftRecursion'
    this.detected = detected // true or false
}

function eval_body(rule, tokens, position){
    var result,
        start = position
    if(! rule.repeat){
        result = eval_body_once(rule, tokens, position)
    }else{
        if(rule.join){
            console.log('rule', rule, 'has join')
        }
        var matches = [],
            start = position
        while(matches.length < rule.repeat[1]){
            var match = eval_body_once(rule, tokens, position)
            if(match === FAIL){
                if(matches.length >= rule.repeat[0]){
                    result = {rule, matches, start, end: position}
                }else{
                    result = FAIL
                }
                break
            }
            matches.push(match)
            if(rule.join && tokens[match.end][1] == rule.join){
                position = match.end + 1
            }else{
                position = match.end
            }
        }
        if(! result){
            result = {rule, start, matches, end: position}
        }
    }
    if(rule.lookahead){
        switch(rule.lookahead){
            case 'positive':
                if(result !== FAIL){
                    result.end = result.start // don't consume input
                }
                break
            case 'negative':
                if(result === FAIL){
                    result = {rule, start, end: start}
                }else{
                    result = FAIL
                }
                break
        }
    }
    return result
}

function eval_body_once(rule, tokens, position){
    if(debug){
        console.log('eval body of rule', rule, 'position', position)
    }
    if(rule.choices){
        for(var i = 0, len = rule.choices.length; i < len; i++){
            var choice = rule.choices[i]
            var match = eval_body(choice, tokens, position)
            if(match === FROZEN_FAIL){
                // if a choice with a ~ fails, don't try other alternatives
                return FAIL
            }else if(match !== FAIL){
                match.rank = i
                return match
            }
        }
        return FAIL
    }else if(rule.items){
        var start = position,
            matches = [],
            frozen_choice = false // set to true if we reach a COMMIT_CHOICE (~)
        for(var item of rule.items){
            if(item.type == 'COMMIT_CHOICE'){
                console.log('freeze choice')
                frozen_choice = true
            }
            var match = eval_body(item, tokens, position)
            if(match !== FAIL){
                matches.push(match)
                position = match.end
                if(match.end === undefined){
                    console.log('no end, rule', rule, 'item', item,
                        'result of eval_body', match)
                    alert()
                }
            }else{
                if(debug){
                    console.log('item', item, 'of sequence', rule, 'fails')
                }
                if(frozen_choice){
                    return FROZEN_FAIL
                }
                return FAIL
            }
        }
        return {rule, matches, start, end: position}
    }else if(rule.type == "rule"){
        return apply_rule(grammar[rule.name], tokens, position)
    }else if(rule.type == "string"){
        return tokens[position][1] == rule.value ?
            {rule, start: position, end: position + 1} :
            FAIL
    }else if(rule.type == 'COMMIT_CHOICE'){
        // mark current option as frozen
        return {rule, start: position, end: position}
    }else{
        var test = tokens[position][0] == rule.type &&
          (rule.value === undefined ? true : tokens[position][1] == rule.value)
        if(test){
            return {rule, start: position, end: position + 1}
        }else{
            return FAIL
        }
    }
}

function grow_lr(rule, tokens, position, m){
    // Called after eval_body(rule, position) produced a match and ignored
    // an option that referenced itself (recursion) because at that time,
    // memo(rule, position) was a LeftReference.
    //
    // m is the MemoEntry for (rule, position); m.match is the latest match,
    // m.pos is the last position in tokens
    //
    // apply_rule(rule, position) will return this match
    //
    // In each iteration of the "while" loop, we try again eval_body(),
    // which uses the MemoEntry m for the rule. This allows an
    // expression such as "1 + 2 + 3" to set a first match for "1 + 2",
    // then a second for "1 + 2 + 3"
    if(debug){
        console.log('grow_lr, rule', rule, position, 'current MemoEntry', m)
    }
    while(true){
        var match = eval_body(rule, tokens, position)
        if(match === FAIL || match.end <= m.end){
            break
        }
        m.match = match
        m.end = match.end
    }
    return m.match
}

function apply_rule(rule, tokens, position){
    // apply rule at position
    if(rule.name == "assignment"){
        console.log('apply rule', rule.name)
    }
    if(debug){
        console.log('apply rule', rule, position, 'memo', memo)
    }
    // search if result is in memo
    var memoized = get_memo(rule, position)
    if(memoized === null){
        // for left recursion, initialize with LeftRecursion set to false
        var LR = new LeftRecursion(false),
            m = new MemoEntry(LR, position)
        set_memo(rule, position, m)
        // evaluate body of rule
        // if the rule includes itself at the same position, it will be found
        // in memo as LR; LR.detected will be set to true and the branch of
        // eval_body containing rule will return FAIL, but eval_body can
        // match with another branch that doesn't contain rule
        var match = eval_body(rule, tokens, position)
        if(match !== FAIL){
            match.rule.name = rule.name
        }

        // change memo(rule, position) with result of match
        m.match = match
        m.end = match.end

        if(LR.detected && match !== FAIL){
            // recursion detected when executing eval_body
            // memo(rule, position) now contains the match with a branch
            // without recursion
            // grow_lr will try again at position, and use memo(rule, position)
            // to search a longer match
            return grow_lr(rule, tokens, position, m)
        }else{
            return match
        }
    }else{
        if(debug){
            console.log('read from memo', memoized)
        }
        if(memoized.match instanceof LeftRecursion){
            if(debug){
                console.log('recursion !')
            }
            memoized.match.detected = true
            return FAIL
        }else{
            if(memoized !== FAIL && memoized.match.start === undefined){
                console.log('pas de start', rule, position, memoized)
                alert()
            }
            return memoized === FAIL ? memoized : memoized.match
        }
    }
}

function parse(grammar, tokens){
    var position = 0,
        rule = grammar.file,
        match
    clear_memo()
    for(rule_name in grammar){
        grammar[rule_name].name = rule_name
    }
    while(position < tokens.length){
        match = apply_rule(rule, tokens, position)
        if(match === FAIL){
            console.log('rule', rule, 'fails')
            return
        }else{
            position = match.end
        }
    }
    console.log('parse succeeds !', match)
    console.log(show(match, tokens))
}

function show(match, tokens, level){
    level = level || 0
    var s = '',
        prefix = '  '.repeat(level)
    if(match.rule.name !== undefined){
         s += prefix + match.rule.name +
             (match.rank === undefined ? '' : ' #' + match.rank) + '\n'
         level += 1
    }
    if(match.rank !== undefined){
        if(grammar[match.rule.name] === undefined){
            console.log('pas de gramamar', match.rule)
        }
        console.log('choice', grammar[match.rule.name].choices[match.rank])
    }
    if(match.matches){
        for(var match of match.matches){
            s += show(match, tokens, level)
        }
    }else{
        if(match.end > match.start){
            s += prefix
            if(['NAME', 'STRING', 'NUMBER', 'string'].indexOf(match.rule.type) > -1){
                s += match.rule.type + ' ' + tokens[match.start][1]
            }else{
                s += match.rule.type + ' ' + (match.rule.value || '') +
                    match.start + '-' + match.end
            }
            s += '\n'
        }
    }
    return s
}