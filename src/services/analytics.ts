import { AnalyticsEventType } from '../types';
import { dataStore } from './dataStore';
import { getPostHog } from '../lib/posthog';

class AnalyticsTracker {
  private visitorId: string;
  private sessionId: string;
  private deviceType: 'mobile' | 'tablet' | 'desktop';
  private trafficSource: 'facebook' | 'instagram' | 'google' | 'direct' | 'other';
  private locationGovernorate?: string;

  constructor() {
    this.visitorId = this.getOrCreateVisitorId();
    this.sessionId = this.getOrCreateSessionId();
    this.deviceType = this.detectDeviceType();
    this.trafficSource = this.detectTrafficSource();

    // Identify using anonymous random ID only — never PII.
    // Runs as a no-op when PostHog key is not configured.
    try {
      getPostHog().identify(this.visitorId, {
        device_type: this.deviceType,
        traffic_source: this.trafficSource,
      });
    } catch {
      // Silenced
    }
  }

  private getOrCreateVisitorId(): string {
    let id = localStorage.getItem('bh_visitor_id');
    if (!id) {
      id = `vis_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
      localStorage.setItem('bh_visitor_id', id);
    }
    return id;
  }

  private getOrCreateSessionId(): string {
    let id = sessionStorage.getItem('bh_session_id');
    if (!id) {
      id = `sess_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
      sessionStorage.setItem('bh_session_id', id);
    }
    return id;
  }

  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    const ua = navigator.userAgent.toLowerCase();
    if (/tablet|ipad/i.test(ua) || (width >= 768 && width <= 1024)) {
      return 'tablet';
    }
    if (/mobile|iphone|android|phone/i.test(ua) || width < 768) {
      return 'mobile';
    }
    return 'desktop';
  }

  private detectTrafficSource(): 'facebook' | 'instagram' | 'google' | 'direct' | 'other' {
    const ref = document.referrer.toLowerCase();
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source')?.toLowerCase() || '';

    if (ref.includes('facebook.com') || ref.includes('fb.com') || utmSource.includes('facebook') || utmSource.includes('fb')) {
      return 'facebook';
    }
    if (ref.includes('instagram.com') || utmSource.includes('instagram') || utmSource.includes('ig')) {
      return 'instagram';
    }
    if (ref.includes('google.com') || utmSource.includes('google')) {
      return 'google';
    }
    if (!ref && !utmSource) {
      return 'direct';
    }
    return 'other';
  }

  public setLocation(governorate: string) {
    this.locationGovernorate = governorate;
  }

  public track(eventName: AnalyticsEventType, metadata?: Record<string, any>) {
    try {
      const payload = {
        event_name: eventName,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        page_url: window.location.pathname + window.location.search,
        device_type: this.deviceType,
        traffic_source: this.trafficSource,
        location_governorate: this.locationGovernorate || metadata?.governorate || undefined,
        metadata: metadata || {}
      };

      // Internal analytics store (unchanged)
      dataStore.logAnalyticsEvent(payload);

      // PostHog: strip PII before sending.
      // Never forward: customer name, phone, address, raw search queries,
      // order items with product names, or visitor/session IDs.
      const phProps = this.buildPostHogProps(eventName, metadata);
      getPostHog().capture(eventName, phProps);
    } catch (e) {
      console.warn('Analytics tracking error:', e);
    }
  }

  /**
   * Builds a PII-free property bag for PostHog from the raw metadata.
   * Each event type is explicitly mapped — unknown keys are dropped.
   */
  private buildPostHogProps(
    eventName: AnalyticsEventType,
    metadata?: Record<string, any>
  ): Record<string, unknown> {
    const base: Record<string, unknown> = {
      device_type: this.deviceType,
      traffic_source: this.trafficSource,
      page_url: window.location.pathname,
    };

    if (!metadata) return base;

    switch (eventName) {
      case 'PAGE_VIEW':
        return { ...base, page: metadata.page };

      case 'PRODUCT_VIEW':
        return { ...base, product_id: metadata.product_id };

      case 'PRODUCT_CLICK':
        // Card tap/click (intent) — distinct from opening the detail modal.
        return { ...base, product_id: metadata.product_id, sku: metadata.sku };

      case 'CATEGORY_VIEW':
        return { ...base, category_id: metadata.category_id };

      case 'SEARCH':
        // Send query length only — not the raw query text (could contain names).
        return { ...base, query_length: (metadata.query ?? '').length };

      case 'ADD_TO_CART':
        return {
          ...base,
          product_id: metadata.product_id,
          sku: metadata.sku,
          price: metadata.price,
          quantity: metadata.quantity,
        };

      case 'REMOVE_FROM_CART':
        return { ...base, product_id: metadata.product_id };

      case 'BEGIN_CHECKOUT':
        return {
          ...base,
          items_count: metadata.items_count,
          total_estimate: metadata.total_estimate,
        };

      case 'ORDER_SUBMIT_ATTEMPT':
        // Fires immediately when the user clicks submit, before any persistence.
        return {
          ...base,
          items_count: metadata.items_count,
          total_estimate: metadata.total_estimate,
        };

      case 'ORDER_CREATED':
        // Fires after dataStore.createOrder() returns successfully.
        // Meaning: order is CONFIRMED saved to localStorage (always synchronous).
        // Supabase sync is fire-and-forget; success/failure is NOT guaranteed here.
        // 'supabase_sync' is always 'pending' — we cannot confirm without awaiting.
        return {
          ...base,
          order_id: metadata.order_id,
          order_number: metadata.order_number,
          total_amount: metadata.total_amount,
          items_count: metadata.items_count,
          // Governorate is regional aggregate data, acceptable.
          governorate: metadata.governorate,
          delivery_fee: metadata.delivery_fee,
          deposit_amount: metadata.deposit_amount,
          remaining_amount: metadata.remaining_amount,
          // Reflect actual persistence scope honestly:
          saved_to: 'localStorage',
          supabase_sync: 'pending',
        };

      case 'WHATSAPP_CLICK':
        return {
          ...base,
          source: metadata.source,
          order_number: metadata.order_number,
          window_opened: metadata.window_opened ?? metadata.whatsapp_opened,
        };

      default:
        return base;
    }
  }

  public getVisitorId(): string {
    return this.visitorId;
  }

  public getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    return this.deviceType;
  }

  public getTrafficSource(): 'facebook' | 'instagram' | 'google' | 'direct' | 'other' {
    return this.trafficSource;
  }
}

export const analytics = new AnalyticsTracker();
