import { PodcastSource } from '@/types/podcast';

export interface EducationalContent {
  id: string;
  title: string;
  description: string;
  summary: string;
  category: string;
  author: string;
  duration: number; // in milliseconds
  imageUrl: string;
  audioUrl: string | number;
  backgroundColor: string;
  badgeColor: string;
  textColor: string;
  timeLeft?: string;
  progress?: number; // 0-1
  isCompleted?: boolean;
  publishedDate: string;
  createdAt: Date; // Actual creation date
  sources?: PodcastSource[];
}

export const educationalContent: EducationalContent[] = [
  {
    id: '10',
    title: 'Learn to Use AI: More Consistent & Controlled Image Generation with JSON Formatting',
    description: `Using JSON style guides allows teachers to lock key visual elements (style, camera angle, and colour palette) so that AI-generated images remain consistent across lessons, reducing distractions and improving student focus on learning.

You'll be able to:
1. Apply JSON style guides to lock in core design elements (style, camera, colours) and maintain consistency across slides and teaching materials.
2. Differentiate between fixed and variable fields in prompts so that only lesson-specific content changes while the overall look stays coherent.
3. Implement a practical team workflow for generating visuals that align with department or school branding, making it easier for students to recognise and follow materials.`,
    summary: `1 JSON style guides allow teachers to lock key visual elements (style, camera angle, and colour palette) for consistent AI-generated images across lessons.

2 By differentiating between fixed and variable fields in prompts, only lesson-specific content changes while maintaining visual coherence.

3 Implementing team workflows ensures visuals align with department or school branding, making materials easier for students to recognise and follow.`,
    category: 'Artificial Intelligence',
    author: 'Kahhow',
    duration: 251000, // 4min 11s
    imageUrl: 'https://picsum.photos/400/400?random=10',
    audioUrl: require('../assets/audio/10 json image - isolated.mp3'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-yellow-200',
    textColor: 'text-yellow-900',
    timeLeft: '4m',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date(),
    sources: [
      {
        title: 'JSON Style Guides for Controlled Image Generation with GPT-4o and GPT-Image-1',
        url: 'https://dev.to/worldlinetech/json-style-guides-for-controlled-image-generation-with-gpt-4o-and-gpt-image-1-36p',
        type: 'website',
        author: 'raphiki',
        publishedDate: '9 May 2025',
      },
    ]
  },
  {
    id: '8',
    title: 'Learn about AI (Safety): Prompt Injection',
    description: `Prompt injection shows how AI systems can be tricked by carefully worded instructions, highlighting the need for awareness and critical use in education.

You'll be able to:
1. Recognise what prompt injection is and how it compares to older security issues like SQL injection.
2. Identify at least three common techniques used in prompt injection (e.g., "ignore the above," translation tricks, role-play outlets).
3. Evaluate why most prompt injections are reputational rather than catastrophic, and apply this understanding to classroom AI use.`,
    summary: `1 Prompt injection is when someone sneaks extra instructions into an AI request, tricking the system into ignoring its original task.

2 It shows that AI can be manipulated through language, leading to embarrassing outputs or leaked "hidden" instructions — but usually with reputational rather than catastrophic risks.

3 Treat AI critically, know the common tricks ("ignore the above," translation hacks, role-play outlets), and use awareness as the best safeguard in schools.`,
    category: 'Artificial Intelligence',
    author: 'Kahhow',
    duration: 201000, // 3.35 minutes in milliseconds
    imageUrl: 'https://picsum.photos/400/400?random=8',
    audioUrl: require('../assets/audio/8 Prompt Injection.mp3'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-yellow-200',
    textColor: 'text-yellow-900',
    timeLeft: '3m',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date(), // [PLACEHOLDER: Update with actual creation date]
    sources: [
      {
        title: 'Reverse Prompt Engineering',
        url: 'https://www.latent.space/p/reverse-prompt-eng',
        type: 'website',
        author: 'Latent.space',
        publishedDate: '2022',
      },
      {
        title: 'Play a game to learn about prompt injection',
        url: 'https://gandalf.lakera.ai/baseline',
        type: 'website',
        author: 'Lakera.ai',
        publishedDate: '2024',
      },
    ]
  },
  {
    id: '15',
    title: 'Learn to use AI: creating songs to help students\' remember, inspired by Eugene Teo (SJI)',
    description: 'Discover how you can use AI to turn subject content into songs, harness audio for memory, and explore sleep-based learning strategies inspired by Eugene Teo\'s (SJI) edutech experiments to support student learning outcomes.\n\nYou\'ll be able to:\n1. Use AI tools like ChatGPT, Suno, or Udio to convert subject concepts into lyrics and music, even if you\'re not musically inclined.\n2. Integrate audio-based study aids into your teaching — from playlists to paired video summaries — to reinforce learning beyond the classroom.\n3. Apply sleep research such as Targeted Memory Reactivation (TMR) by pairing summaries and lofi tracks with bedtime routines to strengthen student recall.',
    summary: '1. Turn Concepts into Lyrics – Use AI prompts to transform tricky topics (like ionic bonding) into short, catchy lines. You don\'t need to be musical — AI does the heavy lifting.\n2. Generate Songs with AI Tools – Drop your lyrics into Suno or Udio, pick a style (lofi, pop, rap), and in minutes you\'ll have a polished track for students to study with.\n3. Boost Recall with Audio & Sleep – Pair songs with NotebookLM video summaries, then encourage students to listen before bed. Research on Targeted Memory Reactivation (TMR) suggests audio cues during sleep can strengthen memory.',
    category: 'Artificial Intelligence',
    author: 'Kahhow',
    duration: 306000, // 5.1 minutes in milliseconds
    imageUrl: 'https://picsum.photos/400/400?random=7',
    audioUrl: require('../assets/audio/15 ai audio - eugene - isolated.mp3'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-yellow-200',
    textColor: 'text-yellow-900',
    timeLeft: '5m left',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date('2025-08-28'),
    sources: [
      {
        title: 'O Level Chemistry Lofi Study Music (Vol 1 - v1)',
        url: 'https://www.youtube.com/watch?v=sWRqbqHKa_s',
        type: 'video',
        author: 'Eugene Teo, SJI',
        publishedDate: '2025'
      },
      {
        title: 'Chemistry NotebookLM summaries in a YouTube playlist by Eugene Teo, SJI',
        url: 'https://www.youtube.com/playlist?list=PLRyjE27lCUbxefJzi6Ys7Fka_ZrN1EIPt',
        type: 'video',
        author: 'Eugene Teo, SJI',
        publishedDate: '2025'
      },
      {
        title: 'Eugene\'s Original Linkedin Post, reposted with consent',
        url: 'https://www.linkedin.com/feed/update/urn:li:activity:7357597913297932289/',
        type: 'article',
        author: 'Eugene Teo, SJI',
        publishedDate: '2025'
      },
    ]
  },
  {
    id: '3',
    title: 'Supporting Students with Dyslexia: What Every Teacher Needs to Know',
    description: '**Overview**\nThis episode dives deep into how educators can better understand and support students with dyslexia in mainstream classrooms. Backed by current brain research and real classroom experiences, the conversation unpacks what dyslexia really is (and isn’t), why some common myths persist, and how teachers can implement practical, research-based strategies that empower struggling readers. By embracing neurodiversity and applying structured support, educators can help students with dyslexia thrive both academically and emotionally.',
    summary: '1. Teach Reading Through Explicit, Systematic Phonics\n 2. Support Students Holistically in the Classroom (paired reading, visual support, leverage strengths; reframing lack of motivation as perhaps due to working twice as hard to decode text and hence appear disengaged)\n3. Build confidence by leveraging their strengths (oral expression, problem-solving, visual-spatial skills) and validating their effort)',
    category: 'Special Educational Needs',
    author: 'DXD Product Team',
    duration: 435000, // 7.15 minutes
    imageUrl: 'https://picsum.photos/400/400?random=5',
    audioUrl: require('../assets/audio/The_Hidden_Truth_about_Dyslexia-What_Every_Teacher_Needs_to_Know.wav'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-purple-200',
    textColor: 'text-purple-900',
    timeLeft: '13m left',
    progress: 0.2,
    publishedDate: '1 day ago',
    createdAt: new Date('2025-08-28'),
    sources: [
      {
        title: 'Literacy and Language Needs',
        url: 'https://intranet.moe.gov.sg/Send/Resources/Pages/LiteracyandLanguageNeeds.aspx',
        type: 'intranet',
        author: 'MOE SEND',
        publishedDate: '2025'
      },
      {
        title: 'Strategies for Supporting Students with SEN in Mainstream Classrooms',
        url: 'https://uldforparents.com/contents/identifying-and-diagnosing-specific-learning-disabilities/diagnostic-criteria-for-specific-learning-disorder-diagnosis/',
        type: 'article',
        author: 'Auspeld Team',
        publishedDate: '2025'
      },
    ]
  },
  {
    id: '2',
    title: "ADHD in Classrooms: Strategies That Work",
    description: '**Overview**\nThis episode unpacks how teachers can understand and support students with Attention Deficit Hyperactivity Disorder (ADHD) in mainstream classrooms. We break down common myths, explore how ADHD presents in different students, and share practical, low-prep strategies to help learners focus, stay organized, and succeed. Learn how to work effectively with parents, use classroom adjustments, and create inclusive learning environments where all students can thrive.',
    summary: '1. Understanding ADHD Is Essential for Effective Support \nSimple, Low-Prep Strategies Make a Big Impact (structured routines, visual aids, and clear instructions—can greatly improve focus, organization, and participation) \n 3. Collaboration and Inclusivity Enhance Outcomes (parents, the entire class community)',
    category: 'Special Educational Needs',
    author: 'DXD Product Team',
    duration: 540000, // 9 minutes
    imageUrl: 'https://picsum.photos/400/400?random=6',
    audioUrl: require('../assets/audio/ADHD_in_Classrooms_Strategies_That_Work.wav'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-purple-200',
    textColor: 'text-purple-900',
    timeLeft: '6m left',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date('2025-08-28'),
    sources: [
      {
        title: 'Remembering an Extraordinary ADHD Educator and Advocate',
        url: 'https://www.additudemag.com/chris-zeigler-dendy-adhd-iceberg-educator/',
        type: 'article',
        author: 'ADDitude Editors',
        publishedDate: '2024'
      },
      {
        title: 'Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5)',
        url: 'https://www.nie.edu.sg/research/ai-personalized-learning',
        type: 'book',
        author: 'American Psychiatric Association',
        publishedDate: '2013'
      },
      {
        title: 'EdTech Plan: Transforming Education Through Technology',
        url: 'https://www.moe.gov.sg/education-in-sg/educational-technology',
        type: 'article',
        author: 'Ministry of Education, Singapore',
        publishedDate: '2021'
      },
      {
        title: 'MOE SEND Intranet Resources',
        url: 'https://intranet.moe.gov.sg/Send/Pages/Resources.aspx',
        type: 'study',
        author: 'MOE SEND Team',
        publishedDate: 'Unknown'
      }    ]
  },
  {
    id: '1',
    title: 'Managing Student Meltdowns with CALM & CASE (Singapore)',
    description: 'Learn how to manage student meltdowns in Singapore classrooms using the CALM and CASE frameworks, with strategies for prevention, response, and whole-school support.\n\nYou will be able to:\n1. Recognise the difference between meltdowns, tantrums, and defiance, and identify early warning signs unique to your students.\n2. Apply MOE\'s CALM framework during a meltdown and CASE after, ensuring safety, communication, and stronger support systems.\n3. Design classroom and school-wide routines — like calm corners, exit cards, or peer supports — that reduce escalation and build trust with students.',
    summary: '1. Meltdowns Require Empathy, Not Discipline\n2. Frameworks Provide Clarity in Crisis and Recovery\n3. Prevention and Whole-School Support Are Key',
    category: 'Special Educational Needs',
    author: 'DXD Product Team',
    duration: 187000, // 3 minutes 7 seconds
    imageUrl: 'https://picsum.photos/400/400?random=42',
    audioUrl: require('../assets/audio/1 meltdown - isolated.mp3'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-purple-200',
    textColor: 'text-purple-900',
    timeLeft: '3m 7s',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date('2025-09-03'),
    sources: [
      {
        title: 'SEN:se Online PD Unit 4.2 Managing Meltdown',
        url: 'https://www.opal2.moe.edu.sg/app/learner/detail/course/76f2e6d2-ac95-4b3c-8102-c5ecf223d9d0',
        type: 'other',
        author: 'MOE (SEN:se)',
        publishedDate: '—'
      },
      {
        title: 'Modifications to Physical Spaces',
        url: 'https://file.notion.so/f/f/859c0b29-8cad-46b7-9f58-b12ad54a080a/27ca9427-be63-4b28-a738-e83dcb0c545c/Modification_to_Physical_Spaces_FINAL.pdf?table=block&id=25d970a3-87f2-80da-81c4-dbfdaaf220e0&spaceId=859c0b29-8cad-46b7-9f58-b12ad54a080a&expirationTimestamp=1756896134461&signature=TB5u3peFHa-puc3YJeaxd1MsV1RB-T-rNTkZ21fW5bI&downloadName=Modification+to+Physical+Spaces_FINAL.pdf',
        type: 'other',
        author: 'SEND',
        publishedDate: '—'
      },
      {
        title: 'Managing Meltdown – Facilitation Guide for Teachers (Contact Time)',
        url: 'https://file.notion.so/f/f/859c0b29-8cad-46b7-9f58-b12ad54a080a/3417a89f-56d5-4693-9d90-b6f83b6b2a11/MOE_Managing_Meltdown_Facilitation_Guide_for_teachers_(Contact_Time)_FINAL.pdf?table=block&id=25d970a3-87f2-80da-81c4-dbfdaaf220e0&spaceId=859c0b29-8cad-46b7-9f58-b12ad54a080a&expirationTimestamp=1756896105776&signature=0ic6ly-uzg10Jj37jR3T6r7WWTSH9dDmapCyiQPsy6k&downloadName=MOE+Managing+Meltdown+Facilitation+Guide+for+teachers+%28Contact+Time%29_FINAL.pdf',
        type: 'other',
        author: 'SEND',
        publishedDate: '—'
      },
      {
        title: 'Guiding Schools in Implementing School-Level SEN Support',
        url: 'https://file.notion.so/f/f/859c0b29-8cad-46b7-9f58-b12ad54a080a/6adfc6d3-24df-4254-851e-1e732df6e298/Guiding_Schools_in_Implementing_School-Level_SEN_Support.pdf?table=block&id=25d970a3-87f2-80da-81c4-dbfdaaf220e0&spaceId=859c0b29-8cad-46b7-9f58-b12ad54a080a&expirationTimestamp=1756896084760&signature=wvruBI1y3uyfEl7UyI04z4hoqqPoXZdn94N8c2--DNk&downloadName=Guiding+Schools+in+Implementing+School-Level+SEN+Support.pdf',
        type: 'other',
        author: 'SEND',
        publishedDate: '—'
      },
      {
        title: 'Circle of Friends',
        url: 'https://file.notion.so/f/f/859c0b29-8cad-46b7-9f58-b12ad54a080a/9859b7f0-9c92-4306-92d2-4be8b7f29e74/Circles_of_Friends.pdf?table=block&id=25d970a3-87f2-80da-81c4-dbfdaaf220e0&spaceId=859c0b29-8cad-46b7-9f58-b12ad54a080a&expirationTimestamp=1756896057718&signature=4JrrjyEzOqyBMQbPJbjLtEpkm8oWznQ7LhDP-PfKnNE&downloadName=Circles+of+Friends.pdf',
        type: 'other',
        author: 'SEND',
        publishedDate: '—'
      }
    ]
  },
  {
    id: '9',
    title: 'Learn about AI (General): From Anxiety to Agency - inspired by Prof Po-Shen\'s talk',
    description: `AI can solve even Olympiad-level problems, but the durable edge for Singaporean educators lies in cultivating language, empathy, and critical thinking—skills that keep learning human-centered and future-ready.

You'll be able to:
1. Reframe AI anxiety into teacher agency by focusing on human strengths like care, logic, and value creation for others.
2. Design classroom practices that preserve foundational skills—such as writing, problem-solving, and reflection—while integrating AI as a supportive tool.
3. Implement empathy-driven learning activities that help students engage with diverse perspectives and develop resilience in an AI-saturated world.

Watch the original video for more!`,
    summary: `1. Focus on Human Strengths – Reframe AI anxiety by emphasizing uniquely human skills like care, empathy, and logical reasoning that AI cannot replicate.

2. Preserve Foundational Skills – Design classroom practices that maintain core abilities like writing, problem-solving, and reflection while using AI as a supportive tool rather than a replacement.

3. Build Empathy & Resilience – Implement learning activities that help students engage with diverse perspectives and develop emotional resilience for an AI-saturated world.`,
    category: 'Artificial Intelligence',
    author: 'Kahhow',
    duration: 324702, // 5min 25s
    imageUrl: 'https://picsum.photos/400/400?random=9',
    audioUrl: require('../assets/audio/9_AI_olympiad.mp3'),
    backgroundColor: 'bg-white',
    badgeColor: 'bg-yellow-200',
    textColor: 'text-yellow-900',
    timeLeft: '5m',
    progress: 0,
    publishedDate: 'Today',
    createdAt: new Date(),
    sources: [
      {
        title: 'From Anxiety to Agency - Prof Po-Shen\'s talk',
        url: 'https://www.youtube.com/watch?v=xWYb7tImErIv',
        type: 'video',
        author: 'Prof Po-Shen',
        publishedDate: '2025'
      }
    ]
  }
];

export const getWeeklyProgress = () => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate the start of the current week (Monday)
  const startOfWeek = new Date(now);
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Adjust for Sunday
  startOfWeek.setDate(now.getDate() - daysToMonday);
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return weekDays.map((day, index) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + index);
    
    const isToday = date.toDateString() === now.toDateString();
    
    // For demo purposes, you can set some days as completed
    // In a real app, this would come from user progress data
    const isCompleted = index === 1 || index === 2; // Tuesday and Wednesday completed for demo
    
    return {
      day,
      date: date.getDate(),
      isCompleted,
      isToday
    };
  });
};

export const weeklyProgress = getWeeklyProgress();

export const formatDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};

export const getDaysAgo = (createdAt: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};