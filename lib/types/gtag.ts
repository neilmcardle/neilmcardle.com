// Ambient types for Google Analytics / Google Ads gtag.js. The script
// attaches `window.gtag` and `window.dataLayer` at runtime; this file
// teaches TypeScript about them so callers don't need `any`.

type GtagConfigParams = Record<string, unknown>;

type GtagEventParams = {
  send_to?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
} & Record<string, unknown>;

export type Gtag = {
  (command: 'js', date: Date): void;
  (command: 'config', targetId: string, params?: GtagConfigParams): void;
  (command: 'event', eventName: string, params?: GtagEventParams): void;
  (command: 'set', params: Record<string, unknown>): void;
  (command: 'consent', action: 'default' | 'update', params: Record<string, unknown>): void;
};

declare global {
  interface Window {
    gtag?: Gtag;
    dataLayer?: unknown[];
  }
}

export {};
