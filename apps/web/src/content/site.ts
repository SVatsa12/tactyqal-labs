/**
 * All homepage copy lives here. Components never hardcode copy.
 * Source of truth: https://tactyqal.com (live site). Do not invent facts,
 * numbers, names or quotes. Student count is always "100+ students mentored".
 */

// ---------------------------------------------------------------- types

export type Link = { label: string; href: string };

/** Icon keys are resolved to lucide icons in components/ui/icon.tsx. */
export type IconKey =
  | "user"
  | "blocks"
  | "trophy"
  | "graduation"
  | "wallet"
  | "infinity"
  | "presentation"
  | "lightbulb"
  | "sparkles"
  | "badge-dollar"
  | "users"
  | "file-chart"
  | "star"
  | "handshake"
  | "target"
  | "layout"
  | "mail"
  | "phone"
  | "clock"
  | "timer"
  | "search"
  | "pen"
  | "code"
  | "rocket";

/** Which CSS-built mockup screen to draw inside a phone frame. */
export type MockupKind = "insights" | "shop" | "subscription" | "pets" | "media" | "chat";

export type Stat = { value: string; label: string };

export type SuccessStory = {
  name: string;
  description: string;
  /** Short fact chips, each taken from the description on the live site. */
  highlights: string[];
  mockup: MockupKind;
};

export type ProgramStep = { weeks: string; title: string; icon: IconKey };

export type Feature = { title: string; description: string; icon: IconKey };

export type Tool = { name: string; href: string; icon: IconKey };

export type Testimonial = { name: string; quote: string };

export type FallbackPost = {
  title: string;
  excerpt: string;
  readMinutes: number;
  publishedAt: string; // ISO date
  href: string;
};

export type Faq = { question: string; answer: string };

export type ContactItem = { label: string; value: string; href?: string; icon: IconKey };

// ---------------------------------------------------------------- links

const BOOKING_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3JlaCrNitoPs8Bdr-FUP0cRfFI-MopSIH2azaPNDpRk56h6drYLbXSh-mDc9sfEZAQUKGdsUXs?gv=true";

// ---------------------------------------------------------------- content

