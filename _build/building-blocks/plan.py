# Dec 29 lesson removed Oct 20 (Jonathan away Dec 20 – Jan 3; holiday family project covers it). 30 lessons.
# KCE Building Blocks — schedule and topic map for Bristol and Bailey (Oct 20, 2026 – Jan 28, 2027)
DATES = [
 # (n, iso date, weekday, mode)
 (1,"2026-10-20","Tue","In person"),(2,"2026-10-22","Thu","In person"),
 (3,"2026-10-26","Mon","Zoom"),(4,"2026-10-27","Tue","In person"),(5,"2026-10-29","Thu","In person"),
 (6,"2026-11-02","Mon","Zoom"),(7,"2026-11-03","Tue","In person"),(8,"2026-11-05","Thu","In person"),
 (9,"2026-11-09","Mon","Zoom"),(10,"2026-11-10","Tue","In person"),(11,"2026-11-12","Thu","In person"),
 (12,"2026-12-03","Thu","In person"),
 (13,"2026-12-07","Mon","Zoom"),(14,"2026-12-08","Tue","In person"),(15,"2026-12-10","Thu","In person"),
 (16,"2026-12-14","Mon","Zoom"),(17,"2026-12-15","Tue","In person"),(18,"2026-12-17","Thu","In person"),
 (19,"2027-01-04","Mon","Zoom"),(20,"2027-01-05","Tue","In person"),(21,"2027-01-07","Thu","In person"),
 (22,"2027-01-11","Mon","Zoom"),(23,"2027-01-12","Tue","In person"),(24,"2027-01-14","Thu","In person"),
 (25,"2027-01-18","Mon","Zoom"),(26,"2027-01-19","Tue","In person"),(27,"2027-01-21","Thu","In person"),
 (28,"2027-01-25","Mon","Zoom"),(29,"2027-01-26","Tue","In person"),(30,"2027-01-28","Thu","In person"),
]
WEEKS = [(1,[1,2]),(2,[3,4,5]),(3,[6,7,8]),(4,[9,10,11]),(5,[12]),(6,[13,14,15]),(7,[16,17,18]),(8,[19,20,21]),(9,[22,23,24]),(10,[25,26,27]),(11,[28,29,30])]

MF = "https://kingcretot.github.io/KCE_Math_Foundations/"
PW = "https://kingcretot.github.io/KCE_Pathways_Curriculum/"
RF = "https://readingfoundations.kingcretot.com/"
RP = "https://readingpower.kingcretot.com/"
MF45 = MF + "World%201%20-%20Multiplication%20Mountain/MathFoundations_MultiplicationMountain_Lesson1.html"

