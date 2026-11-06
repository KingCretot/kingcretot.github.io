#!/usr/bin/env python3
"""Nov 6, 2026: Bristol and Bailey bonus lesson for Sun Nov 8 (Zoom): Inside Amazon.
The family visits Amazon on Mon Nov 9. Writes data/bonus.json (one bonus lesson per student).
Facts checked Nov 6, 2026 against aboutamazon.com (fulfillment center tour article), amazontours.com
(tour rules: age 6+, about 1 mile of walking, photos only at marked spots) and July 2025 reporting
of Amazon's one-millionth robot."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
DATE = "2026-11-08"

STEPS5 = ["📥 Receive: trucks bring boxes of new items to the building.",
          "🗄️ Stow: workers put each item into a bin on a tall yellow shelf called a pod.",
          "🛒 Pick: a robot carries the pod to a worker, who takes out the item someone ordered.",
          "📦 Pack: the item goes in a box or bag, and a machine measures just enough tape.",
          "🚚 Ship: a machine sticks on the label, and the package slides into the right truck."]

def notes(do, say=None, ask=None, listen=None):
    n = {"do": do}
    if say: n["say"] = say
    if ask: n["ask"] = ask
    if listen: n["listen"] = listen
    return n

# ───────────────────────────── BRISTOL ─────────────────────────────
BR_VOCAB = [
 {"word": "package", "pos": "noun", "emoji": "📦", "meaning": "A box or bag that is sent to someone.", "example": "A <b>package</b> came to our door today."},
 {"word": "robot", "pos": "noun", "emoji": "🤖", "meaning": "A machine that can move and do a job by itself.", "example": "The <b>robot</b> carries a tall shelf across the floor."},
 {"word": "tote", "pos": "noun", "emoji": "🧺", "meaning": "A yellow plastic tub that holds items while they move.", "example": "The worker puts the toy in a yellow <b>tote</b>."},
 {"word": "conveyor belt", "pos": "noun", "emoji": "➡️", "meaning": "A moving belt that carries things from place to place.", "example": "The tote rides on the <b>conveyor belt</b>."},
 {"word": "deliver", "pos": "verb", "emoji": "🚚", "meaning": "To bring something to the place where it needs to go.", "example": "The driver will <b>deliver</b> the package to our house."},
]

BR_TEACH = [
 {"type": "hello", "title": "Inside Amazon", "text": "On Monday you get to go inside Amazon! 🎉 Today you learn how a package gets from a giant building all the way to someone's front door.", "visual": {"kind": "emoji", "text": "🏭➡️📦➡️🚚➡️🏠"},
  "notes": notes("Share your screen. This is a bonus lesson to get her ready for Monday's Amazon visit. Today is Zoom, so she types nothing: she says every answer, and you tap or type exactly what she says. Ask Tia before class to set out paper, a pencil, crayons and about 40 beans or counters.",
                 "On Monday you are going somewhere amazing. Today you will be the expert before you even walk in.",
                 "Have you ever gotten a package from Amazon? What was inside?",
                 "Any real memory of a delivery. Use it again on slide 4.")},
 {"type": "talk", "kick": "Talk about it", "title": "What do you think?", "text": "Make a guess. There is no wrong answer yet.", "prompts": ["Where do you think a package is before it comes to your house?", "Who do you think gets the package ready: people, robots, or both?", "What do you most want to see on Monday?"], "starters": ["I think the package is …", "I think … gets it ready because …", "On Monday I want to see …"],
  "notes": notes("4 minutes. She guesses out loud. Write her guesses on your whiteboard and keep them on camera; you come back to them at the end.", ask="Why do you think that?", listen="Full sentences using the starters.")},
 {"type": "vocab", "kick": "Word Power", "title": "Amazon words", "text": "Tap each card to flip it. Say the word out loud.", "words": BR_VOCAB,
  "notes": notes("She tells you which card to flip and reads each word out loud. Then she uses one word in her own sentence about Monday.", ask="Use the word tote in a sentence.", listen="She can say what a tote is: the yellow tub items ride in.")},
 {"type": "learn", "kick": "Learn", "title": "5 steps inside the building", "text": "Amazon calls the giant building a <b>fulfillment center</b>. Every item goes through 5 steps.", "steps": [{"text": s} for s in STEPS5], "tip": "Receive, stow, pick, pack, ship.",
  "notes": notes("Read each step with her. Act out the step with your hands on camera: unload, put away, grab, tape, slide. She copies you.", "Receive, stow, pick, pack, ship. Say it with me three times.", "Which step do you think a robot helps with?", "Pick: the robot brings the shelf to the worker.")},
 {"type": "order", "kick": "Put in order", "title": "What happens first?", "text": "Say the steps in order. Jonathan taps them.", "steps": STEPS5, "why": "Receive, stow, pick, pack, ship.", "hint": "The item has to come into the building first.",
  "notes": notes("She says the order from memory; you tap the steps in her order.", listen="Receive first, ship last.")},
 {"type": "learn", "kick": "Learn", "title": "Robots and people work together", "text": "Robots and people each have their own jobs.", "visual": {"kind": "emoji", "text": "🤖🗄️ ➡️ 🙋‍♀️"},
  "steps": [{"text": "Small robots slide under the tall yellow <b>pods</b>, lift them, and carry them across the floor."}, {"text": "The robot brings the pod to a worker. The worker grabs the item and puts it in a yellow <b>tote</b>."}, {"text": "Amazon has about <b>one million</b> robots helping in its buildings around the world!"}],
  "tip": "Robots carry. People pick.",
  "notes": notes("On Monday she may see the robots behind a fence. Tell her that the robots work in their own fenced space so people stay safe.", ask="Why do you think the robot brings the shelf to the person, and not the other way around?", listen="Walking takes a long time; the robot saves steps.")},
 {"type": "sort", "kick": "Sort it", "title": "Robot job or person job?", "text": "Tap a job. Then tap the box.", "buckets": ["🤖 Robot or machine job", "🙋 Person job"],
  "items": [{"text": "Carry a tall shelf across the floor", "b": 0, "why": "Robots slide under the pods and carry them.", "hint": "Who lifts the giant shelves?"},
            {"text": "Take the right toy out of a bin", "b": 1, "why": "People pick the item with their hands.", "hint": "Who looks at the screen and grabs the item?"},
            {"text": "Stick the address label on a box", "b": 0, "why": "A machine sticks the label on as the box rolls by.", "hint": "It happens on the moving belt."},
            {"text": "Fix a robot that got stuck", "b": 1, "why": "A worker helps a robot that is stuck.", "hint": "Can a stuck robot fix itself?"}],
  "notes": notes("She tells you the job and the box; you tap.", listen="She explains why for at least two of them.")},
 {"type": "tap", "kick": "Amazon math", "title": "Totes and boxes", "text": "Say the answer. Jonathan types it.",
  "items": [{"type": "fill", "q": "A worker fills <b>4 totes</b>. Each tote has <b>6 toys</b>. How many toys in all?", "answers": ["24"], "why": "4 groups of 6. 4 × 6 = 24 toys.", "no": "4 totes, 6 in each one. Multiply.", "hint": "4 × 6", "visual": {"kind": "array", "rows": 4, "cols": 6, "emoji": "🧸"}},
            {"type": "fill", "q": "A cart has <b>7 shelves</b>. Each shelf holds <b>5 boxes</b>. How many boxes?", "answers": ["35"], "why": "7 × 5 = 35 boxes.", "no": "7 groups of 5. Count by 5s seven times.", "hint": "5, 10, 15 …"},
            {"q": "A truck takes <b>8 packages</b> to one street and <b>9 packages</b> to the next street. How many packages? Which number sentence?", "choices": ["8 + 9", "8 × 9"], "a": 0, "why": "Two different amounts put together: add. 8 + 9 = 17.", "no": [None, "The groups are not equal. This is not equal groups, so add."]}],
  "notes": notes("She can use her beans for the first one: 4 rows of 6. Then she says the answer; you type it.", ask="Is this equal groups? How do you know?", listen="Equal groups means multiply; two different amounts means add.")},
 {"type": "build", "kick": "Build it", "title": "Fill the totes", "text": "A worker puts <b>8 books</b> in each tote. There are <b>3 totes</b>. Make the groups.", "groups": 3, "each": 8, "emoji": "📘", "why": "3 groups of 8 make 24. So <b>3 × 8 = 24</b> books.", "hint": "3 totes means 3 groups. Put 8 in each.",
  "notes": notes("She builds it with beans first: 3 piles of 8. Then she tells you the groups and how many in each, and you set the counters on screen.", ask="How many books in all?", listen="3 × 8 = 24.")},
 {"type": "learn", "kick": "Learn", "title": "Packages go all over the world", "text": "Amazon sends packages to people in more than <b>100 countries</b>! 🌎", "visual": {"kind": "emoji", "text": "🚚 ✈️ 🚢 🌍"},
  "steps": [{"text": "🚚 <b>Trucks and vans</b> bring packages to houses near the building."}, {"text": "✈️ <b>Amazon cargo planes</b> fly packages to faraway cities."}, {"text": "🚢 Big <b>ships</b> carry huge boxes of items across the ocean."}],
  "tip": "Truck, plane, or ship: each one helps a package travel.",
  "notes": notes("If you have a globe or map, hold it up to the camera. Show Florida, then point across the ocean.", ask="If a grandma in France orders a book from the United States, how could it get there?", listen="Plane or ship, then a truck to her door.")},
 {"type": "tap", "kick": "Check it", "title": "Amazon expert quiz", "text": "Say the answer. Jonathan taps it.",
  "items": [{"q": "What is the tall yellow shelf called?", "choices": ["a pod", "a tote", "a truck"], "a": 0, "why": "The tall yellow shelf is a <b>pod</b>. The yellow tub is a tote.", "no": [None, "A tote is the small yellow tub.", "A truck takes packages away."]},
            {"q": "Which step comes right after <b>pick</b>?", "choices": ["pack", "receive", "stow"], "a": 0, "why": "Pick, then <b>pack</b>, then ship.", "no": [None, "Receive is the very first step.", "Stow comes before pick."]},
            {"q": "Who brings the pod to the worker?", "choices": ["a robot", "the truck driver", "the customer"], "a": 0, "why": "A <b>robot</b> carries the pod.", "no": [None, "The driver works outside with the truck.", "The customer is at home waiting."]}],
  "notes": notes("Quick check. She says each answer; you tap it.")},
 {"type": "talk", "kick": "Get ready", "title": "Be a smart visitor", "text": "Think about Monday.", "prompts": ["Wear closed shoes and stay with your grown-up. Why do you think that matters in a busy building?", "Think of one question to ask the guide.", "What will you count or look for?"], "starters": ["It matters because …", "My question is …", "I will look for …"],
  "notes": notes("Help her pick one real question for the tour guide and write it on page 1 of her Field Notes. Remind her that photos are allowed only at the marked spots.", ask="What is your question for the guide?", listen="A real question, like 'How many robots work here?'")},
 {"type": "learn", "kick": "Your plan", "title": "Before and after the trip", "steps": [{"text": "<b>Tonight:</b> do the After-class lesson. It ends with Show What You Know."}, {"text": "<b>Monday at Amazon:</b> bring your <b>Field Notes</b> (page 1). Fill it in on the trip."}, {"text": "<b>Tuesday:</b> bring your Field Notes to class and tell me what you saw."}], "tip": "Have fun on Monday!",
  "notes": notes("Show her where the Field Notes are on her course page. Ask Tia to print page 1 for the trip.", say="I can't wait to hear what you saw.", ask="What will you do tonight? What will you bring on Monday?")},
]

BR_SLIDES = [
 {"type": "hello", "title": "Inside Amazon: On Your Own", "text": "In class you learned how a package gets from a giant building to a front door. Now show what you know. It takes about 15 minutes.", "visual": {"kind": "emoji", "text": "📦🤖🚚"}},
 {"type": "talk", "kick": "Say it", "title": "Tell someone at home", "text": "Find someone at home. Tell them out loud.", "prompts": ["What are the 5 steps inside the building?", "What job do the robots do?", "What will you look for on Monday?"], "starters": ["First … then …", "The robots …", "On Monday I will look for …"]},
 {"type": "vocab", "kick": "Word Power", "title": "Remember the words", "text": "Say the meaning before you flip the card. Then flip to check.", "words": BR_VOCAB},
 {"type": "learn", "kick": "Remember", "title": "Receive, stow, pick, pack, ship", "text": "Every item goes through 5 steps.", "steps": [{"text": s} for s in STEPS5], "tip": "Robots carry. People pick."},
 {"type": "order", "kick": "Put in order", "title": "The 5 steps", "text": "Tap the steps in the right order.", "steps": STEPS5, "why": "Receive, stow, pick, pack, ship.", "hint": "The item has to come into the building first."},
 {"type": "sort", "kick": "Sort it", "title": "Add or multiply?", "text": "Tap a story. Then tap the box.", "buckets": ["✖️ Equal groups: multiply", "➕ Different amounts: add"],
  "items": [{"text": "5 totes with 4 toys in each", "b": 0, "why": "5 equal groups of 4: 5 × 4 = 20.", "hint": "Is every tote the same?"},
            {"text": "7 boxes on one cart and 6 boxes on another", "b": 1, "why": "Different amounts: 7 + 6 = 13.", "hint": "Are the two carts the same?"},
            {"text": "6 trucks with 9 packages each", "b": 0, "why": "6 equal groups of 9: 6 × 9 = 54.", "hint": "Each truck has the same number."},
            {"text": "8 red bags and 5 blue bags", "b": 1, "why": "Different amounts: 8 + 5 = 13.", "hint": "Two different amounts."}]},
 {"type": "check", "title": "Show What You Know", "sets": [
   [{"q": "What is the tall yellow shelf called?", "choices": ["a pod", "a tote", "a box"], "a": 0, "why": "The tall yellow shelf is a <b>pod</b>.", "no": [None, "A tote is the small yellow tub.", "A box is what the item ships in."]},
    {"q": "Which step is first?", "choices": ["receive", "pack", "ship"], "a": 0, "why": "First the items come in: <b>receive</b>.", "no": [None, "Pack comes later.", "Ship is the last step."]},
    {"q": "Who brings the pod to the worker?", "choices": ["a robot", "a truck", "a plane"], "a": 0, "why": "A <b>robot</b> carries the pod.", "no": [None, "Trucks work outside.", "Planes fly packages far away."]},
    {"type": "fill", "q": "<b>3 totes</b> have <b>6 toys</b> each. How many toys?", "answers": ["18"], "why": "3 × 6 = 18 toys.", "no": "3 groups of 6. Multiply.", "hint": "3 × 6"},
    {"type": "fill", "q": "<b>4 carts</b> have <b>8 boxes</b> each. How many boxes?", "answers": ["32"], "why": "4 × 8 = 32 boxes.", "no": "4 groups of 8. Double 8, then double again.", "hint": "4 × 8"},
    {"type": "fill", "q": "A truck has <b>9 packages</b>. A van has <b>7 packages</b>. How many in all?", "answers": ["16"], "why": "Different amounts: add. 9 + 7 = 16.", "no": "The groups are not equal. Add.", "hint": "9 + 7"},
    {"q": "How does a package cross the ocean?", "choices": ["on a plane or a ship", "on a bike", "on a conveyor belt"], "a": 0, "why": "Planes and ships carry packages across the ocean.", "no": [None, "A bike cannot cross the ocean.", "Conveyor belts are inside the building."]},
    {"q": "What does <b>deliver</b> mean?", "choices": ["to bring something where it needs to go", "to make something new", "to throw something away"], "a": 0, "why": "To <b>deliver</b> is to bring something where it needs to go.", "no": [None, "That is to build.", "That is the opposite."]}],
   [{"q": "What is the small yellow tub called?", "choices": ["a tote", "a pod", "a truck"], "a": 0, "why": "The small yellow tub is a <b>tote</b>.", "no": [None, "A pod is the tall shelf.", "A truck takes packages away."]},
    {"q": "Which step is last?", "choices": ["ship", "stow", "pick"], "a": 0, "why": "The last step is <b>ship</b>.", "no": [None, "Stow is the second step.", "Pick comes in the middle."]},
    {"q": "What do people do at the pick station?", "choices": ["take the item out of the bin", "drive the robot", "fly the plane"], "a": 0, "why": "People pick the item and put it in a tote.", "no": [None, "The robots drive themselves.", "Pilots fly the planes."]},
    {"type": "fill", "q": "<b>2 totes</b> have <b>7 toys</b> each. How many toys?", "answers": ["14"], "why": "2 × 7 = 14 toys.", "no": "2 groups of 7. Double 7.", "hint": "7 + 7"},
    {"type": "fill", "q": "<b>6 carts</b> have <b>4 boxes</b> each. How many boxes?", "answers": ["24"], "why": "6 × 4 = 24 boxes.", "no": "6 groups of 4. Multiply.", "hint": "6 × 4"},
    {"type": "fill", "q": "A cart has <b>8 bags</b>. Another cart has <b>6 bags</b>. How many in all?", "answers": ["14"], "why": "Different amounts: add. 8 + 6 = 14.", "no": "The carts are not the same. Add.", "hint": "8 + 6"},
    {"q": "Which one flies packages to faraway cities?", "choices": ["a cargo plane", "a robot", "a tote"], "a": 0, "why": "Amazon cargo planes fly packages far away.", "no": [None, "Robots work inside the building.", "A tote is a tub."]},
    {"q": "What is a <b>conveyor belt</b>?", "choices": ["a moving belt that carries things", "a belt you wear", "a big truck"], "a": 0, "why": "A conveyor belt moves things from place to place.", "no": [None, "Not that kind of belt!", "A truck drives on the road."]}]]},
]

BR_PRACTICE = {"intro": "Three tries on each one. Only your first try counts.", "questions": [
 {"type": "fill", "q": "<b>5 totes</b> have <b>6 toys</b> each. How many toys?", "answers": ["30"], "why": "5 × 6 = 30.", "no": "5 groups of 6.", "hint": "5 × 6"},
 {"type": "fill", "q": "<b>9 carts</b> have <b>4 boxes</b> each. How many boxes?", "answers": ["36"], "why": "9 × 4 = 36.", "no": "9 groups of 4.", "hint": "Double 9, then double again."},
 {"type": "fill", "q": "<b>7 trucks</b> have <b>7 packages</b> each. How many packages?", "answers": ["49"], "why": "7 × 7 = 49.", "no": "7 groups of 7. Split 7 into 5 and 2.", "hint": "35 + 14"},
 {"type": "fill", "q": "A van has <b>8 packages</b>. A truck has <b>7 packages</b>. How many in all?", "answers": ["15"], "why": "Different amounts: 8 + 7 = 15.", "no": "Add the two amounts.", "hint": "8 + 7"},
 {"q": "Which step comes right after <b>stow</b>?", "choices": ["pick", "ship", "receive"], "a": 0, "why": "Receive, stow, <b>pick</b>, pack, ship.", "no": [None, "Ship is the last step.", "Receive is the first step."]},
 {"q": "What do the robots carry?", "choices": ["the tall yellow pods", "the trucks", "the people"], "a": 0, "why": "Robots carry the <b>pods</b>.", "no": [None, "Trucks drive on the road.", "Robots do not carry people."]}]}

FIELD_NOTES_PAGE = [
 {"title": "Part 1: My Amazon Field Notes", "directions": "Take this page with you on Monday. Fill it in during or after the tour.", "items": [
   {"type": "fill", "text": "1. The question I asked the guide:", "lines": 1},
   {"type": "fill", "text": "2. The answer:", "lines": 1},
   {"type": "fill", "text": "3. Three things I saw: ______________ , ______________ , ______________", "lines": 0},
   {"type": "choice", "text": "4. Circle each one you saw:", "options": ["robots", "yellow pods", "yellow totes", "conveyor belts", "boxes", "trucks"]},
   {"type": "draw", "text": "5. Draw the coolest machine you saw. Label it.", "height": 2.6}]}]

BR_PACKET = {"title": "Inside Amazon: Field Notes", "pages": [FIELD_NOTES_PAGE, [
 {"title": "Part 2: Amazon Words", "directions": "Write the best word in each blank.", "items": [
   {"type": "bank", "words": ["package", "robot", "tote", "conveyor belt", "deliver"]},
   {"type": "fill", "text": "1. The worker put the toy in a yellow ______________.", "lines": 0},
   {"type": "fill", "text": "2. A ______________ carried the tall shelf.", "lines": 0},
   {"type": "fill", "text": "3. The boxes rode on the moving ______________.", "lines": 0},
   {"type": "fill", "text": "4. The driver will ______________ the ______________ to our house.", "lines": 0}]},
 {"title": "Part 3: Amazon Math", "directions": "Multiply for equal groups. Add for different amounts.", "items": [
   {"type": "problem", "text": "5. 6 totes have 4 toys in each. How many toys?", "lines": 1},
   {"type": "problem", "text": "6. 3 carts have 9 boxes on each. How many boxes?", "lines": 1},
   {"type": "problem", "text": "7. A truck has 9 packages. A van has 8. How many in all?", "lines": 1}]},
 {"title": "Part 4: Put the Steps in Order", "directions": "Write 1, 2, 3, 4, 5.", "items": [
   {"type": "fill", "text": "____ pack&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____ receive&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____ ship&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____ stow&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;____ pick", "lines": 0}]}]]}

BR_TEACHER = {
 "objective": "Bristol learns how an Amazon fulfillment center works (receive, stow, pick, pack, ship; robots carry pods, people pick) and how packages travel by truck, plane and ship, so she walks into Monday's visit as an expert. She practices her 4s, 6s, 7s, 8s and 9s and the multiply-or-add habit with Amazon stories. It is on Zoom: she says every answer and you type or tap it.",
 "materials": ["Zoom with screen share (open the <b>Class lesson</b>; teacher code 9110)", "At her house (ask Tia to set out): about 40 beans or counters, paper, a pencil and crayons", "A globe or world map you can hold up to the camera, if you have one", "Your whiteboard for her guesses (slide 2)", "Ask Tia to print the <b>Field Notes packet</b>: page 1 goes on the trip Monday; page 2 is for Tuesday"],
 "plan": [
  {"time": "0:00–0:04", "block": "Hello", "do": "Class slide 1. She tells you about a package she remembers."},
  {"time": "0:04–0:08", "block": "Guess", "do": "Class slide 2. Write her guesses on the whiteboard."},
  {"time": "0:08–0:14", "block": "Word Power", "do": "Class slide 3. Five words; she uses one in a sentence about Monday."},
  {"time": "0:14–0:22", "block": "The 5 steps", "do": "Class slides 4–5. Act out each step on camera; she puts the steps in order from memory."},
  {"time": "0:22–0:30", "block": "Robots and people", "do": "Class slides 6–7. Robots carry pods; people pick. She sorts the jobs."},
  {"time": "0:30–0:42", "block": "Amazon math", "do": "Class slides 8–9. Beans for 4 × 6 and 3 × 8; one add-or-multiply story."},
  {"time": "0:42–0:48", "block": "Around the world", "do": "Class slide 10. Truck, plane, ship. Use the globe if you have one."},
  {"time": "0:48–0:52", "block": "Expert quiz", "do": "Class slide 11."},
  {"time": "0:52–0:57", "block": "Get ready", "do": "Class slide 12. She picks her question for the guide and writes it on Field Notes page 1."},
  {"time": "0:57–1:00", "block": "Plan", "do": "Class slide 13. Tonight the after-class lesson; Monday the Field Notes; Tuesday she shares."}],
 "watch": ["Mixing up <b>pod</b> (tall shelf) and <b>tote</b> (small tub).", "Multiplying when the groups are not equal: ask \"Is every group the same?\"", "7s and 9s facts: use her 5-and-2 split from Lesson 7 (7 × 7 = 35 + 14)."],
 "packet_key": [{"item": "Page 1 (Field Notes)", "answer": "Her own answers from the trip; look at them together on Tuesday."},
                {"item": "Part 2", "answer": "1 tote · 2 robot · 3 conveyor belt · 4 deliver, package"},
                {"item": "Part 3", "answer": "5) 6 × 4 = 24 toys · 6) 3 × 9 = 27 boxes · 7) 9 + 8 = 17 packages"},
                {"item": "Part 4", "answer": "pack 4 · receive 1 · ship 5 · stow 2 · pick 3"}],
 "notes": "This bonus lesson does not lock or unlock anything; Lesson 8 still opens from her Lesson 7 Show What You Know. On Tuesday, start with 3 minutes of her Field Notes before Lesson 8."}

BR_TASKS = ["Sunday night: do the <a href=\"lesson-a1.html\"><b>Inside Amazon After-class lesson</b></a>. It ends with <b>Show What You Know</b>.",
            "Monday at Amazon: bring <a href=\"packet-a1.html\"><b>Field Notes page 1</b></a> and fill it in on the trip.",
            "Tuesday: bring your Field Notes to class. Page 2 of the packet is for Tuesday night."]

# ───────────────────────────── BAILEY ─────────────────────────────
BA_VOCAB = [
 {"word": "fulfillment center", "pos": "noun", "emoji": "🏭", "meaning": "A giant building where orders are stored, packed and sent out.", "example": "The <b>fulfillment center</b> is as big as many football fields."},
 {"word": "inventory", "pos": "noun", "emoji": "🗄️", "meaning": "All the items a business has ready to sell.", "example": "Computers keep track of every item in the <b>inventory</b>."},
 {"word": "logistics", "pos": "noun", "emoji": "🧭", "meaning": "Planning how to move things to the right place at the right time.", "example": "Good <b>logistics</b> gets a package to you in one or two days."},
 {"word": "automated", "pos": "adjective", "emoji": "🤖", "meaning": "Done by machines that run by themselves.", "example": "The label machine is <b>automated</b>: no one has to stick labels on by hand."},
 {"word": "global", "pos": "adjective", "emoji": "🌍", "meaning": "Having to do with the whole world.", "example": "Amazon is a <b>global</b> company that ships to many countries."},
 {"word": "efficient", "pos": "adjective", "emoji": "⚡", "meaning": "Doing a job well without wasting time or energy.", "example": "Robots make picking more <b>efficient</b> because workers walk less."},
]

BA_STEPS = ["📥 Receive: trucks unload boxes of new items into the building.",
            "🗄️ Stow: workers put items into any open bin on a yellow pod, and the computer remembers exactly where each one is.",
            "🛒 Pick: a robot drives the pod to a worker, who takes out the ordered item and puts it in a yellow tote.",
            "📦 Pack: a computer suggests the right box size, and a machine measures just enough tape.",
            "🏷️ SLAM: the box rolls under a machine that Scans, Labels, Applies and Manifests it. The package is weighed to check that everything is inside.",
            "🚚 Ship: a sorter reads the label and sends the package down the slide to the right truck."]

BA_TEACH = [
 {"type": "hello", "title": "Inside Amazon", "text": "On Monday you get to go inside Amazon! 🎉 Today you find out how one order travels through a giant building and out to the whole world.", "visual": {"kind": "emoji", "text": "🏭📦🤖🌍"},
  "notes": notes("Share your screen. This is a bonus lesson to get her ready for Monday's Amazon visit. Today is Zoom, so she writes and types nothing in class: she says every answer, and you type or tap exactly what she says. Ask Tia before class to set out paper and a pencil.",
                 "On Monday you will see one of the biggest buildings you have ever been in. Today you become the expert first.",
                 "What is something your family ordered that came really fast?",
                 "A real example. Ask: how do you think it got there so fast?")},
 {"type": "talk", "kick": "Predict", "title": "Make a prediction", "text": "Make a prediction. You will check it at the end.", "prompts": ["How many items do you think one fulfillment center can hold?", "Do robots or people do most of the work? Why do you think so?", "How could a package get from Florida to a family in Japan?"], "starters": ["I predict … because …", "I think … do most of the work because …", "First the package … then …"],
  "notes": notes("4 minutes. Write her three predictions on the whiteboard and keep them on camera. You check them on slide 12.", listen="Predictions with a reason (because …).")},
 {"type": "vocab", "kick": "Word Power", "title": "Words for today", "text": "Read each card out loud. Then use it in your own sentence.", "words": BA_VOCAB,
  "notes": notes("She tells you which card to flip and reads each word aloud. She makes a sentence about Monday with two of the words.", ask="Use logistics and efficient in one sentence.", listen="Logistics = planning how things move; efficient = no wasted time.")},
 {"type": "learn", "kick": "Learn", "title": "How one order moves", "text": "Inside a fulfillment center, every order follows the same path.", "steps": [{"text": s} for s in BA_STEPS], "tip": "Receive, stow, pick, pack, SLAM, ship.",
  "notes": notes("Go one step at a time. After each step, she says it back in her own words.", "Stowing looks messy on purpose: a toy can sit next to a toothbrush. The computer remembers every spot, so any open space can be used.", "Why would putting items in any open bin be more efficient than giving every type of item its own shelf?", "No wasted space, and workers stow faster.")},
 {"type": "order", "kick": "Put in order", "title": "Follow the order", "text": "Say the steps in order. Jonathan taps them.", "steps": BA_STEPS, "why": "Receive, stow, pick, pack, SLAM, ship.", "hint": "The label goes on after the box is packed.",
  "notes": notes("She says the order from memory; you tap the steps in her order.", listen="SLAM comes after pack and before ship.")},
 {"type": "learn", "kick": "Learn", "title": "Robots and people", "text": "Amazon put its <b>one-millionth robot</b> to work in 2025. But people are still part of every order.", "visual": {"kind": "emoji", "text": "🤖 + 🙋 = 📦"},
  "steps": [{"text": "<b>Robots</b> slide under the yellow pods and drive them to workers, so workers do not have to walk miles of aisles."}, {"text": "<b>People</b> pick and stow items, check the work, and fix problems, like a robot that gets stuck."}, {"text": "<b>Automated machines</b> measure tape, print labels and sort packages to the right trucks."}],
  "tip": "Robots bring the shelf to the person. That makes the work more efficient.",
  "notes": notes("On Monday the robots work in a fenced area so people stay safe.", ask="Why is it more efficient for the shelf to come to the person?", listen="It saves walking time, so orders move faster.")},
 {"type": "sort", "kick": "Sort it", "title": "Robot, machine or person?", "text": "Tap a job. Then tap the box.", "buckets": ["🤖 Robot or automated machine", "🙋 Person"],
  "items": [{"text": "Drive a pod to the pick station", "b": 0, "why": "Robots drive the pods.", "hint": "Who lifts the pods?"},
            {"text": "Print and stick the shipping label", "b": 0, "why": "The SLAM machine labels the box automatically.", "hint": "It happens on the moving belt."},
            {"text": "Choose the right item from a crowded bin", "b": 1, "why": "A person looks at the screen and picks the item.", "hint": "Who uses their hands to grab it?"},
            {"text": "Reset a robot that stopped on the floor", "b": 1, "why": "A floor monitor fixes stuck robots.", "hint": "Can a stuck robot fix itself?"},
            {"text": "Send each package down the right slide", "b": 0, "why": "An automated sorter reads the label and picks the slide.", "hint": "The sorter reads the label."}],
  "notes": notes("She tells you the job and the box; you tap. Ask her to explain two of them.")},
 {"type": "tap", "kick": "Amazon math", "title": "Estimate, then multiply", "text": "Estimate first. Then solve on paper and say the answer. Jonathan types it.",
  "items": [{"q": "A truck holds <b>236 packages</b>. Which is the best estimate for <b>4 trucks</b>?", "choices": ["between 800 and 1,200", "between 80 and 120", "between 8,000 and 12,000"], "a": 0, "why": "200 × 4 = 800 and 300 × 4 = 1,200.", "no": [None, "236 is more than 100, so 4 trucks hold more than 400.", "Too many zeros. 300 × 4 = 1,200."]},
            {"type": "fill", "q": "Now solve it: <b>236 × 4</b> = ____ packages", "answers": ["944"], "why": "200 × 4 = 800, 30 × 4 = 120, 6 × 4 = 24. 800 + 120 + 24 = 944. It is between 800 and 1,200 ✔.", "no": "Use three boxes: 200, 30 and 6. Multiply each by 4, then add.", "hint": "800 + 120 + 24", "visual": {"kind": "area", "b": 4, "split": [200, 30, 6], "show": False}},
            {"type": "fill", "q": "A pick station gets <b>24 pods</b> an hour. Each pod has <b>12 bins</b>. How many bins in an hour? <b>24 × 12</b> = ____", "answers": ["288"], "why": "20 × 10 = 200, 20 × 2 = 40, 4 × 10 = 40, 4 × 2 = 8. 200 + 40 + 40 + 8 = 288.", "no": "Use four boxes: 20 and 4 across, 10 and 2 down.", "hint": "200 + 40 + 40 + 8"},
            {"type": "fill", "q": "<b>56 totes</b> are shared equally among <b>8 workers</b>. How many totes does each worker get?", "answers": ["7"], "why": "8 × 7 = 56, so 56 ÷ 8 = 7 totes.", "no": "Think: 8 times what is 56?", "hint": "8 × ? = 56"}],
  "notes": notes("She works on paper, holds it up, and says each answer; you type it. The estimate always comes first.", ask="Does your answer match your estimate?", listen="She checks the answer against the estimate without being asked.")},
 {"type": "learn", "kick": "Learn", "title": "A global network", "text": "Amazon sends packages to customers in more than <b>100 countries</b>. Good logistics plans every trip.", "visual": {"kind": "emoji", "text": "🚚 ✈️ 🚢 🛸"},
  "steps": [{"text": "🚢 <b>Ships</b> carry huge containers of items across oceans to fulfillment centers."}, {"text": "✈️ <b>Amazon cargo planes</b> fly packages between faraway cities."}, {"text": "🚚 <b>Trucks and vans</b> bring packages from delivery stations to front doors."}, {"text": "🛸 Amazon is even testing <b>drones</b> that fly small packages to some homes."}],
  "tip": "Amazon has fulfillment centers in many countries, so many orders never cross an ocean at all.",
  "notes": notes("Hold up a globe or map if you have one. Trace a route: a factory overseas → ship → fulfillment center in Florida → truck → her house.", ask="Why would Amazon build fulfillment centers in many countries instead of one giant one?", listen="Packages arrive faster and travel less.")},
 {"type": "tap", "kick": "Think about it", "title": "Logistics puzzles", "text": "Say the answer and your reason. Jonathan taps it.",
  "items": [{"q": "A family in Japan orders a book. What is the most <b>efficient</b> plan?", "choices": ["ship it from a fulfillment center in Japan", "fly one book from Florida", "send it by boat from Florida"], "a": 0, "why": "If the book is already in a nearby fulfillment center, it travels the shortest distance.", "no": [None, "That works, but it travels much farther than it needs to.", "That would take weeks."]},
            {"q": "Why does the SLAM machine <b>weigh</b> every package?", "choices": ["to check that everything is inside", "to make the box lighter", "to pick a color"], "a": 0, "why": "If the weight is wrong, something may be missing.", "no": [None, "Weighing does not change the box.", "Weight has nothing to do with color."]},
            {"q": "What does <b>inventory</b> mean?", "choices": ["all the items a business has ready to sell", "the trucks a business owns", "the people who work there"], "a": 0, "why": "Inventory is the stock of items ready to sell.", "no": [None, "Trucks are part of shipping, not inventory.", "Those are the workers."]}],
  "notes": notes("She explains each reason before you tap.")},
 {"type": "talk", "kick": "Get ready", "title": "Be a smart visitor", "text": "Think about Monday.", "prompts": ["The tour asks for closed shoes and long hair tied back. Why do those rules matter in a busy building?", "Write one question for the guide. Make it one you cannot answer yet.", "What will you count or measure on the tour?"], "starters": ["Those rules matter because …", "My question is …", "I will count …"],
  "notes": notes("Help her choose a strong question for the guide and write it on Field Notes page 1. Remind her that photos are allowed only at the marked spots.", ask="What is your question for the guide?", listen="A question that needs the guide, like 'How many items can this building hold?'")},
 {"type": "learn", "kick": "Check your predictions", "title": "Were you right?", "text": "Look at your predictions from the start.", "steps": [{"text": "A big fulfillment center can hold <b>millions</b> of items at once."}, {"text": "Robots and people work <b>together</b>: robots carry, people pick and check."}, {"text": "Amazon has fulfillment centers in Japan, so many orders there ship from <b>nearby</b>."}], "tip": "On Monday, see if you can find proof!",
  "notes": notes("Hold up the whiteboard. She checks each prediction: right, close, or changed her mind.", ask="Which prediction surprised you most?")},
 {"type": "learn", "kick": "Your plan", "title": "Before and after the trip", "steps": [{"text": "<b>Tonight:</b> do the After-class lesson. It ends with Show What You Know."}, {"text": "<b>Monday at Amazon:</b> bring your <b>Field Notes</b> (page 1). Fill it in on the trip."}, {"text": "<b>Tuesday:</b> bring your Field Notes to class and tell me one fact you learned."}], "tip": "Have fun on Monday!",
  "notes": notes("Show her the Field Notes on the course page. Ask Tia to print page 1 for the trip.", ask="What will you do tonight? What will you bring on Monday?")},
]

BA_SLIDES = [
 {"type": "hello", "title": "Inside Amazon: On Your Own", "text": "In class you followed one order through a fulfillment center and out to the world. Now show what you know. It takes about 20 minutes. Keep paper and a pencil next to you.", "visual": {"kind": "emoji", "text": "🏭📦🌍"}},
 {"type": "talk", "kick": "Say it", "title": "Teach it to someone", "text": "Find someone at home. Teach them out loud.", "prompts": ["Explain the six steps an order follows.", "Explain why robots make picking more efficient.", "Explain how a package could travel to another country."], "starters": ["First … next … finally …", "Robots make it efficient because …", "The package could …"]},
 {"type": "vocab", "kick": "Word Power", "title": "Remember the words", "text": "Say the meaning before you flip the card. Then flip to check.", "words": BA_VOCAB},
 {"type": "order", "kick": "Put in order", "title": "Follow the order", "text": "Tap the steps in the right order.", "steps": BA_STEPS, "why": "Receive, stow, pick, pack, SLAM, ship.", "hint": "The label goes on after the box is packed."},
 {"type": "tap", "kick": "Your turn", "title": "Amazon math on paper", "text": "Estimate first. Then solve on paper and type the answer.",
  "items": [{"type": "fill", "q": "A cart carries <b>148 boxes</b>. How many boxes on <b>6 carts</b>? <b>148 × 6</b> = ____", "answers": ["888"], "why": "100 × 6 = 600, 40 × 6 = 240, 8 × 6 = 48. 600 + 240 + 48 = 888.", "no": "Use three boxes: 100, 40 and 8.", "hint": "600 + 240 + 48", "visual": {"kind": "area", "b": 6, "split": [100, 40, 8], "show": False}},
            {"type": "fill", "q": "<b>13 robots</b> each move <b>15 pods</b>. <b>13 × 15</b> = ____ pods", "answers": ["195"], "why": "10 × 10 = 100, 10 × 5 = 50, 3 × 10 = 30, 3 × 5 = 15. 100 + 50 + 30 + 15 = 195.", "no": "Use four boxes: 10 and 3 across, 10 and 5 down.", "hint": "100 + 50 + 30 + 15"}]},
 {"type": "check", "title": "Show What You Know", "sets": [
   [{"q": "Which step comes right after <b>pack</b>?", "choices": ["SLAM", "stow", "receive"], "a": 0, "why": "Pack, then <b>SLAM</b> (the label), then ship.", "no": [None, "Stow comes before pick.", "Receive is the first step."]},
    {"q": "Why do robots bring pods to the workers?", "choices": ["so workers walk less and orders move faster", "so the robots can pick the items", "so the pods stay clean"], "a": 0, "why": "It saves walking time. That is <b>efficient</b>.", "no": [None, "People still pick the items.", "That is not the reason."]},
    {"q": "What does <b>logistics</b> mean?", "choices": ["planning how to move things to the right place at the right time", "a kind of robot", "a box size"], "a": 0, "why": "Logistics is planning how things move.", "no": [None, "Robots are machines, not plans.", "Not a box."]},
    {"q": "Which is the best estimate for <b>312 × 3</b>?", "choices": ["about 900", "about 90", "about 9,000"], "a": 0, "why": "300 × 3 = 900.", "no": [None, "312 is about 300, and 300 × 3 = 900.", "Too many zeros."]},
    {"type": "fill", "q": "<b>312 × 3</b> = ____", "answers": ["936"], "why": "900 + 30 + 6 = 936.", "no": "Three boxes: 300, 10 and 2.", "hint": "900 + 30 + 6"},
    {"type": "fill", "q": "<b>21 × 14</b> = ____", "answers": ["294"], "why": "200 + 80 + 10 + 4 = 294.", "no": "Four boxes: 20 and 1 across, 10 and 4 down.", "hint": "200 + 80 + 10 + 4"},
    {"q": "Why does Amazon have fulfillment centers in many countries?", "choices": ["so packages travel a shorter distance", "so every building can be empty", "so trucks are not needed"], "a": 0, "why": "Nearby centers mean faster, shorter trips.", "no": [None, "The buildings are full of inventory.", "Trucks still bring the packages home."]},
    {"q": "Which word means <b>done by machines that run by themselves</b>?", "choices": ["automated", "global", "inventory"], "a": 0, "why": "<b>Automated</b> means machines do it.", "no": [None, "Global means about the whole world.", "Inventory is the items for sale."]}],
   [{"q": "Which step comes right after <b>stow</b>?", "choices": ["pick", "ship", "SLAM"], "a": 0, "why": "Receive, stow, <b>pick</b>, pack, SLAM, ship.", "no": [None, "Ship is last.", "SLAM comes after pack."]},
    {"q": "What does the SLAM machine do?", "choices": ["scans, labels and checks each package", "drives the pods", "unloads the trucks"], "a": 0, "why": "SLAM = Scan, Label, Apply, Manifest. It weighs the package too.", "no": [None, "Robots drive the pods.", "Workers unload at the receive step."]},
    {"q": "What does <b>global</b> mean?", "choices": ["having to do with the whole world", "very small", "made by hand"], "a": 0, "why": "Global = the whole world.", "no": [None, "Not about size.", "That is the opposite of automated."]},
    {"q": "Which is the best estimate for <b>189 × 5</b>?", "choices": ["between 500 and 1,000", "between 50 and 100", "between 5,000 and 10,000"], "a": 0, "why": "100 × 5 = 500 and 200 × 5 = 1,000.", "no": [None, "189 is more than 100, so the answer is more than 500.", "Too many zeros."]},
    {"type": "fill", "q": "<b>189 × 5</b> = ____", "answers": ["945"], "why": "500 + 400 + 45 = 945.", "no": "Three boxes: 100, 80 and 9.", "hint": "500 + 400 + 45"},
    {"type": "fill", "q": "<b>32 × 13</b> = ____", "answers": ["416"], "why": "300 + 90 + 20 + 6 = 416.", "no": "Four boxes: 30 and 2 across, 10 and 3 down.", "hint": "300 + 90 + 20 + 6"},
    {"q": "A family in Florida orders shoes. Where will they most likely come from?", "choices": ["a fulfillment center in the United States", "a center on another continent", "the store's website"], "a": 0, "why": "Most orders ship from a nearby fulfillment center.", "no": [None, "That would be a much longer trip.", "A website cannot ship shoes."]},
    {"q": "Which word means <b>doing a job without wasting time or energy</b>?", "choices": ["efficient", "logistics", "fulfillment center"], "a": 0, "why": "<b>Efficient</b> means no wasted time or energy.", "no": [None, "Logistics is planning how things move.", "That is the building."]}]]},
]

BA_PRACTICE = {"intro": "Three tries on each one. Only your first try counts. Estimate first.", "questions": [
 {"type": "fill", "q": "<b>254 × 3</b> = ____", "answers": ["762"], "why": "600 + 150 + 12 = 762.", "no": "Three boxes: 200, 50 and 4.", "hint": "600 + 150 + 12"},
 {"type": "fill", "q": "<b>17 × 12</b> = ____", "answers": ["204"], "why": "100 + 20 + 70 + 14 = 204.", "no": "Four boxes: 10 and 7 across, 10 and 2 down.", "hint": "100 + 20 + 70 + 14"},
 {"q": "Which is the best estimate for <b>421 × 7</b>?", "choices": ["between 2,800 and 3,500", "between 280 and 350", "between 28,000 and 35,000"], "a": 0, "why": "400 × 7 = 2,800 and 500 × 7 = 3,500.", "no": [None, "4 hundreds × 7 = 28 hundreds = 2,800.", "Too many zeros."]},
 {"type": "fill", "q": "<b>48 packages</b> go equally into <b>6 bins</b>. How many in each bin?", "answers": ["8"], "why": "6 × 8 = 48.", "no": "6 times what is 48?", "hint": "6 × ? = 48"},
 {"q": "What does <b>inventory</b> mean?", "choices": ["all the items a business has ready to sell", "a shipping truck", "a robot"], "a": 0, "why": "Inventory is the items ready to sell.", "no": [None, "A truck carries packages.", "A robot carries pods."]},
 {"q": "Which step happens right before <b>ship</b>?", "choices": ["SLAM", "pick", "receive"], "a": 0, "why": "The label goes on (SLAM), then the package ships.", "no": [None, "Pick is earlier.", "Receive is first."]}]}

BA_FIELD = [
 {"title": "Part 1: My Amazon Field Notes", "directions": "Take this page with you on Monday. Fill it in during or after the tour.", "items": [
   {"type": "fill", "text": "1. My question for the guide:", "lines": 1},
   {"type": "fill", "text": "2. The guide's answer:", "lines": 1},
   {"type": "fill", "text": "3. One step I saw (receive, stow, pick, pack, SLAM or ship), and what happened:", "lines": 2},
   {"type": "fill", "text": "4. A number I learned on the tour, and what it measures:", "lines": 1},
   {"type": "choice", "text": "5. Circle each one you saw:", "options": ["robots", "yellow pods", "yellow totes", "conveyor belts", "SLAM machine", "trucks"]},
   {"type": "draw", "text": "6. Sketch one machine and label its parts.", "height": 2.0}]}]

BA_PACKET = {"title": "Inside Amazon: Field Notes", "pages": [BA_FIELD, [
 {"title": "Part 2: Word Power", "directions": "Write the best word from the bank in each blank. One word is extra.", "items": [
   {"type": "bank", "words": ["fulfillment center", "inventory", "logistics", "automated", "global", "efficient"]},
   {"type": "fill", "text": "1. The label machine is ______________: it works by itself.", "lines": 0},
   {"type": "fill", "text": "2. A ______________ company ships to many countries.", "lines": 0},
   {"type": "fill", "text": "3. The computer tracks every item in the ______________.", "lines": 0},
   {"type": "fill", "text": "4. Robots make picking more ______________ because workers walk less.", "lines": 0},
   {"type": "fill", "text": "5. Good ______________ gets packages to the right place on time.", "lines": 0}]},
 {"title": "Part 3: Amazon Math", "directions": "Estimate first. Then use an area model.", "items": [
   {"type": "problem", "text": "6. A truck holds 225 packages. How many on 4 trucks? Estimate: ________", "lines": 2},
   {"type": "problem", "text": "7. 14 robots each move 12 pods. How many pods? Estimate: ________", "lines": 2}]},
 {"title": "Part 4: Write About It", "directions": "Answer in 2 or 3 complete sentences.", "items": [
   {"type": "write", "text": "8. After your visit: what surprised you most, and why?", "lines": 3}]}]]}

BA_TEACHER = {
 "objective": "Bailey learns how an Amazon fulfillment center works (receive, stow, pick, pack, SLAM, ship), why robots make picking efficient, and how a global network of ships, planes and trucks moves packages, so she walks into Monday's visit as an expert with her own question for the guide. She practices Saturday's skill: estimate first, then a three-box or four-box area model. It is on Zoom: she says every answer and you type or tap it.",
 "materials": ["Zoom with screen share (open the <b>Class lesson</b>; teacher code 9110)", "At her house (ask Tia to set out): paper and a pencil", "A globe or world map you can hold up to the camera, if you have one", "Your whiteboard for her predictions (slides 2 and 12)", "Ask Tia to print the <b>Field Notes packet</b>: page 1 goes on the trip Monday; page 2 is for Tuesday"],
 "plan": [
  {"time": "0:00–0:04", "block": "Hello", "do": "Class slide 1. A fast delivery she remembers."},
  {"time": "0:04–0:08", "block": "Predict", "do": "Class slide 2. Write her three predictions on the whiteboard."},
  {"time": "0:08–0:15", "block": "Word Power", "do": "Class slide 3. Six words; one sentence with two of them."},
  {"time": "0:15–0:24", "block": "How one order moves", "do": "Class slides 4–5. Six steps, then the order from memory."},
  {"time": "0:24–0:31", "block": "Robots and people", "do": "Class slides 6–7. Why the shelf comes to the person; she sorts the jobs."},
  {"time": "0:31–0:43", "block": "Amazon math", "do": "Class slide 8. Estimate first every time; area models on paper."},
  {"time": "0:43–0:50", "block": "A global network", "do": "Class slides 9–10. Ship, plane, truck, drone; logistics puzzles."},
  {"time": "0:50–0:55", "block": "Get ready", "do": "Class slide 11. She writes her question for the guide on Field Notes page 1."},
  {"time": "0:55–1:00", "block": "Check predictions + plan", "do": "Class slides 12–13. Tonight the after-class lesson; Monday the Field Notes; Tuesday she shares one fact."}],
 "watch": ["Skipping the estimate: ask for it before she multiplies.", "Area model: a missing box in 2-digit × 2-digit (24 × 12 needs all four: 200, 40, 40, 8).", "Order of SLAM and ship: the label goes on before the package goes to the truck."],
 "packet_key": [{"item": "Page 1 (Field Notes)", "answer": "Her own answers from the trip; look at them together on Tuesday."},
                {"item": "Part 2", "answer": "1 automated · 2 global · 3 inventory · 4 efficient · 5 logistics (extra word: fulfillment center)"},
                {"item": "Part 3", "answer": "6) estimate 800–1,200 (or about 900); 225 × 4 = 800 + 80 + 20 = 900 packages · 7) estimate about 140 (14 × 10); 14 × 12 = 100 + 20 + 40 + 8 = 168 pods"},
                {"item": "Part 4", "answer": "Her own 2–3 sentences with a reason."}],
 "notes": "This bonus lesson does not lock or unlock anything; Lesson 8 still opens from her Lesson 7 Show What You Know. On Tuesday, start with 3 minutes of her Field Notes before Lesson 8."}

BA_TASKS = ["Sunday night: do the <a href=\"lesson-a1.html\"><b>Inside Amazon After-class lesson</b></a>. It ends with <b>Show What You Know</b>.",
            "Monday at Amazon: bring <a href=\"packet-a1.html\"><b>Field Notes page 1</b></a> and fill it in on the trip.",
            "Tuesday: bring your Field Notes to class. Page 2 of the packet is for Tuesday night."]

def lesson(who, title, goal, desc, teach, slides, practice, packet, teacher, tasks):
    return {"after": 7, "id": "a1", "date": DATE, "mode": "Zoom", "ln": "Bonus lesson · Amazon trip",
            "student": who, "title": title, "goal": goal, "card": {"desc": desc}, "win": "You are an Amazon expert now. Have an amazing trip!",
            "teach": {"slides": teach}, "slides": slides, "practice": practice, "packet": packet, "teacher": teacher, "tasks": tasks, "also": []}

out = {
 "bristol": [lesson("bristol", "Inside Amazon: How a Package Travels", "I can tell the 5 steps a package takes inside Amazon and how it travels the world.",
   "Bonus lesson before the Amazon trip on Monday. Bristol learns the 5 steps inside an Amazon fulfillment center (receive, stow, pick, pack, ship), how robots and people work together, and how packages travel by truck, plane and ship. She uses her times tables in Amazon stories and gets her <b>Field Notes</b> ready for the trip.",
   BR_TEACH, BR_SLIDES, BR_PRACTICE, BR_PACKET, BR_TEACHER, BR_TASKS)],
 "bailey": [lesson("bailey", "Inside Amazon: From Click to Doorstep", "I can explain how an order moves through a fulfillment center and around the world.",
   "Bonus lesson before the Amazon trip on Monday. Bailey follows one order through an Amazon fulfillment center (receive, stow, pick, pack, SLAM, ship), learns why robots make the work efficient, and sees how ships, planes and trucks move packages around the world. She estimates and uses area models with Amazon numbers and gets her <b>Field Notes</b> ready for the trip.",
   BA_TEACH, BA_SLIDES, BA_PRACTICE, BA_PACKET, BA_TEACHER, BA_TASKS)],
}
json.dump(out, open(f"{HERE}/data/bonus.json", "w"), ensure_ascii=False, indent=1)
print("wrote data/bonus.json")
