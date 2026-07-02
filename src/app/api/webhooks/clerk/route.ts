import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { syncClerkUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { apiError, apiSuccess } from '@/lib/auth';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return apiError('Webhook secret not configured', 500);
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return apiError('Missing svix headers', 400);
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return apiError('Error verifying webhook signature', 400);
  }

  // Handle the webhooks
  const eventType = evt.type;
  console.log(`Clerk Webhook received: ${eventType}`);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const data = evt.data;
      
      // Perform user sync
      const dbUser = await syncClerkUser({
        id: data.id,
        emailAddresses: data.email_addresses.map((email: any) => ({ emailAddress: email.email_address })),
        firstName: data.first_name ?? null,
        lastName: data.last_name ?? null,
        username: data.username ?? null,
        imageUrl: data.image_url ?? '',
      });

      console.log(`User successfully synced in DB: ${dbUser.id}`);
      return apiSuccess({ success: true, user: dbUser });
    }

    if (eventType === 'user.deleted') {
      const { id } = evt.data;
      if (!id) return apiError('Missing user ID in event data', 400);

      // Deactivate user in PostgreSQL (soft delete)
      const dbUser = await prisma.user.update({
        where: { clerkId: id },
        data: { isActive: false },
      });

      console.log(`User deactivated in DB: ${dbUser.id}`);
      return apiSuccess({ success: true, deactivated: true });
    }
  } catch (error: any) {
    console.error(`Error processing webhook event ${eventType}:`, error);
    return apiError(error?.message || 'Database sync error', 500);
  }

  return apiSuccess({ success: true, ignored: true });
}
