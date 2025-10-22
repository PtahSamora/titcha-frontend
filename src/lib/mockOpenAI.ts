/**
 * Mock OpenAI responses for AI Tutor
 * Context-aware responses based on subject and topic
 */

export interface AIResponse {
  text: string;
  structure: 'explanation' | 'example' | 'practice' | 'definition' | 'tip';
}

/**
 * Generate context-aware mock AI tutor responses
 */
export async function mockContextualResponse(
  userMessage: string,
  subject: string,
  topic: string
): Promise<AIResponse> {
  // Simulate network delay
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  await delay(800 + Math.random() * 1200);

  const subjectLower = subject.toLowerCase();
  const messageLower = userMessage.toLowerCase();

  // Subject-specific context prefixes
  const contextPrefix = getContextPrefix(subjectLower, topic);

  // Generate response based on subject and message content
  if (subjectLower === 'math' || subjectLower === 'mathematics') {
    return generateMathResponse(messageLower, topic, contextPrefix);
  } else if (subjectLower === 'science') {
    return generateScienceResponse(messageLower, topic, contextPrefix);
  } else if (subjectLower === 'english') {
    return generateEnglishResponse(messageLower, topic, contextPrefix);
  }

  // Default generic educational response
  return {
    structure: 'explanation',
    text: `${contextPrefix} Let me help you understand this concept better. In ${subject}, "${topic}" is an important area of study. What specific aspect would you like to explore?`,
  };
}

function getContextPrefix(subject: string, topic: string): string {
  switch (subject) {
    case 'math':
    case 'mathematics':
      return `Let's explore the mathematics behind "${topic}":`;
    case 'science':
      return `In science, particularly regarding "${topic}":`;
    case 'english':
      return `Considering the topic of "${topic}" in English:`;
    default:
      return `Regarding "${topic}" in ${subject}:`;
  }
}

function generateMathResponse(message: string, topic: string, prefix: string): AIResponse {
  // Pythagorean theorem responses
  if (message.includes('pythagorean') || message.includes('theorem') || topic.toLowerCase().includes('pythagorean')) {
    if (message.includes('what') || message.includes('explain')) {
      return {
        structure: 'explanation',
        text: `${prefix} The Pythagorean theorem states that in a right triangle, the square of the hypotenuse (the longest side) equals the sum of squares of the other two sides. We express this as: a² + b² = c², where c is the hypotenuse.`,
      };
    } else if (message.includes('example')) {
      return {
        structure: 'example',
        text: `For example, if one leg is 3 units and the other is 4 units, then the hypotenuse is √(3² + 4²) = √(9 + 16) = √25 = 5 units. This is a famous 3-4-5 right triangle!`,
      };
    } else if (message.includes('practice') || message.includes('try')) {
      return {
        structure: 'practice',
        text: `Let's practice! Can you calculate the hypotenuse if the two legs are 6 and 8 units? Remember: c² = a² + b², so c = √(a² + b²)`,
      };
    }
  }

  // Algebra responses
  if (message.includes('algebra') || message.includes('equation') || message.includes('solve')) {
    return {
      structure: 'explanation',
      text: `${prefix} When solving algebraic equations, we use inverse operations to isolate the variable. For example, to solve 2x + 5 = 15, we subtract 5 from both sides: 2x = 10, then divide by 2: x = 5.`,
    };
  }

  // Fractions
  if (message.includes('fraction') || message.includes('divide')) {
    return {
      structure: 'explanation',
      text: `${prefix} When working with fractions, remember that the numerator (top number) represents parts taken, and the denominator (bottom number) represents total equal parts. To multiply fractions: multiply numerators together and denominators together.`,
    };
  }

  // Geometry
  if (message.includes('area') || message.includes('perimeter') || message.includes('geometry')) {
    return {
      structure: 'definition',
      text: `${prefix} In geometry, area measures the space inside a 2D shape (in square units), while perimeter measures the distance around it (in linear units). For a rectangle: Area = length × width, Perimeter = 2(length + width).`,
    };
  }

  // Even if user types something random like "dolphins", keep it math-focused
  return {
    structure: 'tip',
    text: `${prefix} That's an interesting question! Let's relate it to mathematics. In ${topic}, we focus on patterns, relationships, and problem-solving. Is there a specific mathematical concept you'd like to explore?`,
  };
}

