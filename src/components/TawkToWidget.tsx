'use client';

import Script from 'next/script';

export function TawkToWidget() {
    return (
        <Script
            id="tawk-to-widget"
            strategy="afterInteractive"
        >
            {`
        var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
        Tawk_API.onLoad = function(){
            Tawk_API.hideWidget();
        };
        
        // Force hide specific Tawk elements that bypass CSS
        if (typeof window !== 'undefined') {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        const iframes = document.querySelectorAll('iframe[title="chat widget"]');
                        iframes.forEach((iframe) => {
                             iframe.style.setProperty('display', 'none', 'important');
                             iframe.style.setProperty('visibility', 'hidden', 'important');
                             iframe.style.setProperty('z-index', '-9999', 'important');
                             
                             if (iframe.parentElement) {
                                iframe.parentElement.style.setProperty('display', 'none', 'important');
                                iframe.parentElement.style.setProperty('visibility', 'hidden', 'important');
                                iframe.parentElement.style.setProperty('opacity', '0', 'important');
                                iframe.parentElement.style.setProperty('z-index', '-9999', 'important');
                             }
                        });
                    }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
        (function(){
        var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
        s1.async=true;
        s1.src='https://embed.tawk.to/695d386b607b2b197dd887e1/1jea28p1o';
        s1.charset='UTF-8';
        s1.setAttribute('crossorigin','*');
        s0.parentNode.insertBefore(s1,s0);
        })();
      `}
        </Script>
    );
}
