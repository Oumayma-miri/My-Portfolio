import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  computed,
  signal,
} from '@angular/core';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GlowFlower } from '../glow-flower/glow-flower';

gsap.registerPlugin(ScrollTrigger);

type Lang = 'typescript' | 'php' | 'java';

interface Note {
  from: number; // first line explained by this note (1-based)
  to: number; // last line
  title: string;
  text: string;
}

interface Snippet {
  file: string;
  path: string;
  project: string;
  lang: Lang;
  title: string;
  description: string;
  concepts: string[];
  code: string;
  notes: Note[];
  link?: { label: string; url: string };
}

type TokenType = 'kw' | 'str' | 'num' | 'fn' | 'type' | 'var' | 'deco' | 'com' | '';

interface Token {
  text: string;
  type: TokenType;
}

interface CodeLine {
  n: number;
  tokens: Token[];
}

// ---------- tiny syntax highlighter (no dependencies) ----------
// Works line by line, so avoid multi-line strings and multi-line comments in snippets.

const KEYWORDS: Record<Lang, Set<string>> = {
  typescript: new Set([
    'export', 'import', 'from', 'class', 'private', 'public', 'protected', 'readonly', 'const', 'let',
    'return', 'new', 'void', 'if', 'else', 'for', 'of', 'this', 'null', 'true', 'false', 'async', 'await',
    'interface', 'type', 'extends', 'implements', 'static', 'number', 'string', 'boolean',
  ]),
  php: new Set([
    'function', 'return', 'array', 'string', 'int', 'bool', 'new', 'if', 'else', 'foreach', 'as', 'class',
    'public', 'private', 'protected', 'static', 'null', 'true', 'false', 'try', 'catch', 'throw', 'use',
  ]),
  java: new Set([
    'public', 'private', 'protected', 'final', 'class', 'return', 'new', 'int', 'void', 'static', 'if',
    'else', 'for', 'null', 'true', 'false', 'this', 'import', 'extends', 'implements', 'interface',
    'double', 'boolean', 'String', 'try', 'catch', 'throw', 'throws',
  ]),
};

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|(\$[A-Za-z_]\w*)|(@[A-Za-z_]\w*)|([A-Za-z_]\w*)/g;

function tokenizeLine(line: string, lang: Lang): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;

  let m: RegExpExecArray | null;
  while ((m = TOKEN_RE.exec(line)) !== null) {
    if (m.index > last) tokens.push({ text: line.slice(last, m.index), type: '' });

    let type: TokenType = '';
    if (m[1]) type = 'com';
    else if (m[2]) type = 'str';
    else if (m[3]) type = 'num';
    else if (m[4]) type = 'var';
    else if (m[5]) type = 'deco';
    else if (m[6]) {
      const rest = line.slice(TOKEN_RE.lastIndex);
      if (KEYWORDS[lang].has(m[6])) type = 'kw';
      else if (/^(<[^()]*>)?\(/.test(rest)) type = 'fn';
      else if (/^[A-Z]/.test(m[6])) type = 'type';
    }

    tokens.push({ text: m[0], type });
    last = TOKEN_RE.lastIndex;
  }

  if (last < line.length) tokens.push({ text: line.slice(last), type: '' });
  return tokens;
}

function toLines(code: string, lang: Lang): CodeLine[] {
  return code
    .replace(/^\n|\n$/g, '')
    .split('\n')
    .map((text, i) => ({ n: i + 1, tokens: tokenizeLine(text, lang) }));
}

@Component({
  selector: 'app-code-showcase',
  standalone: true,
  imports: [GlowFlower],
  templateUrl: './code-showcase.html',
  styleUrl: './code-showcase.scss',
})
export class CodeShowcase implements AfterViewInit, OnDestroy {
  @ViewChild('csRoot') csRoot!: ElementRef<HTMLElement>;

  private animationContext?: ReturnType<typeof gsap.context>;
  private tabsObserver?: ResizeObserver;
  private copyTimer?: ReturnType<typeof setTimeout>;

  // =====================================================
  //  EDIT YOUR CONTENT HERE
  //
  //  !! These three snippets are ILLUSTRATIVE SAMPLES, not your real code.
  //  Replace `code`, `notes` and the texts with code from your own projects.
  //
  //  Tips:
  //   - Keep each snippet short (10 to 25 lines).
  //   - Avoid multi-line strings and multi-line comments (the highlighter works line by line).
  //   - `notes` explain line ranges; clicking a note highlights those lines.
  //   - lang can be 'typescript', 'php' or 'java'.
  // =====================================================

