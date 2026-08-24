import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global variable to catch the native browser install prompt as early as possible
let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
let hasAutoPrompted = false;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar so our button can invoke the browser's native prompt on demand
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent('pwa-prompt-ready'));

    // If page was opened with ?auto_install=true or ?install=true, trigger browser native prompt immediately
    const urlParams = new URLSearchParams(window.location.search);
    if ((urlParams.get('auto_install') === 'true' || urlParams.get('install') === 'true') && !hasAutoPrompted) {
      hasAutoPrompted = true;
      setTimeout(() => {
        try {
          globalDeferredPrompt?.prompt();
        } catch (err) {
          console.warn('Auto prompt trigger:', err);
        }
      }, 300);
    }
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
  isWindows: boolean;
  isMac: boolean;
  isInIframe: boolean;
  appName: string;
} {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isInApp: false, isAndroid: false, isIOS: false, isWindows: false, isMac: false, isInIframe: false, appName: '' };
  }

  const ua = (navigator.userAgent || navigator.vendor || '').toLowerCase();
  const isAndroid = /android/.test(ua);
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isWindows = /windows/.test(ua);
  const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
  const isInIframe = window.self !== window.top;

  const isMessenger = ua.includes('fban') || ua.includes('fbav') || ua.includes('messenger') || ua.includes('fb_iab');
  const isInstagram = ua.includes('instagram');
  const isTikTok = ua.includes('musical_ly') || ua.includes('tiktok') || ua.includes('bytedance');
  const isLine = ua.includes('line');
  const isTwitter = ua.includes('twitter');
  const isWeChat = ua.includes('micromessenger');
  const isSnapchat = ua.includes('snapchat');
  const isTelegram = ua.includes('telegram');
  const isWhatsApp = ua.includes('whatsapp');
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
    isTelegram ||
    isWhatsApp ||
    isGenericWebView;

  let appName = 'In-App Browser';
  if (isMessenger) appName = 'Messenger';
  else if (isInstagram) appName = 'Instagram';
  else if (isTikTok) appName = 'TikTok';
  else if (isLine) appName = 'Line';
  else if (isTwitter) appName = 'Twitter';
  else if (isWeChat) appName = 'WeChat';
  else if (isSnapchat) appName = 'Snapchat';
  else if (isTelegram) appName = 'Telegram';
  else if (isWhatsApp) appName = 'WhatsApp';

  return { isInApp, isAndroid, isIOS, isWindows, isMac, isInIframe, appName };
}

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(globalDeferredPrompt);
  const [isInstallable, setIsInstallable] = useState(true);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  const [inAppInfo, setInAppInfo] = useState(() => detectInAppBrowser());
  const [justInstalled, setJustInstalled] = useState<boolean>(false);

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
      setJustInstalled(true);
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
  }, [isInstalled]);

  // Auto-dismiss justInstalled notification after 6 seconds
  useEffect(() => {
    if (justInstalled) {
      const timer = setTimeout(() => {
        setJustInstalled(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [justInstalled]);

  const dismissJustInstalled = useCallback(() => {
    setJustInstalled(false);
  }, []);

  const dismissFallback = useCallback(() => {
    setFallbackInfo((prev) => ({ ...prev, show: false }));
  }, []);

  const openInDefaultBrowser = useCallback((withAutoInstall = true) => {
    if (typeof window === 'undefined') return;

    const currentUrl = new URL(window.location.href);
    if (withAutoInstall) {
      currentUrl.searchParams.set('auto_install', 'true');
    }
    const targetUrl = currentUrl.toString();
    const cleanHostAndPath = `${currentUrl.host}${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`;
    const { isAndroid, isIOS } = detectInAppBrowser();

    if (isAndroid) {
      const chromeIntent = `intent://${cleanHostAndPath}#Intent;scheme=https;package=com.android.chrome;end;`;
      try {
        window.location.href = chromeIntent;
      } catch {
        window.open(targetUrl, '_blank');
      }
    } else if (isIOS) {
      window.open(targetUrl, '_blank');
    } else {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  }, []);

  /**
   * Directly triggers the browser's native installation popup.
   * If the browser or environment requires transfer (iframe or in-app webview),
   * it delegates directly to the browser without displaying website modals.
   */
  const installPWA = useCallback(async () => {
    const inApp = detectInAppBrowser();

    // 1. If running inside an iframe (like AI Studio preview):
    // Browser sandboxing blocks native install prompts inside iframes.
    // Transfer execution immediately to a real browser window with ?auto_install=true
    if (inApp.isInIframe) {
      openInDefaultBrowser(true);
      return;
    }

    // 2. If running inside an In-App Browser (Facebook/Instagram/TikTok/Messenger):
    // Launch Chrome intent directly so the actual browser handles installation
    if (inApp.isInApp) {
      openInDefaultBrowser(true);
      return;
    }

    // 3. Directly invoke the browser's native installation popup!
    const promptToUse = deferredPrompt || globalDeferredPrompt;
    if (promptToUse) {
      try {
        // This triggers the browser's native popup (Chrome / Edge / Android OS dialog)
        await promptToUse.prompt();
        const { outcome } = await promptToUse.userChoice;
        if (outcome === 'accepted') {
          globalDeferredPrompt = null;
          setDeferredPrompt(null);
          setIsInstalled(true);
          setIsInstallable(false);
          setJustInstalled(true);
          setFallbackInfo((prev) => ({ ...prev, show: false }));
        }
      } catch (error) {
        console.error('Error triggering browser native install popup:', error);
      }
      return;
    }

    // 4. If iOS Safari (which doesn't support programmatic beforeinstallprompt),
    // show the standard Safari manual instructions toast
    if (inApp.isIOS) {
      setFallbackInfo({
        show: true,
        reason: 'ios_safari',
        title: 'Install via Safari Browser',
        message: 'Tap the Share icon (⎋ / ⬆) at the bottom of Safari, then select "Add to Home Screen" to install.',
      });
    } else {
      // For browsers that haven't fired beforeinstallprompt yet or already installed
      setFallbackInfo({
        show: true,
        reason: 'browser_menu',
        title: 'Install from Browser Bar',
        message: 'Click the Install icon (⊕) in your browser address bar or open the browser menu (⋮) → "Install NUX Trading".',
      });
    }
  }, [deferredPrompt, openInDefaultBrowser]);

  return {
    isInstallable,
    isInstalled,
    justInstalled,
    dismissJustInstalled,
    inAppInfo,
    deferredPrompt,
    hasDeferredPrompt: !!(deferredPrompt || globalDeferredPrompt),
    fallbackInfo,
    installPWA,
    promptInstall: installPWA,
    dismissFallback,
    openInDefaultBrowser,
    openInNewTab: openInDefaultBrowser,
  };
}
