import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Highlight {
  value: string;
  label: string;
}

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location: string;
  project: string;
  summary: string;
  tasks: string[];
  stack: string[];
  highlights?: Highlight[];
  link?: { label: string; url: string };
}

interface GalleryItem {
  title: string;
  description: string;
  meta: string;
  image: string; // path to your image, or '' to show a placeholder
}

interface GalleryGroup {
  label: string;
  title: string;
  description: string;
  noun: string;
  icon: string; // SVG path data (24x24, stroke style)
  items: GalleryItem[];
}

// Simple line icons (Lucide-style paths)
const ICON_BRIEFCASE = 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z';
const ICON_AWARD = 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.12';
const ICON_CALENDAR = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z';
const ICON_IMAGE = 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM21 15l-5-5L5 21';

@Component({
  selector: 'app-experience',
  standalone: true,
  templateUrl: './experience.html',
  styleUrl: './experience.scss',
})
export class Experience implements AfterViewInit, OnDestroy {
  @ViewChild('expRoot') expRoot!: ElementRef<HTMLElement>;

  private animationContext?: ReturnType<typeof gsap.context>;
  private tabsObserver?: ResizeObserver;
  private lastFocus: HTMLElement | null = null;
  private closing = false;

  protected readonly tabIcon = ICON_BRIEFCASE;
  protected readonly imageIcon = ICON_IMAGE;

  // =====================================================
  //  EDIT YOUR CONTENT HERE  (anything in [brackets] is a placeholder)
  // =====================================================

  protected readonly experiences: ExperienceItem[] = [
    {
      company: 'Circonscription Sanitaire de Sidi Bouzid',
      role: 'Web Development Intern',
      period: 'January, 2026 - February, 2026',
      location: 'Sidi Bouzid, Tunisia',
      project: 'Health Dashboard',
      summary:
        'Designed and built a healthcare statistics dashboard that brings the data of 24 regions together in one clear, easy-to-read interface.',
      tasks: [
        'Built the dashboard interface with Angular 18+ and TypeScript.',
        'Organized and displayed health statistics for 24 regions in a clear, readable layout.',
        'Managed application data with JSON Server and localStorage.',
        'Implemented responsive design to ensure the dashboard works well on different screen sizes.',
      ],
      stack: ['Angular', 'TypeScript', 'CSS', 'JSON Server', 'localStorage'],
      highlights: [{ value: '24', label: 'REGIONS COVERED' }],
      // link: { label: 'View on GitHub', url: 'https://github.com/...' },
    },
    {
      company: 'Infosmile',
      role: 'Web Development Intern',
      period: 'January, 2025 - February, 2025',
      location: 'Sidi Bouzid, Tunisia',
      project: 'CV Creator',
      summary:
        'Developed the front-end of website for creating CVs, built with the core technologies of the web.',
      tasks: [
        'Built the pages and interface with HTML, CSS and JavaScript.',
        'Structured the content so a CV can be created in a clean, consistent format.',
        'Added interactivity to the interface with JavaScript.',
      ],
      stack: ['HTML', 'CSS', 'JavaScript'],
    },
  ];

