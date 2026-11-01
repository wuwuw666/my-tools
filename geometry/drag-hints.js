(function(){
  'use strict';
  const seen=new Set(),targets=new Map(),ns='http://www.w3.org/2000/svg';
  const style=document.createElement('style');
  style.textContent=`
    .drag-intro{cursor:grab;touch-action:none;filter:drop-shadow(0 4px 0 #bd8b29)}
    .drag-intro .drag-intro-surface{fill:#ffe37c;stroke:#cc7f23;stroke-width:2}
    .drag-intro text{fill:#493311;font:700 17px "Microsoft YaHei","PingFang SC",sans-serif;text-anchor:middle;pointer-events:none}
    .drag-intro-breathe{animation:drag-intro-attention 1.7s ease-in-out 3}
    #constructionPlay.play-intro,#areaPlay.play-intro{background:#ffe37c;color:#493311;border-color:#cc7f23;box-shadow:0 3px 0 #bd8b29}
    .play-intro-breathe{animation:drag-intro-attention 1.7s ease-in-out 3}
    .has-drag-intro>.handle-caption,.has-drag-intro>.point-name{visibility:hidden}
    @keyframes drag-intro-attention{0%,100%{opacity:1}50%{opacity:.66}}
    @media(prefers-reduced-motion:reduce){.drag-intro-breathe,.play-intro-breathe{animation:none}}
  `;
  document.head.append(style);
  // Highlight each play button independently without touching its clock or size.
  const playObserver=new IntersectionObserver(entries=>{
    for(const entry of entries)if(entry.isIntersecting){
      if(entry.target.classList.contains('play-intro'))entry.target.classList.add('play-intro-breathe');
      playObserver.unobserve(entry.target);
    }
  },{threshold:.5});
  for(const id of ['constructionPlay','areaPlay']){
    const button=document.getElementById(id);if(!button)continue;
    button.classList.add('play-intro');playObserver.observe(button);
    button.addEventListener('click',()=>{
      button.classList.remove('play-intro','play-intro-breathe');
      playObserver.unobserve(button);
    },{once:true,capture:true});
  }
  function dismiss(key){
    seen.add(key);
    for(const [name,{target}] of targets)if(name===key){
      target.classList.remove('has-drag-intro');
      const cue=target.querySelector('.drag-intro');
      // Retain ancestry until pointerdown reaches the existing drag handler.
      if(cue){cue.style.visibility='hidden';cue.classList.remove('drag-intro-breathe');}
    }
  }
  function attach(svg,target,key){
    if(!target||seen.has(key))return;
    const previous=targets.get(key)?.target;
    if(previous&&previous!==target){previous.classList.remove('has-drag-intro');previous.querySelector('.drag-intro')?.remove();}
    targets.set(key,{svg,target});
    const matrix=target.getScreenCTM();if(!matrix)return;
    const scale=Math.hypot(matrix.a,matrix.b);if(!scale)return;
    const bounds=svg.getBoundingClientRect(),x=matrix.e,y=matrix.f;
    const shift=Math.max(bounds.left+94,Math.min(bounds.right-94,x))-x;
    const below=y-bounds.top<105,top=below?32:-92;
    let cue=target.querySelector('.drag-intro');
    if(!cue){cue=document.createElementNS(ns,'g');cue.setAttribute('class','drag-intro drag-intro-breathe');target.append(cue);}
    cue.setAttribute('transform',`scale(${1/scale})`);
    cue.innerHTML=`<path class="drag-intro-surface" d="${below?'M-10 32L0 17L10 32':'M-10 -42L0 -27L10 -42'}"/><rect class="drag-intro-surface" x="${shift-85}" y="${top}" width="170" height="50" rx="13"/><text x="${shift}" y="${top+32}">✥ 按住这里拖动</text>`;
    target.classList.add('has-drag-intro');
  }
  function interaction(event){
    if(event.type==='keydown'&&!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',' '].includes(event.key))return;
    if(event.target.closest('#board .vertex'))dismiss('triangle');
    if(event.target.closest('#heightHandle'))dismiss('height');
  }
  document.addEventListener('pointerdown',interaction,true);
  document.addEventListener('keydown',interaction,true);
  const resize=new ResizeObserver(()=>{for(const [key,{svg,target}] of targets)if(target.isConnected)attach(svg,target,key);});
  for(const id of ['board','heightsBoard']){const svg=document.getElementById(id);if(svg)resize.observe(svg);}
  window.DragHints={attach};
})();
