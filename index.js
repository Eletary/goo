let templates,
    coreabilities, trivialabilityheads, trivialabilities, trivialabilitytails,
    smallheads, instantheads, noninstantheads,
    smalldamages,
    smalleffects, smallmediceffects, instanteffects, noninstanteffects, keepmaineffects, keepeffects, smallaftereffects,
    smalltails, noninstanttails,
    area;
async function getjson(e) {
    return (await fetch(e)).json();
}
async function fetchdata() {
    templates = await getjson('data/template.json');
    [coreabilities, trivialabilityheads, trivialabilities, trivialabilitytails] = await getjson('data/ability.json');
    [smallheads, instantheads, noninstantheads] = await getjson('data/head.json');
    smalldamages = await getjson('data/damage.json');
    [smalleffects, smallmediceffects, instanteffects, noninstanteffects, keepmaineffects, keepeffects, smallaftereffects] = await getjson('data/effect.json');
    [smalltails, noninstanttails] = await getjson('data/tail.json');
    area = await getjson('data/area.json')
}
for (let i in keepeffects) {
    noninstanteffects.push(keepeffects[i]);
}
let operatorname, seed, template;
function rand() {
    seed = seed * 48271 % 2147483647;
    return seed;
}
function I(l, r) {
    return rand() % (r - l + 1) + l;
}
function D(l,r) {
    return I(l, r) / 100;
}
function choice(field) {
    return field[rand() % field.length];
}
function hash(str) {
    let res = 0;
    for (let i in str) {
        res = (res * 2579 + str.codePointAt(i)) & 0xffff;
    }
    return res;
}
function choosemany(L, n) {
    n = Math.min(n, L.length);
    let L1 = [], L2 = [];
    for (let i = 0; i < n; i++) {
        let x = I(0, L.length - 1);
        while (L1.includes(x)) {
            x = I(0, L.length - 1);
        }
        L1.push(x);
        L2.push(L[x]);
    }
    return L2;
}
function generatearea() {
    if (rand() % 2 == 0) {
        return "";
    }
    return `<img src=src/area/${choice(area)} />`;
}
function generatesummonedability() {
    return "";
}
function generatecoreability() {
    return eval("`" + choice(coreabilities) + "`");
}
function generatetrivialabilityhead() {
    if (rand() % 2 == 0) {
        return "";
    }
    return eval("`" + choice(trivialabilityheads) + "`");
}
function generatetrivialability() {
    return eval("`" + choice(trivialabilities) + "`");
}
function generatetrivialabilitytail() {
    if (rand() % 2 == 0) {
        return "";
    }
    return "，" + eval("`" + choice(trivialabilitytails) + "`");
}
function generateability(canbesummoned) {
    // if (canbesummoned && rand() % 3 == 0) {
    // 	return generatesummonedability();
    // }
    if (rand() % 2 == 0) {
        return generatecoreability();
    }
    let ret = generatetrivialabilityhead(), L = choosemany(trivialabilities, I(1, 5));
    for (let i in L) {
        if (i != 0) {
            ret += "，";
        }
        ret += eval("`" + L[i] + "`");
    }
    return ret + generatetrivialabilitytail();
}
function generatesmallhead() {
    return choice(smallheads);
}
function generateinstanthead() {
    return choice(instantheads);
}
function generatenoninstanthead() {
    return choice(noninstantheads);
}
function generatesmalldamage() {
    return eval("`" + choice(smalldamages) + "`");
}
function generateinstantdamage() {
    return "";
}
function generateinstanteffect() {
    return "";
}
function generatenoninstanteffect() {
    return "";
}
function generatesmalltail() {
    if (rand() % 2 == 0) {
        return "";
    }
    return "<br />" + eval("`" + choice(smalltails) + "`");
}
function generateinstanttail() {
    return "";
}
function generatenoninstanttail() {
    if (rand() % 2 == 0) {
        return "";
    }
    return "<br />" + eval("`" + choice(noninstanttails) + "`");
}
function generatesmallaftereffect() {
    if (rand() % 2 == 0) {
        return "";
    }
    let ret = `，目标在<span class="positive">${I(2,9)}</span>秒内`, L = choosemany(smallaftereffects, I(1, 3));
    for (let i in L) {
        if (i != 0) {
            ret += "并";
        }
        ret += eval("`" + L[i] + "`");
    }
    return ret;
}
function generatesmallmedicskill(str) {
    let ret = `下次治疗使目标获得一个可以吸收相当于${operatorname}攻击力<span class="positive">${I(25,135)}%</span>`, L = choosemany(smallmediceffects, I(1, 3))
    if (rand() % 2 == 0) {
        ret += "伤害";
    } else {
        ret += "法术伤害";
    }
    ret += `的屏障，持续<span class="positive">${I(2,7)}</span>秒`;
    for (let i in L) {
        ret += "，" + eval("`" + L[i] + '`');
    }
    document.getElementById(`${str}effect`).innerHTML = ret + generatesmalltail();
}
function generatesmallskill(str) {
    let head = generatesmallhead();
    document.getElementById(`${str}header`).innerHTML = eval("`" + head.header + "`");
    document.getElementById(`${str}initial`).innerHTML = eval("`" + head.initial + "`");
    document.getElementById(`${str}cost`).innerHTML = eval("`" + head.cost + "`");
    document.getElementById(`${str}span`).innerHTML = eval("`" + head.span + "`");
    if (template.catergory == "【医疗】") {
        generatesmallmedicskill(str);
        return;
    }
    let ret = "下次攻击" + generatesmalldamage(), L = choosemany(smalleffects, I(1, 3));
    for (let i in L) {
        ret += "，" + eval("`" + L[i] + "`");
    }
    document.getElementById(`${str}effect`).innerHTML = ret + generatesmallaftereffect() + generatesmalltail();
}
function generateinstantskill(str) {
    let head = generateinstanthead();
    document.getElementById(`${str}header`).innerHTML = eval("`" + head.header + "`");
    document.getElementById(`${str}initial`).innerHTML = eval("`" + head.initial + "`");
    document.getElementById(`${str}cost`).innerHTML = eval("`" + head.cost + "`");
    document.getElementById(`${str}span`).innerHTML = eval("`" + head.span + "`");
    let ret = "" + generateinstantdamage(), L = choosemany(instanteffects, I(1, 3));
    for (let i in L) {
        if (i != 0) {
            ret += "，并";
        }
        ret += eval("`" + L[i] + "`");
    }
    document.getElementById(`${str}effect`).innerHTML = ret + generateinstanttail();
}
function generatekeepskill(str) {
    let ret = '<span class="negative">停止攻击</span>', L = choosemany(keepeffects, I(1, 3));
    for (let i in L) {
        ret += "，" + eval("`" + L[i] + "`");
    }
    document.getElementById(`${str}effect`).innerHTML = ret + "，" + eval("`" + choice(keepmaineffects) + "`") + generatenoninstanttail();
}
function generatenoninstantskill(str) {
    let head = generatenoninstanthead();
    document.getElementById(`${str}header`).innerHTML = eval("`" + head.header + "`");
    document.getElementById(`${str}initial`).innerHTML = eval("`" + head.initial + "`");
    document.getElementById(`${str}cost`).innerHTML = eval("`" + head.cost + "`");
    document.getElementById(`${str}span`).innerHTML = eval("`" + head.span + "`");
    if (template.catergory != "【医疗】" && rand() % 2 == 0) {
        generatekeepskill(str);
        return;
    }
    let ret = "", L = choosemany(noninstanteffects, I(1, 3));
    for (let i in L) {
        if (i != 0) {
            ret += "，";
        }
        ret += eval("`" + L[i] + "`");
    }
    document.getElementById(`${str}effect`).innerHTML = ret + generatenoninstanttail();
}
function generateskill(str) {
    document.getElementById(`${str}area`).innerHTML = generatearea();
    if (rand() % 3 == 0) {
        return generatesmallskill(str);
    }
    if (rand() % 2 == 0) {
        return generateinstantskill(str);
    }
    return generatenoninstantskill(str);
}
async function generate() {
    if (templates == undefined) await fetchdata();
    operatorname = document.getElementById("input").value;
    seed = hash(operatorname);
    document.getElementById("result").style.display = "block";
    template = choice(templates);
    document.getElementById("templatename").innerHTML = template.name;
    document.getElementById("templateeffect").innerHTML = template.effect;
    if (false) {
    } else {
        document.getElementById("ability1").innerHTML = generateability(true);
        document.getElementById("ability2").innerHTML = generateability(false);
        generateskill("skill1");
        generateskill("skill2");
        generateskill("skill3");
    }
}
function handle_event(event) {
    if (event.keyCode != 13) {
        return;
    }
    generate();
}