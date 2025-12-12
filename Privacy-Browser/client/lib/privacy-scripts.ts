import { PrivacySettings, getRandomUserAgent } from "./storage";

export function generatePrivacyScript(settings: PrivacySettings): string {
  const scripts: string[] = [];

  if (settings.canvasProtection) {
    scripts.push(`
      (function() {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        
        HTMLCanvasElement.prototype.toDataURL = function() {
          const ctx = this.getContext('2d');
          if (ctx) {
            const imageData = originalGetImageData.call(ctx, 0, 0, this.width, this.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
              imageData.data[i] = imageData.data[i] ^ (Math.random() * 2);
            }
            ctx.putImageData(imageData, 0, 0);
          }
          return originalToDataURL.apply(this, arguments);
        };
      })();
    `);
  }

  if (settings.webglSpoofing) {
    scripts.push(`
      (function() {
        const getParameter = WebGLRenderingContext.prototype.getParameter;
        WebGLRenderingContext.prototype.getParameter = function(parameter) {
          if (parameter === 37445) return 'Intel Inc.';
          if (parameter === 37446) return 'Intel Iris OpenGL Engine';
          return getParameter.apply(this, arguments);
        };
        
        if (typeof WebGL2RenderingContext !== 'undefined') {
          const getParameter2 = WebGL2RenderingContext.prototype.getParameter;
          WebGL2RenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 37445) return 'Intel Inc.';
            if (parameter === 37446) return 'Intel Iris OpenGL Engine';
            return getParameter2.apply(this, arguments);
          };
        }
      })();
    `);
  }

  if (settings.fontBlocking) {
    scripts.push(`
      (function() {
        Object.defineProperty(document, 'fonts', {
          get: function() {
            return {
              check: function() { return true; },
              load: function() { return Promise.resolve([]); },
              ready: Promise.resolve(),
              forEach: function() {},
              entries: function() { return [].entries(); },
              keys: function() { return [].keys(); },
              values: function() { return [].values(); },
              [Symbol.iterator]: function() { return [].values(); }
            };
          }
        });
      })();
    `);
  }

  if (settings.audioProtection) {
    scripts.push(`
      (function() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
          AudioContext.prototype.createAnalyser = function() {
            const analyser = originalCreateAnalyser.apply(this, arguments);
            const originalGetFloatFrequencyData = analyser.getFloatFrequencyData.bind(analyser);
            analyser.getFloatFrequencyData = function(array) {
              originalGetFloatFrequencyData(array);
              for (let i = 0; i < array.length; i++) {
                array[i] = array[i] + (Math.random() * 0.0001);
              }
            };
            return analyser;
          };
        }
      })();
    `);
  }

  if (settings.resolutionSpoofing) {
    scripts.push(`
      (function() {
        Object.defineProperty(screen, 'width', { get: function() { return 1920; } });
        Object.defineProperty(screen, 'height', { get: function() { return 1080; } });
        Object.defineProperty(screen, 'availWidth', { get: function() { return 1920; } });
        Object.defineProperty(screen, 'availHeight', { get: function() { return 1040; } });
        Object.defineProperty(screen, 'colorDepth', { get: function() { return 24; } });
        Object.defineProperty(screen, 'pixelDepth', { get: function() { return 24; } });
        Object.defineProperty(window, 'devicePixelRatio', { get: function() { return 1; } });
      })();
    `);
  }

  if (settings.webrtcBlocking) {
    scripts.push(`
      (function() {
        if (typeof RTCPeerConnection !== 'undefined') {
          RTCPeerConnection = function() { throw new Error('WebRTC disabled'); };
        }
        if (typeof webkitRTCPeerConnection !== 'undefined') {
          webkitRTCPeerConnection = function() { throw new Error('WebRTC disabled'); };
        }
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia = function() {
            return Promise.reject(new Error('getUserMedia disabled'));
          };
        }
      })();
    `);
  }

  if (settings.antiProxyDetection) {
    scripts.push(`
      (function() {
        Object.defineProperty(navigator, 'webdriver', { get: function() { return false; } });
        Object.defineProperty(navigator, 'plugins', { get: function() { return [1, 2, 3, 4, 5]; } });
        Object.defineProperty(navigator, 'languages', { get: function() { return ['en-US', 'en']; } });
        window.chrome = { runtime: {} };
        Object.defineProperty(navigator, 'permissions', {
          get: function() {
            return {
              query: function() {
                return Promise.resolve({ state: 'granted' });
              }
            };
          }
        });
      })();
    `);
  }

  if (settings.randomUserAgent) {
    const ua = settings.currentUserAgent || getRandomUserAgent();
    scripts.push(`
      (function() {
        Object.defineProperty(navigator, 'userAgent', { get: function() { return '${ua}'; } });
        Object.defineProperty(navigator, 'appVersion', { get: function() { return '${ua.replace("Mozilla/", "")}'; } });
        Object.defineProperty(navigator, 'platform', { get: function() { return 'Win32'; } });
      })();
    `);
  }

  return scripts.join("\n");
}

export function generateAdBlockScript(enabled: boolean, isHomepage: boolean, allowHomepageAds: boolean): string {
  if (!enabled) return "";
  if (isHomepage && allowHomepageAds) return "";

  return `
    (function() {
      const adSelectors = [
        '[class*="ad-"]', '[class*="ads-"]', '[class*="advert"]',
        '[id*="ad-"]', '[id*="ads-"]', '[id*="advert"]',
        'iframe[src*="doubleclick"]', 'iframe[src*="googlesyndication"]',
        'iframe[src*="googleadservices"]', '[data-ad]', '[data-ads]',
        '.advertisement', '.ad-banner', '.ad-container',
        '[class*="sponsored"]', '[id*="sponsored"]',
        'ins.adsbygoogle', '.google-ads', '#google_ads'
      ];
      
      function removeAds() {
        adSelectors.forEach(function(selector) {
          try {
            document.querySelectorAll(selector).forEach(function(el) {
              el.style.display = 'none';
              el.remove();
            });
          } catch(e) {}
        });
      }
      
      removeAds();
      
      const observer = new MutationObserver(function(mutations) {
        removeAds();
      });
      
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
      
      setInterval(removeAds, 2000);
    })();
  `;
}
