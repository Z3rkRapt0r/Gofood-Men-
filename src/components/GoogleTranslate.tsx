'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        google: any;
        googleTranslateElementInit: any;
    }
}

export default function GoogleTranslate() {
    const [currentLang, setCurrentLang] = useState('it');

    useEffect(() => {
        // Initialize Google Translate
        window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
                {
                    pageLanguage: 'it',
                    includedLanguages: 'it,en',
                    autoDisplay: false,
                    layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                'google_translate_element'
            );
        };

        const scriptId = 'google-translate-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'text/javascript';
            script.async = true;
            script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            document.body.appendChild(script);
        }

        // MutationObserver to aggressively hide the banner
        const observer = new MutationObserver(() => {
            const bannerFrame = document.querySelector('.goog-te-banner-frame');
            const bannerFrame2 = document.querySelector('iframe.goog-te-banner-frame');

            if (bannerFrame) {
                bannerFrame.setAttribute('style', 'display: none !important; height: 0 !important; visibility: hidden !important;');
            }
            if (bannerFrame2) {
                bannerFrame2.setAttribute('style', 'display: none !important; height: 0 !important; visibility: hidden !important;');
            }

            if (document.body.style.top !== '0px') {
                document.body.style.top = '0px';
                document.body.style.position = 'static';
            }

            if (document.body.classList.contains('goog-te-banner-show')) {
                document.body.classList.remove('goog-te-banner-show');
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        // Check existing cookie
        const match = document.cookie.match(/googtrans=\/it\/([a-z]{2})/);
        if (match) {
            setCurrentLang(match[1]);
        }

        return () => observer.disconnect();
    }, []);

    const handleLanguageChange = (lang: string) => {
        const domain = window.location.hostname;
        const cookieDomain = domain === 'localhost' ? '' : `domain=.${domain};`;

        if (lang === 'it') {
            // Force Clear Cookie - try multiple paths/domains
            document.cookie = `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
            document.cookie = `googtrans=; path=/; ${cookieDomain} expires=Thu, 01 Jan 1970 00:00:00 UTC;`;

            // Also explicitly set to /it/it (Original) just in case clearing fails
            // document.cookie = `googtrans=/it/it; path=/; ${cookieDomain}`; 
            // Setting /it/it sometimes causes the "translated to Italian" banner. 
            // Clearing is better for "Original".
        } else {
            const cookieValue = `/it/${lang}`;
            document.cookie = `googtrans=${cookieValue}; path=/;`;
            document.cookie = `googtrans=${cookieValue}; path=/; ${cookieDomain}`;
        }

        setCurrentLang(lang);

        // Force reload to apply
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return (
        <div className="flex items-center gap-2">
            {/* Global Styles to hide Google Top Bar */}
            <style jsx global>{`
                .goog-te-banner-frame.skiptranslate {
                    display: none !important;
                }
                body {
                    top: 0px !important; 
                }
                /* Hide the specific iframe */
                iframe.goog-te-banner-frame {
                    visibility: hidden !important;
                    height: 0 !important;
                    display: none !important;
                }
                /* Hide the weird top margin google adds */
                body.goog-te-banner-show {
                    margin-top: 0 !important;
                }
                
                /* Hide the widget itself if needed */
                #google_translate_element {
                    display: none !important;
                }
                .goog-te-gadget {
                    display: none !important;
                }
            `}</style>

            {/* Hidden container for Google's widget */}
            <div id="google_translate_element" className="hidden"></div>

            {/* Custom Flags */}
            <button
                onClick={() => handleLanguageChange('it')}
                className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${currentLang === 'it' ? 'border-orange-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                title="Italiano"
            >
                <Image
                    src="https://flagcdn.com/it.svg"
                    alt="Italiano"
                    fill
                    className="object-cover"
                />
            </button>

            <button
                onClick={() => handleLanguageChange('en')}
                className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${currentLang === 'en' ? 'border-orange-500 scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                title="English"
            >
                <Image
                    src="https://flagcdn.com/gb.svg"
                    alt="English"
                    fill
                    className="object-cover"
                />
            </button>
        </div>
    );
}
