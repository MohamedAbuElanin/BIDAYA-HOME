import { AnalyticsEventType } from '../types';
import { dataStore } from './dataStore';

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
      dataStore.logAnalyticsEvent({
        event_name: eventName,
        visitor_id: this.visitorId,
        session_id: this.sessionId,
        page_url: window.location.pathname + window.location.search,
        device_type: this.deviceType,
        traffic_source: this.trafficSource,
        location_governorate: this.locationGovernorate || metadata?.governorate || undefined,
        metadata: metadata || {}
      });
    } catch (e) {
      console.warn('Analytics tracking error:', e);
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
