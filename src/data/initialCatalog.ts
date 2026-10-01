import { Course, Instructor, SiteSetting } from '../types/lms';
import heroCampusImg from '../assets/images/hero_danivo_campus_1790856906516.jpg';
import aiTechImg from '../assets/images/course_ai_tech_1790856918880.jpg';
import marketingImg from '../assets/images/course_digital_marketing_1790856931112.jpg';
import businessImg from '../assets/images/course_business_finance_1790856942747.jpg';
import mediaImg from '../assets/images/course_media_design_1790856954301.jpg';

export const CATEGORY_IMAGES: Record<string, string> = {
  'AI & Technology': aiTechImg,
  'Digital Marketing & Sales': marketingImg,
  'Business, Finance & Productivity': businessImg,
  'Media, Design & Creation': mediaImg,
  'Lifestyle, Communication & Personal Development': heroCampusImg,
};

export const COURSE_CATEGORIES = [
  'AI & Technology',
  'Digital Marketing & Sales',
  'Business, Finance & Productivity',
  'Media, Design & Creation',
  'Lifestyle, Communication & Personal Development',
] as const;

export const DEFAULT_SITE_SETTINGS: SiteSetting = {
  brandName: 'DANIVO INSTITUTE',
  tagline: 'Where Academic Rigor Meets Digital Innovation for Career Mastery',
  logoUrl: '',
  heroHeadline: 'Industry-Aligned Digital, Technology & Business Education Built for Real-World Impact',
  heroSubheadline:
    'DANIVO INSTITUTE combines the academic standards of a premier educational institution with the practical speed of a modern technology academy. Gain verifiable skills, complete hands-on assessments, and earn globally verifiable certificates.',
  heroCtaPrimary: 'Browse Course Catalog',
  heroCtaSecondary: 'Explore Free Learning',
  heroImageUrl: heroCampusImg,
  primaryCurrency: 'KES',
  mpesaPaybillOrNumber: '0116654805',
  mpesaInstructions:
    'Send the exact course tuition fee in KES via M-Pesa to payment number 0116654805. Once you receive your M-Pesa confirmation SMS, enter the transaction reference code below for verification.',
  bankAccountNumber: '7770184960901',
  bankName: '',
  bankBranch: '',
  bankAccountName: '',
  bankInstructions:
    'Transfer the exact course fee to Account Number 7770184960901. After completing the transfer, submit your bank transaction reference number below for verification by the admissions office.',
  contactEmail: 'demmizkenya@gmail.com',
  contactWhatsapp: '0708083643',
  contactAddress: 'Nairobi, Kenya · Global Online Campus',
  announcementText:
    'Admissions Open: Enroll in 30+ practical career programs across AI, Software Engineering, Digital Growth, Finance, and Creative Design.',
  isPublic: true,
};

export const INITIAL_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst_ai_tech',
    name: 'Dr. David Ochieng, PhD',
    roleTitle: 'Director of Artificial Intelligence & Cloud Systems',
    bio: 'Computer scientist and enterprise systems architect with 14 years of experience leading cloud infrastructure and applied AI engineering across East Africa and Europe.',
    photoUrl: aiTechImg,
    expertise: ['Artificial Intelligence', 'Cloud Architecture', 'Cybersecurity', 'Full-Stack Engineering'],
    qualifications: 'PhD in Computer Science · Certified Cloud Solutions Architect',
    linkedinUrl: 'https://linkedin.com',
    coursesCount: 6,
    isActive: true,
  },
  {
    id: 'inst_marketing',
    name: 'Grace Wanjiku Mwangi',
    roleTitle: 'Faculty Lead, Digital Growth & Revenue Systems',
    bio: 'Performance marketing strategist who has managed multi-million shilling customer acquisition campaigns for fintech, e-commerce, and SaaS brands across Africa.',
    photoUrl: marketingImg,
    expertise: ['SEO Strategy', 'Paid Media', 'Conversion Copywriting', 'Lifecycle Automation'],
    qualifications: 'MBA in Marketing · Certified Digital Marketing Professional',
    linkedinUrl: 'https://linkedin.com',
    coursesCount: 6,
    isActive: true,
  },
  {
    id: 'inst_business',
    name: 'CPA Samuel Kiprop',
    roleTitle: 'Senior Fellow, Enterprise Finance & Agile Operations',
    bio: 'Chartered accountant, agile transformation consultant, and SME advisor specializing in financial modeling, operational excellence, and scalable business architecture.',
    photoUrl: businessImg,
    expertise: ['Financial Modeling', 'Agile & Scrum', 'SME Bookkeeping', 'E-Commerce Operations'],
    qualifications: 'CPA(K) · Certified Scrum Master (CSM) · B.Com Finance',
    linkedinUrl: 'https://linkedin.com',
    coursesCount: 7,
    isActive: true,
  },
  {
    id: 'inst_media',
    name: 'Amina Hassan',
    roleTitle: 'Head of Product Design & Digital Media Production',
    bio: 'Principal UX/UI product designer and creative director with a decade of experience designing fintech mobile apps, brand identities, and high-retention digital media.',
    photoUrl: mediaImg,
    expertise: ['UX/UI Systems', 'Visual Identity', 'Short-Form Video Production', 'Audio Engineering'],
    qualifications: 'B.A. Design & Media Arts · Human-Computer Interaction Specialist',
    linkedinUrl: 'https://linkedin.com',
    coursesCount: 5,
    isActive: true,
  },
  {
    id: 'inst_lifestyle',
    name: 'Prof. Lydia Njoroge',
    roleTitle: 'Dean of Executive Communication & Human Performance',
    bio: 'Educator, executive communication coach, and wellness researcher dedicated to helping professionals master public speaking, cross-cultural fluency, and sustainable vitality.',
    photoUrl: heroCampusImg,
    expertise: ['Executive Rhetoric', 'Applied Nutrition', 'Stress Resilience', 'Sustainable Urban Agriculture'],
    qualifications: 'M.A. Communication Studies · Certified Executive Coach',
    linkedinUrl: 'https://linkedin.com',
    coursesCount: 6,
    isActive: true,
  },
];