  // Image paths are relative to public/.
  protected readonly groups: GalleryGroup[] = [
    {
      label: 'ACHIEVEMENTS & CERTIFICATES',
      title: 'Certificates, badges & achievements',
      description: 'A curated glimpse of selected certificates, badges, and recognition earned along the way.',
      noun: 'ITEMS',
      icon: ICON_AWARD,
      items: [
        {
          title: 'Certificate 1',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(1).png',
        },
        {
          title: 'Certificate 2',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(2).png',
        },
        {
          title: 'Certificate 3',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(3).png',
        },
        {
          title: 'Certificate 4',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(4).png',
        },
        {
          title: 'Certificate 5',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(5).png',
        },
        {
          title: 'Certificate 6',
          description: '',
          meta: 'Certificate',
          image: 'images/achivmentsimage/c%20(6).png',
        },
        {
          title: 'Badge 1',
          description: '',
          meta: 'Badge',
          image: 'images/achivmentsimage/b%20(1).png',
        },
        {
          title: 'Badge 2',
          description: '',
          meta: 'Badge',
          image: 'images/achivmentsimage/b%20(2).png',
        },
        {
          title: 'Badge 3',
          description: '',
          meta: 'Badge',
          image: 'images/achivmentsimage/b%20(3).png',
        },
        {
          title: 'Hackathon win',
          description: 'Award for winning a hackathon.',
          meta: 'Hackathon · Award',
          image: 'images/achivmentsimage/e%20(3).jpeg',
        },
      ],
    },
    {
      label: 'EVENTS & CLUB ACTIVITIES',
      title: 'Events & club activities',
      description: 'A glimpse into a few events and club moments that have been part of my journey.',
      noun: 'MOMENTS',
      icon: ICON_CALENDAR,
      items: [
        {
          title: 'Event photo 1',
          description: '',
          meta: 'Event & club activities',
          image: 'images/achivmentsimage/e%20(1).jpeg',
        },
        {
          title: 'Event photo 2',
          description: '',
          meta: 'Event & club activities',
          image: 'images/achivmentsimage/e%20(2).jpeg',
        },
        {
          title: 'Event photo 4',
          description: '',
          meta: 'Event & club activities',
          image: 'images/achivmentsimage/e%20(4).jpeg',
        },
        {
          title: 'Event photo 5',
          description: '',
          meta: 'Event & club activities',
          image: 'images/achivmentsimage/e%20(5).jpeg',
        },
      ],
    },
  ];

  // =====================================================

  // experience switcher
  protected readonly activeIndex = signal(0);
  protected readonly displayedIndex = signal(0);

  // gallery
  protected readonly openGroup = signal<number | null>(null);
  protected readonly itemIndex = signal(0);

  protected get current(): ExperienceItem {
    return this.experiences[this.displayedIndex()] ?? this.experiences[0];
  }

  protected get group(): GalleryGroup {
    return this.groups[this.openGroup() ?? 0];
  }

  protected get item(): GalleryItem {
    return this.group.items[this.itemIndex()] ?? this.group.items[0];
  }

  private get root(): HTMLElement {
    return this.expRoot.nativeElement;
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    const tabs = this.root.querySelector('.exp-tabs');
    if (tabs && typeof ResizeObserver !== 'undefined') {
      this.tabsObserver = new ResizeObserver(() => this.moveIndicator(false));
      this.tabsObserver.observe(tabs);
    }
    document.fonts?.ready.then(() => this.moveIndicator(false));
    this.moveIndicator(false);

    if (this.reduceMotion()) return;

    this.animationContext = gsap.context(() => this.buildEntrance(), this.root);
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
    this.tabsObserver?.disconnect();
    this.animationContext?.revert();
  }

