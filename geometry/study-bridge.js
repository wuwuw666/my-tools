(function(){
  'use strict';
  const key='little-study-lab.v1',status=document.createElement('p');status.id='geometryRecordStatus';status.style.cssText='font-size:13px;color:#58715f;margin:18px 0';
  status.textContent='这 3 题的作答会保存在本机；错题可在“数学 → 数学错题”继续复习。';document.getElementById('checkHeight').append(status);
  const logged=new Set();document.addEventListener('geometry-answer',event=>{
    const detail=event.detail,signature=detail.prompt+'|'+detail.answer;if(logged.has(signature))return;
    try{const raw=localStorage.getItem(key),data=raw?StudyCore.validateBackup({app:'little-study-lab',data:JSON.parse(raw)}):StudyCore.empty();const {answer,correct,...item}=detail;StudyCore.record(data,item,answer,correct);localStorage.setItem(key,JSON.stringify(data));logged.add(signature);status.textContent=correct?'这次作答已记录。可以到学习记录查看进度。':'已加入数学错题：点击上方“数学”，再进入“数学错题”复习。';}
    catch{status.textContent='浏览器暂时无法保存这次作答；题目仍可继续练习。请检查网站存储权限，并及时备份已有记录。';}
  });
})();