interface RawCourseSeed {
  index: number;
  title: string;
  category: (typeof COURSE_CATEGORIES)[number];
  price: number;
  instructorId: string;
  instructorName: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  durationHours: number;
  accessDurationDays: number;
  isFreeScholarship?: boolean;
  featured?: boolean;
  popular?: boolean;
  isNew?: boolean;
  shortDescription: string;
  skills: string[];
  outcomes: string[];
}

const RAW_COURSES: RawCourseSeed[] = [
  // AI & TECHNOLOGY (1 - 6)
  {
    index: 1,
    title: 'AI Prompt Engineering',
    category: 'AI & Technology',
    price: 1500,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Beginner',
    durationHours: 14,
    accessDurationDays: 90,
    isFreeScholarship: true,
    featured: true,
    popular: true,
    shortDescription:
      'Master structured prompting frameworks, chain-of-thought reasoning, and enterprise LLM workflows to multiply professional productivity.',
    skills: ['Structured Prompting', 'Chain-of-Thought Design', 'System Instructions', 'Output Evaluation'],
    outcomes: [
      'Architect reliable system prompts for research, coding, and business analysis',
      'Apply few-shot and chain-of-thought reasoning to eliminate hallucinations',
      'Build reusable prompt templates for team operations and client deliverables',
    ],
  },
  {
    index: 2,
    title: 'AI Automation for Small Business',
    category: 'AI & Technology',
    price: 2500,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Intermediate',
    durationHours: 18,
    accessDurationDays: 120,
    featured: true,
    isNew: true,
    shortDescription:
      'Design end-to-end automated customer support, lead qualification, invoicing, and reporting workflows for modern SMEs.',
    skills: ['Workflow Automation', 'API Webhooks', 'CRM Integration', 'AI Agent Routing'],
    outcomes: [
      'Map high-cost manual processes in small businesses and replace them with reliable automations',
      'Connect forms, spreadsheets, WhatsApp/email notifications, and AI processors',
      'Audit and monitor automated workflows for accuracy and cost efficiency',
    ],
  },
  {
    index: 3,
    title: 'Coding for Beginners',
    category: 'AI & Technology',
    price: 2000,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Beginner',
    durationHours: 24,
    accessDurationDays: 180,
    popular: true,
    shortDescription:
      'Build a rock-solid foundation in web development, computational thinking, HTML5, CSS, and modern JavaScript from scratch.',
    skills: ['HTML5 & Semantic Web', 'Modern CSS Layouts', 'JavaScript Fundamentals', 'DOM Manipulation'],
    outcomes: [
      'Write clean, semantic HTML and responsive CSS layouts for desktop and mobile',
      'Program interactive browser applications using variables, functions, loops, and events',
      'Deploy a complete portfolio web application to production hosting',
    ],
  },
  {
    index: 4,
    title: 'Cybersecurity Basics for Remote Workers',
    category: 'AI & Technology',
    price: 1500,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    shortDescription:
      'Protect corporate data, client credentials, and remote devices against phishing, ransomware, and network interception.',
    skills: ['Zero-Trust Hygiene', 'Credential Management', 'Phishing Detection', 'Endpoint Encryption'],
    outcomes: [
      'Secure home and public Wi-Fi connections using encrypted tunnels and DNS hardening',
      'Implement hardware-backed multi-factor authentication and enterprise password vaults',
      'Identify sophisticated social engineering and business email compromise attempts',
    ],
  },
  {
    index: 5,
    title: 'No-Code App Development',
    category: 'AI & Technology',
    price: 2500,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Intermediate',
    durationHours: 20,
    accessDurationDays: 120,
    isNew: true,
    shortDescription:
      'Build, launch, and monetize database-driven web and mobile applications without writing traditional backend boilerplate.',
    skills: ['Relational Data Modeling', 'Visual UI Builders', 'Role-Based Access', 'Payment Workflows'],
    outcomes: [
      'Structure normalized databases for marketplaces, directories, and internal portals',
      'Design responsive user interfaces with conditional visibility and user authentication',
      'Launch a production MVP capable of onboarding real paying customers',
    ],
  },
  {
    index: 6,
    title: 'Cloud Computing Fundamentals',
    category: 'AI & Technology',
    price: 2500,
    instructorId: 'inst_ai_tech',
    instructorName: 'Dr. David Ochieng, PhD',
    difficulty: 'Intermediate',
    durationHours: 22,
    accessDurationDays: 180,
    shortDescription:
      'Understand cloud compute, serverless architecture, object storage, IAM security, and cost optimization on modern cloud platforms.',
    skills: ['Cloud Architecture', 'IAM & Security', 'Serverless Compute', 'Cloud Cost FinOps'],
    outcomes: [
      'Compare IaaS, PaaS, and serverless execution models for modern web workloads',
      'Configure least-privilege Identity and Access Management policies',
      'Design resilient, auto-scaling cloud deployments with predictable billing budgets',
    ],
  },

  // DIGITAL MARKETING & SALES (7 - 12)
  {
    index: 7,
    title: 'SEO & Content Marketing Mastery',
    category: 'Digital Marketing & Sales',
    price: 2000,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Beginner',
    durationHours: 16,
    accessDurationDays: 90,
    featured: true,
    popular: true,
    shortDescription:
      'Rank websites on search engines through technical SEO audits, high-intent keyword architecture, and authoritative editorial content.',
    skills: ['Keyword Architecture', 'On-Page Optimization', 'Technical SEO Audits', 'Content Attribution'],
    outcomes: [
      'Execute comprehensive keyword research mapped to commercial buyer intent',
      'Optimize site architecture, metadata, internal linking, and Core Web Vitals',
      'Build an editorial content engine that compounds organic search traffic month over month',
    ],
  },
  {
    index: 8,
    title: 'Paid Social Media Advertising',
    category: 'Digital Marketing & Sales',
    price: 2500,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Intermediate',
    durationHours: 18,
    accessDurationDays: 120,
    popular: true,
    shortDescription:
      'Plan, launch, and scale profitable paid acquisition campaigns across Meta, TikTok, and LinkedIn with rigorous ROAS tracking.',
    skills: ['Campaign Architecture', 'Pixel & Conversion API', 'Creative Testing', 'ROAS Optimization'],
    outcomes: [
      'Structure full-funnel prospecting and retargeting ad campaigns without audience overlap',
      'Write and test high-converting video and static ad creatives',
      'Analyze CPA, CTR, and ROAS metrics to scale winning ad sets profitably',
    ],
  },
  {
    index: 9,
    title: 'High-Converting Copywriting',
    category: 'Digital Marketing & Sales',
    price: 1500,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    isFreeScholarship: true,
    shortDescription:
      'Write persuasive landing pages, sales emails, product descriptions, and B2B proposals grounded in buyer psychology.',
    skills: ['Value Proposition Design', 'Sales Page Structure', 'Objection Handling', 'Headline Testing'],
    outcomes: [
      'Research customer pain points and translate technical features into concrete benefits',
      'Structure landing pages using proven persuasion frameworks (PAS, AIDA, Story-Offer)',
      'Edit and sharpen headlines and calls-to-action for measurable conversion lift',
    ],
  },
  {
    index: 10,
    title: 'Email Marketing Automation',
    category: 'Digital Marketing & Sales',
    price: 2000,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Intermediate',
    durationHours: 14,
    accessDurationDays: 90,
    shortDescription:
      'Build automated welcome sequences, abandoned cart recovery flows, and segmented newsletter systems that drive repeat revenue.',
    skills: ['List Segmentation', 'Automated Drip Flows', 'Deliverability & SPF/DKIM', 'A/B Testing'],
    outcomes: [
      'Configure domain authentication (SPF, DKIM, DMARC) for high inbox placement',
      'Design behavioral lifecycle flows that convert subscribers into repeat buyers',
      'Measure open rates, click-to-conversion, and revenue per recipient',
    ],
  },
  {
    index: 11,
    title: 'Affiliate Marketing Playbook',
    category: 'Digital Marketing & Sales',
    price: 2000,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Beginner',
    durationHours: 15,
    accessDurationDays: 90,
    shortDescription:
      'Build ethical, content-driven affiliate revenue streams by pairing high-trust product evaluations with targeted search and social traffic.',
    skills: ['Partner Selection', 'Review Content Strategy', 'Conversion Funnels', 'Link Attribution'],
    outcomes: [
      'Evaluate affiliate programs with strong EPC, recurring commissions, and product quality',
      'Create comparison guides and tutorials that genuinely solve buyer decisions',
      'Track click-throughs and conversions using clean UTM and sub-ID attribution',
    ],
  },
  {
    index: 12,
    title: 'YouTube Channel Growth & Monetization',
    category: 'Digital Marketing & Sales',
    price: 2000,
    instructorId: 'inst_marketing',
    instructorName: 'Grace Wanjiku Mwangi',
    difficulty: 'Beginner',
    durationHours: 16,
    accessDurationDays: 120,
    isNew: true,
    shortDescription:
      'Grow an authoritative YouTube channel through retention-engineered scripting, packaging, search discovery, and multi-stream monetization.',
    skills: ['Title & Thumbnail Packaging', 'Retention Scripting', 'YouTube Analytics', 'Sponsorship Strategy'],
    outcomes: [
      'Ideate video topics with validated search demand and broad suggested-video appeal',
      'Script strong first-30-second hooks that maximize average percentage viewed',
      'Monetize through AdSense, brand sponsorships, digital products, and consulting leads',
    ],
  },

  // BUSINESS, FINANCE & PRODUCTIVITY (13 - 19)
  {
    index: 13,
    title: 'Personal Finance & Budgeting',
    category: 'Business, Finance & Productivity',
    price: 1500,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    isFreeScholarship: true,
    popular: true,
    shortDescription:
      'Take complete control of cash flow, zero-based budgeting, emergency reserves, debt elimination, and long-term wealth building.',
    skills: ['Zero-Based Budgeting', 'Emergency Fund Sizing', 'Debt Snowball/Avalanche', 'Investment Basics'],
    outcomes: [
      'Build an automated monthly cash-flow system tailored to variable or salaried income',
      'Structure an emergency reserve and eliminate high-interest consumer debt systematically',
      'Evaluate money market funds, government bonds, SACCOs, and diversified portfolios',
    ],
  },
  {
    index: 14,
    title: 'Freelance Business Setup',
    category: 'Business, Finance & Productivity',
    price: 2000,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Beginner',
    durationHours: 15,
    accessDurationDays: 90,
    shortDescription:
      'Transition from solo skill-holder to structured freelance business owner with client contracts, value pricing, and global payment collection.',
    skills: ['Service Packaging', 'Client Contracts & SOWs', 'Outbound Acquisition', 'Cross-Border Billing'],
    outcomes: [
      'Package your technical or creative skills into high-value productized service offers',
      'Draft clear Statements of Work, milestone schedules, and scope-creep protections',
      'Acquire local and international clients and manage multi-currency invoicing',
    ],
  },
  {
    index: 15,
    title: 'E-Commerce & Dropshipping',
    category: 'Business, Finance & Productivity',
    price: 2500,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Intermediate',
    durationHours: 20,
    accessDurationDays: 120,
    featured: true,
    shortDescription:
      'Launch and operate a profitable online retail store with validated supplier sourcing, M-Pesa/card checkout, and reliable fulfillment.',
    skills: ['Product Validation', 'Storefront Conversion', 'Supplier Vetting', 'Last-Mile Logistics'],
    outcomes: [
      'Analyze unit economics, landed costs, and gross margins before stocking inventory',
      'Build a high-trust online store with seamless mobile money and card payment gateways',
      'Manage supplier SLAs, delivery logistics, and customer retention metrics',
    ],
  },
  {
    index: 16,
    title: 'Advanced Excel & Data Dashboards',
    category: 'Business, Finance & Productivity',
    price: 2000,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Intermediate',
    durationHours: 18,
    accessDurationDays: 120,
    popular: true,
    shortDescription:
      'Master dynamic arrays, XLOOKUP, Power Query data cleaning, PivotTables, and executive KPI dashboards for data-driven decisions.',
    skills: ['XLOOKUP & Dynamic Arrays', 'Power Query ETL', 'PivotTable Modeling', 'Executive KPI Charts'],
    outcomes: [
      'Clean and merge messy multi-sheet datasets automatically using Power Query',
      'Write dynamic formulas using XLOOKUP, INDEX/MATCH, SUMIFS, and logical operators',
      'Build interactive executive dashboards with slicers and variance indicators',
    ],
  },
  {
    index: 17,
    title: 'Agile & Scrum Project Management',
    category: 'Business, Finance & Productivity',
    price: 2500,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Intermediate',
    durationHours: 18,
    accessDurationDays: 180,
    shortDescription:
      'Lead cross-functional software and business teams using Agile principles, Scrum ceremonies, backlog prioritization, and sprint velocity tracking.',
    skills: ['Scrum Framework', 'User Story Mapping', 'Sprint Ceremonies', 'Velocity & Burndown'],
    outcomes: [
      'Write clear epics, user stories, and acceptance criteria for product backlogs',
      'Facilitate Sprint Planning, Daily Standups, Reviews, and Retrospectives effectively',
      'Identify delivery bottlenecks and forecast release timelines with empirical data',
    ],
  },
  {
    index: 18,
    title: 'Personal Branding on LinkedIn',
    category: 'Business, Finance & Productivity',
    price: 1500,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Beginner',
    durationHours: 10,
    accessDurationDays: 60,
    shortDescription:
      'Position yourself as an industry authority on LinkedIn to attract executive career opportunities, consulting retainers, and partnerships.',
    skills: ['Profile Optimization', 'Thought Leadership Content', 'Strategic Networking', 'Inbound Lead Capture'],
    outcomes: [
      'Optimize your headline, summary, and featured proof to convert profile visitors',
      'Publish high-credibility industry case studies and insights on a sustainable cadence',
      'Build genuine relationships with hiring managers, founders, and decision-makers',
    ],
  },
  {
    index: 19,
    title: 'Bookkeeping for Small Businesses',
    category: 'Business, Finance & Productivity',
    price: 2000,
    instructorId: 'inst_business',
    instructorName: 'CPA Samuel Kiprop',
    difficulty: 'Beginner',
    durationHours: 16,
    accessDurationDays: 120,
    shortDescription:
      'Maintain accurate double-entry financial records, reconcile M-Pesa till and bank statements, and prepare monthly P&L and balance sheets.',
    skills: ['Chart of Accounts', 'Bank & Mobile Money Reconciliation', 'Income Statements', 'Tax Readiness'],
    outcomes: [
      'Set up a clean Chart of Accounts and record daily revenue, expenses, and payables',
      'Reconcile M-Pesa business statements and commercial bank accounts without discrepancies',
      'Generate accurate monthly Profit & Loss statements and Balance Sheets',
    ],
  },

  // MEDIA, DESIGN & CREATION (20 - 24)
  {
    index: 20,
    title: 'Graphic Design with Canva & Photoshop',
    category: 'Media, Design & Creation',
    price: 2000,
    instructorId: 'inst_media',
    instructorName: 'Amina Hassan',
    difficulty: 'Beginner',
    durationHours: 16,
    accessDurationDays: 90,
    popular: true,
    shortDescription:
      'Master visual hierarchy, typography, color systems, photo compositing, and brand identity assets using Canva Pro and Adobe Photoshop.',
    skills: ['Typographic Hierarchy', 'Color Theory', 'Photo Retouching', 'Brand Kit Systems'],
    outcomes: [
      'Apply professional grid systems, contrast, and typographic pairing to every composition',
      'Retouch portraits, mask complex subjects, and composite commercial visuals in Photoshop',
      'Deliver complete social media, print, and presentation brand kits for clients',
    ],
  },
  {
    index: 21,
    title: 'Video Editing for Short-Form Content',
    category: 'Media, Design & Creation',
    price: 2000,
    instructorId: 'inst_media',
    instructorName: 'Amina Hassan',
    difficulty: 'Beginner',
    durationHours: 14,
    accessDurationDays: 90,
    isNew: true,
    shortDescription:
      'Edit high-retention vertical videos for Reels, TikTok, and YouTube Shorts using pacing, sound design, dynamic captions, and color grading.',
    skills: ['Rhythm & Pacing Cuts', 'Audio Mixing & SFX', 'Dynamic Typography', 'Color Correction'],
    outcomes: [
      'Assemble raw footage into tight, engaging story arcs with zero dead air',
      'Layer voiceovers, background music, and subtle sound effects at broadcast loudness standards',
      'Export crisp vertical deliverables optimized for mobile social platforms',
    ],
  },
  {
    index: 22,
    title: 'UX/UI Design Fundamentals',
    category: 'Media, Design & Creation',
    price: 2500,
    instructorId: 'inst_media',
    instructorName: 'Amina Hassan',
    difficulty: 'Intermediate',
    durationHours: 22,
    accessDurationDays: 180,
    featured: true,
    shortDescription:
      'Design intuitive digital products from user research and wireframes to interactive Figma prototypes and developer-ready design systems.',
    skills: ['User Research & Flows', 'Wireframing', 'Component Design Systems', 'Interactive Prototyping'],
    outcomes: [
      'Conduct user interviews and translate findings into clear information architecture',
      'Build reusable Figma component libraries with Auto Layout, variants, and design tokens',
      'Deliver interactive high-fidelity prototypes with complete developer handoff specs',
    ],
  },
  {
    index: 23,
    title: 'Podcasting from Scratch',
    category: 'Media, Design & Creation',
    price: 1500,
    instructorId: 'inst_media',
    instructorName: 'Amina Hassan',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    shortDescription:
      'Plan, record, edit, distribute, and grow a professional audio and video podcast using budget-friendly studio equipment.',
    skills: ['Show Format Design', 'Microphone Technique', 'Multi-Track Audio Editing', 'RSS Distribution'],
    outcomes: [
      'Configure acoustic treatment and dynamic microphones for studio-grade vocal clarity',
      'Conduct compelling guest interviews and edit multi-track audio episodes cleanly',
      'Distribute your show across Spotify, Apple Podcasts, and YouTube with sponsor media kits',
    ],
  },
  {
    index: 24,
    title: 'Smartphone Photography & Lighting',
    category: 'Media, Design & Creation',
    price: 1500,
    instructorId: 'inst_media',
    instructorName: 'Amina Hassan',
    difficulty: 'Beginner',
    durationHours: 10,
    accessDurationDays: 60,
    shortDescription:
      'Capture commercial-grade product, portrait, and architectural photographs using a smartphone, natural light shaping, and mobile RAW grading.',
    skills: ['Manual Exposure Control', 'Natural & Continuous Lighting', 'Composition Rules', 'Mobile RAW Grading'],
    outcomes: [
      'Lock exposure, focus, and white balance manually on any modern smartphone camera',
      'Shape window light and affordable diffusers for commercial product and portrait shots',
      'Grade RAW mobile photos with consistent, natural skin tones and crisp detail',
    ],
  },

  // LIFESTYLE, COMMUNICATION & PERSONAL DEVELOPMENT (25 - 30)
  {
    index: 25,
    title: 'Conversational Foreign Languages',
    category: 'Lifestyle, Communication & Personal Development',
    price: 2000,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 20,
    accessDurationDays: 180,
    shortDescription:
      'Acquire practical conversational fluency for international business, travel, and diplomatic communication using spaced-repetition immersion.',
    skills: ['High-Frequency Vocabulary', 'Pronunciation & Phonetics', 'Business Etiquette', 'Active Listening'],
    outcomes: [
      'Master the top 800 high-frequency words and sentence frames used in daily conversation',
      'Navigate professional introductions, travel logistics, and client meetings confidently',
      'Maintain a sustainable daily 20-minute speaking and listening immersion habit',
    ],
  },
  {
    index: 26,
    title: 'Nutrition & Meal Planning',
    category: 'Lifestyle, Communication & Personal Development',
    price: 1500,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    shortDescription:
      'Build evidence-based weekly meal plans using accessible whole foods to optimize cognitive energy, metabolic health, and household budgets.',
    skills: ['Macronutrient Balance', 'Micronutrient Density', 'Batch Meal Prep', 'Glycemic Stability'],
    outcomes: [
      'Calculate personal energy and protein requirements based on activity levels',
      'Design balanced, nutrient-dense plates using locally accessible whole ingredients',
      'Execute a 2-hour weekly batch-prep workflow that eliminates daily food stress',
    ],
  },
  {
    index: 27,
    title: 'Mindfulness & Stress Management',
    category: 'Lifestyle, Communication & Personal Development',
    price: 1500,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 10,
    accessDurationDays: 90,
    shortDescription:
      'Develop cognitive resilience, nervous-system regulation, and deep focus habits for high-pressure academic and executive environments.',
    skills: ['Autonomic Regulation', 'Attentional Focus', 'Cognitive Reframing', 'Burnout Prevention'],
    outcomes: [
      'Apply physiological sigh and breathwork protocols to down-regulate acute stress in under 2 minutes',
      'Structure distraction-free deep work blocks and restorative recovery routines',
      'Identify early cognitive markers of burnout and establish healthy professional boundaries',
    ],
  },
  {
    index: 28,
    title: 'Public Speaking & Presentation Skills',
    category: 'Lifestyle, Communication & Personal Development',
    price: 1500,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 14,
    accessDurationDays: 90,
    featured: true,
    popular: true,
    shortDescription:
      'Command boardrooms, conferences, and virtual keynotes with structured rhetoric, vocal projection, executive presence, and persuasive slide design.',
    skills: ['Executive Presence', 'Rhetorical Structure', 'Vocal Projection', 'Q&A Mastery'],
    outcomes: [
      'Structure keynotes and investor pitches around a clear, memorable core thesis',
      'Control vocal pacing, pause discipline, and body language on stage and on camera',
      'Handle high-stakes Q&A sessions with composure and precision',
    ],
  },
  {
    index: 29,
    title: 'Urban Farming & Gardening Basics',
    category: 'Lifestyle, Communication & Personal Development',
    price: 1500,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    shortDescription:
      'Grow high-yield organic vegetables, herbs, and vertical container gardens in balconies, small compounds, and peri-urban spaces.',
    skills: ['Container Soil Science', 'Drip & Water Conservation', 'Organic Pest Control', 'Crop Rotation'],
    outcomes: [
      'Formulate nutrient-rich potting mixes and compost from household organic matter',
      'Design water-efficient vertical planters and micro-drip systems for small spaces',
      'Manage pests naturally and harvest year-round leafy greens, herbs, and fruiting crops',
    ],
  },
  {
    index: 30,
    title: 'Yoga & Mobility Routines',
    category: 'Lifestyle, Communication & Personal Development',
    price: 1500,
    instructorId: 'inst_lifestyle',
    instructorName: 'Prof. Lydia Njoroge',
    difficulty: 'Beginner',
    durationHours: 12,
    accessDurationDays: 90,
    shortDescription:
      'Restore joint mobility, spinal alignment, and core stability with desk-worker decompression sequences and progressive movement flows.',
    skills: ['Thoracic & Hip Mobility', 'Postural Decompression', 'Core Stabilization', 'Breath-Synchronized Flow'],
    outcomes: [
      'Counteract prolonged desk sitting with targeted cervical, thoracic, and hip flexor mobility drills',
      'Build functional core and scapular stability for pain-free daily movement',
      'Follow 15-minute morning activation and evening decompression routines safely',
    ],
  },
];

