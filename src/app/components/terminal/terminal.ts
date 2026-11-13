import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';

// =====================================================
//  TYPES
// =====================================================

/** A piece of text inside an output line: plain, a link, or a clickable command */
interface Seg {
  t: string;
  cls?: string; // dim | accent | cyan | ok | val | warn | bold | kbd
  href?: string; // makes it a link
  ext?: boolean; // external link (opens in a new tab)
  cmd?: string; // makes it a button that runs this command
}

interface SkillItem {
  name: string;
  note?: string;
}

interface SkillGroup {
  title?: string;
  items: SkillItem[];
}

interface SkillCategory {
  id: string;
  title: string;
  aliases: string[];
  groups: SkillGroup[];
}

interface Project {
  id: string;
  name: string;
  tag: string;
  description: string;
  stack: string[];
  image: string;
  color: string;
  repo?: string; // add the repository URL to show a GitHub button
}

interface ProjectCard {
  project: Project;
  index: number;
  total: number;
  prevId: string;
  nextId: string;
}

/** One block of terminal output */
interface Block {
  k: 'line' | 'gap' | 'chips' | 'project';
  segs?: Seg[];
  items?: SkillItem[];
  card?: ProjectCard;
}

interface Entry {
  id: number;
  type: 'command' | 'output';
  text?: string;
  blocks?: Block[];
}

interface Suggestion {
  label: string;
  value: string;
}

// =====================================================
//  CONTENT  (edit here)
// =====================================================

const EMAIL = 'oumaymamiri.contact@gmail.com';
const GITHUB = 'https://github.com/Oumayma-miri';
const LINKEDIN = 'https://linkedin.com/in/oumayma-el-miri-323911340/';

const PROJECTS: Project[] = [
  {
    id: 'health-dashboard',
    name: 'Health Dashboard',
    tag: 'Internship · Circonscription Sanitaire de Sidi Bouzid',
    description: 'Healthcare statistics dashboard covering 24 regions, built during my internship.',
    stack: ['Angular 18+', 'TypeScript', 'CSS', 'JSON Server', 'LocalStorage'],
    image: '/images/health.png',
    color: '#70d6f5',
    // repo: 'https://github.com/Oumayma-miri/your-repo-name',
  },
  {
    id: 'covoiturage',
    name: 'Covoiturage Platform',
    tag: 'Full-stack web application',
    description: 'Ride-sharing application with trip management, search, reservations and user accounts.',
    stack: ['PHP', 'MySQL', 'Bootstrap', 'PDO'],
    image: '/images/carpool.png',
    color: '#9875f5',
  },
  {
    id: 'product-manager',
    name: 'Product Manager App',
    tag: 'Java application',
    description: 'Product management application that uses the Gemini API.',
    stack: ['Java', 'MySQL', 'SQLite', 'Gemini API'],
    image: '/images/product.png',
    color: '#d7a2d3',
  },
  {
    id: 'cv-creator',
    name: 'CV Creator',
    tag: 'Internship · Infosmile',
    description: 'CV creation website developed during my Infosmile internship.',
    stack: ['HTML', 'CSS', 'JavaScript'],
    image: '/images/cv.png',
    color: '#70d6a5',
  },
];

