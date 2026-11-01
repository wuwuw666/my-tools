(function(){
  'use strict';
  const $=id=>document.getElementById(id),G=window.GeometryLessons,names=['A','B','C','D'];
  const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
  const smooth=x=>{const t=clamp(x);return t*t*(3-2*t);};
  const pts=ps=>ps.map(p=>`${p.x},${p.y}`).join(' ');
  const seg=(p,q,cls,id='')=>`<line ${id?`id="${id}"`:''} x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" class="${cls}"/>`;
  const label=(p,s,cls='construction-label')=>`<text x="${p.x}" y="${p.y}" class="${cls}">${s}</text>`;
  const attr=(el,key,value)=>el.setAttribute(key,String(value));
  const opacity=(el,value)=>attr(el,'opacity',value);
  function angleMark(h,u,v,size=18){return `M ${h.x+u.x*size} ${h.y+u.y*size} L ${h.x+(u.x+v.x)*size} ${h.y+(u.y+v.y)*size} L ${h.x+v.x*size} ${h.y+v.y*size}`;}
  function pointLabels(ps){
    const c=ps.reduce((a,p)=>({x:a.x+p.x/ps.length,y:a.y+p.y/ps.length}),{x:0,y:0});
    return ps.map((p,i)=>{const dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);return `<circle cx="${p.x}" cy="${p.y}" r="4" fill="#243a38"/>`+label({x:p.x+dx/d*29,y:p.y+dy/d*29+7},names[i]);}).join('');
  }
  function options(select,shape,base){
    select.replaceChildren(...G.examples[shape].bases.map(edge=>{const o=document.createElement('option');o.value=edge;o.textContent=`${edge} 当底`;return o;}));select.value=base;
  }
  // Demonstrations never autoplay. Their illustrations move by transform and
  // opacity, while each independent clock supports pause, resume and seeking.
  const calm=$('calmMotion'),preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  calm.checked=preference.matches;
  const clocks=[];
  function makeClock(prefix,duration,stops,onFrame,playLabel){
    const play=$(prefix+'Play'),restart=$(prefix+'Restart'),range=$(prefix+'Progress'),speed=$(prefix+'Speed');
    let q=0,running=false,frame=0,last=null;
    function controls(){play.textContent=calm.checked?'▸ 分步看下一步':running?'❚❚ 暂停':q>0&&q<1?'▶ 继续播放':playLabel;play.setAttribute('aria-pressed',String(running));}
    function pause(){running=false;cancelAnimationFrame(frame);last=null;controls();}
    function seek(value){q=clamp(value);range.value=String(Math.round(q*1000));onFrame(q);controls();}
    function tick(now){if(!running)return;if(last!==null)seek(q+(now-last)*Number(speed.value)/duration);last=now;if(q>=1){pause();return;}frame=requestAnimationFrame(tick);}
    function start(){
      if(calm.checked){pause();seek(stops.find(s=>s>q+.001)??stops[0]);return;}
      if(running){pause();return;}if(q>=1)seek(0);running=true;last=null;controls();frame=requestAnimationFrame(tick);
    }
    play.addEventListener('click',start);restart.addEventListener('click',()=>{pause();seek(0);});range.addEventListener('input',()=>{pause();seek(Number(range.value)/1000);});
    const clock={pause,seek,get progress(){return q;},get running(){return running;},refresh:controls};clocks.push(clock);return clock;
  }
  calm.addEventListener('change',()=>clocks.forEach(c=>{c.pause();c.refresh();}));
  preference.addEventListener('change',event=>{calm.checked=event.matches;clocks.forEach(c=>{c.pause();c.refresh();});});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clocks.forEach(c=>c.pause());});

  let shape='acute',base='BC',model,nodes={},phase=-1;
  const construction=$('constructionBoard');
  const constructionClock=makeClock('construction',12000,[0,.45,.7,1],drawConstruction,'▶ 播放画高动画');
  function buildConstruction(){
    constructionClock.pause();phase=-1;model=G.heightConstruction(shape,base,.36,$('tiltLesson').checked);
    const {ps,p,g,quad}=model,h=g.foot,u={x:g.ux,y:g.uy},v={x:(p.x-h.x)/g.height,y:(p.y-h.y)/g.height};
    const pName=quad?'P':names[model.topIndex],near=ps.findIndex(q=>Math.hypot(q.x-h.x,q.y-h.y)<1);
    let html=`<title id="constructionTitle">${model.example.name}：${base} 当底，用三角尺画高</title><desc id="constructionDesc">点击播放，先对齐底边，再平移三角尺，沿经过起点的直角边作垂线。支持暂停和拖动进度。</desc><polygon points="${pts(ps)}" class="construction-shape"/>`;
    if(quad&&$('splitLesson').checked)html+=`<polygon points="${pts([ps[0],ps[1],ps[2]])}" class="split-fill"/>`+seg(ps[0],ps[2],'mini-diagonal');
    if(quad)html+=seg(...model.opposite,'opposite-edge');
    html+=`<g id="constructionExtension">${seg({x:g.start.x-u.x*500,y:g.start.y-u.y*500},{x:g.end.x+u.x*500,y:g.end.y+u.y*500},'construction-extension')}</g>`;
    html+=seg(g.start,g.end,'mini-base')+`<circle cx="${p.x}" cy="${p.y}" r="11" class="construction-start"/>`;
    html+=label({x:(g.start.x+g.end.x)/2-v.x*45,y:(g.start.y+g.end.y)/2-v.y*45},`底 ${base}`,'base-caption');
    html+=`<g id="movingSquare"><polygon points="0,0 140,0 0,${g.height+35}" class="set-square"/><path d="M18 0V18H0" class="square-corner"/><path d="M35 10H96L10 ${Math.min(g.height-35,190)}V35Z" class="square-cutout"/><text x="28" y="40" class="ruler-note">三角尺</text></g>`;
    html+=`<g transform="matrix(${u.x} ${u.y} ${-v.x} ${-v.y} ${p.x} ${p.y})"><g id="drawnHeightScale"><line x1="0" y1="0" x2="0" y2="${g.height}" class="animated-height" vector-effect="non-scaling-stroke"/></g></g>`;
    html+=`<g id="drawingPencil"><path d="M0 0L-5 -23L4 -23Z" fill="#d97520" stroke="white" stroke-width="1.5"/><circle r="3" fill="#243a38"/></g>`;
    html+=`<g id="finishedHeight"><path d="${angleMark(h,u,v)}" class="mini-angle"/><circle cx="${h.x}" cy="${h.y}" r="4" fill="#197da3"/>${label({x:h.x-v.x*29+u.x*26,y:h.y-v.y*29+u.y*26+5},near>=0?`H（${names[near]}）`:'H')}${label({x:(p.x+h.x)/2+u.x*28,y:(p.y+h.y)/2+u.y*28},`高 ${pName}H`,'height-caption')}</g>`;
    html+=pointLabels(ps);
    if(quad)html+=label({x:p.x-u.x*30+v.x*27,y:p.y-u.y*30+v.y*27},'P');
    construction.innerHTML=html;
    const all=ps.concat([h,{x:h.x-u.x*145-v.x*80,y:h.y-u.y*145-v.y*80}]);
    const minX=Math.min(0,...all.map(q=>q.x-70)),maxX=Math.max(900,...all.map(q=>q.x+100)),minY=Math.min(0,...all.map(q=>q.y-70)),maxY=Math.max(500,...all.map(q=>q.y+70));
    attr(construction,'viewBox',`${minX} ${minY} ${maxX-minX} ${maxY-minY}`);
    nodes={square:$('movingSquare'),extension:$('constructionExtension'),height:$('drawnHeightScale'),pencil:$('drawingPencil'),finish:$('finishedHeight'),u,v,h,p,pName,near};
    document.querySelectorAll('[data-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shape===shape)));
    $('splitLesson').disabled=!quad;if(!quad)$('splitLesson').checked=false;constructionClock.seek(0);
  }
  function drawConstruction(q){
    if(!model)return;const {g}=model,{u,v,h,p}=nodes;
    const align=smooth((q-.2)/.25),slide=smooth((q-.45)/.25),draw=clamp((q-.72)/.23);
    const x=h.x-u.x*145*(1-slide)-v.x*75*(1-align),y=h.y-u.y*145*(1-slide)-v.y*75*(1-align);
    attr(nodes.square,'transform',`matrix(${u.x} ${u.y} ${v.x} ${v.y} ${x} ${y}) rotate(${28*(1-align)})`);
    opacity(nodes.square,q<.2?0:clamp((q-.2)/.06)*(1-clamp((q-.97)/.03)*.35));opacity(nodes.extension,q<.2?0:1);
    attr(nodes.height,'transform',`scale(1 ${draw})`);opacity(nodes.height,draw>0?1:0);
    attr(nodes.pencil,'transform',`translate(${p.x+(h.x-p.x)*draw} ${p.y+(h.y-p.y)*draw}) rotate(${Math.atan2(h.y-p.y,h.x-p.x)*180/Math.PI+90})`);
    opacity(nodes.pencil,q>.72&&q<.96?1:0);opacity(nodes.finish,q>=.95?1:0);attr(construction,'data-progress',q.toFixed(4));
    const next=q<=.2?0:q<=.45?1:q<=.7?2:3;
    if(next!==phase){phase=next;
      const instructions=[
        ['先选底，再找画高的起点',model.quad?`橙色 ${base} 是选定的底，紫色虚线是它的平行对边。这次从对边上的 P 点画高。${shape==='trapezoid'?'梯形只有这组平行边当上底、下底。':''}`:`选 ${base} 当底，从它对面的顶点 ${nodes.pName} 出发。先认清起点，再拿三角尺。`],
        ['让一条直角边贴住底边所在直线','看三角尺的小方角。把它的一条直角边与橙色直线对齐、贴合。必要时先延长底边；尺的角不能斜着翘起来。'],
        ['保持贴合，沿底边平移',`沿着橙色直线平移三角尺，不转动它，直到另一条直角边恰好经过 ${nodes.pName}。现在尺的一条直角边沿底，另一条经过起点。`],
        ['沿经过起点的直角边画线',`从 ${nodes.pName} 沿尺画到底边所在直线，垂足记为 H，最后标上直角。${nodes.near>=0?`H 与 ${names[nodes.near]} 重合，高正好与一条边重合。`:g.outside?'H 在底边延长线上，高在图形外面也正确。':'这条线段与底边成 90°，就是对应的高。'}`]
      ];
      $('lessonStepCount').textContent=`第 ${next+1} 步 / 共 4 步`;$('lessonStepTitle').textContent=instructions[next][0];$('lessonStepText').textContent=instructions[next][1];$('lessonObservation').textContent=model.example.note;
      $('lessonNext').textContent=next===3?'从第 1 步再看一次 ↺':'单独看下一步 →';
      document.querySelectorAll('[data-step]').forEach(b=>{b.setAttribute('aria-pressed',String(Number(b.dataset.step)===next+1));b.classList.toggle('done',Number(b.dataset.step)<next+1);});
    }
  }
  document.querySelectorAll('[data-shape]').forEach(b=>b.addEventListener('click',()=>{shape=b.dataset.shape;base='BC';options($('lessonBase'),shape,base);if(G.examples[shape].points.length===3)$('splitLesson').checked=false;buildConstruction();}));
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{constructionClock.pause();constructionClock.seek([.1,.45,.7,1][Number(b.dataset.step)-1]);}));
  $('lessonNext').addEventListener('click',()=>{constructionClock.pause();constructionClock.seek([.1,.45,.7,1][(phase+1)%4]);});
  $('lessonBase').addEventListener('change',()=>{base=$('lessonBase').value;buildConstruction();});$('tiltLesson').addEventListener('change',buildConstruction);$('splitLesson').addEventListener('change',buildConstruction);
  options($('lessonBase'),shape,base);buildConstruction();

  const heightState={shape:'parallelogram',base:'BC',position:.4},heightBoard=$('heightsBoard');let heightModel,heightDrag=null,heightDragOffset={x:0,y:0};
  function renderHeights(){
    const st=heightState,range=G.heightMovementRange(st.shape,st.base);st.position=clamp(st.position,range.min,range.max);
    const m=G.heightConstruction(st.shape,st.base,st.position,$('movingTilt').checked);heightModel=m;
    const {g,p,ps}=m,h=g.foot,u={x:g.ux,y:g.uy},v={x:(p.x-h.x)/g.height,y:(p.y-h.y)/g.height};
    let html=`<title id="heightsTitle">${m.example.name}：拖动高，观察高度和面积保持不变</title><desc id="heightsDesc">拖动蓝色圆点沿对边及其两侧延长线移动，或用下方滑块。高始终垂直于选定底边，长度不变。圆点获得焦点后也可用方向键移动。</desc><polygon points="${pts(ps)}" class="construction-shape"/>`;
    const extremes=[range.min,range.max].map(t=>G.heightConstruction(st.shape,st.base,t,$('movingTilt').checked)),ends=extremes.map(q=>q.g),lo=Math.min(0,...ends.map(q=>q.t))-.1,hi=Math.max(1,...ends.map(q=>q.t))+.1;
    html+=seg({x:g.start.x+u.x*g.length*lo,y:g.start.y+u.y*g.length*lo},{x:g.start.x+u.x*g.length*hi,y:g.start.y+u.y*g.length*hi},'construction-extension');
    const [oa,ob]=m.opposite,topExtensions=[G.interpolate(oa,ob,range.min-.1),G.interpolate(oa,ob,range.max+.1)];
    html+=seg(...topExtensions,'opposite-edge');
    if($('showManyHeights').checked)for(let t=0;t<=1.001;t+=.125){const sample=G.heightConstruction(st.shape,st.base,t,$('movingTilt').checked);html+=seg(sample.p,sample.g.foot,'height-ghost');}
    html+=seg(g.start,g.end,'mini-base')+seg(...m.opposite,'opposite-edge')+pointLabels(ps)+seg(p,h,'mini-height','movableHeightLine')+`<path d="${angleMark(h,u,v)}" class="mini-angle"/>`;
    html+=label({x:(p.x+h.x)/2+u.x*28,y:(p.y+h.y)/2+u.y*28},`高 ${(g.height/50).toFixed(1)}`,'height-caption');
    html+=`<g id="heightHandle" transform="translate(${p.x} ${p.y})" role="button" tabindex="0" aria-label="拖动高的位置，也可用左右方向键"><circle r="30" class="height-handle-halo"/><circle r="11" class="height-handle-dot"/><text y="-29" class="handle-caption" text-anchor="middle">拖我</text></g>`;
    heightBoard.innerHTML=html;
    const all=ps.concat(extremes.flatMap(q=>[q.p,q.g.foot]),topExtensions);
    const minX=Math.min(0,...all.map(q=>q.x-65)),maxX=Math.max(900,...all.map(q=>q.x+80)),minY=Math.min(0,...all.map(q=>q.y-70)),maxY=Math.max(500,...all.map(q=>q.y+65));
    attr(heightBoard,'viewBox',`${minX} ${minY} ${maxX-minX} ${maxY-minY}`);
    const location=st.position<0||st.position>1?'蓝点在对边延长线上':g.outside?'蓝点在对边上，垂足在底边延长线上':'蓝点在对边上';
    $('heightPosition').value=String((st.position-range.min)/(range.max-range.min)*100);$('heightPosition').setAttribute('aria-valuetext',`${location}，高 ${(g.height/50).toFixed(1)} 单位`);
    $('movingHeightValue').textContent=`${(g.height/50).toFixed(1)} 单位`;$('movingAreaValue').textContent=`${(m.area/2500).toFixed(1)} 平方单位`;
    $('heightFinding').textContent=`${location}。${st.position<0||st.position>1?'图形外的蓝线段连接两条平行边所在的直线，表示的仍是同一个高度。':''}它始终与 ${st.base} 成 90°。${st.shape==='trapezoid'?'上下底没有变，':'底没有变，'}高的长度也没有变，所以面积不变。`;
    document.querySelectorAll('[data-height-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.heightShape===st.shape)));
    window.DragHints?.attach(heightBoard,$('heightHandle'),'height');
  }
  function moveHeight(event){
    const point=heightBoard.createSVGPoint();point.x=event.clientX-heightDragOffset.x;point.y=event.clientY-heightDragOffset.y;const xy=point.matrixTransform(heightBoard.getScreenCTM().inverse()),[a,b]=heightModel.opposite,dx=b.x-a.x,dy=b.y-a.y;
    const range=G.heightMovementRange(heightState.shape,heightState.base);
    heightState.position=clamp(((xy.x-a.x)*dx+(xy.y-a.y)*dy)/(dx*dx+dy*dy),range.min,range.max);renderHeights();
  }
  heightBoard.addEventListener('pointerdown',event=>{const handle=event.target.closest('#heightHandle');if(!handle)return;event.preventDefault();heightDragOffset={x:0,y:0};const fromCue=!!event.target.closest('.drag-intro');if(fromCue){const matrix=handle.getScreenCTM();heightDragOffset={x:event.clientX-matrix.e,y:event.clientY-matrix.f};}heightDrag=event.pointerId;heightBoard.setPointerCapture(event.pointerId);if(!fromCue)moveHeight(event);});
  heightBoard.addEventListener('pointermove',event=>{if(heightDrag===event.pointerId)moveHeight(event);});['pointerup','pointercancel','lostpointercapture'].forEach(type=>heightBoard.addEventListener(type,()=>{heightDrag=null;heightDragOffset={x:0,y:0};}));
  heightBoard.addEventListener('keydown',event=>{const dirs={ArrowLeft:-.025,ArrowDown:-.025,ArrowRight:.025,ArrowUp:.025};if(!event.target.closest('#heightHandle')||!dirs[event.key])return;event.preventDefault();const range=G.heightMovementRange(heightState.shape,heightState.base);heightState.position=clamp(heightState.position+dirs[event.key],range.min,range.max);renderHeights();$('heightHandle').focus({preventScroll:true});});
  document.querySelectorAll('[data-height-shape]').forEach(b=>b.addEventListener('click',()=>{heightState.shape=b.dataset.heightShape;heightState.base='BC';options($('movingBase'),heightState.shape,heightState.base);renderHeights();}));
  $('heightPosition').addEventListener('input',()=>{const range=G.heightMovementRange(heightState.shape,heightState.base);heightState.position=range.min+Number($('heightPosition').value)/100*(range.max-range.min);renderHeights();});$('movingBase').addEventListener('change',()=>{heightState.base=$('movingBase').value;renderHeights();});$('movingTilt').addEventListener('change',renderHeights);$('showManyHeights').addEventListener('change',renderHeights);
  options($('movingBase'),heightState.shape,heightState.base);renderHeights();

  // The congruent copy only rotates/translates: its shape and area never change.
  let areaMode='triangle',areaNodes={},areaPhase=-1,assemblyModel;const areaBoard=$('areaBoard');
  const areaClock=makeClock('area',10000,[0,.48,.8,1],drawArea,'▶ 播放拼图动画');
  function buildAssembly(){
    areaClock.pause();areaPhase=-1;
    const cutMode=areaMode==='parallelogram';
    const stepNames=cutMode?['① 沿高剪开','② 移到右边','③ 拼成长方形','④ 底 × 高']:['① 两份一样大','② 旋转、移动','③ 拼成新图形','④ 每份占一半'];
    document.querySelectorAll('[data-area-step]').forEach(b=>{b.textContent=stepNames[Number(b.dataset.areaStep)];});
    $('areaTitle').textContent=cutMode?'平行四边形为什么是“底 × 高”？':areaMode==='trapezoid'?'梯形面积为什么也要“÷ 2”？':'为什么三角形面积要“÷ 2”？';
    $('areaLead').textContent=cutMode?'只用原来的一个平行四边形：沿高剪开，把左侧小三角形移到右边，看看它怎样变成长方形。':'拿两个完全相同的图形，把其中一个转半圈、移过去。每一块的形状和大小都没有改变。';
    if(cutMode){buildRectangleCut();return;}
    assemblyModel=G.areaAssembly(areaMode,0);const m=assemblyModel,trap=areaMode==='trapezoid',top=m.ps[0],foot={x:top.x,y:360};
    let html=`<title id="assemblyTitle">两个完全相同的${trap?'梯形':'三角形'}拼成平行四边形</title><desc id="assemblyDesc">绿色一块，紫色一块。把紫色块转半圈移过去，拼成无重叠、无空隙的平行四边形，每一块面积是整体的一半。</desc>`;
    html+=`<g id="assemblyOutline" opacity="0"><polygon points="${pts(m.outer)}" class="assembly-outline"/>${seg(m.outer[1],m.outer[2],'mini-base')}${label({x:(m.outer[1].x+m.outer[2].x)/2,y:407},trap?'新底 = 上底 3 + 下底 6 = 9':'拼成的底还是 6','base-caption')}</g>`;
    html+=`<polygon points="${pts(m.ps)}" class="assembly-original"/><g id="assemblyCopy"><polygon points="${pts(m.ps)}" class="assembly-copy"/></g>`;
    html+=`<g id="assemblyOriginalMeasure">${seg(m.ps[1],m.ps[2],'mini-base')}${label({x:(m.ps[1].x+m.ps[2].x)/2,y:397},trap?'下底 6':'底 6','base-caption')}${trap?seg(m.ps[0],m.ps[3],'mini-base')+label({x:(m.ps[0].x+m.ps[3].x)/2,y:138},'上底 3','base-caption'):''}</g>`;
    html+=seg(top,foot,'mini-height')+`<path d="M${foot.x} ${foot.y-17}h17v17" class="mini-angle"/>`+label({x:top.x+16,y:270},'高 4','height-caption');
    html+=`<g id="assemblyHalf" opacity="0">${label({x:790,y:240},trap?'一块 = 18':'一块 = 12','area-half-number')}${label({x:790,y:277},'另一块一样大','area-half-label')}</g>`;
    areaBoard.innerHTML=html;areaNodes={copy:$('assemblyCopy'),outline:$('assemblyOutline'),measure:$('assemblyOriginalMeasure'),half:$('assemblyHalf')};
    document.querySelectorAll('[data-area-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.areaMode===areaMode)));areaClock.seek(0);
  }
  function drawArea(q){
    if(areaMode==='parallelogram'){drawRectangleCut(q);return;}
    if(!assemblyModel)return;const movement=smooth((q-.18)/.57),m=G.areaAssembly(areaMode,movement),trap=areaMode==='trapezoid';
    attr(areaNodes.copy,'transform',`translate(${m.offset} 0) rotate(${m.angle} ${m.pivot.x} ${m.pivot.y})`);
    opacity(areaNodes.outline,clamp((q-.75)/.08));opacity(areaNodes.measure,1-clamp((q-.72)/.08));opacity(areaNodes.half,clamp((q-.86)/.1));attr(areaBoard,'data-progress',q.toFixed(4));
    const next=q<.18?0:q<.75?1:q<.86?2:3;
    if(next!==areaPhase){areaPhase=next;
      const texts=[
        [`两块完全相同的${trap?'梯形':'三角形'}`,'绿色一块，紫色一块。紫色块是绿色块的复制品，两块面积相同。这里长度用“单位”，面积用“平方单位”。'],
        ['转半圈，移过去，形状和大小不变','只旋转和平移紫色块，不拉长、不压扁。留意两块的边怎样对上，准备拼成一个更熟悉的图形。'],
        ['刚好拼成一个平行四边形',trap?'两块不重叠，也没有空隙。新平行四边形的底 = 梯形的上底 + 下底，高还是原来的高。':'两块不重叠，也没有空隙。新平行四边形的底和高，正好是原三角形的底和高。'],
        ['两份合起来，每一份就占一半',trap?'整体面积是（上底 + 下底）× 高。这是两块梯形的面积，所以一块要再 ÷ 2。':'整体面积是底 × 高。这是两块三角形的面积，两块又一样大，所以一块要再 ÷ 2。']
      ];
      $('areaStageTitle').textContent=texts[next][0];$('areaStageText').textContent=texts[next][1];
      $('areaFormula').textContent=next===3?(trap?'梯形面积 =（上底 + 下底）× 高 ÷ 2':'三角形面积 = 底 × 高 ÷ 2'):next===2?`两块合起来：${trap?'（3 + 6）':'6'} × 4 = ${m.wholeArea} 平方单位`:'先观察拼图，公式等拼好再看。';
      $('areaExample').textContent=next===3?(trap?'这次：两块合起来 9 × 4 = 36；一块 36 ÷ 2 = 18 平方单位。':'这次：两块合起来 6 × 4 = 24；一块 24 ÷ 2 = 12 平方单位。'):'旋转、移动不改变面积；图上两块始终一样大。';
      document.querySelectorAll('[data-area-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.areaStep)===next)));
    }
  }
  function buildRectangleCut(){
    const m=G.parallelogramRearrangement(0);assemblyModel=m;
    let html='<title id="assemblyTitle">平行四边形沿高剪开，平移小三角形，拼成面积相同的长方形</title><desc id="assemblyDesc">只有原来的一个平行四边形。剪下紫色小三角形移到右边，绿色部分不动，最后无重叠无空隙地拼成长方形。底变成长，高变成宽，所以面积等于底乘高。</desc>';
    html+=`<polygon points="${pts(m.original)}" fill="none" stroke="#93a297" stroke-width="2" stroke-dasharray="7 7" opacity=".4"/>`;
    html+=`<polygon points="${pts(m.remaining)}" class="assembly-original"/><g id="rectangleCutPiece"><polygon points="${pts(m.cut)}" class="assembly-copy"/></g>`;
    html+=`<g id="rectangleCutGuide">${seg({x:300,y:160},{x:300,y:360},'mini-height')}<path d="M300 342h18v18" class="mini-angle"/></g>`;
    html+='<g transform="translate(300 160)"><g id="rectangleCutInk"><line x1="0" y1="0" x2="0" y2="200" stroke="#d97520" stroke-width="4" vector-effect="non-scaling-stroke"/></g></g>';
    html+='<g id="rectangleScissors" fill="none" stroke="#a55c19" stroke-width="3"><circle cx="-8" cy="-8" r="6"/><circle cx="8" cy="-8" r="6"/><path d="M-4 -3L7 17M4 -3L-7 17"/></g>';
    html+=`<g id="rectangleOriginalBase">${seg({x:180,y:360},{x:480,y:360},'mini-base')}${label({x:330,y:408},'原来的底 6','base-caption')}</g>`;
    html+=`<g id="rectangleFinished" opacity="0"><polygon points="${pts(m.rectangle)}" fill="none" stroke="#243a38" stroke-width="3"/><path d="M300 178h18v-18M582 160v18h18M600 342h-18v18M318 360v-18h-18" class="mini-angle"/>${seg({x:300,y:360},{x:600,y:360},'mini-base')}${label({x:450,y:408},'长 = 原来的底 6','base-caption')}</g>`;
    html+='<text id="rectangleHeightLabel" x="274" y="268" text-anchor="end" class="height-caption">高 4</text>';
    html+=`<g id="rectangleAreaResult" opacity="0">${label({x:790,y:245},'面积还是 24','area-half-number')}${label({x:790,y:282},'没增加，也没减少','area-half-label')}</g>`;
    areaBoard.innerHTML=html;
    areaNodes={piece:$('rectangleCutPiece'),ink:$('rectangleCutInk'),scissors:$('rectangleScissors'),base:$('rectangleOriginalBase'),finished:$('rectangleFinished'),result:$('rectangleAreaResult'),height:$('rectangleHeightLabel')};
    document.querySelectorAll('[data-area-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.areaMode===areaMode)));areaClock.seek(0);
  }
  function drawRectangleCut(q){
    const cut=clamp(q/.18),m=G.parallelogramRearrangement(clamp((q-.18)/.57));
    attr(areaNodes.ink,'transform',`scale(1 ${cut})`);opacity(areaNodes.ink,q<=.2?1:0);
    attr(areaNodes.scissors,'transform',`translate(300 ${160+200*cut})`);opacity(areaNodes.scissors,q<.18?1:0);
    attr(areaNodes.piece,'transform',`translate(${m.dx} ${m.dy})`);
    opacity(areaNodes.base,1-clamp((q-.72)/.08));opacity(areaNodes.finished,clamp((q-.75)/.08));opacity(areaNodes.result,clamp((q-.86)/.1));
    attr(areaBoard,'data-progress',q.toFixed(4));
    const next=q<.18?0:q<.75?1:q<.86?2:3;
    if(next!==areaPhase){areaPhase=next;
      const texts=[
        ['沿高剪下左侧的小三角形','沿蓝色的高从上往下剪。紫色小三角形和绿色部分，合起来仍是原来的一个平行四边形。高与底垂直，剪口也是直的。'],
        ['把剪下的部分移到右边','绿色部分不动，只平移紫色小三角形。它没有变大、变小或转动，也没有复制出第二份。'],
        ['刚好拼成一个长方形','两块严丝合缝，没有重叠，也没有空隙。长方形的长等于原来的底，宽等于原来的高。形状变了，面积没变。'],
        ['长方形的长 × 宽，就是原来的底 × 高','剪拼前后用的是同样两块，面积不变。长方形面积 = 长 × 宽，所以平行四边形面积 = 底 × 高。这次没有复制成两份，不需要 ÷ 2。']
      ];
      $('areaStageTitle').textContent=texts[next][0];$('areaStageText').textContent=texts[next][1];
      $('areaFormula').textContent=next===3?'平行四边形面积 = 底 × 高':next===2?'长方形：长 6 × 宽 4 = 24 平方单位':'同一个图形，只剪开、移动，不增加也不丢掉任何一块。';
      $('areaExample').textContent=next>=2?'原来的底 6 → 长方形的长 6；原来的高 4 → 长方形的宽 4。原面积 = 6 × 4 = 24 平方单位。':'观察橙色的底和蓝色的高，最后它们会对应长方形的哪两条边。';
      areaNodes.height.textContent=next>=2?'宽 = 高 4':'高 4';
      document.querySelectorAll('[data-area-step]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.areaStep)===next)));
    }
  }
  document.querySelectorAll('[data-area-mode]').forEach(b=>b.addEventListener('click',()=>{areaMode=b.dataset.areaMode;buildAssembly();}));
  document.querySelectorAll('[data-area-step]').forEach(b=>b.addEventListener('click',()=>{areaClock.pause();areaClock.seek([0,.48,.8,1][Number(b.dataset.areaStep)]);}));buildAssembly();

  const answers={1:{right:'AH',text:'AH 从对面的顶点 A 出发，落在 BC 上，并且与 BC 成 90°。AM、AB 虽从 A 出发，却不与 BC 垂直。'},2:{right:'equal',text:'两个三角形都用 6 × 4 ÷ 2 = 12 平方厘米。同底等高，面积相等；斜边和形状可以不同。24 是同底等高的平行四边形面积。'},3:{right:'15',text:'（4 + 6）× 3 ÷ 2 = 15 平方厘米。高是与两底垂直的 3 厘米，不是斜着的腰 5 厘米。'}};
  const attempts=new Map();
  function score(){const correct=[...attempts.values()].filter(Boolean).length;$('quizScore').textContent=`已完成 ${attempts.size} / 3 题 · 当前答对 ${correct} / 3 题${correct===3?'，你会把底和高配对了！':''}`;}
  document.querySelectorAll('[data-question]').forEach(card=>card.querySelectorAll('[data-answer]').forEach(button=>button.addEventListener('click',()=>{
    const n=card.dataset.question,answer=answers[n],correct=button.dataset.answer===answer.right;attempts.set(n,correct);
    const feedback=card.querySelector('.quiz-feedback');feedback.textContent=(correct?'答对了！':'再试一次。')+answer.text;feedback.classList.toggle('correct',correct);
    card.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));score();
    document.dispatchEvent(new CustomEvent('geometry-answer',{detail:{subject:'math',kind:'geometry',prompt:card.querySelector('h3').textContent+' '+(card.querySelector('p:not(.quiz-feedback)')?.textContent||''),expected:card.querySelector(`[data-answer="${answer.right}"]`).textContent,explanation:answer.text,answer:button.textContent,correct}}));
  })));
  $('quizReset').addEventListener('click',()=>{attempts.clear();document.querySelectorAll('[data-answer]').forEach(b=>b.setAttribute('aria-pressed','false'));document.querySelectorAll('.quiz-feedback').forEach(p=>{p.textContent='重新选一个答案，再说明理由。';p.classList.remove('correct');});score();});
})();