function buildCurriculumForCourse(seed: RawCourseSeed) {
  const slugBase = `c${seed.index}`;
  return [
    {
      id: `${slugBase}_mod_1`,
      title: `Module 1: Foundations & Core Architecture of ${seed.title}`,
      description: `Establish rigorous conceptual foundations, industry standards, and practical setup for ${seed.title}.`,
      lessons: [
        {
          id: `${slugBase}_les_1`,
          title: `1.1 Executive Overview & Strategic Framework`,
          type: 'video' as const,
          durationMinutes: 18,
          isPreview: true,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          contentMarkdown: `### Executive Overview: ${seed.title}\n\nWelcome to **DANIVO INSTITUTE**. In this opening lecture, **${seed.instructorName}** introduces the core mental models, professional standards, and practical workflows that define mastery in **${seed.title}**.\n\n#### Key Learning Objectives\n- Understand how ${seed.title} drives measurable value in modern African and global organizations.\n- Set up your workspace, evaluation checklist, and baseline performance metrics.\n- Review the core competencies covered in this program: **${seed.skills.join(', ')}**.\n\n#### Practical Implementation Principle\nAt DANIVO INSTITUTE, theory is immediately paired with execution. As you progress through each module, document your notes and apply the frameworks directly to a real-world project or organization.`,
          resources: [
            {
              id: `${slugBase}_res_1`,
              title: `${seed.title} — Complete Study Syllabus & Workbook.pdf`,
              type: 'pdf' as const,
              sizeLabel: '1.4 MB',
              contentSummary: `Official DANIVO INSTITUTE workbook for ${seed.title}, including frameworks, checklists, and glossary.`,
            },
            {
              id: `${slugBase}_res_2`,
              title: `Implementation Checklist & Standard Operating Template`,
              type: 'template' as const,
              sizeLabel: '420 KB',
              contentSummary: `Step-by-step execution checklist for applying ${seed.skills[0]} and ${seed.skills[1]}.`,
            },
          ],
        },
        {
          id: `${slugBase}_les_2`,
          title: `1.2 Core Methodology: ${seed.skills[0]} & ${seed.skills[1]}`,
          type: 'text' as const,
          durationMinutes: 25,
          isPreview: false,
          videoUrl: '',
          contentMarkdown: `### Mastering ${seed.skills[0]} & ${seed.skills[1]}\n\nA common mistake among practitioners is jumping into tools without establishing a repeatable methodology. In this lesson, we break down the exact four-stage operating system used by senior professionals.\n\n#### Stage 1: Diagnostic Audit\nBefore executing any changes, establish a baseline. Measure current performance, identify bottlenecks, and define clear success criteria.\n\n#### Stage 2: Structured Design\nApply **${seed.skills[0]}** using standardized templates. Ensure that every decision is documented and aligned with the primary objective: *${seed.outcomes[0]}*.\n\n#### Stage 3: Controlled Execution\nImplement **${seed.skills[1]}** incrementally. Verify each component against quality benchmarks before scaling across your team or client environment.\n\n#### Stage 4: Quantitative Review\nReview outcomes against your initial baseline and refine your workflow for continuous improvement.`,
          resources: [
            {
              id: `${slugBase}_res_3`,
              title: `${seed.skills[0]} Reference Guide.pdf`,
              type: 'guide' as const,
              sizeLabel: '890 KB',
              contentSummary: `Detailed reference guide covering best practices and common pitfalls in ${seed.skills[0]}.`,
            },
          ],
        },
      ],
    },
    {
      id: `${slugBase}_mod_2`,
      title: `Module 2: Applied Execution, Assessment & Capstone`,
      description: `Apply ${seed.skills[2] || seed.skills[0]} in real scenarios, complete the knowledge assessment quiz, and submit your practical assignment.`,
      lessons: [
        {
          id: `${slugBase}_les_3`,
          title: `2.1 Advanced Workflows: ${seed.skills[2] || 'Systems'} & ${seed.skills[3] || 'Optimization'}`,
          type: 'video' as const,
          durationMinutes: 22,
          isPreview: false,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          contentMarkdown: `### Advanced Execution & Production Standards\n\nIn this module, we transition from foundational methodology to production-grade execution.\n\n#### Core Outcomes Addressed\n1. ${seed.outcomes[1]}\n2. ${seed.outcomes[2]}\n\n#### Case Study Walkthrough\nNotice how structured execution eliminates guesswork. Use the downloadable worksheet below to audit your own implementation before taking the Module Mastery Quiz.`,
          resources: [
            {
              id: `${slugBase}_res_4`,
              title: `Applied Case Study & Audit Worksheet`,
              type: 'worksheet' as const,
              sizeLabel: '650 KB',
              contentSummary: `Practical audit worksheet for ${seed.title}.`,
            },
          ],
        },
        {
          id: `${slugBase}_les_4`,
          title: `2.2 Competency Assessment Quiz: ${seed.title}`,
          type: 'quiz' as const,
          durationMinutes: 15,
          isPreview: false,
          videoUrl: '',
          contentMarkdown: `Complete this graded assessment to verify your mastery of the core concepts in **${seed.title}**. A minimum score of **70%** is required to pass.`,
          resources: [],
          quizPassingScore: 70,
          quizMaxAttempts: 5,
          quizQuestions: [
            {
              id: `${slugBase}_q1`,
              question: `Which of the following is the primary first step before executing a workflow in ${seed.title}?`,
              type: 'multiple_choice' as const,
              options: [
                'Conducting a diagnostic baseline audit and defining measurable success criteria',
                'Skipping documentation to deploy unverified changes immediately',
                'Relying solely on intuition without tracking metrics',
                'Duplicating generic templates without adapting to context',
              ],
              correctIndex: 0,
              explanation:
                'Establishing a diagnostic baseline and measurable criteria ensures every action can be evaluated objectively.',
            },
            {
              id: `${slugBase}_q2`,
              question: `In ${seed.title}, combining ${seed.skills[0]} with ${seed.skills[1]} improves both consistency and measurable output quality.`,
              type: 'true_false' as const,
              options: ['True', 'False'],
              correctIndex: 0,
              explanation: `Integrating ${seed.skills[0]} and ${seed.skills[1]} creates a structured, repeatable professional system.`,
            },
            {
              id: `${slugBase}_q3`,
              question: `What is the primary professional outcome of mastering ${seed.skills[2] || seed.skills[0]}?`,
              type: 'multiple_choice' as const,
              options: [
                seed.outcomes[0],
                'Increasing manual overhead without quality controls',
                'Eliminating the need for performance verification',
                'Avoiding structured planning',
              ],
              correctIndex: 0,
              explanation: `Mastering these skills directly enables you to: ${seed.outcomes[0]}.`,
            },
          ],
        },
        {
          id: `${slugBase}_les_5`,
          title: `2.3 Practical Capstone Assignment: ${seed.title}`,
          type: 'assignment' as const,
          durationMinutes: 30,
          isPreview: false,
          videoUrl: '',
          contentMarkdown: `### Practical Capstone Submission\n\nApply what you have learned in **${seed.title}** to a real-world scenario. Submit your structured implementation plan or project summary below.`,
          resources: [],
          assignmentPrompt: `Design and document a practical implementation plan for "${seed.title}" applied to a real business, career project, or client scenario. Specifically demonstrate how you apply ${seed.skills.join(', ')} to achieve: "${seed.outcomes[0]}".`,
          assignmentDeliverables: [
            `Executive summary of the problem or opportunity being addressed`,
            `Step-by-step application of ${seed.skills[0]} and ${seed.skills[1]}`,
            `Key performance metrics you will track to verify success`,
          ],
        },
      ],
    },
  ];
}

