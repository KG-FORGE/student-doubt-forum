import { z } from 'zod';

export const createAnswerSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, 'Answer must be at least 20 characters')
    .max(10000, 'Answer must be at most 10 000 characters'),
});

export const updateAnswerSchema = z.object({
  content: z
    .string()
    .trim()
    .min(20, 'Answer must be at least 20 characters')
    .max(10000, 'Answer must be at most 10 000 characters'),
});

export const voteSchema = z.object({
  targetType: z.enum(['Question', 'Answer']),
  targetId: z.string().min(1),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export const reportSchema = z.object({
  targetType: z.enum(['Question', 'Answer']),
  targetId: z.string().min(1),
  reason: z.enum(['spam', 'offensive', 'misleading', 'plagiarism', 'off-topic', 'other']),
  description: z.string().trim().max(1000).optional().default(''),
});
