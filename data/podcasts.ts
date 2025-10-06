import { Podcast } from '@/types/podcast';

/**
 * Mock podcast data for development and testing
 */
export const mockPodcasts: Podcast[] = [
  {
    id: '24',
    title: "Beyond 'no gaming'",
    description: `Drawing on Self-Determination Theory (SDT), this episode explores the psychological appeal of gaming, which meets students' core needs for autonomy, competence, and relatedness. It differentiates between recreational gaming, hazardous gaming, and the clinical Gaming Disorder (ICD-11 definition), equipping educators to recognize warning signs and proactively guide students toward balanced well-being.

You'll be able to:
a) Unmet Needs Drive Engagement: Recognise that excessive gaming often serves as a signal, fulfilling unmet psychological needs for autonomy, competence, or relatedness that students may not be satisfied with at home or school.
b) Spot Key Warning Signs: Monitor for clear indicators of hazardous gaming, such as neglecting schoolwork, lying, poor emotional regulation, or sleep problems, as teachers are often the first to notice these shifts.
c) Substitute and Cope: Guide students toward healthy replacement activities (e.g., CCAs, sports) that satisfy the same core needs, and equip them with non-gaming coping strategies (e.g., music, exercise) to manage stress.`,
    imageUrl: 'https://picsum.photos/400/400?random=24',
    audioUrl: require('../assets/audio/Beyond Stop Gaming_2025 1003 1859.mp3'),
    duration: 420000, // 7 minutes - placeholder duration
    author: 'SDCD (Demo)',
    category: 'Student Well-being',
    sources: [
      {
        title: '[PLACEHOLDER: Self-Determination Theory research]',
        url: 'https://example.com/sdt-research',
        type: 'article',
        author: 'Deci & Ryan',
        publishedDate: '2025',
      },
      {
        title: '[PLACEHOLDER: ICD-11 Gaming Disorder definition]',
        url: 'https://example.com/icd-11-gaming',
        type: 'article',
        author: 'World Health Organization',
        publishedDate: '2024',
      },
      // [PLACEHOLDER: Add more sources as needed]
    ]
  },
  {
    id: '10',
    title: 'Learn to Use AI: More Consistent & Controlled Image Generation with JSON Formatting',
    description: `Using JSON style guides allows teachers to lock key visual elements (style, camera angle, and colour palette) so that AI-generated images remain consistent across lessons, reducing distractions and improving student focus on learning.

You'll be able to:
1. Apply JSON style guides to lock in core design elements (style, camera, colours) and maintain consistency across slides and teaching materials.
2. Differentiate between fixed and variable fields in prompts so that only lesson-specific content changes while the overall look stays coherent.
3. Implement a practical team workflow for generating visuals that align with department or school branding, making it easier for students to recognise and follow materials.`,
    imageUrl: 'https://picsum.photos/400/400?random=10',
    audioUrl: require('../assets/audio/10 json image - isolated.mp3'),
    duration: 251000, // 4min 11s
    author: 'Kahhow',
    category: 'Artificial Intelligence',
    sources: [
      {
        title: 'JSON Style Guides for Controlled Image Generation with GPT-4o and GPT-Image-1',
        url: 'https://dev.to/worldlinetech/json-style-guides-for-controlled-image-generation-with-gpt-4o-and-gpt-image-1-36p',
        type: 'website',
        author: 'raphiki',
        publishedDate: '9 May 2025',
      },
      // [PLACEHOLDER: Add more sources as needed]
    ]
  },
  {
    id: '8',
    title: 'Learn about AI: How to Trick a Language Model',
    description: `Prompt injection shows how AI systems can be tricked by carefully worded instructions, highlighting the need for awareness and critical use in education.

You'll be able to:
1. Recognise what prompt injection is and how it compares to older security issues like SQL injection.
2. Identify at least three common techniques used in prompt injection (e.g., "ignore the above," translation tricks, role-play outlets).
3. Evaluate why most prompt injections are reputational rather than catastrophic, and apply this understanding to classroom AI use.`,
    imageUrl: 'https://picsum.photos/400/400?random=8',
    audioUrl: require('../assets/audio/8 Prompt Injection.mp3'),
    duration: 201000, 
    author: 'Kahhow',
    category: 'Artificial Intelligence',
    sources: [
      {
        title: '[PLACEHOLDER: Add source title]',
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
      // [PLACEHOLDER: Add more sources as needed]
    ]
  },
  {
    id: '15',
    title: 'Learn to use AI: creating songs to help students’ remember, inspired by Eugene Teo (SJI)',
    description: 'Discover how you can use AI to turn subject content into songs, harness audio for memory, and explore sleep-based learning strategies inspired by Eugene Teo\'s (SJI) edutech experiments to support student learning outcomes.\n\nYou\'ll be able to:\n1. Use AI tools like ChatGPT, Suno, or Udio to convert subject concepts into lyrics and music, even if you\'re not musically inclined.\n2. Integrate audio-based study aids into your teaching — from playlists to paired video summaries — to reinforce learning beyond the classroom.\n3. Apply sleep research such as Targeted Memory Reactivation (TMR) by pairing summaries and lofi tracks with bedtime routines to strengthen student recall.',
    imageUrl: 'https://picsum.photos/400/400?random=7',
    audioUrl: require('../assets/audio/15 ai audio - eugene - isolated.mp3'),
    duration: 306000,
    author: 'Kahhow',
    category: 'Artificial Intelligence',
    sources: [
      {
        title: 'Prompts for Suno to generate songs for your subject',
        url: 'https://medium.com/string/suno-ready-prompts-for-learning-via-audio-first-35e87af221e4',
        type: 'website',
        author: 'Kahhow',
        publishedDate: '2025',
      },
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
    description: 'Comprehensive approaches to create a positive school culture that prevents bullying and promotes student safety and wellbeing.',
    imageUrl: 'https://picsum.photos/400/400?random=5',
    audioUrl: require('../assets/audio/The_Hidden_Truth_about_Dyslexia-What_Every_Teacher_Needs_to_Know.wav'),
    duration: 435000, // 40 minutes in milliseconds
    author: 'DXD Product Team',
    category: 'Special Educational Needs',
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
    imageUrl: 'https://picsum.photos/400/400?random=6',
    audioUrl: require('../assets/audio/ais-role-in-singapores-education-transformation.wav'),
    duration: 540000, // 9 minutes
    author: 'Education Technology Team',
    category: 'Artificial Intelligence',
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
        publishedDate: 'Unknown'},
    ]
  }
];

/**
 * Helper function to format duration from milliseconds to readable string
 */
export const formatDuration = (milliseconds: number): string => {
  const minutes = Math.floor(milliseconds / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  
  return `${minutes}m`;
};