# Week topics. Each week: (topic title, focus area from the learner profile, color, existing lessons to link)
TOPICS = {
 "bristol": {
  1: ("Equal Groups: Multiply or Add?", "Multiply vs. add in word problems", "#2E86DE", []),
  2: ("Facts for 4 and 6", "Facts 4, 6, 7, 8, 9", "#10AC84", [("Times Table Trail, Lesson 3: Multiplying by 3 and 4", MF+"world3/lesson3.html")]),
  3: ("Facts for 7, 8 and 9", "Facts 4, 6, 7, 8, 9", "#8E44AD", [("Times Table Trail, Lesson 4: Multiplying by 6, 7, 8 and 9", MF+"world3/lesson4.html"),("Times Table Trail, Lesson 5: Turn-Around Facts", MF+"world3/lesson5.html")]),
  4: ("Word Problem Detective", "Week 7 math to mastery", "#E67E22", [("Times Table Trail, Lesson 7: Multiplication Word Problems", MF+"world3/lesson7.html"),("Pathways Week 7 Math: Pricing Day at the Trading Post", PW+"grade3/week7/math.html")]),
  5: ("Welcome Back Review", "Retention / spaced review", "#C9A84C", []),
  6: ("Contractions", "Contractions", "#E84393", []),
  7: ("Spelling Teams: ea and oo", "Spelling patterns (ea, oo)", "#00A8A8", [("Reading Foundations: ee / ea", RF+"KCE_RF_U6L2_EEEA.html"),("Reading Foundations: oo", RF+"KCE_RF_U6L5_OO.html"),("Reading Foundations: Vowel Team Sentences", RF+"KCE_RF_U6L7_TeamSentences.html")]),
  8: ("Super Sentences", "Complete sentences, capitals, end marks", "#0047BA", []),
  9: ("Compare and Round", "Comparing and rounding to 90+", "#16A085", [("Number Ville, Lesson 2: Comparing Numbers", MF+"world1/lesson2.html"),("Number Ville, Lesson 3: Rounding to the Nearest 10", MF+"world1/lesson3.html")]),
  10: ("Who Is Telling the Story?", "Point of view", "#D35400", [("Pathways Week 7 Reading: The Grumpy Hiker", PW+"grade3/week7/reading.html")]),
  11: ("What Did They Learn? (Theme)", "Theme / lesson of a story + fluency", "#DB2F30", [("Pathways Week 4 Reading: Theme", PW+"grade3/week4/reading.html"),("Reading Foundations: Reading with Expression", RF+"KCE_RF_U8L4_Expression.html")]),
 },
 "bailey": {
  1: ("Fact Shortcuts: x9 and x6", "Facts 6–9 automatic + fact strategies", "#2E86DE", [("Times Table Trail, Lesson 4: Multiplying by 6, 7, 8 and 9", MF+"world3/lesson4.html")]),
  2: ("Fact Shortcuts: x8 and x7", "Facts 6–9 automatic + fact strategies", "#10AC84", [("Times Table Trail, Lesson 5: Turn-Around Facts", MF+"world3/lesson5.html"),("Times Table Trail, Lesson 8: Mixed Review", MF+"world3/lesson8.html")]),
  3: ("The Area Model: Stop Adding, Start Multiplying", "Area model / choosing the efficient method", "#8E44AD", [("Multiplication Mountain, Lesson 1: Meet the Area Model", MF45)]),
  4: ("Division Undoes Multiplication", "Division facts and fact families", "#E67E22", [("Division Station, Lesson 4: Division Facts for 6, 7, 8 and 9", MF+"world4/lesson4.html"),("Division Station, Lesson 5: Fact Families", MF+"world4/lesson5.html")]),
  5: ("Welcome Back Review", "Retention / spaced review", "#C9A84C", []),
  6: ("Long Division, One Step at a Time", "Long division, 1-digit divisors", "#E84393", [("Long Division Lane, Lesson 1: Meet Long Division", MF+"World%203%20-%20Long%20Division%20Lane/MathFoundations_LongDivisionLane_Lesson1.html"),("Long Division Lane, Lesson 2: Dividing 2-Digit Numbers", MF+"World%203%20-%20Long%20Division%20Lane/MathFoundations_LongDivisionLane_Lesson2.html"),("Long Division Lane, Lesson 4: Dividing 3-Digit Numbers by 1-Digit", MF+"World%203%20-%20Long%20Division%20Lane/MathFoundations_LongDivisionLane_Lesson4.html")]),
  7: ("Remainders and Checking", "Long division, remainders + checking", "#00A8A8", [("Long Division Lane, Lesson 3: With Remainder", MF+"World%203%20-%20Long%20Division%20Lane/MathFoundations_LongDivisionLane_Lesson3.html"),("Long Division Lane, Lesson 6: Checking Division with Multiplication", MF+"World%203%20-%20Long%20Division%20Lane/MathFoundations_LongDivisionLane_Lesson6.html")]),
  8: ("Main Idea and Details", "Main idea & details", "#0047BA", [("Reading Power: Main Idea & Details", RP+"KCE_RP_U6L1_MainIdea.html"),("Reading Power: Key Details", RP+"KCE_RP_U7L1_KeyDetails.html")]),
  9: ("Word Power: Context Clues", "Reading vocabulary", "#16A085", [("Reading Power: Context Clues", RP+"KCE_RP_U4L1_ContextClues.html"),("Reading Power: Multiple-Meaning Words", RP+"KCE_RP_U4L4_MultiMeaning.html")]),
  10: ("Two-Digit Divisors", "Long division, 2-digit divisors", "#D35400", [("Pathways Week 7 Math: Deja's Food Drive", PW+"grade4-5/week7/math.html"),("Pathways Week 7A: The Bake Sale Split", PW+"grade4-5/week7a/lesson.html")]),
  11: ("Fraction x Fraction", "Fraction x fraction + final check", "#DB2F30", [("Fraction Falls, Lesson 5: Fraction Times Fraction", MF+"World%202%20-%20Fraction%20Falls/MathFoundations_FractionFalls_Lesson5.html"),("Pathways Week 8 Math: Sophia's Garden Plot", PW+"grade4-5/week8/math.html")]),
 },
}
MASTERY = {"bristol": 85, "bailey": 90}
NAMES = {"bristol": "Bristol", "bailey": "Bailey"}
BOOKS = {"bristol": "Amy and the Missing Puppy", "bailey": "How to Train Your Dragon"}

