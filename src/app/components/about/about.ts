import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject,
  signal,
} from '@angular/core';

import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Fact {
  label: string;
  value: string;
}

interface EducationItem {
  period: string;
  title: string;
  place: string;
  text: string;
  current?: boolean;
}

interface Stat {
  label: string;
  value: number;
}

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements AfterViewInit, OnDestroy {
  @ViewChild('aboutRoot') aboutRoot!: ElementRef<HTMLElement>;

  private readonly destroyRef = inject(DestroyRef);
  private animationContext?: ReturnType<typeof gsap.context>;

  // =====================================================
  //  EDIT YOUR CONTENT HERE  (anything in [brackets] is a placeholder)
  // =====================================================

  // Rotating end of the heading: "Developer, designer, <phrase>"
  private readonly phrases = [
    'always building.',
    'always learning.',
    'always curious.',
    'always creating.',
  ];

  private phraseIndex = 0;
  protected readonly currentPhrase = signal(this.phrases[0]);

  protected readonly intro: string[] = [
    "I'm an IT student specializing in Multimedia & Web Development at ISET Sidi Bouzid. I enjoy turning ideas into interfaces that work well and feel good to use. I build with Angular and TypeScript, and I care as much about how a product looks and moves as about how it is built underneath.",
    "Two internships gave me hands-on experience: a healthcare statistics dashboard covering 24 regions, and a CV creation website. Alongside my studies I keep building, from a ride-sharing platform in PHP and MySQL to a Java product manager with Gemini API integration, and I like experimenting with Unity.",
  ];

  protected readonly facts: Fact[] = [
    { label: 'FOCUS', value: 'Development and UI/UX' },
    { label: 'STUDYING', value: 'Multimedia & Web Development, ISET Sidi Bouzid' },
    { label: 'OPEN TO', value: 'PFE opportunities' },
    { label: 'LANGUAGES', value: '[Arabic, French, English]' },
  ];

  protected readonly interests: string[] = [
    'Web development',
    'UI/UX design',
    'Creative technology',
    'Interactive experiences',
  ];

  protected readonly now: Fact[] = [
    { label: 'BUILDING', value: 'This portfolio with Angular and GSAP' },
    { label: 'LEARNING', value: 'Advanced Angular and motion design' },
  ];

  protected readonly education: EducationItem[] = [
    {
      period: '[Year] - Present',
      title: 'Multimedia & Web Development',
      place: 'ISET Sidi Bouzid',
      text: 'Studying web development, databases and multimedia, with a strong focus on building practical projects and internships.',
      current: true,
    },
    {
      period: '[Year]',
      title: '[Baccalaureate, section]',
      place: '[Your high school]',
      text: '[One short line about what you studied or achieved.]',
    },
  ];

  protected readonly stats: Stat[] = [
    { label: 'PROJECTS', value: 4 },
    { label: 'INTERNSHIPS', value: 2 },
    { label: 'TECHNOLOGIES', value: 15 },
  ];

  // =====================================================

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    // Rotate the heading phrase every 2.6 seconds (same pattern as the hero roles)
    interval(2600)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.phraseIndex = (this.phraseIndex + 1) % this.phrases.length;
        this.currentPhrase.set(this.phrases[this.phraseIndex]);

        if (!this.reduceMotion()) {
          const el = this.aboutRoot.nativeElement.querySelector('.rotating-phrase');
          if (el) {
            gsap.fromTo(
              el,
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
            );
          }
        }
      });

    if (this.reduceMotion()) return;

    this.animationContext = gsap.context(() => {
      this.buildEntrance();
    }, this.aboutRoot.nativeElement);
  }

  ngOnDestroy(): void {
    this.animationContext?.revert();
  }

  // Plays once, when the section scrolls into view
  private buildEntrance(): void {
    const root = this.aboutRoot.nativeElement;

    // stat numbers start at 0 and count up (edit the text node in place so Angular stays in sync)
    const counters = gsap.utils
      .toArray<HTMLElement>('.stat-value', root)
      .map(el => ({ node: el.firstChild as Text, target: Number(el.dataset['value']) }))
      .filter(c => c.node);

    counters.forEach(c => (c.node.nodeValue = '0'));

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: root, start: 'top 65%', once: true },
    });

    tl.from('.about-heading > *', { y: 25, opacity: 0, duration: 0.8, stagger: 0.12 })
      .from('.about-card', { y: 30, opacity: 0, duration: 0.8, stagger: 0.15 }, '-=0.5')
      .from('.fact', { y: 10, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.5')
      .from('.chip', { scale: 0.9, opacity: 0, duration: 0.35, stagger: 0.05, ease: 'back.out(2)' }, '-=0.3')
      .from('.timeline-line', { scaleY: 0, transformOrigin: 'top', duration: 1, ease: 'power2.inOut' }, '-=1.1')
      .from('.t-item', { x: 20, opacity: 0, duration: 0.5, stagger: 0.2 }, '<0.1')
      .from('.about-stats', { y: 20, opacity: 0, duration: 0.6 }, '-=0.3');

    counters.forEach((c, i) => {
      const state = { v: 0 };
      tl.to(
        state,
        {
          v: c.target,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => (c.node.nodeValue = String(Math.round(state.v))),
        },
        i === 0 ? '-=0.2' : '<',
      );
    });
  }
}