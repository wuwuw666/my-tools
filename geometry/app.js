(function(){
  'use strict';
  const $=id=>document.getElementById(id),board=$('board');
  const scenes={
    free:{A:{x:440,y:115},B:{x:235,y:405},C:{x:700,y:405}},
    tilted:{A:{x:550,y:95},B:{x:200,y:315},C:{x:690,y:465}},
    outside:{A:{x:155,y:125},B:{x:340,y:405},C:{x:720,y:405}},
    parallel:{A:{x:390,y:165},B:{x:270,y:405},C:{x:690,y:405},D:{x:600,y:165}}
  };
  let scene='free',base='BC',points=structuredClone(scenes.free),drag=null;
  const vertices=[...document.querySelectorAll('.vertex')];
  const set=(id,attrs)=>Object.entries(attrs).forEach(([key,value])=>$(id).setAttribute(key,String(value)));
  const line=(id,p,q)=>set(id,{x1:p.x,y1:p.y,x2:q.x,y2:q.y});
  const position=(id,x,y)=>set(id,{transform:`translate(${x} ${y})`});
  const text=(id,value)=>{$(id).textContent=value;};
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function render(){
    const g=window.triangleGeometry(points,base);
    set('triangle',{points:['A','B','C'].map(n=>`${points[n].x},${points[n].y}`).join(' ')});
    line('baseLine',g.start,g.end);
    vertices.forEach(el=>{
      const name=el.dataset.point;
      if(name==='D'&&scene!=='parallel'){el.style.display='none';return;}
      el.style.display='';el.setAttribute('transform',`translate(${points[name].x} ${points[name].y})`);
      const locked=scene==='parallel'&&name!=='A'&&name!=='D';
      el.classList.toggle('base-point',name===g.startName||name===g.endName);
      el.classList.toggle('locked',locked);
      el.setAttribute('aria-disabled',String(locked));
      el.setAttribute('aria-label',`顶点 ${name}，${name===g.topName||name==='D'?'底对面的顶点':'底边端点'}${locked?'，本实验固定不动':'，可以拖动或用方向键移动'}`);
    });
    document.querySelectorAll('[data-base]').forEach(el=>{el.classList.toggle('selected',el.dataset.base===base);el.setAttribute('aria-pressed',String(el.dataset.base===base));el.disabled=scene==='parallel'&&el.dataset.base!=='BC';});
    document.querySelectorAll('[data-scene]').forEach(el=>{el.classList.toggle('active',el.dataset.scene===scene);el.setAttribute('aria-pressed',String(el.dataset.scene===scene));});
    text('baseName',`边 ${base}`);text('vertexName',scene==='parallel'?'顶点 A 和 D':`顶点 ${g.topName}`);text('heightName',scene==='parallel'?'AH 和 DK':`线段 ${g.topName}H`);
    $('baseTag').querySelector('text').textContent=`底 ${base}`;
    $('heightTag').querySelector('text').textContent=`高 ${g.topName}H`;
    text('dragHint',scene==='parallel'?'左右拖动 A 或 D：形状变了，高呢？':'拖动 A、B、C 任意一个圆点');
    $('parallelGuide').style.display=scene==='parallel'?'block':'none';
    set('parallelGuide',{y1:points.A.y,y2:points.A.y});
    $('comparisonGeometry').style.display=scene==='parallel'?'':'none';
    $('sameBasePanel').hidden=scene!=='parallel';
    if(scene==='parallel'){
      const q=window.triangleGeometry({A:points.D,B:points.B,C:points.C},'BC'),k=q.foot;
      set('compareTriangle',{points:['D','B','C'].map(n=>`${points[n].x},${points[n].y}`).join(' ')});
      line('compareHeight',points.D,k);set('compareFoot',{cx:k.x,cy:k.y});set('compareFootLabel',{x:k.x+13,y:k.y+29});
      set('compareAngle',{d:`M ${k.x+17} ${k.y} L ${k.x+17} ${k.y-17} L ${k.x} ${k.y-17}`});
      position('compareHeightTag',k.x+(points.D.x<points.A.x?-112:17),(points.D.y+k.y)/2-19);
      text('equalHeight',`${(q.height/30).toFixed(1)} 单位`);text('equalArea',`${(q.area/900).toFixed(1)} 平方单位`);
      text('areaFirst',`${(g.area/900).toFixed(1)} 平方单位`);text('areaSecond',`${(q.area/900).toFixed(1)} 平方单位`);
    }
    const hx=g.foot?.x??450,hy=g.foot?.y??270;
    const minX=Math.min(0,hx-85),minY=Math.min(0,hy-85),maxX=Math.max(900,hx+85),maxY=Math.max(540,hy+85);
    set('board',{viewBox:`${minX} ${minY} ${maxX-minX} ${maxY-minY}`});
    if(g.foot){
      line('heightLine',g.top,g.foot);set('footDot',{cx:hx,cy:hy});set('footLabel',{x:hx+13,y:hy+(g.top.y<=hy?29:-14)});
      const direction=g.t>1?-1:1,ux=g.ux*direction,uy=g.uy*direction;
      const vx=(g.top.x-hx)/(g.height||1),vy=(g.top.y-hy)/(g.height||1),size=Math.min(18,g.height/3,g.length/5);
      set('rightAngle',{d:`M ${hx+ux*size} ${hy+uy*size} L ${hx+(ux+vx)*size} ${hy+(uy+vy)*size} L ${hx+vx*size} ${hy+vy*size}`});
      set('angleLabel',{x:hx+(ux+vx)*30,y:hy+(uy+vy)*30});
      const bx=(g.start.x+g.end.x)/2,by=(g.start.y+g.end.y)/2;
      const nx=-g.uy,ny=g.ux,side=(g.top.x-bx)*nx+(g.top.y-by)*ny>0?-1:1;
      position('baseTag',bx+nx*side*42-50,by+ny*side*42-19);
      let tx=(g.top.x+hx)/2,ty=(g.top.y+hy)/2;
      position('heightTag',scene==='parallel'?tx+(points.A.x<points.D.x?-112:17):tx+g.ux*15,ty+g.uy*15-19);
      $('extension').style.display=g.outside?'block':'none';
      line('extension',g.foot,g.t<0?g.start:g.end);
      if(scene==='parallel'){
        const left=Math.min(points.B.x,points.A.x,points.D.x),right=Math.max(points.C.x,points.A.x,points.D.x);
        $('extension').style.display=left<points.B.x||right>points.C.x?'block':'none';
        line('extension',{x:left,y:points.B.y},{x:right,y:points.B.y});
      }
    }
    ['heightLine','rightAngle','angleLabel','footDot','footLabel','heightTag'].forEach(id=>{$(id).style.visibility=g.valid?'visible':'hidden';});
    if(scene==='parallel')$('angleLabel').style.visibility='hidden';
    if(!g.valid){text('discoveryTitle','三个点排在一条直线上了。');text('discoveryText','现在暂时不是三角形。把一个顶点往旁边拖一点，再看看高。');}
    else if(scene==='parallel'){text('discoveryTitle','同底等高：同一条底，两条高一样长。');text('discoveryText','A 和 D 沿着与 BC 平行的虚线移动。蓝色 AH 和紫色 DK 一样长，所以 △ABC 与 △DBC 的面积相等；它们的斜边不一定一样长。');}
    else if(g.outside){text('discoveryTitle','高可以在三角形外面！');text('discoveryText',`橙色虚线是底边 ${base} 的延长线。高 ${g.topName}H 落到这条直线上，依然和它垂直。`);}
    else if(Math.abs(g.uy)>.1){text('discoveryTitle','底斜着，高也跟着改变方向。');text('discoveryText',`高不是永远“竖直向下”。看 ${g.topName}H 和底边所在的直线：它们仍然垂直，夹角是 90°。`);}
    else{text('discoveryTitle',`选 ${base} 当底，就从对面的 ${g.topName} 作高。`);text('discoveryText','蓝色小方角表示 90°。换一条边当底试试：对面的顶点和对应的高，也会一起换。');}
    const format=n=>Number.isFinite(n)?n.toFixed(1):'—';
    text('baseValue',`${format(g.length/30)} 单位`);text('heightValue',`${format((g.height||0)/30)} 单位`);text('areaValue',`${format((g.area||0)/900)} 平方单位`);
    window.DragHints?.attach(board,vertices.find(el=>el.dataset.point===g.topName),'triangle');
  }
  function setScene(next){drag=null;scene=next;points=structuredClone(scenes[next]);base='BC';render();}
  document.querySelectorAll('[data-scene]').forEach(button=>button.addEventListener('click',()=>setScene(button.dataset.scene)));
  document.querySelectorAll('[data-base]').forEach(button=>button.addEventListener('click',()=>{if(scene==='parallel'&&button.dataset.base!=='BC')return;base=button.dataset.base;render();}));
  $('reset').addEventListener('click',()=>setScene(scene));
  function pointFromEvent(event){const p=board.createSVGPoint();p.x=event.clientX;p.y=event.clientY;return p.matrixTransform(board.getScreenCTM().inverse());}
  function move(name,x,y){
    if(scene==='parallel'&&name!=='A'&&name!=='D')return;
    const next={x:clamp(x,65,835),y:scene==='parallel'?scenes.parallel.A.y:clamp(y,65,465)};
    const names=scene==='parallel'?['A','B','C','D']:['A','B','C'];
    if(names.some(other=>other!==name&&Math.hypot(points[other].x-next.x,points[other].y-next.y)<46))return;
    points[name]=next;render();
  }
  vertices.forEach(el=>{
    el.addEventListener('pointerdown',event=>{
      const name=el.dataset.point;if(scene==='parallel'&&name!=='A'&&name!=='D')return;
      event.preventDefault();el.focus({preventScroll:true});const p=pointFromEvent(event);
      drag={name,id:event.pointerId,dx:points[name].x-p.x,dy:points[name].y-p.y};el.setPointerCapture(event.pointerId);
    });
    el.addEventListener('pointermove',event=>{if(!drag||drag.id!==event.pointerId)return;const p=pointFromEvent(event);move(drag.name,p.x+drag.dx,p.y+drag.dy);});
    const finish=event=>{if(drag?.id===event.pointerId)drag=null;};
    el.addEventListener('pointerup',finish);el.addEventListener('pointercancel',finish);el.addEventListener('lostpointercapture',finish);
    el.addEventListener('keydown',event=>{
      const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]},d=dirs[event.key];if(!d)return;
      event.preventDefault();const p=points[el.dataset.point],step=event.shiftKey?20:6;move(el.dataset.point,p.x+d[0]*step,p.y+d[1]*step);
    });
  });
  render();
})();
