'use server';

import { z } from 'zod';

const formSchema = z.object({
  governorate: z.string().min(2, 'Governorate is required.'),
  month: z.string({ required_error: 'Please select a month.' }),
  events: z
    .array(
      z.object({
        details: z.string().min(5, 'Details must be at least 5 characters.'),
        date: z.date({ required_error: 'A date is required.' }),
        type: z.string({ required_error: 'Please select an event type.' }),
      })
    )
    .min(1, 'At least one event is required.'),
  deputies: z
    .array(
      z.object({
        name: z.string().min(2, 'Deputy name is required.'),
      })
    )
    .min(1, 'At least one deputy signature is required.'),
});

type FormState = {
  message: string;
  success: boolean;
};

export async function submitPlan(
  data: z.infer<typeof formSchema>
): Promise<FormState> {
  const validatedFields = formSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data. Please check your inputs.',
      success: false,
    };
  }

  try {
    const response = await fetch('https://submit.tahyamisrsu.com/webhook/plan-oc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedFields.data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Webhook Error:', errorData);
      return {
        message: `Submission failed. The server responded with status: ${response.status}.`,
        success: false,
      };
    }

    return {
      message: 'Plan submitted successfully!',
      success: true,
    };
  } catch (error) {
    console.error('Network or other error:', error);
    return {
      message: 'An unexpected error occurred. Please try again later.',
      success: false,
    };
  }
}
