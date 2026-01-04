import { z } from 'zod';

export const userSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters'),
  role: z.enum(['admin', 'manager', 'rep'], {
    required_error: 'Role is required',
  }),
  bio: z
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  isActive: z.boolean().optional(),
});

export type UserInput = z.infer<typeof userSchema>;

export const contactSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  status: z.enum(['lead', 'customer'], {
    required_error: 'Status is required',
  }),
  jobTitle: z
    .string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  companyId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid('Invalid company ID').optional().nullable()
  ),
  userId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().cuid('Invalid user ID').optional().nullable()
  ),
});

export type ContactInput = z.infer<typeof contactSchema>;

export const activitySchema = z.object({
  type: z.enum(['call', 'email', 'meeting', 'note'], {
    required_error: 'Activity type is required',
  }),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(200, 'Subject must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  contactId: z.string().uuid('Invalid contact ID'),
  userId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().cuid('Invalid user ID').optional().nullable()
  ),
});

export type ActivityInput = z.infer<typeof activitySchema>;

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  dueDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required',
  }),
  contactId: z.string().uuid('Invalid contact ID'),
  userId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().cuid('Invalid user ID').optional().nullable()
  ),
});

export type TaskInput = z.infer<typeof taskSchema>;

export const companySchema = z.object({
  name: z
    .string()
    .min(1, 'Company name is required')
    .max(255, 'Company name must be less than 255 characters'),
  industry: z
    .string()
    .max(100, 'Industry must be less than 100 characters')
    .optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 characters')
    .max(20, 'Phone number must be less than 20 characters')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'Address must be less than 500 characters')
    .optional(),
  employeeCount: z
    .number()
    .int('Employee count must be a whole number')
    .min(0, 'Employee count must be positive')
    .optional(),
  revenue: z
    .number()
    .min(0, 'Revenue must be positive')
    .optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;

export const dealSchema = z.object({
  name: z
    .string()
    .min(1, 'Deal name is required')
    .max(255, 'Deal name must be less than 255 characters'),
  value: z
    .number()
    .min(0, 'Deal value must be a positive number'),
  stage: z.enum(
    ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
    {
      required_error: 'Stage is required',
    }
  ),
  expectedCloseDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
  actualCloseDate: z.string().optional(),
  status: z.enum(['open', 'won', 'lost'], {
    required_error: 'Status is required',
  }),
  probability: z
    .number()
    .min(0, 'Probability must be between 0 and 100')
    .max(100, 'Probability must be between 0 and 100')
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  contactId: z.string().uuid('Invalid contact ID'),
  companyId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().uuid('Invalid company ID').optional().nullable()
  ),
  userId: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().cuid('Invalid user ID').optional().nullable()
  ),
});

export type DealInput = z.infer<typeof dealSchema>;