function generateScienceResponse(message: string, topic: string, prefix: string): AIResponse {
  // Photosynthesis
  if (message.includes('photosynthesis') || topic.toLowerCase().includes('photosynthesis')) {
    if (message.includes('what') || message.includes('explain')) {
      return {
        structure: 'explanation',
        text: `${prefix} Photosynthesis is the process by which plants convert light energy into chemical energy (glucose). The equation is: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants take in carbon dioxide and water, and produce glucose and oxygen!`,
      };
    } else if (message.includes('example')) {
      return {
        structure: 'example',
        text: `For example, when a plant's leaves absorb sunlight, chlorophyll in the chloroplasts captures that energy. This energy splits water molecules and combines carbon dioxide to create sugar (glucose) that the plant uses for growth.`,
      };
    }
  }

  // Physics
  if (message.includes('force') || message.includes('motion') || message.includes('physics')) {
    return {
      structure: 'explanation',
      text: `${prefix} Newton's laws describe motion and force. The first law states that an object at rest stays at rest unless acted upon by a force. The second law gives us F = ma (force equals mass times acceleration).`,
    };
  }

  // Chemistry
  if (message.includes('atom') || message.includes('element') || message.includes('chemistry')) {
    return {
      structure: 'definition',
      text: `${prefix} An atom is the smallest unit of an element. It consists of a nucleus (containing protons and neutrons) surrounded by electrons. The number of protons determines which element it is.`,
    };
  }

  return {
    structure: 'tip',
    text: `${prefix} Science helps us understand the natural world through observation and experimentation. In ${topic}, we explore how things work and why they behave the way they do. What aspect interests you most?`,
  };
}

function generateEnglishResponse(message: string, topic: string, prefix: string): AIResponse {
  // Grammar
  if (message.includes('grammar') || message.includes('verb') || message.includes('noun')) {
    return {
      structure: 'explanation',
      text: `${prefix} Parts of speech form the building blocks of sentences. Nouns name people, places, or things. Verbs express actions or states of being. Adjectives describe nouns, and adverbs modify verbs, adjectives, or other adverbs.`,
    };
  }

  // Writing
  if (message.includes('essay') || message.includes('write') || message.includes('paragraph')) {
    return {
      structure: 'tip',
      text: `${prefix} Good writing follows a clear structure: introduction (hook + thesis), body paragraphs (topic sentence + evidence + analysis), and conclusion (restate thesis + final thoughts). Always proofread for clarity and grammar!`,
    };
  }

  // Literature
  if (message.includes('theme') || message.includes('character') || message.includes('story')) {
    return {
      structure: 'explanation',
      text: `${prefix} Literary analysis involves examining elements like character development, theme, setting, and plot. A theme is the central message or insight about life that the author conveys through the story.`,
    };
  }

  return {
    structure: 'explanation',
    text: `${prefix} English helps us communicate effectively and appreciate literature. In ${topic}, we develop skills in reading comprehension, writing, and critical thinking. What would you like to learn more about?`,
  };
}

/**
 * Detect if message contains mathematical expressions
 */
export function containsMathExpression(text: string): boolean {
  // Check for common math patterns
  const mathPatterns = [
    /\d+\s*[\+\-\*\/\^]\s*\d+/,  // Basic operations: 2 + 3, 5 * 4
    /[a-z]\s*[\+\-\*\/\^]\s*\d+/, // Variables: x + 5, 2y
    /\d+\s*[a-z]/,                // Coefficients: 2x, 3y
    /[²³⁴⁵⁶⁷⁸⁹]/,                // Superscripts
    /[₀₁₂₃₄₅₆₇₈₉]/,              // Subscripts
    /√/,                          // Square root
    /≤|≥|≠|≈/,                    // Math symbols
    /\^/,                         // Exponent
    /a²|b²|c²/,                   // Common squared terms
  ];

  return mathPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract LaTeX expressions from text for KaTeX rendering
 */
export function extractLatexExpressions(text: string): Array<{ type: 'text' | 'latex'; content: string }> {
  const parts: Array<{ type: 'text' | 'latex'; content: string }> = [];

  // Common math expressions to convert to LaTeX
  const replacements = [
    { pattern: /a² \+ b² = c²/g, latex: 'a^2 + b^2 = c^2' },
    { pattern: /√\(([^)]+)\)/g, latex: '\\sqrt{$1}' },
    { pattern: /(\d+)²/g, latex: '$1^2' },
    { pattern: /x²/g, latex: 'x^2' },
    { pattern: /y²/g, latex: 'y^2' },
  ];

  let processedText = text;
  const latexMatches: Array<{ start: number; end: number; latex: string }> = [];

  // Find all LaTeX expressions
  replacements.forEach(({ pattern, latex }) => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match.index !== undefined) {
        latexMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          latex: latex.replace('$1', match[1] || ''),
        });
      }
    }
  });

  // Sort by position
  latexMatches.sort((a, b) => a.start - b.start);

  // Split text into parts
  let lastIndex = 0;
  latexMatches.forEach(match => {
    if (match.start > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.start),
      });
    }
    parts.push({
      type: 'latex',
      content: match.latex,
    });
    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex),
    });
  }

  // If no LaTeX found, return original text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }

  return parts;
}
