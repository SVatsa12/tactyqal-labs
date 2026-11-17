/**
 * Fallback blog content so the site is never empty before the WordPress import runs.
 * Titles match real posts on the old Tactyqal blog; bodies are original.
 * Slugs are the real WordPress slugs (see the old blog URLs), so `import:wp` adopts these rows instead of duplicating them.
 */

export type SeedTerm = { name: string; slug: string };

export type SeedPost = {
  title: string;
  slug: string;
  excerpt: string;
  category: SeedTerm;
  tags: SeedTerm[];
  /** Days before the seed run; only used when the post is first created. */
  daysAgo: number;
  content: string;
};

const cat = {
  entrepreneurship: { name: "Entrepreneurship", slug: "entrepreneurship" },
  ideas: { name: "Startup Ideas", slug: "startup-ideas" },
  building: { name: "Building a Startup", slug: "building-a-startup" },
} satisfies Record<string, SeedTerm>;

const tag = (name: string): SeedTerm => ({
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
});

const list = (items: string[]) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;
const olist = (items: string[]) => `<ol>${items.map((i) => `<li>${i}</li>`).join("")}</ol>`;

export const seedPosts: SeedPost[] = [
  {
    title: "The elevator pitch for business entrepreneurs (with examples)",
    slug: "elevator-pitch-with-examples-for-business-entrepreneurs",
    excerpt:
      "A good elevator pitch explains what you are building, who it is for and why it matters in under a minute. Here is a simple structure, three worked examples and the mistakes to avoid.",
    category: cat.entrepreneurship,
    tags: [tag("Pitching"), tag("Communication"), tag("Founders")],
    daysAgo: 3,
    content: `
<p>Every founder gets the same question again and again: <em>"So, what are you working on?"</em> Your answer to that question is your elevator pitch. It is short, it is spoken, and it decides whether the other person leans in or politely changes the subject.</p>
<p>A good pitch is not a summary of everything you have done. It is a clear, confident answer that makes the listener want to ask a second question.</p>

<h2>A simple structure that works</h2>
<p>Most strong pitches answer four things, in this order:</p>
${olist([
  "<strong>The problem.</strong> Who is struggling, and with what? Make it specific enough to picture.",
  "<strong>Your solution.</strong> What you built, described in plain words, not features.",
  "<strong>Why it is different.</strong> The one thing you do that others do not.",
  "<strong>The ask or the hook.</strong> What you want next: feedback, a pilot user, an introduction.",
])}
<p>Aim for 30 to 60 seconds. If it takes longer, you are explaining, not pitching.</p>

<h2>Three examples</h2>
<h3>A study-planner app</h3>
<p>"Students preparing for board exams waste hours deciding what to study next. Our app looks at their syllabus and test scores and builds a daily plan in one tap. Unlike generic to-do apps, it adjusts after every mock test. We are looking for ten students to try it this month."</p>
<h3>A neighbourhood tiffin service</h3>
<p>"Working parents in our area want home-style lunches but do not have time to cook every morning. We connect them with home cooks within two kilometres, with a weekly menu and doorstep delivery. Every cook is someone the community already knows. We want feedback from five families before we launch."</p>
<h3>A tool for small shop owners</h3>
<p>"Small shop owners still track stock in notebooks and only notice shortages when a customer asks. We built a simple WhatsApp-based tracker that reminds them before items run out. No new app to learn. We are piloting with three shops on our street."</p>

<blockquote><p>If someone can repeat your pitch to a friend after hearing it once, it is ready.</p></blockquote>

<h2>Mistakes to avoid</h2>
${list([
  "Opening with your company name instead of the problem.",
  "Using jargon like “AI-powered synergy platform” that hides what you actually do.",
  "Listing every feature. Pick one that matters most.",
  "Forgetting the ask, so the conversation ends with nothing to follow up on.",
  "Memorising it word for word. Know the structure, then speak naturally.",
])}

<h2>How to practise</h2>
<p>Write your pitch down, then cut it in half. Say it out loud to a friend, a parent or a teacher, and ask them to explain it back to you. Wherever they stumble is where your pitch is unclear. Record yourself on your phone and listen once; you will hear the filler words immediately.</p>
<p>Finally, keep two versions ready: a ten-second line for introductions, and the full one-minute version for when someone asks for more. Founders who pitch often get better quickly, so treat every conversation as a chance to sharpen yours.</p>
`,
  },
  {
    title: "How to build a tech startup team",
    slug: "how-to-build-a-tech-startup-team-2",
    excerpt:
      "Your first team shapes everything that follows. Learn which roles matter early, how to find co-founders you can trust, and how to keep a small team moving fast together.",
    category: cat.building,
    tags: [tag("Team"), tag("Co-founders"), tag("Hiring")],
    daysAgo: 8,
    content: `
<p>Ideas are easy to come by. Teams that can turn an idea into a working product are much rarer. Whether you are starting a company or building a project with friends, the people you start with will shape how far you go.</p>

<h2>Start with the skills the idea needs</h2>
<p>Before you look for people, write down what the first version of your product actually requires. For most tech startups, early work falls into three buckets:</p>
${list([
  "<strong>Building:</strong> writing code, designing screens, setting up data and hosting.",
  "<strong>Talking to users:</strong> interviews, onboarding, support and collecting feedback.",
  "<strong>Getting the word out:</strong> content, partnerships, sales and community.",
])}
<p>A strong founding team covers all three between them. If everyone loves building and nobody wants to talk to users, the product will be beautiful and unused.</p>

<h2>Choosing co-founders</h2>
<p>A co-founder is not someone you hire; it is someone you will make hard decisions with for years. Look for:</p>
${list([
  "Shared values about how you work, how you treat people and what you will not compromise on.",
  "Complementary skills, so you are not doing the same job twice.",
  "Proof of follow-through. Have you finished something together before, even a small project?",
  "Honest communication, including the ability to disagree without it becoming personal.",
])}
<blockquote><p>Build something small together before you commit to building something big together.</p></blockquote>

<h2>Agree on the basics early</h2>
<p>Many early teams fall apart over things nobody discussed. Have the awkward conversations in the first month:</p>
${olist([
  "Who decides what, and how do you break a tie?",
  "How much time can each person realistically commit each week?",
  "How will ownership be shared, and what happens if someone leaves?",
  "What does success look like in six months?",
])}
<p>Write the answers down. It feels formal, but it prevents misunderstandings later.</p>

<h2>Your first hires</h2>
<p>When you start adding people beyond the founders, hire for ownership over credentials. In a small team, a curious person who takes responsibility for outcomes is worth more than an expert who waits for instructions. Give early team members real problems to solve, not just tasks to complete.</p>

<h2>Keep the team moving</h2>
${list([
  "Hold a short weekly check-in: what shipped, what is blocked, what is next.",
  "Keep one shared list of priorities so everyone works on what matters most.",
  "Celebrate small launches; momentum is a team's best fuel.",
  "Talk to users together, so everyone hears the same feedback first-hand.",
])}
<p>Great teams are built on trust, clarity and steady progress. Get those right, and the code, the design and the growth tend to follow.</p>
`,
  },
  {
    title: "11 reasons why startups fail at the idea stage",
    slug: "11-reasons-why-startups-fail-at-idea-stage",
    excerpt:
      "Most startups that fail never get past the idea. These are the eleven most common traps, from solving a problem nobody has to waiting for the perfect plan, and how to avoid each one.",
    category: cat.entrepreneurship,
    tags: [tag("Validation"), tag("Founders"), tag("Lessons")],
    daysAgo: 13,
    content: `
<p>We usually hear about startups that fail after launch. But many more never make it that far. They stall at the idea stage, often for reasons that are easy to spot once you know what to look for.</p>
<p>Here are eleven of the most common, along with what to do instead.</p>

<h2>The eleven traps</h2>
${olist([
  "<strong>Solving a problem nobody has.</strong> If you cannot name five people who struggle with it today, keep looking.",
  "<strong>Falling in love with the solution.</strong> Stay attached to the problem; be willing to change how you solve it.",
  "<strong>Skipping user conversations.</strong> Ten honest interviews will teach you more than a month of guessing.",
  "<strong>Asking leading questions.</strong> “Would you use this?” invites polite yeses. Ask how they handle the problem now.",
  "<strong>Building too much before testing.</strong> A landing page, a form or a mock-up can test demand in days.",
  "<strong>Ignoring existing alternatives.</strong> Your real competitor is often a spreadsheet, a WhatsApp group or doing nothing.",
  "<strong>Targeting “everyone”.</strong> A product for everyone is a product for no one. Pick one group to serve first.",
  "<strong>No clear way to reach users.</strong> Know where your first hundred users spend their time before you build.",
  "<strong>Waiting for the perfect plan.</strong> Plans change the moment real users arrive. Start small and adjust.",
  "<strong>Working alone for too long.</strong> Feedback from teammates and mentors catches blind spots early.",
  "<strong>Giving up after the first “no”.</strong> Early rejection is information. Ask why, then refine.",
])}

<blockquote><p>An idea is a guess. The job at the idea stage is to find out, as cheaply as possible, whether the guess is right.</p></blockquote>

<h2>A simple validation checklist</h2>
<p>Before writing serious code, try to tick these boxes:</p>
${list([
  "You can describe the problem in one sentence without mentioning your product.",
  "You have spoken to at least ten people who have the problem.",
  "Some of them are already trying to solve it with a workaround.",
  "At least a few signed up, paid, or asked when they can try it.",
  "You know the first place you will find more users like them.",
])}

<h2>Talking to users without leading them</h2>
<p>The most useful interview questions are about the past, not the future. Ask people to describe the last time they faced the problem, what they tried, what it cost them and what annoyed them most. Real stories reveal real needs. Opinions about a product that does not exist yet rarely do.</p>

<h2>Why this matters</h2>
<p>The idea stage is the cheapest time to be wrong. Changing direction costs a conversation, not months of work. Founders who treat early ideas as experiments, rather than promises, learn faster and waste less.</p>
<p>So test early, listen carefully and stay flexible. The goal is not to protect your first idea. It is to find the version of it that people genuinely need.</p>
`,
  },
  {
    title: "50 no-code startup app ideas",
    slug: "50-no-code-startup-ideas-to-build-without-programming-skills",
    excerpt:
      "You do not need to write code to launch a useful app. Here are 50 startup ideas you can build with no-code tools, grouped by theme, plus tips for picking the right one.",
    category: cat.ideas,
    tags: [tag("No-code"), tag("App ideas"), tag("Side projects")],
    daysAgo: 18,
    content: `
<p>No-code tools let you build working apps with visual editors, forms, spreadsheets and automations. They are perfect for testing an idea quickly before investing in custom software. Here are 50 ideas to get you started.</p>

<h2>Learning and school</h2>
${olist([
  "A homework planner that sends daily reminders.",
  "A peer-tutoring marketplace for your school.",
  "A flashcard library shared between classmates.",
  "An exam countdown with study-session tracking.",
  "A college application deadline tracker.",
  "A directory of free online courses by subject.",
  "A book-swap board for used textbooks.",
  "A group-project task manager.",
  "A reading-challenge tracker for book clubs.",
  "A scholarship finder filtered by eligibility.",
])}

<h2>Local community</h2>
${olist([
  "A neighbourhood lost-and-found board.",
  "A volunteer sign-up app for local events.",
  "A directory of home bakers and cooks.",
  "A tool-lending library for neighbours.",
  "A local sports team match scheduler.",
  "A society notice board with alerts.",
  "A pet-sitting exchange between neighbours.",
  "A carpool planner for school runs.",
  "A local events calendar.",
  "A small-shop discount and loyalty card.",
])}

<h2>Small business tools</h2>
${olist([
  "An appointment booking page for salons.",
  "An inventory tracker for small shops.",
  "A customer feedback collector with QR codes.",
  "An order form for home businesses.",
  "A simple invoice generator.",
  "A staff shift planner.",
  "A catalogue app for local boutiques.",
  "A delivery tracker for tiffin services.",
  "A lead tracker for freelancers.",
  "A client portal for tuition teachers.",
])}

<h2>Health and habits</h2>
${olist([
  "A habit tracker with streaks.",
  "A water-intake reminder.",
  "A workout log shared with friends.",
  "A screen-time reflection journal.",
  "A meal planner with grocery lists.",
  "A sleep diary with weekly summaries.",
  "A gratitude journal with prompts.",
  "A step-challenge leaderboard for teams.",
  "A medicine reminder for families.",
  "A meditation timer with session notes.",
])}

<h2>Creators and hobbies</h2>
${olist([
  "A portfolio site builder for young artists.",
  "A content calendar for creators.",
  "A recipe collection with ratings.",
  "A music practice log.",
  "A travel itinerary planner.",
  "A plant-care reminder app.",
  "A photography challenge community.",
  "A board-game night organiser.",
  "A personal finance tracker for students.",
  "A newsletter sign-up and archive.",
])}

<blockquote><p>Pick the idea you would use yourself. You will understand the problem better than anyone else.</p></blockquote>

<h2>How to choose</h2>
${list([
  "Start with a problem you or your friends face every week.",
  "Build the smallest version that solves one part of it.",
  "Share it with ten real users and watch how they use it.",
  "Improve what they actually use; drop what they ignore.",
])}
<p>No-code is a fast way to learn whether an idea has legs. If it does, you can always rebuild it with code later.</p>
`,
  },
  {
    title: "30 startup ideas to solve food waste",
    slug: "30-startup-ideas-for-solving-food-waste-problems",
    excerpt:
      "Food waste happens at every step from farm to fridge. Here are 30 startup ideas that tackle it, from surplus marketplaces to smarter kitchens, plus how to test one quickly.",
    category: cat.ideas,
    tags: [tag("Food waste"), tag("Sustainability"), tag("Social impact")],
    daysAgo: 23,
    content: `
<p>A huge amount of food is wasted between the farm and the plate, while many people still go hungry. That gap is a real problem, and real problems make good startup opportunities. Here are 30 ideas, grouped by where the waste happens.</p>

<h2>On farms and in supply chains</h2>
${olist([
  "A marketplace for “imperfect” fruit and vegetables.",
  "Cold-storage booking for small farmers.",
  "A demand forecaster for local markets.",
  "Direct farm-to-restaurant ordering.",
  "Solar-powered drying for surplus produce.",
  "A route planner to cut transport spoilage.",
])}

<h2>In shops and restaurants</h2>
${olist([
  "An end-of-day surplus app for bakeries.",
  "Discounted “mystery bags” of unsold food.",
  "Shelf-life tracking for small grocery stores.",
  "Smart portion planning for canteens.",
  "Surplus pickup for food banks and shelters.",
  "Menu tools that reuse ingredients across dishes.",
  "Dynamic pricing as products near expiry.",
  "A waste-audit service for restaurants.",
])}

<h2>At home</h2>
${olist([
  "A fridge tracker that warns before food spoils.",
  "Recipes built from leftover ingredients.",
  "A meal planner that shops only for what you need.",
  "A neighbourhood sharing board for spare food.",
  "Smart labels that show freshness at a glance.",
  "A family grocery list that avoids double-buying.",
  "Batch-cooking guides for busy households.",
  "A storage guide that explains how to keep food fresh longer.",
])}

<h2>Turning waste into value</h2>
${olist([
  "Composting pickup for apartment buildings.",
  "Home composting kits with guidance.",
  "Animal feed made from safe food scraps.",
  "Upcycled snacks from fruit peels or spent grain.",
  "Natural dyes made from food waste.",
  "Biogas units for schools and hostels.",
])}

<h2>Awareness and education</h2>
${olist([
  "A school challenge to measure and cut canteen waste.",
  "A tracker that shows the impact of food saved.",
])}

<blockquote><p>The best impact ideas solve a problem for the planet and save someone money at the same time.</p></blockquote>

<h2>What makes a food-waste idea work</h2>
<p>The strongest ideas in this space share a few traits. They make saving food easier than throwing it away. They give someone a clear reason to care, whether that is lower costs, extra income or less effort. And they work at a small scale first, in one street, one canteen or one market, before trying to grow. If your idea depends on changing everyone's habits overnight, look for a smaller first step.</p>

<h2>How to test one of these ideas</h2>
${list([
  "Visit a local shop, canteen or kitchen and ask what they throw away each week.",
  "Offer a manual version first, such as a WhatsApp group for surplus food.",
  "Measure what changes: kilograms saved, money saved, meals shared.",
  "Use those results to win your next partner.",
])}
<p>Food waste is a problem you can see in your own street. That makes it one of the best places for young founders to start building something that matters.</p>
`,
  },
  {
    title: "50 startup ideas for Gen-Z entrepreneurs",
    slug: "50-startup-ideas-for-generation-z-entrepreneurs",
    excerpt:
      "Gen-Z grew up online and understands problems older founders miss. Here are 50 startup ideas across creator tools, learning, money, wellbeing and sustainability to spark your first venture.",
    category: cat.ideas,
    tags: [tag("Gen-Z"), tag("Young founders"), tag("Startup ideas")],
    daysAgo: 28,
    content: `
<p>Gen-Z founders have an advantage: they understand the apps, habits and frustrations of their generation first-hand. Many of the best ideas come from noticing what does not work for you and your friends. Here are 50 to get you thinking.</p>

<h2>Creator economy</h2>
${olist([
  "Thumbnail and caption templates for new creators.",
  "A collab-matching app for small creators.",
  "Video editing as a service for local businesses.",
  "A merch store builder for student clubs.",
  "A podcast starter kit and guide.",
  "Analytics that explain growth in plain words.",
  "A brand-deal tracker for micro-influencers.",
  "Short-form video workshops for small shops.",
  "A meme-based marketing studio.",
  "A creator portfolio and media-kit builder.",
])}

<h2>Learning and careers</h2>
${olist([
  "Peer coding bootcamps run by students.",
  "A mock-interview practice app.",
  "Internship listings for school students.",
  "A skill-swap platform between friends.",
  "Exam-prep study rooms online.",
  "A resume builder for first jobs.",
  "Career talks with young professionals.",
  "A project showcase for student builders.",
  "Language exchange with peers abroad.",
  "A focus timer with group accountability.",
])}

<h2>Money and commerce</h2>
${olist([
  "A thrift and resale marketplace for clothes.",
  "Budgeting made simple for teenagers.",
  "Group-gifting for birthdays.",
  "A sneaker cleaning and restoration service.",
  "Custom phone cases and accessories.",
  "Gaming gear rental.",
  "Event ticket resale for school fests.",
  "Freelance gigs for students.",
  "A rent-a-camera service for creators.",
  "A local handmade-goods shop online.",
])}

<h2>Wellbeing and community</h2>
${olist([
  "A peer-support journaling app.",
  "A digital-detox challenge community.",
  "A fitness-buddy matcher.",
  "A study-break mindfulness app.",
  "A club and society discovery platform.",
  "A hobby meetup organiser.",
  "Safe-commute check-ins for friends.",
  "A playlist-based mood journal.",
  "A volunteering finder for teens.",
  "Mentorship matching with older students.",
])}

<h2>Sustainability and tech</h2>
${olist([
  "A campus e-waste collection drive.",
  "A second-hand textbook exchange.",
  "Upcycled fashion workshops.",
  "A carbon-footprint tracker for students.",
  "A repair café booking app.",
  "Reusable-bottle refill station maps.",
  "Smart reminders for no-plastic shopping.",
  "Tech help for older relatives.",
  "Website building for local shops.",
  "An app for organising school events.",
])}

<blockquote><p>You do not need a big idea to start. You need a real problem and the courage to ship a first version.</p></blockquote>

<h2>Why your age is an advantage</h2>
<p>Young founders often worry that they lack experience. But you have things many older founders do not: time to experiment, a network of peers who will give honest feedback, and a natural feel for the platforms your generation uses every day. Mistakes cost less when you are starting out, so this is the best time to try, learn and try again.</p>

<h2>Getting started</h2>
${list([
  "Pick one idea that excites you and that you understand well.",
  "Talk to ten people who would use it.",
  "Build a simple version in a weekend.",
  "Share it, learn from it and keep improving.",
])}
<p>Every big company started as a small experiment. Yours can start this week.</p>
`,
  },
];
