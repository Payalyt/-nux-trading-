import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to catch the event early before React mounts
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar and preserve event for manual installation
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));
  });
}

export type FallbackReason = 'inapp_android' | 'inapp_ios' | 'iframe' | 'ios_safari' | 'browser_menu' | null;

export interface FallbackInfo {
  show: boolean;
  reason: FallbackReason;
  title: string;
  message: string;
  actionText?: string;
  appName?: string;
  intentUrl?: string;
}

export function detectInAppBrowser(): {
  isInApp: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  appName: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isInApp: false, isAndroid: false, isIOS: false, appName: '' };
  }

  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);

  // Common in-app browser identifiers (Facebook, Messenger, Instagram, TikTok, Line, etc.)
  const isMessenger = ua.includes('fban') || ua.includes('fbav') || ua.includes('messenger') || ua.includes('fb_iab');
  const isInstagram = ua.includes('instagram');
  const isTikTok = ua.includes('musical_ly') || ua.includes('tiktok') || ua.includes('bytedance');
  const isLine = ua.includes('line');
  const isTwitter = ua.includes('twitter');
  const isWeChat = ua.includes('micromessenger');
  const isSnapchat = ua.includes('snapchat');
  const isGenericWebView =
    (isAndroid && (ua.includes('; wv') || ua.includes('version/4.0'))) ||
    (isIOS && !ua.includes('safari') && ua.includes('mobile/'));

  const isInApp =
    isMessenger ||
    isInstagram ||
    isTikTok ||
    isLine ||
    isTwitter ||
    isWeChat ||
    isSnapchat ||
    isGenericWebView;

  let appName = 'In-App Browser';
  if (isMessenger) appName = 'Messenger';
  else if (isInstagram) appName = 'Instagram';
  else if (isTikTok) appName = 'TikTok';
  else if (isLine) appName = 'Line';
  else if (isTwitter) appName = 'Twitter';
  else if (isWeChat) appName = 'WeChat';
  else if (isSnapchat) appName = 'Snapchat';

  return { isInApp, isAndroid, isIOS, appName };
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    );
  });

  const [inAppInfo, setInAppInfo] = useState(() => detectInAppBrowser());

  const [fallbackInfo, setFallbackInfo] = useState<FallbackInfo>({
    show: false,
    reason: null,
    title: '',
    message: '',
  });

  useEffect(() => {
    setInAppInfo(detectInAppBrowser());

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      globalDeferredPrompt = promptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);
    };

    const handlePromptReady = () => {
      if (globalDeferredPrompt) {
        setDeferredPrompt(globalDeferredPrompt);
      }
    };

    const handleAppInstalled = () => {
      globalDeferredPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
      setIsInstallable(false);
      setFallbackInfo((prev) => ({ ...prev, show: false }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('pwa-prompt-ready', handlePromptReady);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (globalDeferredPrompt) {
      setDeferredPrompt(globalDeferredPrompt);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('pwa-prompt-ready', handlePromptReady);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissFallback = useCallback(() => {
    setFallbackInfo((prev) => ({ ...prev, show: false }));
  }, []);

  const openInDefaultBrowser = useCallback(() => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;
    const cleanHostAndPath = `${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
    const { isAndroid, isIOS } = detectInAppBrowser();

    if (isAndroid) {
      // Android Chrome intent to launch Google Chrome directly from in-app browsers
      const chromeIntent = `intent://${cleanHostAndPath}#Intent;scheme=https;package=com.android.chrome;end;`;
      try {
        window.location.href = chromeIntent;
      } catch {
        window.open(currentUrl, '_system');
      }
    } else if (isIOS) {
      // On iOS Safari / external browser
      window.open(currentUrl, '_blank');
    } else {
      window.open(currentUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  const installPWA = useCallback(async () => {
    // 1. Check if user is in an in-app browser (Messenger, Instagram, FB, etc.)
    const inApp = detectInAppBrowser();

    if (inApp.isInApp) {
      const cleanHostAndPath = `${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`;
      const chromeIntent = `intent://${cleanHostAndPath}#Intent;scheme=https;package=com.android.chrome;end;`;

      if (inApp.isAndroid) {
        // Attempt to directly launch in Chrome on Android
        try {
          window.location.href = chromeIntent;
        } catch (e) {
          console.warn('Direct intent launch failed:', e);
        }

        setFallbackInfo({
          show: true,
          reason: 'inapp_android',
          title: `Open in Chrome to Install`,
          message: `${inApp.appName} blocks direct app installation. Tap the 3 dots (⋯ or ⋮) at the top right, then select "Open in Chrome" or "Open in External Browser".`,
          actionText: 'Open in Chrome',
          appName: inApp.appName,
          intentUrl: chromeIntent,
        });
        return;
      } else if (inApp.isIOS) {
        setFallbackInfo({
          show: true,
          reason: 'inapp_ios',
          title: `Open in Safari to Install`,
          message: `${inApp.appName} blocks home screen installation. Tap the 3 dots (⋯) or Share icon at the top/bottom, and choose "Open in Safari".`,
          actionText: 'Open in Safari',
          appName: inApp.appName,
        });
        return;
      }
    }

    // 2. If native prompt event is captured, trigger it immediately
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (promptToUse) {
      try {
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          setIsInstallable(false);
          setFallbackInfo((prev) => ({ ...prev, show: false }));
        }
      } catch (error) {
        console.error('Error triggering native PWA prompt:', error);
      }
      return;
    }

    // 3. Handle specific browser environments when deferredPrompt is not yet ready
    const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isIOS = /iphone|ipad|ipod/.test(ua);

    if (isInIframe) {
      setFallbackInfo({
        show: true,
        reason: 'iframe',
        title: 'Install in Main Window',
        message: 'Browser security restricts native PWA installation inside preview frames. Open in a new tab or use browser menu (⋮ → Install App).',
        actionText: 'Open in New Tab',
      });
    } else if (isIOS) {
      setFallbackInfo({
        show: true,
        reason: 'ios_safari',
        title: 'Install on iOS Safari',
        message: 'Tap the Share button (⎋ / ⬆) at the bottom of Safari, then choose "Add to Home Screen" to install the app.',
      });
    } else {
      setFallbackInfo({
        show: true,
        reason: 'browser_menu',
        title: 'Install via Browser Menu',
        message: 'Click the install icon (⊕) in your browser address bar or click menu (⋮) → "Install NUX Trading" / "Add to Home screen".',
      });
    }
  }, [deferredPrompt]);

  return {
    isInstallable,
    isInstalled,
    inAppInfo,
    deferredPrompt,
    fallbackInfo,
    installPWA,
    promptInstall: installPWA,
    dismissFallback,
    openInDefaultBrowser,
    openInNewTab: openInDefaultBrowser,
  };
}