def week_of(n):
    for w, ns in WEEKS:
        if n in ns: return w
def day_in_week(n):
    for w, ns in WEEKS:
        if n in ns: return ns.index(n)+1, len(ns)

# Family projects for the long breaks, per student (pages live in building-blocks/projects/).
# Each entry: (after week, file, title, dates label, present at, card description)
def _simon_desc(show):
    return f"A family project for the break. Mom, Dad, Bristol, Bailey, River and Cam are all in it. Follow the day-by-day plan. Present it at {show}."
_SIMON = [
 (4, "gratitude.html", "The Simon Family Gratitude Project", "Mon, Nov 16 – Wed, Dec 2", "Lesson 12 · Thu, Dec 3"),
 (7, "holiday.html", "The Simon Family Holiday Gazette", "Sun, Dec 20 – Sun, Jan 3", "Lesson 19 · Mon, Jan 4 (Zoom)"),
]
_SIMON = [p + (_simon_desc(p[4]),) for p in _SIMON]   # Bristol and Bailey share the Simon family projects
PROJECTS = {"bristol": _SIMON, "bailey": _SIMON}

# ── Ethan Ferguson (added Oct 20, 2026): Pathways Grades 4–5 in the Building Blocks format.
# One lesson a week (Wed, in person, KCE Schoolhouse). Each lesson = one Pathways week, so "Week" = Pathways week number.
STU_DATES = {
 "ethan": [(1,"2026-10-21","Wed","In person"),(2,"2026-11-04","Wed","In person"),(3,"2026-11-11","Wed","In person"),
           (4,"2026-12-02","Wed","In person"),(5,"2026-12-09","Wed","In person"),
           (6,"2026-12-16","Wed","In person"),(7,"2027-01-06","Wed","In person")]
# Oct 27, 2026 (Jonathan): Oct 28 is a reteach of Lesson 1 (not mastered); Lessons 2-7 moved back one week.,
}
STU_WEEKS = {"ethan": [(6,[1]),(7,[2]),(8,[3]),(9,[4]),(10,[5]),(11,[6]),(12,[7])]}
PW45 = PW + "grade4-5/"
TOPICS["ethan"] = {
 6: ("Malik's Mural Project", "Multi-digit multiplication: area model, partial products, standard algorithm", "#2E86DE", []),
 7: ("Deja's Food Drive", "Long division (Pathways Week 7)", "#10AC84", []),
 8: ("Sophia's Garden Plot", "Fractions with unlike denominators (Pathways Week 8)", "#8E44AD", []),
 9: ("Elena's Market Stand", "Multiplying decimals + lining up decimal points (Pathways Week 9)", "#E67E22", []),
 10: ("Unit 2 Checkpoint", "Review of Weeks 6–9", "#C9A84C", []),
 11: ("The Dairy Farm Schedule", "Factors, multiples and prime numbers + narrative writing: punctuating dialogue (Pathways Week 11)", "#16A085", []),
 12: ("The Houston Apartment Build", "Equivalent fractions, simplifying and mixed numbers + informative writing: paragraphs and transitions (Pathways Week 12)", "#D35400", []),
}
MASTERY["ethan"] = 85
NAMES["ethan"] = "Ethan"
SINGLE = {"ethan"}   # one lesson per week: card label shows the Pathways week, no Learn/Practice/Prove days
def _ethan_desc(show):
    return f"A family project for the break, and you lead it. Mom, Dad, Joyce and Clyde are all in it. Follow the day-by-day plan. Present it at {show}."
