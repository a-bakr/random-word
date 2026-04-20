'use client';

let _sid: string | null = null;

function sid(): string {
  if (_sid) return _sid;
  try {
    _sid = sessionStorage.getItem('_sid') ?? crypto.randomUUID();
    sessionStorage.setItem('_sid', _sid);
  } catch {
    _sid = crypto.randomUUID();
  }
  return _sid;
}

function utmProps() {
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
  };
}

function referrerDomain(): string | null {
  try {
    return document.referrer ? new URL(document.referrer).hostname : null;
  } catch {
    return null;
  }
}

export function track(name: string, props: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return;
  fetch('/api/track', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      session_id: sid(),
      path: window.location.pathname,
      referrer: referrerDomain(),
      props,
      ...utmProps(),
    }),
    keepalive: true,
  }).catch(() => {});
}
