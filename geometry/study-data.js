window.StudyData={
  words:[['library','图书馆'],['science','科学'],['Wednesday','星期三'],['beautiful','美丽的'],['breakfast','早餐'],['sometimes','有时'],['usually','通常'],['because','因为'],['healthy','健康的'],['village','村庄'],['between','在两者之间'],['homework','家庭作业']].map(([word,meaning])=>({word,meaning})),
  dictation:['清晨','珍惜','观察','规律','智慧','勤奋','鼓励','耐心','尊重','收获','责任','坚持'],
  passages:[{id:'sample-original',title:'晨读小记（原创练习短文，非教材）',text:'清晨，阳光照进窗子。我打开书本，认真读好每一句话。遇到不懂的地方，我先想一想，再向老师请教。每天进步一点点，坚持就会有收获。'}],
  grammar:[
    ['be 动词','My friends ___ in the classroom.',['is','are','am'],'are','friends 是复数，表示“他们在教室里”，用 are。'],
    ['第三人称单数','She ___ to school every day.',['walk','walks','walking'],'walks','一般现在时，主语 she 是第三人称单数，walk 后加 s。'],
    ['现在进行时','Look! The children ___ football.',['play','plays','are playing'],'are playing','Look! 提示动作正在发生，用 be + 动词-ing；children 是复数，用 are。'],
    ['情态动词 can','He can ___ very well.',['swims','swim','swimming'],'swim','can 后面的动词用原形。'],
    ['一般现在时否定','Tom ___ like carrots.',['don’t','doesn’t','isn’t'],'doesn’t','第三人称单数的一般现在时否定句用 doesn’t + 动词原形。'],
    ['there be','There ___ a book on the desk.',['is','are','am'],'is','a book 是单数，表示“桌上有一本书”，用 There is。'],
    ['疑问词','— ___ do you get up? — At seven.',['Where','When','Who'],'When','At seven 回答时间，因此用 When 提问。'],
    ['时间介词','We have English ___ Monday.',['in','on','at'],'on','具体到星期几，用介词 on。'],
    ['频率副词','I ___ brush my teeth before bed.',['always','yesterday','now'],'always','always 表示“总是”，可说明习惯的频率。'],
    ['some / any','Do you have ___ pencils?',['some','any','a'],'any','普通疑问句中，表示“一些”通常用 any。'],
    ['物主代词','This is ___ schoolbag.',['I','me','my'],'my','schoolbag 前需要表示“我的”的 my。'],
    ['单复数','There are two ___ in the room.',['child','children','childs'],'children','child 的复数是不规则变化 children。']
  ].map(([topic,prompt,choices,expected,explanation])=>({subject:'english',kind:'grammar',topic,prompt,choices,expected,explanation}))
};
