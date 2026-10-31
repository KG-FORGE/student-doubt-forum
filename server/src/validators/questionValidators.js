import { z } from 'zod';

export const createQuestionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(300, 'Title must be at most 300 characters'),

  description: z
    .string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(10000, 'Description must be at most 10 000 characters'),

  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(5, 'At most 5 tags are allowed')
    .default([]),

  subject: z.string().optional(), // ObjectId — validated against DB in controller
});

export const updateQuestionSchema = z.object({
  title: z
    .string()
    .trim()
    .min(10, 'Title must be at least 10 characters')
    .max(300)
    .optional(),

  description: z
    .string()
    .trim()
    .min(20)
    .max(10000)
    .optional(),

  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(5)
    .optional(),

  subject: z.string().optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' },
);

export const questionQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().max(200).optional(),
  subject: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  sort: z.enum(['newest', 'popular', 'unanswered']).default('newest'),
  status: z.enum(['open', 'closed']).optional(),
});
