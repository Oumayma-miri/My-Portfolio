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
  logo?: string; // image URL; if missing or broken, the icon below is used
  icon?: string; // SVG path data (24x24, stroke style); defaults to the category icon
  onLight?: boolean; // true for dark logos: they get a light background so they stay visible
  level: string;
  description: string;
}

interface SkillCategory {
  name: string;
  icon: string;
  description: string;
  skills: Skill[];
  also?: string[];
}

// ---------- Icons (used when a skill has no logo) ----------
const ICON_CODE = 'M16 18l6-6-6-6M8 6l-6 6 6 6';
const ICON_SERVER = 'M2 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 15a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM6 7h.01M6 17h.01';
const ICON_DATABASE = 'M3 5c0 1.66 4.03 3 9 3s9-1.34 9-3-4.03-3-9-3-9 1.34-9 3zM3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3';
const ICON_WRENCH = 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z';
const ICON_PEN = 'M12 19l7-7 3 3-7 7-3-3zM18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5zM2 2l7.586 7.586M11 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
const ICON_SPARKLE = 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z';
const ICON_CPU = 'M4 8h2M4 12h2M4 16h2M18 8h2M18 12h2M18 16h2M8 4v2M12 4v2M16 4v2M8 18v2M12 18v2M16 18v2M6 6h12v12H6zM9 9h6v6H9z';
const ICON_MEGAPHONE = 'M3 11l18-5v12L3 14v-3zM11.6 16.8a3 3 0 1 1-5.8-1.6';
const ICON_LAYOUT = 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z';
const ICON_LAYERS = 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5';
const ICON_GRID = 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z';
const ICON_USERS = 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75';
const ICON_PLAY = 'M5 3l14 9-14 9V3z';
const ICON_FILM = 'M2 4h20v16H2zM7 4v16M17 4v16M2 12h20M2 8h5M2 16h5M17 8h5M17 16h5';
const ICON_TERMINAL = 'M4 17l6-6-6-6M12 19h8';
const ICON_BOX = 'M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.3 7L12 12l8.7-5M12 22V12';
const ICON_BRANCH = 'M6 3v12M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 9a9 9 0 0 1-9 9';
const ICON_FILE = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8';
const ICON_REFRESH = 'M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16M16 16h5v5';
const ICON_TARGET = 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
const ICON_CALENDAR = 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z';
const ICON_SHARE = 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98';

// ---------- Logos ----------
const DEVICON = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';
const dev = (name: string, version = 'original'): string => `${DEVICON}/${name}/${name}-${version}.svg`;
const si = (slug: string, hex: string): string => `https://cdn.simpleicons.org/${slug}/${hex}`;

// ---------- Levels ----------
const ADVANCED = 'Advanced';
const INTERMEDIATE = 'Intermediate';
const WORKING = 'Working knowledge';
const HANDS_ON = 'Hands-on';
const COURSEWORK = 'Coursework';
const LEARNING = 'Learning';
const APPLYING = 'Learning & applying';
const PLANNED = 'Planned';