  protected readonly snippets: Snippet[] = [
    {
      file: 'health.service.ts',
      path: 'src/app/health.service.ts',
      project: 'Angular example',
      lang: 'typescript',
      title: 'State management with Angular signals',
      description:
        'A small service that keeps the dashboard data in signals and derives everything else from them.',
      concepts: ['Signals', 'computed()', 'HttpClient', 'Dependency injection'],
      code: `
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);

  readonly regions = signal<Region[]>([]);
  readonly selectedId = signal<number | null>(null);

  readonly selected = computed(() =>
    this.regions().find(r => r.id === this.selectedId()) ?? null
  );

  readonly totalCases = computed(() =>
    this.regions().reduce((sum, r) => sum + r.cases, 0)
  );

  load(): void {
    this.http
      .get<Region[]>('http://localhost:3000/regions')
      .subscribe(data => this.regions.set(data));
  }
}
`,
      notes: [
        { from: 1, to: 3, title: 'One shared service', text: 'Provided at the root, so every component reads the same data. The HTTP client comes from inject().' },
        { from: 5, to: 6, title: 'State lives in signals', text: 'The list of regions and the selected region are signals, so the UI updates automatically when they change.' },
        { from: 8, to: 14, title: 'Derived values with computed', text: 'The selected region and the totals are computed from the signals, so they can never get out of sync.' },
        { from: 16, to: 20, title: 'Loading from a JSON server', text: 'One request fills the signal; everything that depends on it refreshes by itself.' },
      ],
    },
    {
      file: 'search_trips.php',
      path: 'includes/search_trips.php',
      project: 'PHP example',
      lang: 'php',
      title: 'Safe trip search with PDO',
      description:
        'A search function that finds available trips using a prepared statement instead of building SQL from user input.',
      concepts: ['PDO', 'Prepared statements', 'SQL', 'Clean functions'],
      code: `
function searchTrips(PDO $pdo, string $from, string $to): array
{
    $sql = 'SELECT id, departure_time, price, seats_left '
         . 'FROM trips '
         . 'WHERE departure_city = :from AND arrival_city = :to '
         . 'AND seats_left > 0 ORDER BY departure_time';

    $stmt = $pdo->prepare($sql);
    $stmt->execute(['from' => $from, 'to' => $to]);

    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
`,
      notes: [
        { from: 3, to: 6, title: 'Query and values stay separate', text: 'The SQL uses named placeholders, so user input is never pasted into the query text.' },
        { from: 8, to: 9, title: 'Prepared statement', text: 'PDO sends the query and the values separately, which protects the app from SQL injection.' },
        { from: 11, to: 11, title: 'Clean return value', text: 'Rows come back as associative arrays, ready for the page to display.' },
      ],
    },
    {
      file: 'ProductService.java',
      path: 'src/service/ProductService.java',
      project: 'Java example',
      lang: 'java',
      title: 'Low stock detection with streams',
      description:
        'A service class that receives its data access object through the constructor and filters products with Java streams.',
      concepts: ['OOP', 'Dependency injection', 'Streams', 'Method references'],
      code: `
public class ProductService {
    private final ProductDao dao;

    public ProductService(ProductDao dao) {
        this.dao = dao;
    }

    public List<Product> lowStock(int threshold) {
        return dao.findAll().stream()
            .filter(p -> p.getQuantity() <= threshold)
            .sorted(Comparator.comparingInt(Product::getQuantity))
            .toList();
    }
}
`,
      notes: [
        { from: 2, to: 6, title: 'Dependencies come from outside', text: 'The data access object is passed to the constructor, which keeps the class simple and easy to test.' },
        { from: 8, to: 13, title: 'Filter and sort with streams', text: 'Products at or below the threshold are selected and sorted from the lowest stock up, in one readable chain.' },
      ],
    },
  ];

  protected readonly langLabel: Record<Lang, string> = {
    typescript: 'TypeScript',
    php: 'PHP',
    java: 'Java',
  };

  // =====================================================