const SKILLS: SkillCategory[] = [
  {
    id: 'languages',
    title: 'Programming languages',
    aliases: ['language', 'programming', 'code'],
    groups: [
      { items: [{ name: 'Java' }, { name: 'JavaScript' }, { name: 'TypeScript' }, { name: 'PHP' }, { name: 'Python' }, { name: 'SQL' }, { name: 'HTML5' }, { name: 'CSS3' }] },
    ],
  },
  {
    id: 'web',
    title: 'Web development & frameworks',
    aliases: ['frameworks', 'frontend', 'angular'],
    groups: [
      {
        items: [
          { name: 'Angular', note: '18+, standalone components' },
          { name: 'Bootstrap' },
          { name: 'SCSS' },
          { name: 'HTML / CSS' },
          { name: 'JavaScript / TypeScript' },
          { name: 'Responsive Web Design' },
          { name: 'PHP Web Development' },
          { name: 'Laravel', note: 'coursework' },
          { name: 'Spring Boot', note: 'coursework' },
          { name: 'REST API Integration' },
          { name: 'CRUD Applications' },
          { name: 'MVC Architecture' },
          { name: 'Blade Templates' },
        ],
      },
    ],
  },
  {
    id: 'data',
    title: 'Databases & data management',
    aliases: ['db', 'database', 'databases', 'sql'],
    groups: [
      {
        items: [
          { name: 'MySQL' },
          { name: 'PostgreSQL' },
          { name: 'SQLite' },
          { name: 'Oracle SQL' },
          { name: 'Supabase' },
          { name: 'JSON Server' },
          { name: 'Database Design' },
          { name: 'SQL Queries' },
          { name: 'Database Management' },
          { name: 'Data Modeling' },
          { name: 'LocalStorage' },
        ],
      },
    ],
  },
  {
    id: 'software',
    title: 'Software development & concepts',
    aliases: ['dev', 'concepts', 'oop'],
    groups: [
      {
        items: [
          { name: 'Object-Oriented Programming' },
          { name: 'CRUD Operations' },
          { name: 'API Integration' },
          { name: 'Backend Development' },
          { name: 'Frontend Development' },
          { name: 'Authentication & Authorization' },
          { name: 'Application Development' },
          { name: 'Data Visualization' },
          { name: 'Dashboard Development' },
          { name: 'KPI Monitoring' },
          { name: 'Reporting Systems' },
        ],
      },
    ],
  },
  {
    id: 'design',
    title: 'UI/UX & product design',
    aliases: ['ui', 'ux', 'uiux', 'product'],
    groups: [
      {
        items: [
          { name: 'UI Design' },
          { name: 'UX Design' },
          { name: 'Wireframing' },
          { name: 'Responsive Interface Design' },
          { name: 'Interactive Prototyping' },
          { name: 'Visual Hierarchy' },
          { name: 'Design Systems' },
          { name: 'Branding' },
          { name: 'Visual Identity' },
          { name: 'User-Centered Design' },
        ],
      },
    ],
  },
  {
    id: 'multimedia',
    title: 'Graphic design & multimedia',
    aliases: ['graphic', 'graphics', 'media', 'video'],
    groups: [
      {
        items: [
          { name: 'Graphic Design' },
          { name: 'Social Media Design' },
          { name: 'Poster Design' },
          { name: 'Banner Design' },
          { name: 'Certificate Design' },
          { name: 'Presentation Design' },
          { name: '3D Design' },
          { name: 'Video Editing' },
          { name: 'Digital Content Creation' },
          { name: 'Content Scripting' },
          { name: 'Visual Storytelling' },
          { name: 'Motion & Animation Concepts' },
        ],
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Digital marketing & communication',
    aliases: ['communication', 'social'],
    groups: [
      {
        items: [
          { name: 'Digital Marketing' },
          { name: 'Social Media Management' },
          { name: 'Social Media Content Creation' },
          { name: 'Marketing Strategy' },
          { name: 'Content Planning' },
          { name: 'Branding & Communication' },
          { name: 'Promotional Design' },
          { name: 'Community Management' },
        ],
      },
    ],
  },
  {
    id: 'tools',
    title: 'Tools & software',
    aliases: ['tool', 'software-tools', 'ide', 'git'],
    groups: [
      {
        title: 'Graphic & visual design',
        items: [{ name: 'Canva', note: 'advanced' }, { name: 'Adobe Photoshop', note: 'intermediate' }, { name: 'Figma' }, { name: 'Blender' }],
      },
      {
        title: 'Development environments',
        items: [{ name: 'Visual Studio Code' }, { name: 'IntelliJ IDEA / JetBrains IDEs' }, { name: 'Android Studio' }, { name: 'Unity' }, { name: 'Overleaf' }],
      },
      {
        title: 'Version control & development',
        items: [{ name: 'Git' }, { name: 'GitHub' }, { name: 'XAMPP' }, { name: 'Maven' }, { name: 'pgAdmin' }, { name: 'Windsurf' }, { name: 'Antigravity' }],
      },
    ],
  },
  {
    id: 'creative',
    title: 'Creative development, animation & AI',
    aliases: ['ai', 'animation', 'unity', '3d'],
    groups: [
      {
        items: [
          { name: 'GSAP', note: 'portfolio animations' },
          { name: 'Three.js', note: 'planned' },
          { name: 'Unity' },
          { name: 'C#', note: 'Unity coursework' },
          { name: 'Gemini API' },
          { name: 'AI-assisted development' },
          { name: 'AI tools integration' },
          { name: '3D Modeling' },
          { name: 'Interactive Experiences' },
          { name: 'Gamification' },
        ],
      },
    ],
  },
  {
    id: 'engineering',
    title: 'Additional technical concepts',
    aliases: ['devops', 'uml', 'agile', 'concepts-extra'],
    groups: [
      {
        items: [
          { name: 'DevOps', note: 'currently learning' },
          { name: 'Software Engineering' },
          { name: 'System Analysis & Design' },
          { name: 'UML' },
          { name: 'Requirements Analysis' },
          { name: 'Project Planning' },
          { name: 'Agile Development concepts' },
          { name: 'Web Application Architecture' },
          { name: 'Data Management' },
        ],
      },
    ],
  },
];

const LANGUAGES: [string, string][] = [
  ['Arabic', 'Native'],
  ['French', 'Good'],
  ['English', 'Good'],
];

// =====================================================
//  SMALL HELPERS TO BUILD OUTPUT
// =====================================================

const t = (text: string, cls?: string): Seg => ({ t: text, cls });
const cmd = (text: string, command: string = text): Seg => ({ t: text, cmd: command });
const link = (text: string, href: string, ext = true): Seg => ({ t: text, href, ext });
const line = (...segs: Seg[]): Block => ({ k: 'line', segs });
const gap = (): Block => ({ k: 'gap' });

const countOf = (c: SkillCategory): number => c.groups.reduce((n, g) => n + g.items.length, 0);

// =====================================================
//  COMPONENT
// =====================================================

@Component({
  selector: 'app-terminal',
  standalone: true,
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
})
export class Terminal {
  @ViewChild('commandInput') private commandInput?: ElementRef<HTMLInputElement>;
  @ViewChild('terminalBody') private terminalBody?: ElementRef<HTMLElement>;

  protected readonly quickCommands = ['help', 'about', 'skills', 'projects', 'contact'];

  protected readonly entries = signal<Entry[]>(this.intro());
  protected readonly draft = signal('');
  protected readonly suggestions = signal<Suggestion[]>([]);

  // top-level commands, and which ones take an argument
  private readonly commandNames = [
    'about', 'clear', 'contact', 'education', 'experience', 'github', 'help', 'history',
    'languages', 'now', 'project', 'projects', 'skills', 'sudo', 'whoami',
  ].sort((a, b) => a.length - b.length || a.localeCompare(b));

  private readonly commandsWithArgs = new Set(['skills', 'project', 'sudo']);

  // ghost text shown after what you typed (press Tab or the right arrow to accept)
  protected readonly ghost = computed(() => {
    const draft = this.draft();
    const first = this.completionsFor(draft)[0];
    const typed = draft.replace(/^\s+/, '');
    if (!typed || !first) return '';
    return first.length > typed.length && first.startsWith(typed.toLowerCase()) ? first.slice(typed.length) : '';
  });

  private nextId = 100;
  private history: string[] = [];
  private historyIndex = 0;
  private stash = '';

  // ---------------------------------------------------
  //  INPUT HANDLING
  // ---------------------------------------------------

  protected onInput(event: Event): void {
    this.draft.set((event.target as HTMLInputElement).value);
    this.suggestions.set([]);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.draft();
    this.setDraft('');
    this.suggestions.set([]);
    this.run(value);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') {
      event.preventDefault();
      this.entries.set([]);
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.stepHistory(-1);
        break;

      case 'ArrowDown':
        event.preventDefault();
        this.stepHistory(1);
        break;

      case 'Tab':
        if (!event.shiftKey) this.autocomplete(event);
        break;

      case 'ArrowRight': {
        const input = event.target as HTMLInputElement;
        const first = this.completionsFor(this.draft())[0];
        if (this.ghost() && first && input.selectionStart === input.value.length) {
          event.preventDefault();
          this.setDraft(this.withSpace(first));
        }
        break;
      }
    }
  }

  private setDraft(value: string): void {
    this.draft.set(value);
    const input = this.commandInput?.nativeElement;
    if (input) {
      input.value = value;
      queueMicrotask(() => input.setSelectionRange(value.length, value.length));
    }
  }

  protected focusInput(): void {
    if (window.getSelection()?.toString()) return; // do not interrupt text selection
    this.commandInput?.nativeElement.focus({ preventScroll: true });
  }

  protected applySuggestion(s: Suggestion): void {
    this.setDraft(this.withSpace(s.value));
    this.suggestions.set([]);
    this.focusInput();
  }

  // ---------------------------------------------------
  //  HISTORY  (arrow up / down)
  // ---------------------------------------------------

  private pushHistory(text: string): void {
    if (this.history[this.history.length - 1] !== text) this.history.push(text);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length;
    this.stash = '';
  }

  private stepHistory(direction: -1 | 1): void {
    if (!this.history.length) return;

    if (this.historyIndex === this.history.length && direction < 0) {
      this.stash = this.draft(); // keep what was being typed
    }

    const next = this.historyIndex + direction;
    if (next < 0 || next > this.history.length) return;

    this.historyIndex = next;
    this.setDraft(next === this.history.length ? this.stash : this.history[next]);
    this.suggestions.set([]);
  }

  // ---------------------------------------------------
  //  AUTOCOMPLETE  (Tab)
  // ---------------------------------------------------

  private argOptions(command: string): string[] {
    switch (command) {
      case 'skills':
        return SKILLS.map(c => c.id);
      case 'project':
        return PROJECTS.map(p => p.id);
      case 'sudo':
        return ['hire me'];
      default:
        return [];
    }
  }

  /** Full-line completions for what has been typed so far (lowercase) */
  private completionsFor(draft: string): string[] {
    const typed = draft.replace(/^\s+/, '').toLowerCase();
    if (!typed) return [];

    const space = typed.indexOf(' ');

    if (space === -1) {
      return this.commandNames.filter(name => name.startsWith(typed));
    }

    const command = typed.slice(0, space);
    const fragment = typed.slice(space + 1).trimStart();

    return this.argOptions(command)
      .filter(option => option.startsWith(fragment) && option !== fragment)
      .map(option => `${command} ${option}`);
  }

  private withSpace(full: string): string {
    return !full.includes(' ') && this.commandsWithArgs.has(full) ? `${full} ` : full;
  }

  private commonPrefix(values: string[]): string {
    let prefix = values[0];
    for (const v of values) {
      while (!v.startsWith(prefix)) prefix = prefix.slice(0, -1);
    }
    return prefix;
  }

  private autocomplete(event: KeyboardEvent): void {
    const draft = this.draft();
    const typed = draft.replace(/^\s+/, '').toLowerCase();
    const matches = this.completionsFor(draft);

    // nothing to complete: let Tab move the focus as usual (keeps the page keyboard accessible)
    if (!matches.length) return;

    if (matches.length === 1) {
      const next = this.withSpace(matches[0]);
      if (next === draft) return;
      event.preventDefault();
      this.setDraft(next);
      this.suggestions.set([]);
      return;
    }

    event.preventDefault();
    const common = this.commonPrefix(matches);

    if (common.length > typed.length) {
      this.setDraft(common);
    } else {
      // still ambiguous: show the options under the input
      this.suggestions.set(
        matches.map(m => ({ label: m.includes(' ') ? m.slice(m.indexOf(' ') + 1) : m, value: m })),
      );
    }
  }

  // ---------------------------------------------------
  //  RUNNING COMMANDS
  // ---------------------------------------------------

  /** Used by clickable commands inside the terminal */
  protected runCommand(text: string): void {
    this.run(text);
    // on touch screens, do not pop the keyboard up
    if (!window.matchMedia('(pointer: coarse)').matches) this.focusInput();
  }

  private run(raw: string): void {
    const text = raw.trim();
    if (!text) return;

    this.pushHistory(text);
    const low = text.toLowerCase();

    if (low === 'clear' || low === 'cls') {
      this.entries.set([]);
      return;
    }

    const blocks = this.dispatch(low);

    this.entries.update(list =>
      [...list, { id: this.nextId++, type: 'command' as const, text }, { id: this.nextId++, type: 'output' as const, blocks }].slice(-80),
    );

    this.scrollToEnd();
  }

  private dispatch(low: string): Block[] {
    const [name, ...args] = low.split(/\s+/);

    switch (name) {
      case 'help':
      case '?':
        return this.cmdHelp();
      case 'about':
        return this.cmdAbout();
      case 'whoami':
        return this.cmdWhoami();
      case 'education':
        return this.cmdEducation();
      case 'experience':
        return this.cmdExperience();
      case 'languages':
        return this.cmdLanguages();
      case 'now':
        return this.cmdNow();
      case 'skills':
        return this.cmdSkills(args.join(' '));
      case 'projects':
        return this.cmdProjects();
      case 'project':
        return this.cmdProject(args.join(' '));
      case 'github':
        return [line(t('GitHub  ', 'dim'), link('github.com/Oumayma-miri', GITHUB))];
      case 'contact':
        return this.cmdContact();
      case 'history':
        return this.cmdHistory();
      case 'sudo':
        return this.cmdSudo(args);
      default:
        return this.notFound(name);
    }
  }

  private scrollToEnd(): void {
    requestAnimationFrame(() => {
      const el = this.terminalBody?.nativeElement;
      if (!el) return;

      // long answers start at their first line, short ones scroll to the input
      const commands = el.querySelectorAll<HTMLElement>('.command-line');
      const last = commands[commands.length - 1];
      const target = last && el.scrollHeight - last.offsetTop > el.clientHeight ? last.offsetTop - 12 : el.scrollHeight;

      el.scrollTo({
        top: target,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }

  protected delay(index: number): number {
    return Math.min(index, 14) * 28;
  }

  // ---------------------------------------------------
  //  COMMANDS
  // ---------------------------------------------------

  private intro(): Entry[] {
    return [
      {
        id: 1,
        type: 'output',
        blocks: [
          line(t('Interactive developer terminal initialized.', 'dim')),
          line(t('Type '), cmd('help'), t(' to see what I can do, or click any '), t('highlighted', 'cyan'), t(' command.')),
        ],
      },
    ];
  }

  private cmdHelp(): Block[] {
    const row = (label: string, ...items: Seg[]): Block => line(t(label.padEnd(10), 'accent'), ...items);
    const sep = (): Seg => t('  ·  ', 'dim');

    return [
      line(t('Available commands', 'bold')),
      gap(),
      row('PROFILE', cmd('about'), sep(), cmd('whoami'), sep(), cmd('education'), sep(), cmd('experience'), sep(), cmd('languages'), sep(), cmd('now')),
      row('SKILLS', cmd('skills'), t('  then  ', 'dim'), t('skills <category>', 'val')),
      row('WORK', cmd('projects'), t('  then  ', 'dim'), t('project <name>', 'val')),
      row('CONNECT', cmd('contact'), sep(), cmd('github')),
      row('TERMINAL', cmd('history'), sep(), cmd('clear'), sep(), cmd('help')),
      gap(),
      line(t('↑ ↓', 'kbd'), t(' history   ', 'dim'), t('Tab', 'kbd'), t(' autocomplete   ', 'dim'), t('Ctrl+L', 'kbd'), t(' clear', 'dim')),
    ];
  }

  private cmdAbout(): Block[] {
    return [
      line(t('I am Oumayma EL MIRI, an IT student specializing in Multimedia and Web Development at ISET Sidi Bouzid.')),
      line(t('I enjoy combining programming, creativity and technology to build digital experiences that work well and feel good to use.')),
      gap(),
      line(t('● ', 'ok'), t('Open to PFE opportunities  ', 'val'), t('→ ', 'dim'), cmd('contact')),
    ];
  }

  private cmdWhoami(): Block[] {
    const kv = (key: string, ...value: Seg[]): Block => line(t(key.padEnd(9), 'accent'), ...value);

    return [
      line(t('oumayma', 'cyan'), t('@', 'dim'), t('portfolio', 'cyan')),
      line(t('─────────────────', 'dim')),
      kv('Name', t('Oumayma EL MIRI', 'val')),
      kv('Role', t('IT Student · Web Developer', 'val')),
      kv('School', t('ISET Sidi Bouzid', 'val')),
      kv('Study', t('Multimedia & Web Development', 'val')),
      kv('Focus', t('Development · UI/UX', 'val')),
      kv('Stack', t('Angular · TypeScript · PHP · Java', 'val')),
      kv('Status', t('● ', 'ok'), t('Open to PFE opportunities', 'val')),
    ];
  }

  private cmdEducation(): Block[] {
    return [
      line(t('Multimedia & Web Development', 'bold')),
      line(t('ISET Sidi Bouzid', 'cyan')),
      gap(),
      line(t('Studying web development, databases and multimedia, with a focus on building practical projects.', 'dim')),
      line(t('See what I built: ', 'dim'), cmd('projects')),
    ];
  }

  private cmdExperience(): Block[] {
    return [
      line(t('Internships', 'bold')),
      gap(),
      line(t('01  ', 'dim'), t('Circonscription Sanitaire de Sidi Bouzid', 'val')),
      line(t('    Built the Health Dashboard  ', 'dim'), t('→ ', 'dim'), cmd('project health', 'project health-dashboard')),
      gap(),
      line(t('02  ', 'dim'), t('Infosmile', 'val')),
      line(t('    Built the CV Creator  ', 'dim'), t('→ ', 'dim'), cmd('project cv', 'project cv-creator')),
    ];
  }

  private cmdLanguages(): Block[] {
    return [
      line(t('Spoken languages', 'bold')),
      gap(),
      ...LANGUAGES.map(([lang, level]) => line(t(lang.padEnd(9), 'accent'), t(level, 'val'))),
    ];
  }

  private cmdNow(): Block[] {
    return [
      line(t('Currently', 'bold')),
      gap(),
      line(t('● ', 'ok'), t('Building   ', 'accent'), t('this portfolio, with Angular and GSAP', 'val')),
      line(t('● ', 'ok'), t('Learning   ', 'accent'), t('DevOps', 'val')),
      line(t('● ', 'ok'), t('Looking    ', 'accent'), t('for a PFE opportunity  ', 'val'), t('→ ', 'dim'), cmd('contact')),
    ];
  }

  private cmdSkills(query: string): Block[] {
    if (!query) {
      return [
        line(t('Skills by category', 'bold'), t('  (click one, or type ', 'dim'), t('skills <category>', 'val'), t(')', 'dim')),
        gap(),
        ...SKILLS.map((c, i) =>
          line(t(`${String(i + 1).padStart(2, '0')}  `, 'dim'), { t: c.id, cmd: `skills ${c.id}` }, t(`  ${c.title}  `, 'val'), t(String(countOf(c)), 'dim')),
        ),
      ];
    }

    const category = SKILLS.find(c => c.id === query || c.aliases.includes(query)) ?? SKILLS.find(c => c.id.startsWith(query));

    if (!category) {
      return [
        line(t(`Unknown category: "${query}"`, 'warn')),
        line(t('Try '), cmd('skills'), t(' to see all categories.')),
      ];
    }

    const blocks: Block[] = [line(t(category.title, 'bold'), t(`  ${countOf(category)}`, 'dim')), gap()];

    for (const group of category.groups) {
      if (group.title) blocks.push(line(t(group.title, 'accent')));
      blocks.push({ k: 'chips', items: group.items });
    }

    blocks.push(gap(), line(t('← ', 'dim'), cmd('skills'), t('   all categories', 'dim')));
    return blocks;
  }

  private cmdProjects(): Block[] {
    return [
      line(t('Projects', 'bold'), t('  (click one for a preview)', 'dim')),
      gap(),
      ...PROJECTS.map((p, i) =>
        line(t(`${String(i + 1).padStart(2, '0')}  `, 'dim'), { t: p.name, cmd: `project ${p.id}` }, t(`  ${p.stack.slice(0, 3).join(' · ')}`, 'dim')),
      ),
    ];
  }

  private findProject(query: string): number {
    if (/^\d+$/.test(query)) return Number(query) - 1;

    return PROJECTS.findIndex(
      p => p.id === query || p.id.startsWith(query) || p.name.toLowerCase().includes(query),
    );
  }

  private cmdProject(query: string): Block[] {
    if (!query) {
      return [line(t('Usage: ', 'dim'), t('project <name>', 'val'), t('   or pick one from ', 'dim'), cmd('projects'))];
    }

    const index = this.findProject(query);
    const project = PROJECTS[index];

    if (!project) {
      return [line(t(`No project matches "${query}".`, 'warn')), line(t('Try '), cmd('projects'), t('.'))];
    }

    const total = PROJECTS.length;

    return [
      {
        k: 'project',
        card: {
          project,
          index: index + 1,
          total,
          prevId: PROJECTS[(index - 1 + total) % total].id,
          nextId: PROJECTS[(index + 1) % total].id,
        },
      },
    ];
  }

  private cmdContact(): Block[] {
    const kv = (key: string, ...value: Seg[]): Block => line(t(key.padEnd(10), 'accent'), ...value);

    return [
      line(t("Let's talk", 'bold')),
      gap(),
      kv('Email', link(EMAIL, `mailto:${EMAIL}`, false)),
      kv('GitHub', link('github.com/Oumayma-miri', GITHUB)),
      kv('LinkedIn', link('linkedin.com/in/oumayma-el-miri', LINKEDIN)),
      kv('Form', link('scroll to the contact section ↓', '#contact', false)),
    ];
  }

  private cmdHistory(): Block[] {
    if (!this.history.length) return [line(t('No commands yet.', 'dim'))];

    return this.history.map((h, i) => line(t(`${String(i + 1).padStart(2, ' ')}  `, 'dim'), { t: h, cmd: h }));
  }

  private cmdSudo(args: string[]): Block[] {
    if (args[0] === 'hire' && (args[1] === 'me' || args[1] === 'oumayma')) {
      return [
        line(t('[sudo] password for visitor: ', 'dim'), t('••••••••', 'dim')),
        line(t('✓ ', 'ok'), t('Permission granted.', 'val')),
        line(t('✓ ', 'ok'), t('Great decision. Opening the contact form...  ', 'val'), link('go to contact ↓', '#contact', false)),
      ];
    }

    return [line(t('visitor is not in the sudoers file. This incident will be reported.', 'warn'))];
  }

  private notFound(name: string): Block[] {
    const blocks: Block[] = [line(t(`Command not found: "${name}"`, 'warn'))];

    const best = this.commandNames
      .filter(c => c !== 'sudo')
      .map(c => ({ c, d: this.distance(name, c) }))
      .sort((a, b) => a.d - b.d)[0];

    if (best && best.d <= 2 && name.length >= 3) {
      blocks.push(line(t('Did you mean '), cmd(best.c), t('?')));
    } else {
      blocks.push(line(t('Type '), cmd('help'), t(' to see available commands.')));
    }

    return blocks;
  }

  /** Small edit distance, used for "did you mean" */
  private distance(a: string, b: string): number {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
    for (let j = 0; j <= b.length; j++) dp[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        );
      }
    }
    return dp[a.length][b.length];
  }
}