export const INITIAL_COURSES: Course[] = RAW_COURSES.map((seed) => {
  const isFree = Boolean(seed.isFreeScholarship);
  return {
    id: `course_${seed.index}`,
    slug: seed.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, ''),
    title: seed.title,
    shortDescription: seed.shortDescription,
    description: `${seed.shortDescription}\n\nDesigned by the faculty at DANIVO INSTITUTE, this program blends rigorous academic structure with hands-on digital execution. Whether you are advancing your career, building a business in Kenya or across Africa, or competing for global remote opportunities, you will graduate with practical deliverables and a verifiable Certificate of Completion.`,
    category: seed.category,
    instructorId: seed.instructorId,
    instructorName: seed.instructorName,
    thumbnailUrl: CATEGORY_IMAGES[seed.category] || aiTechImg,
    isFree,
    regularPrice: seed.price,
    salePrice: isFree ? 0 : seed.price,
    discountPercentage: isFree ? 100 : 0,
    currency: 'KES',
    accessType: 'fixed_days',
    accessDurationDays: seed.accessDurationDays,
    difficulty: seed.difficulty,
    durationHours: seed.durationHours,
    language: 'English',
    status: 'published',
    featured: Boolean(seed.featured),
    popular: Boolean(seed.popular),
    isNew: Boolean(seed.isNew),
    rating: 5.0,
    studentsCount: 0,
    outcomes: seed.outcomes,
    requirements: [
      'A computer, tablet, or smartphone with internet connectivity',
      'Commitment to completing practical exercises and real-world assessments',
      'No prior advanced certification required — foundational concepts are covered step by step',
    ],
    skills: seed.skills,
    modules: buildCurriculumForCourse(seed),
    completionRequireAllLessons: true,
    completionRequireQuizzes: true,
    completionRequireAssignments: false,
    completionMinQuizScore: 70,
    orderIndex: seed.index,
  };
});
