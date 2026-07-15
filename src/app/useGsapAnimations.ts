'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useGsapAnimations(isLoaded: boolean, onStepChange?: (step: number) => void) {
  useEffect(() => {
    // Only run on client-side and when component is fully loaded
    if (!isLoaded || typeof window === 'undefined') return;

    let ctx: any;
    let handleSync: ((e: any) => void) | undefined;
    const timer = setTimeout(() => {
      console.log('useGsapAnimations: Initializing animations...');
      try {
        // Register plugins only on client-side
        gsap.registerPlugin(ScrollTrigger);
        console.log('useGsapAnimations: ScrollTrigger registered successfully.');

        // Clean up existing triggers cleanly on re-run
        ScrollTrigger.getAll().forEach((t) => t.kill());

        ctx = gsap.context(() => {
      // ─── 1. Hero Title reveal ─────────────────────────
      const heroTitle = document.querySelector('.gsap-hero-title');
      if (heroTitle) {
        gsap.fromTo(
          heroTitle,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.0,
            ease: 'power4.out',
            delay: 0.2,
          }
        );
      }

      // ─── 2. Hero Subtitle reveal ──────────────────────
      const heroSub = document.querySelector('.gsap-hero-sub');
      if (heroSub) {
        gsap.fromTo(
          heroSub,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 }
        );
      }

      // ─── 3. Hero Actions reveal ───────────────────────
      const heroActions = document.querySelector('.gsap-hero-actions');
      if (heroActions) {
        gsap.fromTo(
          heroActions,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.55 }
        );
      }

      // ─── 4. Section headline reveals ───────────────────
      document.querySelectorAll('.gsap-section-title').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power4.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 5. Section subtitles fade in ──────────────────
      document.querySelectorAll('.gsap-section-sub').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 6. Stats - count-up numbers ──────────────────
      document.querySelectorAll('.gsap-stat-value').forEach((el) => {
        const raw = el.textContent ?? '';
        const suffix = raw.replace(/[\d.]/g, ''); // e.g. '+', '%', 'k'
        const num = parseFloat(raw.replace(/[^0-9.]/g, ''));
        if (isNaN(num)) return;

        const obj = { val: 0 };
        gsap.to(obj, {
          val: num,
          duration: 1.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
          onUpdate: () => {
            el.textContent =
              (Number.isInteger(num) ? Math.round(obj.val) : obj.val.toFixed(1)) + suffix;
          },
        });
      });

      // ─── 7. Staggered card/item reveals ────────────────
      document.querySelectorAll('.gsap-stagger-group').forEach((group) => {
        const items = Array.from(group.querySelectorAll('.gsap-stagger-item'));
        gsap.fromTo(
          items,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.7,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: group,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 8. Horizontal marquee speed check ──────────────
      const marqueeTrack = document.querySelector('.gsap-marquee');
      if (marqueeTrack) {
        ScrollTrigger.create({
          trigger: marqueeTrack,
          start: 'top 90%',
          onEnter: () => {
            gsap.to(marqueeTrack, {
              '--marquee-duration': '18s',
              duration: 0.5,
              ease: 'power2.out',
            });
          },
        });
      }



      // ─── 10. Feature showcase browser ──────────────────
      const showcaseBrowser = document.querySelector('.gsap-showcase-browser');
      if (showcaseBrowser) {
        gsap.fromTo(
          showcaseBrowser,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: showcaseBrowser,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 11. CTA Title reveal ─────────────────────────
      const ctaTitle = document.querySelector('.gsap-cta-title');
      if (ctaTitle) {
        gsap.fromTo(
          ctaTitle,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: ctaTitle,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 12. PROCESS SECTION ANIMATION (Fade-in + Pin & Scrub) ───────────────────────
      const processSection = document.querySelector('.gsap-process-section');
      if (processSection && onStepChange && window.innerWidth > 1024) {
        // Pinned workflow ScrollTrigger mapping scroll position to interactive steps
        const trigger = ScrollTrigger.create({
          trigger: processSection,
          start: 'top top',
          end: '+=2400',
          pin: true,
          scrub: true,
          snap: {
            snapTo: 1 / 3,
            duration: { min: 0.1, max: 0.3 },
            delay: 0.05,
            ease: 'power1.inOut'
          },
          onUpdate: (self) => {
            const progress = self.progress;
            let step = Math.floor(progress * 4);
            if (step > 3) step = 3;
            onStepChange(step);
          }
        });

        handleSync = (e: any) => {
          const idx = e.detail.step;
          const scrollPos = trigger.start + (idx / 3) * (trigger.end - trigger.start);
          window.scrollTo({
            top: scrollPos,
            behavior: 'smooth'
          });
        };
        window.addEventListener('sync-workflow-step', handleSync);

        // Grid fade-in entry animation
        gsap.fromTo(
          processSection.querySelectorAll('.gsap-premium-visual-card, .gsap-premium-content-card, .gsap-timeline-col'),
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: processSection,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // ─── 13. Hero watermark parallax ───────────────────
      const heroWatermark = document.querySelector('.gsap-hero-watermark');
      if (heroWatermark) {
        gsap.to(heroWatermark, {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: '.gsap-hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        });
      }

      // ─── 14. Chapter labels reveal ─────────────────────
      document.querySelectorAll('.gsap-chapter-label').forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          }
        );
      });

      // ─── 15. Hero badge pulse ──────────────────────────
      const heroBadge = document.querySelector('.gsap-hero-badge');
      if (heroBadge) {
        gsap.fromTo(
          heroBadge,
          { opacity: 0, y: -10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)', delay: 0.05 }
        );
      }
      });
      } catch (err) {
        console.error('useGsapAnimations: Error initializing GSAP ScrollTrigger:', err);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (ctx) ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (handleSync) {
        window.removeEventListener('sync-workflow-step', handleSync);
      }
    };
  }, [isLoaded]);
}
