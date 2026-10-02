// Analytics service for conversion tracking
import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: Function;
    dataLayer?: any[];
  }
}

export class Analytics {
  static init() {
    if (!import.meta.env.VITE_GTAG_ID) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GTAG_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', import.meta.env.VITE_GTAG_ID);
    window.gtag = gtag;
  }

  static trackEvent(eventName: string, eventParams?: Record<string, any>) {
    if (window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
    console.log('[Analytics]', eventName, eventParams);
  }

  static trackPageView(pageName: string, pageLocation?: string) {
    this.trackEvent('page_view', {
      page_title: pageName,
      page_location: pageLocation || window.location.href,
    });
  }

  static trackSignup(method: string) {
    this.trackEvent('sign_up', { method });
  }

  static trackLogin(method: string) {
    this.trackEvent('login', { method });
  }

  static trackPlanSelected(planId: string, amount: number) {
    this.trackEvent('select_content', {
      content_type: 'plan',
      item_id: planId,
      value: amount,
    });
  }

  static trackCheckoutStart(planId: string, amount: number) {
    this.trackEvent('begin_checkout', {
      currency: 'BRL',
      value: amount,
      items: [{ item_id: planId }],
    });
  }

  static trackPurchase(planId: string, amount: number, transactionId: string) {
    this.trackEvent('purchase', {
      currency: 'BRL',
      value: amount,
      transaction_id: transactionId,
      items: [{ item_id: planId }],
    });
  }

  static trackFeatureUse(featureName: string) {
    this.trackEvent('feature_use', {
      feature: featureName,
    });
  }
}

export function useAnalytics(pageName: string) {
  useEffect(() => {
    Analytics.trackPageView(pageName);
  }, [pageName]);
}
