const MAX_INPUT_LENGTH = 500;

/**
 * Strips HTML tags, script content, and common injection patterns from user input.
 * Used for follow-up questions and any user-provided text sent to Claude.
 */
export function sanitizeInput(input: string): string {
  let cleaned = input;

  // Remove script tags and their content
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Remove all HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, '');

  // Remove common template injection patterns
  cleaned = cleaned.replace(/\{\{[\s\S]*?\}\}/g, '');
  cleaned = cleaned.replace(/\$\{[\s\S]*?\}/g, '');

  // Remove null bytes
  cleaned = cleaned.replace(/\0/g, '');

  // Collapse excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Enforce hard character limit
  if (cleaned.length > MAX_INPUT_LENGTH) {
    cleaned = cleaned.slice(0, MAX_INPUT_LENGTH);
  }

  return cleaned;
}

/**
 * Wraps sanitized user input in delimiters so the AI model can distinguish
 * user questions from system instructions.
 */
export function wrapUserInput(input: string): string {
  const sanitized = sanitizeInput(input);
  return `<user_question>${sanitized}</user_question>`;
}
