import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Get user from metadata
      const userId = session.metadata?.userId;
      if (!userId) break;

      // Update user subscription in Supabase
      await supabase
        .from('profiles')
        .update({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_plan: session.metadata?.plan,
          subscription_status: 'active',
          trial_ended: true,
        })
        .eq('id', userId);

      // Log purchase
      await supabase
        .from('purchase_events')
        .insert({
          user_id: userId,
          event_type: 'purchase',
          plan: session.metadata?.plan,
          amount: session.amount_total,
          currency: session.currency,
          stripe_session_id: session.id,
        });

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;

      // Update subscription status
      await supabase
        .from('profiles')
        .update({
          subscription_status: subscription.status,
        })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      // Mark subscription as cancelled
      await supabase
        .from('profiles')
        .update({
          subscription_status: 'cancelled',
          subscription_plan: null,
        })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;

      // Log successful payment
      await supabase
        .from('payment_events')
        .insert({
          customer_id: invoice.customer as string,
          event_type: 'invoice_paid',
          amount: invoice.amount_paid,
          currency: invoice.currency,
          stripe_invoice_id: invoice.id,
        });

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;

      // Log failed payment
      await supabase
        .from('payment_events')
        .insert({
          customer_id: invoice.customer as string,
          event_type: 'invoice_failed',
          amount: invoice.amount_due,
          currency: invoice.currency,
          stripe_invoice_id: invoice.id,
        });

      break;
    }
  }
}

export async function createCheckoutSession(
  userId: string,
  priceId: string,
  customerEmail: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: customerEmail,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/pricing`,
    metadata: {
      userId,
      plan: priceId,
    },
  });

  return session;
}

export async function getCustomerPortalUrl(customerId: string) {
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.APP_URL}/dashboard`,
  });

  return portal.url;
}
