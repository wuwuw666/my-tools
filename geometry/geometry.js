(function(root){
  'use strict';
  function triangleGeometry(points, base){
    const names={BC:['B','C','A'],CA:['C','A','B'],AB:['A','B','C']}[base];
    if(!names)throw new Error('Unknown base');
    const [startName,endName,topName]=names;
    const start=points[startName],end=points[endName],top=points[topName];
    const dx=end.x-start.x,dy=end.y-start.y,den=dx*dx+dy*dy,length=Math.sqrt(den);
    if(length<1e-8)return {valid:false,start,end,top,startName,endName,topName};
    const t=((top.x-start.x)*dx+(top.y-start.y)*dy)/den;
    const foot={x:start.x+t*dx,y:start.y+t*dy};
    const height=Math.hypot(top.x-foot.x,top.y-foot.y);
    return {valid:height>1e-6,start,end,top,startName,endName,topName,foot,t,length,height,area:length*height/2,ux:dx/length,uy:dy/length,outside:t< -1e-6||t>1+1e-6};
  }
  root.triangleGeometry=triangleGeometry;
  const examples={
    acute:{name:'锐角三角形',points:[[430,95],[230,370],[680,370]],bases:['BC','CA','AB'],note:'固定一条底，三角形的对应高只有一条。锐角三角形的三条高都在内部。'},
    right:{name:'直角三角形',points:[[240,100],[240,370],[680,370]],bases:['BC','CA','AB'],note:'选一条直角边当底，另一条直角边就是高。选斜边当底，要从直角顶点另外作高。'},
    obtuse:{name:'钝角三角形',points:[[140,110],[330,370],[700,370]],bases:['BC','CA','AB'],note:'高落在底边延长线上也正确。钝角三角形有两条高在外面，一条在里面。'},
    parallelogram:{name:'平行四边形',points:[[330,115],[220,365],[610,365],[720,115]],bases:['BC','CD','DA','AB'],note:'两组对边分别平行。选定一组底与对边，可以画无数条同样长的高；斜边通常不是高。'},
    rectangle:{name:'矩形',points:[[240,115],[240,365],[660,365],[660,115]],bases:['BC','CD','DA','AB'],note:'矩形是有四个直角的平行四边形。相邻边可以当高，内部也可以画无数条同样长的高。'},
    trapezoid:{name:'梯形',points:[[330,115],[200,365],[700,365],[570,115]],bases:['BC','DA'],note:'这里按小学常用定义：只有一组对边平行。平行的两边叫上底、下底；它们之间能画无数条同样长的高。两条腰通常不是高。'}
  };
  const interpolate=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
  function polygonArea(ps){return Math.abs(ps.reduce((sum,p,i)=>{const q=ps[(i+1)%ps.length];return sum+p.x*q.y-p.y*q.x;},0))/2;}
  function heightConstruction(shape,base,position=0,tilt=false){
    const example=examples[shape];
    if(!example||!example.bases.includes(base))throw new Error('Choose a valid base for this shape');
    const a=tilt?-.36:0,c=Math.cos(a),s=Math.sin(a),names=['A','B','C','D'];
    const ps=example.points.map(([x,y])=>({x:450+(x-450)*c-(y-250)*s,y:250+(x-450)*s+(y-250)*c}));
    const i=names.indexOf(base[0]),j=names.indexOf(base[1]),quad=ps.length===4;
    const topIndex=quad?(i+3)%4:3-i-j,oppositeEnd=quad?(i+2)%4:topIndex;
    const p=quad?interpolate(ps[topIndex],ps[oppositeEnd],position):ps[topIndex];
    const g=triangleGeometry({A:p,B:ps[i],C:ps[j]},'BC');
    return {example,ps,quad,i,j,topIndex,oppositeEnd,p,g,area:polygonArea(ps),opposite:[ps[topIndex],ps[oppositeEnd]]};
  }
  // Leave room beyond BOTH finite edges, including a trapezoid's shorter base.
  function heightMovementRange(shape,base){
    const a=heightConstruction(shape,base,0),b=heightConstruction(shape,base,1);
    if(!a.quad)throw new Error('Moving heights require parallel opposite edges');
    const slope=b.g.t-a.g.t;
    return {min:Math.min(-.2,(-.2-a.g.t)/slope),max:Math.max(1.2,(1.2-a.g.t)/slope)};
  }
  function areaAssembly(mode,progress=0){
    const trapezoid=mode==='trapezoid';
    const ps=(trapezoid?[[260,160],[160,360],[460,360],[410,160]]:[[300,160],[180,360],[480,360]]).map(([x,y])=>({x,y}));
    const pivot=trapezoid?interpolate(ps[2],ps[3],.5):interpolate(ps[0],ps[2],.5);
    const fraction=Math.max(0,Math.min(1,progress)),angle=Math.PI*fraction,co=Math.cos(angle),si=Math.sin(angle),offset=(trapezoid?400:390)*(1-fraction);
    const copy=ps.map(p=>({x:pivot.x+(p.x-pivot.x)*co-(p.y-pivot.y)*si+offset,y:pivot.y+(p.x-pivot.x)*si+(p.y-pivot.y)*co}));
    const rotated=p=>({x:2*pivot.x-p.x,y:2*pivot.y-p.y});
    const outer=trapezoid?[ps[0],ps[1],rotated(ps[0]),rotated(ps[1])]:[ps[0],ps[1],ps[2],rotated(ps[1])];
    return {ps,copy,pivot,offset,angle:fraction*180,outer,oneArea:polygonArea(ps)/2500,wholeArea:polygonArea(outer)/2500,bottom:trapezoid?6:6,top:trapezoid?3:0,height:4,combinedBase:trapezoid?9:6};
  }
  function parallelogramRearrangement(progress=0){
    const original=[[300,160],[180,360],[480,360],[600,160]].map(([x,y])=>({x,y}));
    const cut=[original[0],original[1],{x:300,y:360}];
    const remaining=[original[0],{x:300,y:360},original[2],original[3]];
    const rectangle=[[300,160],[300,360],[600,360],[600,160]].map(([x,y])=>({x,y}));
    const q=Math.max(0,Math.min(1,progress));
    const ease=t=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
    // Lift clear of the remaining piece, carry it around the right side,
    // lower it, then slide left into place. Nothing stretches or duplicates.
    let dx=0,dy=0;
    if(q<.2)dy=-220*ease(q/.2);
    else if(q<.55){dx=440*ease((q-.2)/.35);dy=-220;}
    else if(q<.8){dx=440;dy=-220*(1-ease((q-.55)/.25));}
    else dx=440-140*ease((q-.8)/.2);
    const moved=cut.map(p=>({x:p.x+dx,y:p.y+dy}));
    return {original,cut,remaining,rectangle,moved,dx,dy,base:6,height:4,area:polygonArea(original)/2500};
  }
  const lessons={examples,interpolate,polygonArea,heightConstruction,heightMovementRange,areaAssembly,parallelogramRearrangement};
  root.GeometryLessons=lessons;
  if(typeof module!=='undefined')module.exports={triangleGeometry,...lessons};
})(typeof window==='undefined'?globalThis:window);