  // activeSnippet = tab highlight (instant), displayedSnippet = shown code (after exit animation)
  protected readonly activeSnippet = signal(0);
  protected readonly displayedSnippet = signal(0);
  protected readonly activeNote = signal(0);
  protected readonly copied = signal(false);

  protected get snippet(): Snippet {
    return this.snippets[this.displayedSnippet()] ?? this.snippets[0];
  }

  protected readonly lines = computed<CodeLine[]>(() => {
    const s = this.snippets[this.displayedSnippet()] ?? this.snippets[0];
    return toLines(s.code, s.lang);
  });

  private get root(): HTMLElement {
    return this.csRoot.nativeElement;
  }

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    const tabs = this.root.querySelector('.ed-tabs');
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
    clearTimeout(this.copyTimer);
    this.tabsObserver?.disconnect();
    this.animationContext?.revert();
  }

  // Plays once, when the section scrolls into view
  private buildEntrance(): void {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: this.root, start: 'top 65%', once: true },
    });

    tl.from('.cs-heading > *', { y: 25, opacity: 0, duration: 0.8, stagger: 0.12 })
      .from('.editor', { y: 30, opacity: 0, duration: 0.8 }, '-=0.5')
      .from('.cs-side', { y: 30, opacity: 0, duration: 0.8 }, '<0.1')
      .from('.line', { x: -10, opacity: 0, duration: 0.3, stagger: 0.03, clearProps: 'opacity,transform' }, '-=0.4')
      .from('.note', { y: 12, opacity: 0, duration: 0.4, stagger: 0.07, clearProps: 'opacity,transform' }, '-=0.6');
  }

  // ---------- sliding tab indicator ----------
  private moveIndicator(animate: boolean): void {
    const tabs = this.root.querySelectorAll<HTMLElement>('.ed-tabs .ed-tab');
    const indicator = this.root.querySelector<HTMLElement>('.ed-indicator');
    const tab = tabs[this.activeSnippet()];
    if (!tab || !indicator) return;

    const target = { x: tab.offsetLeft, width: tab.offsetWidth };

    if (animate && !this.reduceMotion()) {
      gsap.to(indicator, { ...target, duration: 0.45, ease: 'power3.out', overwrite: true });
    } else {
      gsap.set(indicator, target);
    }
  }

  // ---------- switching snippet ----------
  protected select(index: number): void {
    if (this.activeSnippet() === index) return;

    this.activeSnippet.set(index);
    this.moveIndicator(true);
    this.copied.set(false);

    if (this.reduceMotion()) {
      this.apply(index);
      return;
    }

    const targets = this.root.querySelectorAll('.line, .note');
    gsap.killTweensOf(targets);

    gsap.to(targets, {
      opacity: 0,
      x: -8,
      duration: 0.15,
      stagger: { each: 0.008, from: 'end' },
      ease: 'power2.in',
      onComplete: () => {
        this.apply(index);
        requestAnimationFrame(() => this.playIn());
      },
    });
  }

  private apply(index: number): void {
    this.displayedSnippet.set(index);
    this.activeNote.set(0);
  }

  private playIn(): void {
    this.animationContext?.add(() => {
      gsap.fromTo('.line', { x: -10, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, stagger: 0.025, ease: 'power2.out', clearProps: 'opacity,transform' });
      gsap.fromTo('.note', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.07, delay: 0.1, ease: 'power3.out', clearProps: 'opacity,transform' });
      gsap.fromTo('.side-head > *', { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out', clearProps: 'opacity,transform' });
    });
  }

  // ---------- notes and line highlighting ----------
  protected selectNote(index: number): void {
    this.activeNote.set(index);
  }

  protected isActive(line: number): boolean {
    const note = this.snippet.notes[this.activeNote()];
    return !!note && line >= note.from && line <= note.to;
  }

  protected hasNote(line: number): boolean {
    return this.snippet.notes.some(n => line >= n.from && line <= n.to);
  }

  // clicking a line selects the note that explains it
  protected onLineClick(line: number): void {
    const index = this.snippet.notes.findIndex(n => line >= n.from && line <= n.to);
    if (index >= 0) this.activeNote.set(index);
  }

  // ---------- copy ----------
  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.snippet.code.replace(/^\n|\n$/g, ''));
      this.copied.set(true);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* clipboard not available: ignore */
    }
  }
}