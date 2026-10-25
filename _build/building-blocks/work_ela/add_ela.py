import json, re
RF="https://readingfoundations.kingcretot.com/"; RP="https://readingpower.kingcretot.com/"
PW="https://kingcretot.github.io/KCE_Pathways_Curriculum/"
def rf(code,title,skill): return (f"Reading Foundations: {title}", RF+code+".html", 90, skill)
def rp(code,title,skill): return (f"Reading Power: {title}", RP+code+".html", 90, skill)
def p3(w,title,skill): return (f"Pathways Week {w} Reading: {title}", PW+f"grade3/week{w}/reading.html", 85, skill)
def p45(w,title,skill): return (f"Pathways Week {w} Reading: {title}", PW+f"grade4-5/week{w}/reading.html", 85, skill)
ELA={
 "bristol":{
  1:[rf("KCE_RF_U8L5_WhoWhatWhere","Who / What / Where","Find who is in the story, what happens and where it happens.")],
  2:[p3(8,"Mia Steps Up","Read the story carefully and use clues from the text.")],
  3:[rf("KCE_RF_U8L6_Sequence","Retell & Sequence","Tell what happened first, next and last.")],
  4:[p3(9,"What the Trail Taught Them","Think about what the characters learned.")],
  5:[rf("KCE_RF_U8L7_AllTogether","Putting It All Together","Use everything you know to read and understand.")],
  6:[p3(11,"From the Grove to Your Glass","Read to learn how something is made, step by step.")],
  7:[p3(12,"A Night at the Bakery","Read slowly and look for the important details.")],
  8:[rf("KCE_RF_U8L8_ReadingStar","Reading Star","Show what you can do as a reader.")],
  9:[p3(13,"Two Texts, One Harvest","Read two texts and tell how they are the same and different.")],
  10:[p3(14,"Why Did the Author Write It?","Tell why the author wrote the piece.")],
  11:[p3(3,"Sequencing & Story Structure","Tell the beginning, middle and end of a story."),
      p3(2,"Plot & Conflict","Find the problem in the story and how it gets solved.")],
 },
 "bailey":{
  1:[rp("KCE_RP_U7L2_TextFeatures","Text Features","Use headings, captions and bold words to find information.")],
  2:[p45(8,"Ravi's Newsletter","Figure out why the author wrote the piece.")],
  3:[rp("KCE_RP_U7L3_TextStructure","Text Structure","Tell how a nonfiction text is organized.")],
  4:[p45(9,"The Sleep Study","Read a science text and use the facts to answer.")],
  5:[rp("KCE_RP_U7L4_Purpose","Author's Purpose","Tell why an author wrote something: to inform, persuade or entertain.")],
  6:[p45(11,"The Night the Calf Came Early","Follow the events and how the characters respond.")],
  7:[rp("KCE_RP_U7L5_FactOpinion","Fact vs. Opinion","Tell a fact you can prove from an opinion.")],
  8:[p45(12,"Building Up Houston","Read nonfiction and use details from the text.")],
  9:[rp("KCE_RP_U7L6_Evidence","Using Evidence","Back up your answer with words from the text.")],
  10:[p45(13,"Poems from the Clouds","Read poems closely and talk about word choice.")],
  11:[rp("KCE_RP_U7L7_Summarize","Summarizing Nonfiction","Sum up a nonfiction text in a few sentences."),
      p45(14,"Giants of the Bay","Read nonfiction and pull out the main idea and key details.")],
 },
}
# when (by lesson day) the reading lesson goes on the task list
WHEN={"Mon":"Tuesday or Wednesday","Tue":"Wednesday","Thu":"Saturday or Sunday"}
import sys; sys.path.insert(0,'/home/claude/bb_build'); import plan
for who in ("bristol","bailey"):
  days={n:wd for n,iso,wd,mode in plan.DATES}
  for n,items in ELA[who].items():
    f=f"/home/claude/bb_build/data/{who}_L{n:02d}.json"; d=json.load(open(f,encoding='utf-8'))
    d.setdefault("also",[])
    d["also"]=[a for a in d["also"] if not a.get("ela")]
    tasks=[t for t in d["tasks"] if 'data-ela' not in t]
    new=[]
    for k,(label,url,goal,skill) in enumerate(items):
      if n==11: when = (["Break week 2","Break week 3"] if who=="bristol" else ["Second week","Third week"])[k]
      else: when = WHEN[days[n]]
      how=f"Reading practice for this week. Do it on {when} (it is on your task list). {skill} Aim for {goal} or more. If it is locked, type 1111."
      d["also"].append({"label":label,"url":url,"how":how,"ela":True})
      new.append(f'<span data-ela></span>{when}: do the reading lesson <a href="{url}" target="_blank"><b>{label}</b></a>. {skill} Aim for {goal}. If it is locked, type 1111.')
    # insert before the first "read your book" style line if present, else at end
    idx=next((i for i,t in enumerate(tasks) if re.search(r'read (your book|<i>How to Train)', t, re.I)), len(tasks))
    if len(tasks)+len(new)<=7:
      if days[n]=="Mon": idx=len(tasks)
      tasks[idx:idx]=new
    else:
      for k,t in enumerate(new):
        when=t.split('</span>',1)[1].split(':',1)[0]; first=when.split()[0] if not when.startswith(("Break","Second","Third")) else when
        body=t.split(': ',1)[1]
        plain=[re.sub('<[^>]+>','',x).strip() for x in tasks]
        j=next((i for i,x in enumerate(plain) if x.startswith(first) and re.search(r'\bread\b',x,re.I) and 'reading lesson' not in x), None)
        if j is None: j=next((i for i,x in enumerate(plain) if x.startswith(first) and 'reading lesson' not in x), None)
        if j is None: raise SystemExit(f"no line for {who} {n} {first}")
        tasks[j]=tasks[j].rstrip()+' <span data-ela></span>Then '+body[0].lower()+body[1:]
    d["tasks"]=tasks
    json.dump(d,open(f,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(who,n,days[n],len(d["also"]),len(d["tasks"]))
