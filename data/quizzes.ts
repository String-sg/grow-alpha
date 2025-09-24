import { Quiz } from '@/types/quiz';

/**
 * Mock quiz data for development and testing
 * Each quiz corresponds to educational content in the educational-content data
 */
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-2',
    podcastId: '2', // ADHD in Classrooms: Strategies That Work
    title: 'ADHD in Classrooms Quiz',
    description: 'Test your understanding of ADHD characteristics and effective classroom strategies to support students with attention and hyperactivity challenges.',
    durationThreshold: 0.8, // 80% listening required
    estimatedTime: 5,
    questions: [
      {
        id: 'q2-1',
        question: 'What are the two main types of ADHD mentioned in the podcast?',
        difficulty: 'easy',
        options: [
          { id: 'opt1-1', text: 'Mild and severe ADHD', isCorrect: false },
          { id: 'opt1-2', text: 'Inattentive type and hyperactive-impulsive type', isCorrect: true },
          { id: 'opt1-3', text: 'Childhood and adult ADHD', isCorrect: false },
          { id: 'opt1-4', text: 'Medicated and unmedicated ADHD', isCorrect: false }
        ],
        explanation: 'The podcast clearly distinguishes between inattentive ADHD (like Sarah who drifts off and loses things) and hyperactive-impulsive ADHD (like Marcus who can\'t sit still and blurts out answers). Some students have symptoms from both types.'
      },
      {
        id: 'q2-2',
        question: 'According to the podcast, what\'s the most important principle when supporting students with ADHD?',
        difficulty: 'medium',
        options: [
          { id: 'opt2-1', text: 'Students need more discipline and stricter rules', isCorrect: false },
          { id: 'opt2-2', text: 'ADHD behaviors are choices students make consciously', isCorrect: false },
          { id: 'opt2-3', text: 'These aren\'t choices - their brains are wired differently, like a child with a broken leg', isCorrect: true },
          { id: 'opt2-4', text: 'Students with ADHD should be separated from other students', isCorrect: false }
        ],
        explanation: 'The podcast emphasizes that ADHD behaviors aren\'t choices students make. The analogy used is "if a child had a broken leg, we wouldn\'t expect them to run laps" - same principle applies to ADHD students\' brain differences.'
      },
      {
        id: 'q2-3',
        question: 'Which classroom strategy is specifically recommended for students with attention difficulties?',
        difficulty: 'medium',
        options: [
          { id: 'opt3-1', text: 'Seat them by the window for fresh air and natural light', isCorrect: false },
          { id: 'opt3-2', text: 'Give them longer, more complex assignments to challenge them', isCorrect: false },
          { id: 'opt3-3', text: 'Seat them at the front, away from high-traffic areas and distractions', isCorrect: true },
          { id: 'opt3-4', text: 'Have them work alone at all times', isCorrect: false }
        ],
        explanation: 'The podcast specifically recommends seating students with attention difficulties at the front of the classroom, away from high-traffic areas and distractions like the pencil sharpener or classroom door.'
      }
    ]
  },
  {
    id: 'quiz-10',
    podcastId: '10', // Learn to Use AI: More Consistent & Controlled Image Generation with JSON Formatting
    title: 'AI Image Generation with JSON Quiz',
    description: 'Test your understanding of using JSON style guides for consistent and controlled AI image generation in educational contexts.',
    durationThreshold: 0.8, // 80% listening required
    estimatedTime: 5,
    questions: [
      {
        id: 'q10-1',
        question: 'What is the main benefit of using JSON style guides for AI image generation in education?',
        difficulty: 'easy',
        options: [
          { id: 'opt1-1', text: 'It makes images load faster on school computers', isCorrect: false },
          { id: 'opt1-2', text: 'It allows teachers to lock key visual elements for consistency across lessons', isCorrect: true },
          { id: 'opt1-3', text: 'It reduces the cost of generating AI images', isCorrect: false },
          { id: 'opt1-4', text: 'It automatically creates better quality images', isCorrect: false }
        ],
        explanation: 'JSON style guides help teachers maintain consistency by locking in core design elements like style, camera angle, and color palette, ensuring visual coherence across all teaching materials and reducing student distractions.'
      },
      {
        id: 'q10-2',
        question: 'According to the podcast, what should teachers differentiate between when creating JSON prompts?',
        difficulty: 'medium',
        options: [
          { id: 'opt2-1', text: 'Free and paid AI image generation tools', isCorrect: false },
          { id: 'opt2-2', text: 'Simple and complex image requests', isCorrect: false },
          { id: 'opt2-3', text: 'Fixed and variable fields in prompts', isCorrect: true },
          { id: 'opt2-4', text: 'Individual and team-generated images', isCorrect: false }
        ],
        explanation: 'The key is to differentiate between fixed fields (consistent visual elements like style and colors) and variable fields (lesson-specific content), so only the content changes while the overall visual design remains coherent.'
      },
      {
        id: 'q10-3',
        question: 'How does implementing a JSON-based workflow help with team collaboration in schools?',
        difficulty: 'medium',
        options: [
          { id: 'opt3-1', text: 'It speeds up the image generation process', isCorrect: false },
          { id: 'opt3-2', text: 'It allows multiple teachers to generate visuals that align with department branding', isCorrect: true },
          { id: 'opt3-3', text: 'It reduces the number of images needed per lesson', isCorrect: false },
          { id: 'opt3-4', text: 'It eliminates the need for design skills', isCorrect: false }
        ],
        explanation: 'A practical JSON workflow enables teams to create visuals that consistently align with department or school branding, making it easier for students to recognize and follow materials across different classes and teachers.'
      }
    ]
  }
];