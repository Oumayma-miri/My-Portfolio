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

interface Skill {
  name: string;
  logo: string;
  level: string;
  description: string;
}

interface SkillCategory {
  name: string;
  icon: string; // SVG path data (24x24, stroke style)
  description: string;
  skills: Skill[];
}

const GLYPHS = '!<>-_\\/[]{}=+*^?#01';

// Simple line icons (Lucide-style paths)
const ICON_CODE = 'M16 18l6-6-6-6M8 6l-6 6 6 6';
const ICON_SERVER = 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 15a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM6 7h.01M6 17h.01';
const ICON_DATABASE = 'M3 5c0 1.66 4.03 3 9 3s9-1.34 9-3-4.03-3-9-3-9 1.34-9 3zM3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3';
const ICON_WRENCH = 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z';

@Component({
  selector: 'app-skills',
  standalone: true,
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills implements AfterViewInit, OnDestroy {
  @ViewChild('skillsRoot') skillsRoot!: ElementRef<HTMLElement>;

  private animationContext?: ReturnType<typeof gsap.context>;
  private tabsObserver?: ResizeObserver;
  private scrambles = new Map<Text, { tween: gsap.core.Tween; text: string }>();

  private readonly logoBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

  // ---------- DATA (same content, plus a category icon) ----------
  protected readonly categories: SkillCategory[] = [
    {
      name: 'Frontend',
      icon: ICON_CODE,
      description: 'Crafting interfaces and interactive web experiences.',
      skills: [
        { name: 'HTML5', logo: `${this.logoBase}/html5/html5-original.svg`, level: 'Working knowledge', description: 'Structuring accessible and well-organized web pages.' },
        { name: 'CSS3', logo: `${this.logoBase}/css3/css3-original.svg`, level: 'Working knowledge', description: 'Creating responsive layouts, styling and visual effects.' },
        { name: 'JavaScript', logo: `${this.logoBase}/javascript/javascript-original.svg`, level: 'Working knowledge', description: 'Adding interactivity and dynamic behavior to web applications.' },
        { name: 'TypeScript', logo: `${this.logoBase}/typescript/typescript-original.svg`, level: 'Learning & applying', description: 'Writing structured, typed code in Angular applications.' },
        { name: 'Angular', logo: `${this.logoBase}/angular/angular-original.svg`, level: 'Learning & applying', description: 'Building standalone components and interactive interfaces.' },
        { name: 'Bootstrap', logo: `${this.logoBase}/bootstrap/bootstrap-original.svg`, level: 'Working knowledge', description: 'Using a responsive grid and ready-made UI components.' },
      ],
    },
    {
      name: 'Backend',
      icon: ICON_SERVER,
      description: 'Developing application logic and server-side functionality.',
      skills: [
        { name: 'PHP', logo: `${this.logoBase}/php/php-original.svg`, level: 'Working knowledge', description: 'Building server-side functionality and database-driven applications.' },
        { name: 'Java', logo: `${this.logoBase}/java/java-original.svg`, level: 'Working knowledge', description: 'Applying object-oriented programming concepts in application development.' },
      ],
    },
    {
      name: 'Databases',
      icon: ICON_DATABASE,
      description: 'Organizing, storing and managing application data.',
      skills: [
        { name: 'MySQL', logo: `${this.logoBase}/mysql/mysql-original.svg`, level: 'Working knowledge', description: 'Working with relational databases and SQL queries.' },
        { name: 'SQLite', logo: `${this.logoBase}/sqlite/sqlite-original.svg`, level: 'Working knowledge', description: 'Using lightweight relational storage in applications.' },
      ],
    },
    {
      name: 'Tools & Creative',
      icon: ICON_WRENCH,
      description: 'Tools that support my development workflow and creative side.',
      skills: [
        { name: 'Git', logo: `${this.logoBase}/git/git-original.svg`, level: 'Working knowledge', description: 'Managing code versions and collaborating through Git workflows.' },
        { name: 'GitHub', logo: `${this.logoBase}/github/github-original.svg`, level: 'Working knowledge', description: 'Hosting repositories and managing development projects.' },
        { name: 'Canva', logo: `${this.logoBase}/canva/canva-original.svg`, level: 'Experienced', description: 'Creating visual content, presentations and graphic designs.' },
        { name: 'Photoshop', logo: `${this.logoBase}/photoshop/photoshop-plain.svg`, level: 'Intermediate', description: 'Editing images and creating visual compositions.' },
        { name: 'Unity', logo: `${this.logoBase}/unity/unity-original.svg`, level: 'Learning & applying', description: 'Exploring interactive 3D experiences and Unity development.' },
      ],
    },
  ];

  // activeCategory = tab highlight (updates instantly)
  // displayedCategory = what the grid shows (updates after the exit animation)
  protected readonly activeCategory = signal('Frontend');
  protected readonly displayedCategory = signal('Frontend');
  protected readonly selectedSkill = signal<Skill>(this.categories[0].skills[0]);

  protected get currentCategory(): SkillCategory {
    return this.categories.find(c => c.name === this.displayedCategory()) ?? this.categories[0];
  }

  protected get visibleSkills(): Skill[] {
    return this.currentCategory.skills;
  }

  private get root(): HTMLElement {
    return this.skillsRoot.nativeElement;
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- LIFECYCLE ----------
  ngAfterViewInit(): void {
    this.root.addEventListener('pointermove', this.onPointerMove);

    // keep the sliding tab indicator aligned (initial position, resize, font load)
    const tabs = this.root.querySelector('.skills-tabs');
    if (tabs && typeof ResizeObserver !== 'undefined') {
      this.tabsObserver = new ResizeObserver(() => this.moveIndicator(false));
      this.tabsObserver.observe(tabs);
    }
    document.fonts?.ready.then(() => this.moveIndicator(false));
    this.moveIndicator(false);

    if (this.reduceMotion()) return;

    this.animationContext = gsap.context(() => {
      this.buildEntrance();
      this.buildAmbient();
    }, this.root);
  }

  ngOnDestroy(): void {
    this.root?.removeEventListener('pointermove', this.onPointerMove);
    this.tabsObserver?.disconnect();
    this.killScrambles();
    this.animationContext?.revert();
  }

  // ---------- 1. ENTRANCE: plays when the section scrolls into view ----------
  private buildEntrance(): void {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: this.root, start: 'top 65%', once: true },
    });

    tl.from('.skills-heading > *', { y: 25, opacity: 0, duration: 0.8, stagger: 0.12 })
      .from('.skills-main', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.tab', { y: 10, opacity: 0, duration: 0.4, stagger: 0.06 }, '-=0.45')
      .from('.skill-card', { y: 24, opacity: 0, scale: 0.95, duration: 0.55, stagger: 0.07, ease: 'back.out(1.4)' }, '-=0.3')
      .from('.skill-spotlight', { opacity: 0, x: 20, duration: 0.6 }, '-=0.5')
      .from('.skills-code-strip', { opacity: 0, y: 20, duration: 0.6 }, '-=0.3');
  }

  // ---------- 2. AMBIENT LOOPS: always running (the orbit rings are pure CSS) ----------
  private buildAmbient(): void {
    gsap.to('.spotlight-decoration', { scale: 1.4, x: -25, y: 20, opacity: 0.7, duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.code-symbol', { y: -4, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    gsap.to('.spotlight-logo img', { y: -3, duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  }

  // ---------- 3. CURSOR GLOW ON CARDS ----------
  private readonly onPointerMove = (e: PointerEvent): void => {
    const card = (e.target as HTMLElement).closest<HTMLElement>('.skill-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  // ---------- 4. SLIDING TAB INDICATOR ----------
  private moveIndicator(animate: boolean): void {
    const tabs = this.root.querySelectorAll<HTMLElement>('.skills-tabs .tab');
    const indicator = this.root.querySelector<HTMLElement>('.tab-indicator');
    const index = this.categories.findIndex(c => c.name === this.activeCategory());
    const tab = tabs[index];
    if (!tab || !indicator) return;

    const target = { x: tab.offsetLeft, width: tab.offsetWidth };

    if (animate && !this.reduceMotion()) {
      gsap.to(indicator, { ...target, duration: 0.45, ease: 'power3.out', overwrite: true });
    } else {
      gsap.set(indicator, target);
    }
  }

  // ---------- 5. CATEGORY SWITCH ----------
  protected selectCategory(name: string): void {
    if (this.activeCategory() === name) return;

    this.activeCategory.set(name);
    this.moveIndicator(true);

    if (this.reduceMotion()) {
      this.applyCategory(name);
      return;
    }

    this.killScrambles();
    const cards = this.root.querySelectorAll('.skill-card');
    gsap.killTweensOf(cards);

    gsap.to(cards, {
      opacity: 0,
      y: -10,
      scale: 0.95,
      duration: 0.2,
      stagger: { each: 0.025, from: 'end' },
      ease: 'power2.in',
      onComplete: () => {
        this.applyCategory(name);
        requestAnimationFrame(() => this.playCategoryIn());
      },
    });
  }

  private applyCategory(name: string): void {
    this.displayedCategory.set(name);
    const category = this.categories.find(c => c.name === name);
    if (category) this.selectedSkill.set(category.skills[0]);
  }

  private playCategoryIn(): void {
    this.animationContext?.add(() => {
      gsap.fromTo(
        '.skill-card',
        { y: 22, opacity: 0, scale: 0.96 },
        { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.4)', clearProps: 'transform' },
      );
      this.scramble('.skills-topline h3');
      this.playSpotlightIn();
    });
  }

  // ---------- 6. SKILL SELECTION ----------
  protected selectSkill(skill: Skill): void {
    if (this.selectedSkill().name === skill.name) return;

    this.killScrambles();
    this.selectedSkill.set(skill);

    if (this.reduceMotion()) return;

    requestAnimationFrame(() => {
      this.animationContext?.add(() => {
        this.playSpotlightIn();
        gsap.fromTo(
          '.skill-card.selected .logo-container',
          { scale: 0.8 },
          { scale: 1, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' },
        );
      });
    });
  }

  private playSpotlightIn(): void {
    gsap.fromTo('.spotlight-logo', { scale: 0.7, rotation: -12, opacity: 0 }, { scale: 1, rotation: 0, opacity: 1, duration: 0.55, ease: 'back.out(2)' });
    gsap.fromTo('.spotlight-content > *', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
    // small pulse of the orbit container (the rings keep spinning via CSS)
    gsap.fromTo('.skills-orbit', { scale: 0.85, opacity: 0.3 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'power3.out' });
    this.scramble('.skill-spotlight h4');
  }

  protected isSelected(skill: Skill): boolean {
    return this.selectedSkill().name === skill.name;
  }

  // ---------- TEXT SCRAMBLE (edits the text node in place, so Angular bindings keep working) ----------
  private scramble(selector: string, duration = 0.55): void {
    const node = this.root.querySelector(selector)?.firstChild;
    if (!node || node.nodeType !== Node.TEXT_NODE) return;

    const textNode = node as Text;
    const finalText = textNode.nodeValue ?? '';
    this.scrambles.get(textNode)?.tween.kill();

    const state = { p: 0 };
    const tween = gsap.to(state, {
      p: 1,
      duration,
      ease: 'none',
      onUpdate: () => {
        const reveal = Math.floor(state.p * finalText.length);
        textNode.nodeValue = Array.from(finalText)
          .map((ch, i) => (i < reveal || /\s/.test(ch) ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join('');
      },
      onComplete: () => {
        textNode.nodeValue = finalText;
        this.scrambles.delete(textNode);
      },
    });

    this.scrambles.set(textNode, { tween, text: finalText });
  }

  private killScrambles(): void {
    this.scrambles.forEach(({ tween, text }, node) => {
      tween.kill();
      node.nodeValue = text;
    });
    this.scrambles.clear();
  }
}