PROJECTS["ethan"] = [
 (9, "ethan-november.html", "The Ferguson Family Feast Planner", "Thu, Nov 12 – Tue, Dec 1", "Lesson 5 · Wed, Dec 9"),
 (12, "ethan-holiday.html", "The Ferguson Family Winter Games", "Thu, Dec 17 – Tue, Jan 5", "your first January lesson · Wed, Jan 6"),
]
PROJECTS["ethan"] = [p + (_ethan_desc(p[4]),) for p in PROJECTS["ethan"]]

def dates_for(who): return STU_DATES.get(who, DATES)
def weeks_for(who): return STU_WEEKS.get(who, WEEKS)

# ── Ce'Line Mosely (added Oct 25, 2026): Pathways Grades 2–3 in the Building Blocks format.
# She is in Grade 4 but stays on Pathways Grades 2–3 (moved down Oct 15; 4–5 was too difficult).
# One lesson a week (Tue 4:00–5:00 PM ET, in person, DeSoto County Library). Each lesson = one Pathways Grades 2–3 week.
# Optional, self-paced Science and Social Studies (Grades 2–3) ride along each week, plus Florida Focus.
# Jonathan is away Dec 20–28 only (no lessons Nov 16–30, Dec 20–28, Jan 1). Tue Dec 29 IS a lesson for Ce'Line.
STU_DATES["celine"] = [(1,"2026-10-27","Tue","In person"),(2,"2026-11-03","Tue","In person"),(3,"2026-11-10","Tue","In person"),
                       (4,"2026-12-01","Tue","In person"),(5,"2026-12-08","Tue","In person"),(6,"2026-12-15","Tue","In person"),(7,"2026-12-29","Tue","In person")]
STU_WEEKS["celine"] = [(1,[1]),(2,[2]),(3,[3]),(4,[4]),(5,[5]),(6,[6]),(7,[7])]
TOPICS["celine"] = {
 1: ("Place Value and Story Elements", "Place value and rounding + story elements (Pathways Week 1)", "#2E86DE", []),
 2: ("Comparing Numbers and Plot", "Comparing and ordering numbers + plot and conflict (Pathways Week 2)", "#10AC84", []),
 3: ("Regrouping and Sequencing", "Adding and subtracting with regrouping + sequencing and story structure (Pathways Week 3)", "#8E44AD", []),
 4: ("Word Problems and Theme", "Word problems and estimation + theme and lesson of a story (Pathways Week 4)", "#E67E22", []),
 5: ("Unit 1 Checkpoint", "Review of Weeks 1–4", "#C9A84C", []),
 6: ("Stocking the Shelves", "Pathways Week 6 math and reading (The Storm in the Stockroom)", "#16A085", []),
 7: ("Pricing Day and The Grumpy Hiker", "Pathways Week 7 math (Pricing Day at the Trading Post) and reading (The Grumpy Hiker)", "#D35400", []),
}
MASTERY["celine"] = 85
NAMES["celine"] = "Ce'Line"
SINGLE.add("celine")
