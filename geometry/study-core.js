(function(root){
  'use strict';
  const clean=s=>String(s).normalize('NFKC').trim();
  function decimal(s){
    s=clean(s);if(!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)||s.length>40)throw Error('请输入普通小数或整数，例如 0.24');
    const negative=s.startsWith('-');s=s.replace(/^[+-]/,'');const [a,b='']=s.split('.');
    return {n:BigInt((a||'0')+b)*(negative?-1n:1n),scale:b.length};
  }
  function format(n,scale){
    n=BigInt(n);const sign=n<0n?'-':'';let digits=(n<0n?-n:n).toString().padStart(scale+1,'0');
    if(scale)digits=(digits.slice(0,-scale)+'.'+digits.slice(-scale)).replace(/0+$/,'').replace(/\.$/,'');
    return n===0n?'0':sign+digits;
  }
  function decimalEqual(a,b){try{const x=decimal(a),y=decimal(b);return x.n*10n**BigInt(y.scale)===y.n*10n**BigInt(x.scale);}catch{return false;}}
  const normalizeWord=s=>clean(s).toLowerCase().replace(/[‘’]/g,"'").replace(/\s+/g,' ');
  const normalizeChinese=s=>clean(s).replace(/[\p{P}\p{Z}\s]/gu,'');
  function matches(kind,actual,expected){return kind==='decimal'?decimalEqual(actual,expected):kind==='dictation'||kind==='recitation'?normalizeChinese(actual)===normalizeChinese(expected):normalizeWord(actual)===normalizeWord(expected);}
  function exercise(mode='mixed',level='basic',random=Math.random){
    const rand=(a,b)=>Math.floor(random()*(b-a+1))+a;
    const op=mode==='mixed'?(random()<.5?'multiply':'divide'):mode;
    const scale=level==='basic'?1:2,a=rand(1,level==='basic'?99:999),b=rand(1,level==='basic'?99:999);
    const fixed=n=>{const digits=String(n).padStart(scale+1,'0');return digits.slice(0,-scale)+'.'+digits.slice(-scale);};
    const first=fixed(a),second=fixed(b),product=format(BigInt(a)*BigInt(b),scale*2);
    if(op==='multiply')return {subject:'math',kind:'decimal',prompt:`${first} × ${second} = ?`,expected:product,explanation:`先按整数算：${a} × ${b} = ${a*b}。两个因数的小数位合起来有 ${scale*2} 位，再点上小数点并去掉末尾多余的 0，得到 ${product}。`};
    return {subject:'math',kind:'decimal',prompt:`${product} ÷ ${first} = ?`,expected:second,explanation:`被除数和除数同时乘 ${10**scale}：${format(BigInt(a)*BigInt(b),scale)} ÷ ${a} = ${second}。商不变；最后用 ${second} × ${first} = ${product} 验算。`};
  }
  function comparePassage(expected,actual){
    const a=Array.from(normalizeChinese(expected)),b=Array.from(normalizeChinese(actual));
    if(a.length>2000||b.length>2000)throw Error('每次请检查 2000 字以内的一段课文。');
    const dp=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
    for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)dp[i][j]=a[i]===b[j]?dp[i+1][j+1]+1:Math.max(dp[i+1][j],dp[i][j+1]);
    let i=0,j=0;const chunks=[];function add(type,char){const last=chunks.at(-1);if(last?.type===type)last.text+=char;else chunks.push({type,text:char});}
    while(i<a.length||j<b.length){if(i<a.length&&j<b.length&&a[i]===b[j]){add('same',a[i]);i++;j++;}else if(i<a.length&&(j===b.length||dp[i+1][j]>=dp[i][j+1]))add('missing',a[i++]);else add('extra',b[j++]);}
    return {equal:a.join('')===b.join(''),correct:dp[0][0],total:a.length,chunks};
  }
  const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
  function empty(){return {version:1,grade:5,words:[],dictation:[],passages:[],mistakes:[],history:[]};}
  function record(state,item,answer,correct,now=Date.now(),reviewId=null){
    state.history.push({id:uid(),at:now,subject:item.subject,kind:item.kind,correct:!!correct});state.history=state.history.slice(-2000);
    let mistake=reviewId?state.mistakes.find(x=>x.id===reviewId):state.mistakes.find(x=>x.subject===item.subject&&x.kind===item.kind&&x.prompt===item.prompt&&x.expected===item.expected);
    if(!correct){
      if(!mistake){mistake={...item,id:uid(),wrong:0,streak:0,created:now};state.mistakes.push(mistake);}
      mistake.wrong++;mistake.streak=0;mistake.answer=answer;mistake.updated=now;
    }else if(mistake){mistake.streak=Math.min(3,mistake.streak+1);mistake.updated=now;}
    return mistake;
  }
  function parsePairs(text){
    const lines=text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(!lines.length||lines.length>300)throw Error('请填写 1～300 行，每行格式：单词 | 中文意思');
    const entries=lines.map(line=>{const pair=line.split(/[|｜\t]/).map(s=>s.trim());if(pair.length!==2||!pair[0]||!pair[1]||pair[0].length>80||pair[1].length>160)throw Error('每行请填写：单词 | 中文意思，例如 beautiful | 美丽的');return {word:pair[0],meaning:pair[1]};});
    return [...new Map(entries.map(e=>[normalizeWord(e.word),e])).values()];
  }
  function validateBackup(raw){
    if(!raw||raw.app!=='little-study-lab'||raw.data?.version!==1)throw Error('这不是本站支持的学习记录备份。');
    const source=raw.data,result=empty(),text=(v,max)=>{if(typeof v!=='string'||v.length>max)throw Error('备份内容格式或长度不正确。');return v;};
    function array(name,max){if(!Array.isArray(source[name])||source[name].length>max)throw Error('备份条目数量或格式不正确。');return source[name];}
    result.words=array('words',300).map(x=>({word:text(x.word,80),meaning:text(x.meaning,160)}));
    result.dictation=array('dictation',300).map(x=>text(x,80));
    result.passages=array('passages',100).map(x=>({id:text(x.id,100),title:text(x.title,80),text:text(x.text,2000)}));
    result.mistakes=array('mistakes',2000).map(x=>{
      if(!['math','english','chinese'].includes(x.subject)||!['decimal','grammar','spelling','dictation','recitation','geometry'].includes(x.kind))throw Error('备份学科或题型不正确。');
      const r={id:text(x.id,100),subject:x.subject,kind:x.kind,prompt:text(x.prompt,2000),expected:text(x.expected,2000),explanation:text(x.explanation||'',2000),answer:text(x.answer||'',2000)};
      for(const key of ['wrong','streak','created','updated']){const value=x[key]??0;if(!Number.isSafeInteger(value)||value<0)throw Error('备份中的计数或日期不正确。');r[key]=value;}r.streak=Math.min(3,r.streak);return r;
    });
    result.history=array('history',2000).map(x=>{if(!['math','english','chinese'].includes(x.subject)||typeof x.correct!=='boolean'||!Number.isSafeInteger(x.at)||x.at<0)throw Error('备份练习记录不正确。');return {id:text(x.id,100),at:x.at,subject:x.subject,kind:text(x.kind,40),correct:x.correct};});
    return result;
  }
  function merge(a,b){
    const result=empty();result.words=[...new Map([...a.words,...b.words].map(x=>[normalizeWord(x.word),x])).values()].slice(0,300);
    result.dictation=[...new Set([...a.dictation,...b.dictation])].slice(0,300);
    result.passages=[...new Map([...a.passages,...b.passages].map(x=>[x.id,x])).values()].slice(0,100);
    const mistakes=new Map();for(const m of [...a.mistakes,...b.mistakes]){const old=mistakes.get(m.id);if(!old||(m.updated||0)>(old.updated||0))mistakes.set(m.id,m);}result.mistakes=[...mistakes.values()].slice(-2000);
    result.history=[...new Map([...a.history,...b.history].map(x=>[x.id,x])).values()].sort((x,y)=>x.at-y.at).slice(-2000);return result;
  }
  const api={decimal,format,decimalEqual,normalizeWord,normalizeChinese,matches,exercise,comparePassage,uid,empty,record,parsePairs,validateBackup,merge};
  root.StudyCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