export const site = {
  brand: {
    name: "Tactyqal Labs",
    shortName: "Tactyqal",
    homeLabel: "Tactyqal Labs home",
  },

  meta: {
    title: "Tactyqal Labs — Your teen builds a real app in 8 weeks",
    description:
      "1:1 mentoring that takes your teen from idea to a full-stack app in 8 weeks, with no coding. 100+ students mentored, top university admissions, grants and media coverage.",
  },

  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primaryNav: "Primary",
    footerNav: "Footer",
    opensInNewTab: "(opens in a new tab)",
  },

  nav: {
    links: [
      { label: "Success stories", href: "/#success" },
      { label: "Program", href: "/#program" },
      { label: "Why us", href: "/#why" },
      { label: "Tools", href: "/#tools" },
      { label: "Blog", href: "/blog" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
      { label: "Contact", href: "/#contact" },
    ] satisfies Link[],
    cta: { label: "Book free consultation", href: BOOKING_URL } satisfies Link,
  },

  hero: {
    eyebrow: "1:1 mentoring for teens",
    titleBefore: "Empower your kid to build the next app that",
    titleHighlight: "impacts millions",
    titleAfter: ", in 8 weeks",
    pillars: [
      "1:1 mentoring",
      "Idea to full-stack app",
      "No coding",
      "Admissions to the best colleges",
      "Grants",
      "Media coverage",
    ],
    primaryCta: { label: "Book free consultation", href: BOOKING_URL } satisfies Link,
    secondaryCta: { label: "See success stories", href: "/#success" } satisfies Link,
    stats: [
      { value: "100+", label: "Students mentored" },
      { value: "Top", label: "University admissions" },
      { value: "Thousands", label: "Of people impacted" },
    ] satisfies Stat[],
    offer: {
      label: "Limited time offer",
      originalPrice: "₹25,000",
      price: "₹16,000",
      guarantee: "Results guaranteed",
    },
    mockup: {
      appName: "KrishiDrishti",
      caption: "A student-built app",
      weekLabel: "Week 8",
      status: "Launched",
    },
  },

  success: {
    id: "success",
    eyebrow: "Success stories",
    title: "Real students. Real apps. Real success.",
    description:
      "Every one of these started as an idea in a teenager's head. Eight weeks later, it was a working product.",
    stories: [
      {
        name: "KrishiDrishti",
        description:
          "AI-powered soil analysis & crop recommendation app that can impact millions of local farmers in India.",
        highlights: ["AI-powered", "Farmers in India"],
        mockup: "insights",
      },
      {
        name: "Elenor Vegan Handbags",
        description:
          "Corporate gifting platform that sells vegan handbags, started by a 16 year old and generated INR 9,000 in the first week.",
        highlights: ["Founded at 16", "₹9,000 in week one"],
        mockup: "shop",
      },
      {
        name: "One Last Chapter",
        description:
          "Book subscription service for kids. Started by a 13-year old and is generating INR 100,000 monthly revenue.",
        highlights: ["Founded at 13", "₹100,000 / month"],
        mockup: "subscription",
      },
      {
        name: "Paws of Promise",
        description:
          "App for virtual pet adoption that connects pet lovers with pets from shelters.",
        highlights: ["Social impact", "Shelter adoptions"],
        mockup: "pets",
      },
      {
        name: "AudioNova",
        description: "AI music and video production company.",
        highlights: ["AI-powered", "Music & video"],
        mockup: "media",
      },
      {
        name: "Converza",
        description:
          "Spanish learning app featuring Luna, the friendly AI language learning bot.",
        highlights: ["AI tutor", "Language learning"],
        mockup: "chat",
      },
    ] satisfies SuccessStory[],
  },

  program: {
    id: "program",
    eyebrow: "The program",
    title: "From idea to full app in 8 weeks",
    description:
      "Personal 1:1 live sessions, one hour each, with expert guidance at every step.",
    steps: [
      { weeks: "Week 1–2", title: "Ideation & market research", icon: "search" },
      { weeks: "Week 3–4", title: "Design & prototyping", icon: "pen" },
      { weeks: "Week 5–6", title: "Full-stack development", icon: "code" },
      { weeks: "Week 7–8", title: "Launch & marketing", icon: "rocket" },
    ] satisfies ProgramStep[],
    quote: {
      text: "Learn to sell. Learn to build. If you can do both, you will be unstoppable.",
      author: "Naval Ravikant",
    },
    sessionFacts: ["Personal 1:1 live sessions", "1 hour each", "Expert guidance"],
    outcomesLabel: "What it leads to",
    outcomes: ["University admissions", "Revenue generation", "International recognition", "Grants"],
    cta: { label: "Start your journey today", href: BOOKING_URL } satisfies Link,
  },

  why: {
    id: "why",
    eyebrow: "Why Tactyqal",
    title: "Why parents choose Tactyqal Labs",
    description:
      "No group classes, no theory-only lectures. Your teen ships something real, with a mentor beside them the whole way.",
    features: [
      {
        title: "1:1 personalized mentoring",
        description: "Every student gets dedicated, expert guidance. No group classes.",
        icon: "user",
      },
      {
        title: "Full-stack app with no-code",
        description: "Build real apps using modern no-code tools and platforms.",
        icon: "blocks",
      },
      {
        title: "Proven track record",
        description: "100+ students mentored, real revenue, and top university admits.",
        icon: "trophy",
      },
      {
        title: "University admission edge",
        description: "Stand out in applications with real-world projects and achievements.",
        icon: "graduation",
      },
      {
        title: "Revenue generation",
        description: "Students learn to build, launch, and monetize their own apps.",
        icon: "wallet",
      },
      {
        title: "Lifelong support",
        description: "From ideation to launch, students master the full journey.",
        icon: "infinity",
      },
      {
        title: "Pitch & presentation skills",
        description: "Learn to pitch, present, and launch on Product Hunt.",
        icon: "presentation",
      },
      {
        title: "Startup Ideas 101",
        description: "Learn how to identify and validate profitable startup ideas from our founder.",
        icon: "lightbulb",
      },
    ] satisfies Feature[],
  },

  video: {
    eyebrow: "Startup Ideas 101",
    title: "How to come up with startup ideas",
    description:
      "Learn how to identify and validate profitable startup ideas from our founder, Partha Chakraborty, in this talk from a CH Tribe event.",
    youtubeId: "UyUH06CfLbk",
    startSeconds: 105,
    videoTitle: "How to Come Up with Startup Ideas? | A CH Tribe Event with Partha Chakraborty",
    playLabel: "Play video: How to come up with startup ideas",
    watchOnYoutube: { label: "Watch on YouTube", href: "https://www.youtube.com/watch?v=UyUH06CfLbk" },
    posterTitle: "How to come up with startup ideas",
    posterMeta: "Partha Chakraborty · CH Tribe event",
  },

  tools: {
    id: "tools",
    eyebrow: "Free tools",
    title: "Free tools to get started",
    description: "Explore our startup assessment tools, used by 1000+ entrepreneurs.",
    items: [
      { name: "Startup Idea Generator", href: "https://www.tactyqal.com/index.php/Questions/ideaDisplayer", icon: "sparkles" },
      { name: "Fundability Assessment", href: "https://tactyqal.com/Tests/Fundable-Startup", icon: "badge-dollar" },
      { name: "Team Evaluation Tool", href: "https://tactyqal.com/Tests/Startup-Team", icon: "users" },
      { name: "Pitch Deck Analyzer", href: "https://www.tactyqal.com/Tests/Pitch-Deck", icon: "file-chart" },
      { name: "Top 10 Traits for Business Success", href: "https://www.tactyqal.com/Tests/General-Success", icon: "star" },
      { name: "Cofounder Compatibility Test", href: "https://www.tactyqal.com/Tests/The-Right-Cofounder", icon: "handshake" },
      { name: "Problem-Solution Fit", href: "https://www.tactyqal.com/Tests/Problem-Solution-Fit", icon: "target" },
      { name: "Website Landing Page Assessment", href: "https://www.tactyqal.com/Tests/Landing-Page", icon: "layout" },
    ] satisfies Tool[],
    cta: { label: "Access all tools free", href: "https://tactyqal.com/Tests" } satisfies Link,
  },

  testimonials: {
    id: "testimonials",
    eyebrow: "In their words",
    title: "What our students say",
    items: [
      { name: "Aarav Sharma", quote: "I had to struggle to find a tech cofounder" },
      { name: "Isha Patel", quote: "Now I feel independent and can build anything I want" },
      { name: "Rohan Verma", quote: "It's the future" },
      { name: "Simran Kaur", quote: "I can focus on the creative side and don't have to worry about whether it can be built" },
      { name: "Devansh Mehta", quote: "I went on from having no idea to launching my app" },
      { name: "Priya Nair", quote: "My impact app was only in my head till I built it" },
    ] satisfies Testimonial[],
  },

  blog: {
    id: "blog",
    eyebrow: "From the blog",
    title: "Learn from industry experts",
    description: "Practical reads on startup ideas, pitching and building a team.",
    defaultAuthor: "Tactyqal",
    readMoreLabel: "Read article",
    minReadSuffix: "min read",
    allPostsCta: { label: "Read all articles", href: "https://tactyqal.com/blog" } satisfies Link,
    /** Number of posts to show on the homepage. */
    limit: 3,
    /** Shown only if the blog API is unreachable, so the section never renders empty. */
    fallbackPosts: [
      {
        title: "50 no-code startup app ideas",
        excerpt: "Find a list of 50 unique ideas you can explore for your startup…",
        readMinutes: 5,
        publishedAt: "2025-07-09",
        href: "https://tactyqal.com/blog/50-no-code-startup-ideas-to-build-without-programming-skills/",
      },
      {
        title: "The elevator pitch for business entrepreneurs",
        excerpt: "An elevator pitch is the fastest way to describe what your startup…",
        readMinutes: 3,
        publishedAt: "2024-05-01",
        href: "https://www.tactyqal.com/blog/elevator-pitch-with-examples-for-business-entrepreneurs/",
      },
      {
        title: "How to build a tech startup team?",
        excerpt: "In the early days, the fewer employees, the better. Managing people takes up a lot of time…",
        readMinutes: 4,
        publishedAt: "2024-04-20",
        href: "https://www.tactyqal.com/blog/how-to-build-a-tech-startup-team-2/",
      },
      {
        title: "11 reasons why startups fail at the idea stage",
        excerpt: "The default state of a startup is failure and there are many…",
        readMinutes: 3,
        publishedAt: "2024-04-10",
        href: "https://www.tactyqal.com/blog/11-reasons-why-startups-fail-at-idea-stage/",
      },
      {
        title: "30 startup ideas to solve food waste problems",
        excerpt: "Food waste is a massive problem. Every year, we throw away one-third of all food…",
        readMinutes: 4,
        publishedAt: "2024-03-15",
        href: "https://tactyqal.com/blog/30-startup-ideas-for-solving-food-waste-problems/",
      },
      {
        title: "50 startup ideas for Gen-Z entrepreneurs",
        excerpt: "Looking at the opportunities ahead, Generation Z entrepreneurs have advantages…",
        readMinutes: 6,
        publishedAt: "2024-03-05",
        href: "https://tactyqal.com/blog/50-startup-ideas-for-generation-z-entrepreneurs/",
      },
    ] satisfies FallbackPost[],
  },

  /** Public blog pages (/blog, /blog/[slug]). */
  blogPage: {
    eyebrow: "The Tactyqal blog",
    title: "Ideas, pitches and lessons for young founders",
    description:
      "Practical reads on finding startup ideas, pitching, building a team and launching, from the Tactyqal Labs team.",
    metaTitle: "Blog",
    allLabel: "All",
    categoriesLabel: "Filter by category",
    searchLabel: "Search articles",
    searchPlaceholder: "Search articles…",
    searchButton: "Search",
    clearSearch: "Clear",
    resultsFor: "Results for",
    emptyTitle: "No articles found",
    emptyBody: "Try a different search or category.",
    unavailableTitle: "The blog is taking a break",
    unavailableBody: "We couldn't load articles right now. Please try again in a minute.",
    prev: "Newer",
    next: "Older",
    pageLabel: "Page",
    ofLabel: "of",
    paginationLabel: "Blog pages",
    backToBlog: "All articles",
    tagsLabel: "Tags",
    ctaTitle: "Want your teen to build something like this?",
    ctaBody: "8 weeks of 1:1 mentoring, from idea to a launched full-stack app. No coding needed.",
    ctaButton: { label: "Book free consultation", href: BOOKING_URL } satisfies Link,
    notFoundTitle: "Article not found",
    notFoundBody: "This article may have moved or been unpublished.",
  },

  pricing: {
    id: "pricing",
    eyebrow: "Pricing",
    title: "Start your teen's entrepreneurial journey",
    description: "One program, everything included. From the first idea to a launched app.",
    planName: "8-week 1:1 program",
    offerBadge: "Limited time offer",
    originalPrice: "₹25,000",
    originalPriceLabel: "Original price",
    price: "₹16,000",
    priceLabel: "Offer price",
    includes: [
      "8 weeks of 1:1 mentoring",
      "Full-stack app development",
      "Product Hunt launch",
      "Pitch deck creation",
      "Marketing strategy",
      "Ongoing support",
    ],
    guarantee: "Results guaranteed or money back",
    scarcity: "Only 15 spots available for the month",
    cta: { label: "Enroll now", href: BOOKING_URL } satisfies Link,
  },

  faq: {
    id: "faq",
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    description: "Still unsure? Book a free 15-minute call and ask us anything.",
    items: [
      {
        question: "What if my teen has no coding experience?",
        answer: "No problem! Our program is designed for beginners. We use no-code tools and guide students step-by-step.",
      },
      {
        question: "How do you guarantee university admissions?",
        answer: "We help students build standout projects that strengthen their university applications.",
      },
      {
        question: "What kind of apps do students typically build?",
        answer:
          "Apps range from AI-powered tools, e-commerce platforms, subscription services, to social good projects. We help students pick ideas that excite them.",
      },
      {
        question: "How much time commitment is required?",
        answer: "About 2–3 hours per week, including 1 hour of live mentoring and independent work.",
      },
      {
        question: "What is the success rate?",
        answer: "100% of our students launch a working app and achieve their goals.",
      },
      {
        question: "Can my teen generate real revenue?",
        answer: "Yes! Many of our students have generated real revenue and even won grants & media coverage.",
      },
      {
        question: "What universities have your students gotten into?",
        answer: "Our alumni have been admitted to top universities in the US and UK, including the Ivy League.",
      },
      {
        question: "What ongoing support do you provide?",
        answer: "We offer ongoing support, an alumni community, and guidance even after the program ends.",
      },
    ] satisfies Faq[],
  },

  contact: {
    id: "contact",
    title: "Ready to start your teen's success story?",
    description:
      "Get on a 15-minute call to understand how we'll help over the next 8 weeks to come up with an impactful idea and convert it into a full-stack app.",
    primaryCta: { label: "Book a 15-minute call", href: BOOKING_URL } satisfies Link,
    secondaryCta: { label: "Email us", href: "mailto:tactyqal.labs@gmail.com" } satisfies Link,
    detailsTitle: "Contact us",
    detailsDescription: "Reach out to our team for any inquiries, assistance, or information you need.",
    details: [
      { label: "Email", value: "tactyqal.labs@gmail.com", href: "mailto:tactyqal.labs@gmail.com", icon: "mail" },
      { label: "Phone", value: "+91-98047-72106", href: "tel:+919804772106", icon: "phone" },
      { label: "Hours", value: "Mon–Sat, 9am–7pm", icon: "clock" },
      { label: "Response time", value: "Within 24 hours", icon: "timer" },
    ] satisfies ContactItem[],
    form: {
      title: "Send us a message",
      description: "Tell us a little about your teen and we'll reply within 24 hours.",
      fields: {
        name: { label: "Your name", placeholder: "Full name" },
        email: { label: "Email", placeholder: "you@example.com" },
        phone: { label: "Phone", optional: "(optional)", placeholder: "+91 98765 43210" },
        message: { label: "Message", placeholder: "What would your teen like to build?" },
      },
      errors: {
        nameShort: "Please enter at least 2 characters.",
        nameLong: "Please keep your name under 80 characters.",
        email: "Please enter a valid email address.",
        phone: "Use digits, spaces, +, - or brackets only.",
        messageShort: "Please write at least 10 characters.",
        messageLong: "Please keep your message under 2000 characters.",
      },
      submit: "Send message",
      submitting: "Sending…",
      successTitle: "Message sent",
      successBody: "Thanks! We'll get back to you within 24 hours.",
      errorTitle: "Couldn't send your message",
      errorBody: "Please try again, or email us at tactyqal.labs@gmail.com.",
    },
  },

  footer: {
    tagline: "1:1 mentoring that turns teens into builders. Idea to full-stack app in 8 weeks.",
    columns: [
      {
        title: "Program",
        links: [
          { label: "Success stories", href: "/#success" },
          { label: "How it works", href: "/#program" },
          { label: "Pricing", href: "/#pricing" },
          { label: "FAQ", href: "/#faq" },
        ],
      },
      {
        title: "Resources",
        links: [
          { label: "Blog", href: "/blog" },
          { label: "Free tools", href: "https://tactyqal.com/Tests" },
          { label: "Startup Ideas 101", href: "https://www.youtube.com/watch?v=UyUH06CfLbk" },
          { label: "Learn coding with AI teachers", href: "https://codesync.club" },
        ],
      },
      {
        title: "Contact",
        links: [
          { label: "tactyqal.labs@gmail.com", href: "mailto:tactyqal.labs@gmail.com" },
          { label: "+91-98047-72106", href: "tel:+919804772106" },
          { label: "Book a free call", href: BOOKING_URL },
        ],
      },
    ] satisfies { title: string; links: Link[] }[],
    copyright: "Tactyqal Labs. All rights reserved.",
    backToTop: { label: "Back to top", href: "#top" } satisfies Link,
  },
};

export type Site = typeof site;
