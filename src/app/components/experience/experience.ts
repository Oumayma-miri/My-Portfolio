import {
  AfterViewInit,
  Component,
  ElementRef,
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

interface Achievement {
  icon: string; // SVG path data (24x24, stroke style)
  title: string;
  text: string;
  meta: string;
}

// Simple line icons (Lucide-style paths)
const ICON_BRIEFCASE = 'M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16M4 6h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z';
const ICON_AWARD = 'M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.21 13.89L7 23l5-3 5 3-1.21-9.12';
const ICON_CAP = 'M22 10L12 5 2 10l10 5 10-5zM22 10v6M6 12v5c3 3 9 3 12 0v-5';
const ICON_CALENDAR = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z';

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

  protected readonly tabIcon = ICON_BRIEFCASE;

  // =====================================================
  //  EDIT YOUR CONTENT HERE  (anything in [brackets] is a placeholder)
  // =====================================================

  protected readonly experiences: ExperienceItem[] = [
    {
      company: 'Circonscription Sanitaire de Sidi Bouzid',
      role: 'Web Development Intern',
      period: '[Month Year] - [Month Year]',
      location: 'Sidi Bouzid, Tunisia',
      project: 'Health Dashboard',
      summary:
        'Designed and built a healthcare statistics dashboard that brings the data of 24 regions together in one clear, easy-to-read interface.',
      tasks: [
        'Built the dashboard interface with Angular 18+ and TypeScript.',
        'Organized and displayed health statistics for 24 regions in a clear, readable layout.',
        'Managed application data with JSON Server and localStorage.',
        '[Add a challenge you solved or a result the team noticed.]',
      ],
      stack: ['Angular', 'TypeScript', 'CSS', 'JSON Server', 'localStorage'],
      highlights: [{ value: '24', label: 'REGIONS COVERED' }],
      // link: { label: 'View on GitHub', url: 'https://github.com/...' },
    },
    {
      company: 'Infosmile',
      role: 'Web Development Intern',
      period: '[Month Year] - [Month Year]',
      location: '[City, Tunisia]',
      project: 'CV Creator',
      summary:
        'Developed a website for creating CVs, built with the core technologies of the web.',
      tasks: [
        'Built the pages and interface with HTML, CSS and JavaScript.',
        'Structured the content so a CV can be created in a clean, consistent format.',
        '[Add a feature you are proud of.]',
      ],
      stack: ['HTML', 'CSS', 'JavaScript'],
    },
  ];

  protected readonly achievements: Achievement[] = [
    { icon: ICON_AWARD, title: '[Achievement or certificate]', text: '[One short line about what it is and why it matters.]', meta: '[Year]' },
    { icon: ICON_CAP, title: '[Academic achievement]', text: '[One short line about what it is and why it matters.]', meta: '[Year]' },
    { icon: ICON_CALENDAR, title: '[Event, club or activity]', text: '[One short line about what you did.]', meta: '[Year]' },
  ];

  // =====================================================

  // activeIndex = tab highlight (instant), displayedIndex = detail content (after exit animation)
  protected readonly activeIndex = signal(0);
  protected readonly displayedIndex = signal(0);

  protected get current(): ExperienceItem {
    return this.experiences[this.displayedIndex()] ?? this.experiences[0];
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
      .from('.ach-card', { y: 24, opacity: 0, duration: 0.55, stagger: 0.1 }, '-=0.3');
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
}