@Component({
  selector: 'app-skills',
  standalone: true,
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills implements AfterViewInit, OnDestroy {
  @ViewChild('skillsRoot') skillsRoot!: ElementRef<HTMLElement>;
  @ViewChild('tabsEl') tabsEl!: ElementRef<HTMLElement>;
  @ViewChild('indicator') indicator!: ElementRef<HTMLElement>;

  private animationContext?: ReturnType<typeof gsap.context>;
  private swapId = 0; // guards against stale callbacks when clicking quickly

  // =====================================================
  //  YOUR SKILLS
  // =====================================================

  protected readonly categories: SkillCategory[] = [
    {
      name: 'Frontend',
      icon: ICON_CODE,
      description: 'Crafting interfaces and interactive web experiences.',
      skills: [
        { name: 'HTML5', logo: dev('html5'), level: WORKING, description: 'Structuring accessible and well-organized web pages.' },
        { name: 'CSS3', logo: dev('css3'), level: WORKING, description: 'Creating responsive layouts, styling and visual effects.' },
        { name: 'SCSS', logo: dev('sass'), level: WORKING, description: 'Writing maintainable styles with variables, nesting and reusable tokens.' },
        { name: 'JavaScript', logo: dev('javascript'), level: WORKING, description: 'Adding interactivity and dynamic behavior to web applications.' },
        { name: 'TypeScript', logo: dev('typescript'), level: APPLYING, description: 'Writing structured, typed code in Angular applications.' },
        { name: 'Angular', logo: dev('angular'), level: APPLYING, description: 'Building standalone components and interactive interfaces (Angular 18+).' },
        { name: 'Bootstrap', logo: dev('bootstrap'), level: WORKING, description: 'Using a responsive grid and ready-made UI components.' },
      ],
      also: ['Responsive Web Design', 'Frontend Development', 'Dashboard Development', 'Data Visualization', 'KPI Monitoring', 'Reporting Systems'],
    },
    {
      name: 'Backend',
      icon: ICON_SERVER,
      description: 'Developing application logic and server-side functionality.',
      skills: [
        { name: 'PHP', logo: dev('php'), level: WORKING, description: 'Building server-side functionality and database-driven applications.' },
        { name: 'Java', logo: dev('java'), level: WORKING, description: 'Applying object-oriented programming concepts in application development.' },
        { name: 'Python', logo: dev('python'), level: WORKING, description: 'Scripting and problem solving with a clear, readable language.' },
        { name: 'Laravel', logo: dev('laravel'), level: COURSEWORK, description: 'Exploring MVC structure, routing and Blade templates through coursework.' },
        { name: 'Spring Boot', logo: dev('spring'), level: COURSEWORK, description: 'Learning how Java back-end applications are structured, through coursework.' },
        { name: 'Gemini API', logo: si('googlegemini', '8E75B2'), icon: ICON_SPARKLE, level: HANDS_ON, description: 'Adding generative AI features to an application, as in the Product Manager App.' },
      ],
      also: ['REST API Integration', 'Backend Development', 'PHP Web Development', 'Authentication & Authorization', 'CRUD Applications', 'MVC Architecture', 'Blade Templates'],
    },
    {
      name: 'Data',
      icon: ICON_DATABASE,
      description: 'Organizing, storing and managing application data.',
      skills: [
        { name: 'MySQL', logo: dev('mysql'), level: WORKING, description: 'Working with relational databases and SQL queries.' },
        { name: 'PostgreSQL', logo: dev('postgresql'), level: WORKING, description: 'Working with a powerful open-source relational database.' },
        { name: 'SQLite', logo: dev('sqlite'), level: WORKING, description: 'Using lightweight relational storage in applications.' },
        { name: 'Oracle SQL', logo: dev('oracle'), level: WORKING, description: 'Writing queries and working with data in Oracle databases.' },
        { name: 'Supabase', logo: dev('supabase'), level: HANDS_ON, description: 'Using a hosted backend for databases, authentication and APIs.' },
        { name: 'SQL', icon: ICON_DATABASE, level: WORKING, description: 'Querying, joining and organizing relational data.' },
        { name: 'JSON Server', icon: ICON_SERVER, level: HANDS_ON, description: 'Prototyping REST APIs quickly from a simple JSON file.' },
      ],
      also: ['Database Design', 'Data Modeling', 'SQL Queries', 'Database Management', 'LocalStorage'],
    },
    {
      name: 'Design',
      icon: ICON_PEN,
      description: 'Designing clear, consistent and user-centered interfaces.',
      skills: [
        { name: 'Figma', logo: dev('figma'), level: WORKING, description: 'Designing interfaces, layouts and prototypes before writing code.' },
        { name: 'UI Design', icon: ICON_LAYERS, level: WORKING, description: 'Creating clean, consistent interfaces with a clear visual hierarchy.' },
        { name: 'UX Design', icon: ICON_USERS, level: WORKING, description: 'Shaping flows and interactions around what users actually need.' },
        { name: 'Wireframing', icon: ICON_LAYOUT, level: WORKING, description: 'Sketching structure and layout early, before visual design.' },
        { name: 'Interactive Prototyping', icon: ICON_PLAY, level: WORKING, description: 'Testing flows and ideas with clickable prototypes.' },
        { name: 'Design Systems', icon: ICON_GRID, level: HANDS_ON, description: 'Defining colors, typography and components so a product stays consistent.' },
      ],
      also: ['Responsive Interface Design', 'Visual Hierarchy', 'User-Centered Design', 'Branding', 'Visual Identity'],
    },
    {
      name: 'Creative',
      icon: ICON_SPARKLE,
      description: 'Graphic design, multimedia, 3D and creative development.',
      skills: [
        { name: 'Canva', logo: dev('canva'), level: ADVANCED, description: 'Creating visual content, presentations and graphic designs.' },
        { name: 'Photoshop', logo: dev('photoshop'), level: INTERMEDIATE, description: 'Editing images and creating visual compositions.' },
        { name: 'Blender', logo: dev('blender'), level: HANDS_ON, description: 'Modeling and rendering 3D objects and scenes.' },
        { name: 'Video Editing', icon: ICON_FILM, level: HANDS_ON, description: 'Cutting and assembling footage into clear, engaging videos.' },
        { name: 'Unity', logo: dev('unity'), onLight: true, level: APPLYING, description: 'Exploring interactive 3D experiences and Unity development.' },
        { name: 'C#', logo: dev('csharp'), level: COURSEWORK, description: 'Scripting game and interactive logic in Unity, through coursework.' },
        { name: 'GSAP', logo: si('gsap', '0AE448'), icon: ICON_PLAY, level: HANDS_ON, description: 'Animating this portfolio with timelines, scroll triggers and easing.' },
        { name: 'Three.js', logo: dev('threejs'), onLight: true, level: PLANNED, description: 'Planned: bringing 3D scenes to the web in future portfolio work.' },
      ],
      also: [
        'Graphic Design', 'Social Media Design', 'Poster & Banner Design', 'Certificate Design', 'Presentation Design',
        '3D Design & Modeling', 'Motion & Animation Concepts', 'Visual Storytelling', 'Content Scripting',
        'Digital Content Creation', 'Interactive Experiences', 'Gamification',
      ],
    },
    {
      name: 'Tools',
      icon: ICON_WRENCH,
      description: 'The environments and tools behind my development workflow.',
      skills: [
        { name: 'VS Code', logo: dev('vscode'), level: HANDS_ON, description: 'Editor for web development, with extensions and an integrated terminal.' },
        { name: 'IntelliJ IDEA', logo: dev('intellij'), level: HANDS_ON, description: 'Developing and debugging Java applications with JetBrains IDEs.' },
        { name: 'Android Studio', logo: dev('androidstudio'), level: HANDS_ON, description: 'Exploring mobile application development.' },
        { name: 'Git', logo: dev('git'), level: WORKING, description: 'Managing code versions and collaborating through Git workflows.' },
        { name: 'GitHub', logo: dev('github'), onLight: true, level: WORKING, description: 'Hosting repositories and managing development projects.' },
        { name: 'XAMPP', logo: si('xampp', 'FB7A24'), icon: ICON_SERVER, level: HANDS_ON, description: 'Running a local Apache, MySQL and PHP environment for development.' },
        { name: 'Maven', logo: dev('maven'), level: HANDS_ON, description: 'Managing dependencies and builds in Java projects.' },
        { name: 'Windsurf', logo: si('windsurf', 'F5F2FA'), icon: ICON_TERMINAL, level: HANDS_ON, description: 'Working with an AI-powered code editor.' },
        { name: 'Antigravity', logo: dev('antigravity'), icon: ICON_SPARKLE, level: HANDS_ON, description: 'Using an agent-based AI development environment.' },
        { name: 'Overleaf', logo: si('overleaf', '47A141'), icon: ICON_FILE, level: HANDS_ON, description: 'Writing structured documents and reports in LaTeX.' },
      ],
      also: ['pgAdmin', 'AI-Assisted Development', 'AI Tools Integration'],
    },
    {
      name: 'Engineering',
      icon: ICON_CPU,
      description: 'The concepts and methods behind well-built software.',
      skills: [
        { name: 'OOP', icon: ICON_BOX, level: WORKING, description: 'Modeling software with classes, inheritance and encapsulation.' },
        { name: 'UML', icon: ICON_FILE, level: WORKING, description: 'Describing systems with use case, class and sequence diagrams.' },
        { name: 'System Analysis & Design', icon: ICON_LAYERS, level: WORKING, description: 'Turning requirements into a clear structure for a system.' },
        { name: 'Software Engineering', icon: ICON_CPU, level: WORKING, description: 'Planning, building and maintaining software in a structured way.' },
        { name: 'DevOps', icon: ICON_BRANCH, level: LEARNING, description: 'Learning how to automate building, testing and deploying software.' },
        { name: 'Agile', icon: ICON_REFRESH, level: WORKING, description: 'Working in short iterations with feedback and continuous improvement.' },
      ],
      also: ['Requirements Analysis', 'Project Planning', 'Web Application Architecture', 'Application Development', 'Data Management'],
    },
    {
      name: 'Marketing',
      icon: ICON_MEGAPHONE,
      description: 'Digital marketing, content and communication.',
      skills: [
        { name: 'Digital Marketing', icon: ICON_MEGAPHONE, level: WORKING, description: 'Promoting products and ideas through digital channels.' },
        { name: 'Social Media', icon: ICON_SHARE, level: WORKING, description: 'Planning and managing content across social platforms.' },
        { name: 'Content Planning', icon: ICON_CALENDAR, level: WORKING, description: 'Organizing topics and schedules so content stays consistent.' },
        { name: 'Marketing Strategy', icon: ICON_TARGET, level: WORKING, description: 'Defining goals, audience and messaging for a campaign.' },
        { name: 'Community Management', icon: ICON_USERS, level: WORKING, description: 'Engaging and supporting an online community.' },
        { name: 'Promotional Design', icon: ICON_SPARKLE, level: WORKING, description: 'Designing visuals that support a campaign or an event.' },
      ],
      also: ['Social Media Management', 'Social Media Content Creation', 'Branding & Communication'],
    },
  ];

  protected readonly activeCategory = signal('Frontend');
  protected readonly displayedCategory = signal('Frontend');
  protected readonly selectedSkill = signal<Skill>(this.categories[0].skills[0]);
  protected readonly failedLogos = signal<ReadonlySet<string>>(new Set());

  protected get currentCategory(): SkillCategory {
    return this.categories.find(c => c.name === this.displayedCategory()) ?? this.categories[0];
  }

  protected totalOf(category: SkillCategory): number {
    return category.skills.length + (category.also?.length ?? 0);
  }

  protected showLogo(skill: Skill): boolean {
    return !!skill.logo && !this.failedLogos().has(skill.name);
  }

  protected iconOf(skill: Skill): string {
    return skill.icon ?? this.categories.find(c => c.skills.includes(skill))?.icon ?? ICON_CODE;
  }

  protected onLogoError(skill: Skill): void {
    this.failedLogos.update(set => new Set(set).add(skill.name));
  }

  protected tone(level: string): string {
    return level === COURSEWORK || level === LEARNING || level === PLANNED ? 'soft' : 'ok';
  }

  protected isSelected(skill: Skill): boolean {
    return this.selectedSkill().name === skill.name;
  }

  private get root(): HTMLElement {
    return this.skillsRoot.nativeElement;
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------- LIFECYCLE ----------
  ngAfterViewInit(): void {
    this.moveIndicator(false);
    window.addEventListener('resize', this.onResize, { passive: true });
    document.fonts?.ready.then(() => this.moveIndicator(false));

    if (this.reduceMotion()) return;
    this.animationContext = gsap.context(() => this.buildEntrance(), this.root);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onResize);
    this.animationContext?.revert();
  }

  private readonly onResize = (): void => this.moveIndicator(false);

  // ---------- ENTRANCE: a single quiet reveal ----------
  private buildEntrance(): void {
    gsap
      .timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: this.root, start: 'top 75%', once: true },
      })
      .from('.skills-heading > *', { y: 14, opacity: 0, duration: 0.7, stagger: 0.08 })
      .from('.skills-board', { opacity: 0, y: 16, duration: 0.7, clearProps: 'opacity,transform' }, '-=0.45')
      .from('.skill-card', { opacity: 0, y: 8, duration: 0.45, stagger: 0.03, clearProps: 'opacity,transform' }, '-=0.4');
  }

  // ---------- TABS ----------
  private tabButtons(): HTMLElement[] {
    return Array.from(this.tabsEl.nativeElement.querySelectorAll<HTMLElement>('.tab'));
  }

  // the underline glides to the active tab
  private moveIndicator(animate: boolean): void {
    const index = this.categories.findIndex(c => c.name === this.activeCategory());
    const tab = this.tabButtons()[index];
    const bar = this.indicator?.nativeElement;
    if (!tab || !bar) return;

    const target = { x: tab.offsetLeft, width: tab.offsetWidth };

    if (animate && !this.reduceMotion()) {
      gsap.to(bar, { ...target, duration: 0.5, ease: 'power3.out', overwrite: true });
      tab.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    } else {
      gsap.set(bar, target);
    }
  }

  protected onTabKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();

    const count = this.categories.length;
    const current = this.categories.findIndex(c => c.name === this.activeCategory());
    const next =
      event.key === 'Home' ? 0 :
      event.key === 'End' ? count - 1 :
      event.key === 'ArrowRight' ? (current + 1) % count :
      (current - 1 + count) % count;

    this.selectCategory(this.categories[next].name);
    this.tabButtons()[next]?.focus();
  }

  // ---------- CATEGORY SWITCH: fade out, swap, fade in with a soft stagger ----------
  protected selectCategory(name: string): void {
    if (this.activeCategory() === name) return;
    this.activeCategory.set(name);

    if (this.reduceMotion()) {
      this.applyCategory(name);
      this.moveIndicator(false);
      return;
    }

    this.moveIndicator(true);

    const id = ++this.swapId;
    const outgoing = this.root.querySelectorAll('.panel-body, .spotlight-inner');
    gsap.killTweensOf(outgoing);

    gsap.to(outgoing, {
      opacity: 0,
      y: -6,
      duration: 0.18,
      ease: 'power2.in',
      onComplete: () => {
        if (id !== this.swapId) return;
        this.applyCategory(name);
        requestAnimationFrame(() => this.playCategoryIn(id));
      },
    });
  }

  private applyCategory(name: string): void {
    this.displayedCategory.set(name);
    const first = this.categories.find(c => c.name === name)?.skills[0];
    if (first) this.selectedSkill.set(first);
  }

  private playCategoryIn(id: number): void {
    if (id !== this.swapId) return;

    this.animationContext?.add(() => {
      gsap.fromTo(
        '.panel-body, .spotlight-inner',
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', clearProps: 'transform' },
      );
      gsap.from('.skill-card', { opacity: 0, y: 8, duration: 0.4, stagger: 0.03, ease: 'power3.out', clearProps: 'opacity,transform' });
    });
  }

  // ---------- SKILL SELECTION: quick cross-fade of the detail panel ----------
  protected selectSkill(skill: Skill): void {
    if (this.selectedSkill().name === skill.name) return;

    if (this.reduceMotion()) {
      this.selectedSkill.set(skill);
      return;
    }

    const id = ++this.swapId;
    const inner = this.root.querySelector('.spotlight-inner');
    gsap.killTweensOf(inner);

    gsap.to(inner, {
      opacity: 0,
      y: 4,
      duration: 0.14,
      ease: 'power2.in',
      onComplete: () => {
        if (id !== this.swapId) return;
        this.selectedSkill.set(skill);
        requestAnimationFrame(() => {
          this.animationContext?.add(() => {
            gsap.fromTo(
              '.spotlight-inner',
              { opacity: 0, y: 6 },
              { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', clearProps: 'transform' },
            );
          });
        });
      },
    });
  }
}