  // Plays once, when the section scrolls into view
  private buildEntrance(): void {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: this.root, start: 'top 65%', once: true },
    });

    tl.from('.exp-heading > *', { y: 25, opacity: 0, duration: 0.8, stagger: 0.12 })
      .from('.exp-tabs', { y: 16, opacity: 0, duration: 0.5 }, '-=0.5')
      .from('.exp-card', { y: 30, opacity: 0, duration: 0.8 }, '-=0.3')
      .from('.exp-task', { x: -12, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.4')
      .from('.exp-chip', { scale: 0.9, opacity: 0, duration: 0.35, stagger: 0.05, ease: 'back.out(2)' }, '-=0.5')
      .from('.ach-head', { y: 16, opacity: 0, duration: 0.5 }, '-=0.2')
      .from('.ach-card', { y: 28, opacity: 0, duration: 0.6, stagger: 0.12 }, '-=0.3');
  }

  // ---------- sliding tab indicator ----------
  private moveIndicator(animate: boolean): void {
    const tabs = this.root.querySelectorAll<HTMLElement>('.exp-tabs .exp-tab');
    const indicator = this.root.querySelector<HTMLElement>('.exp-indicator');
    const tab = tabs[this.activeIndex()];
    if (!tab || !indicator) return;

    const target = { x: tab.offsetLeft, width: tab.offsetWidth };

    if (animate && !this.reduceMotion()) {
      gsap.to(indicator, { ...target, duration: 0.45, ease: 'power3.out', overwrite: true });
    } else {
      gsap.set(indicator, target);
    }
  }

  // ---------- switching experience ----------
  protected select(index: number): void {
    if (this.activeIndex() === index) return;

    this.activeIndex.set(index);
    this.moveIndicator(true);

    if (this.reduceMotion()) {
      this.displayedIndex.set(index);
      return;
    }

    const blocks = this.root.querySelectorAll('.exp-anim');
    gsap.killTweensOf(blocks);

    gsap.to(blocks, {
      opacity: 0,
      y: -8,
      duration: 0.18,
      stagger: 0.03,
      ease: 'power2.in',
      onComplete: () => {
        this.displayedIndex.set(index);
        requestAnimationFrame(() => this.playIn());
      },
    });
  }

  private playIn(): void {
    this.animationContext?.add(() => {
      gsap.fromTo('.exp-anim', { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out', clearProps: 'transform' });
      gsap.fromTo('.exp-task', { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.07, delay: 0.15, ease: 'power2.out' });
      gsap.fromTo('.exp-chip', { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, stagger: 0.04, delay: 0.2, ease: 'back.out(2)' });
    });
  }

  // =====================================================
  //  GALLERY (opens when you click an achievements card)
  // =====================================================

  protected open(groupIndex: number): void {
    this.lastFocus = document.activeElement as HTMLElement | null;
    this.closing = false;
    this.itemIndex.set(0);
    this.openGroup.set(groupIndex);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      this.root.querySelector<HTMLElement>('.lb-close')?.focus({ preventScroll: true });

      this.animationContext?.add(() => {
        gsap.fromTo('.lb-backdrop', { opacity: 0 }, { opacity: 1, duration: 0.3 });
        gsap.fromTo('.lb-panel', { y: 28, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });
        gsap.fromTo('.lb-thumb', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, delay: 0.25 });
        this.playItemIn(0);
      });
    });
  }

  protected close(): void {
    if (this.openGroup() === null || this.closing) return;
    this.closing = true;

    const finish = (): void => {
      this.openGroup.set(null);
      document.body.style.overflow = '';
      this.lastFocus?.focus({ preventScroll: true });
      this.closing = false;
    };

    if (this.reduceMotion()) {
      finish();
      return;
    }

    this.animationContext?.add(() => {
      gsap.to('.lb-panel', { y: 20, scale: 0.97, opacity: 0, duration: 0.25, ease: 'power2.in' });
      gsap.to('.lb-backdrop', { opacity: 0, duration: 0.25, onComplete: finish });
    });
  }

  protected next(): void {
    this.go(1);
  }

  protected prev(): void {
    this.go(-1);
  }

  protected goTo(index: number): void {
    if (index === this.itemIndex()) return;
    this.change(index, index > this.itemIndex() ? 1 : -1);
  }

  private go(direction: 1 | -1): void {
    const count = this.group.items.length;
    if (count < 2) return;
    this.change((this.itemIndex() + direction + count) % count, direction);
  }

  private change(index: number, direction: number): void {
    this.itemIndex.set(index);
    if (this.reduceMotion()) return;
    requestAnimationFrame(() => this.animationContext?.add(() => this.playItemIn(direction)));
  }

  private playItemIn(direction: number): void {
    gsap.fromTo('.lb-image-wrap', { x: direction * 40, opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    gsap.fromTo('.lb-caption > *', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, delay: 0.1, ease: 'power2.out' });
  }

  protected onImgError(event: Event): void {
    (event.target as HTMLImageElement).classList.add('broken');
  }

  // keyboard: Esc closes, arrows navigate, Tab stays inside the gallery
  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    if (this.openGroup() === null) return;

    if (event.key === 'Escape') {
      this.close();
    } else if (event.key === 'ArrowRight') {
      this.next();
    } else if (event.key === 'ArrowLeft') {
      this.prev();
    } else if (event.key === 'Tab') {
      const focusable = Array.from(
        this.root.querySelectorAll<HTMLElement>('.lb-panel button:not([disabled])'),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
}