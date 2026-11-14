import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';

import { gsap } from 'gsap';

interface NavLink {
  id: string; // the id of the section
  label: string;
}

interface Social {
  label: string;
  href: string;
}

// The menu closes automatically above this width (the desktop links take over)
const DESKTOP_MIN = 1001;

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);

  // same order as the sections in app.html
  protected readonly links: NavLink[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'journey', label: 'Journey' },
    { id: 'code', label: 'Code' },
    { id: 'contact', label: 'Contact' },
  ];

  protected readonly socials: Social[] = [
    { label: 'GitHub', href: 'https://github.com/Oumayma-miri' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/oumayma-el-miri-323911340/' },
    { label: 'Email', href: 'mailto:oumaymamiri.contact@gmail.com' },
  ];

  protected readonly active = signal('home');
  protected readonly menuOpen = signal(false);

  private nav: HTMLElement | null = null;
  private ctx?: ReturnType<typeof gsap.context>;
  private mq?: MediaQueryList;
  private ticking = false;
  private holdActiveUntil = 0; // while a smooth scroll runs, the clicked link stays highlighted

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ---------------------------------------------------
  //  LIFECYCLE
  // ---------------------------------------------------

  ngAfterViewInit(): void {
    this.nav = this.host.nativeElement.querySelector<HTMLElement>('.navbar');
    this.ctx = gsap.context(() => undefined, this.host.nativeElement);

    // scroll listeners run outside Angular, so scrolling never triggers change detection
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll, { passive: true });
    });

    this.mq = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
    this.mq.addEventListener('change', this.onBreakpoint);

    this.update();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    this.mq?.removeEventListener('change', this.onBreakpoint);
    document.body.style.overflow = '';
    this.ctx?.revert();
  }

  // ---------------------------------------------------
  //  SCROLL: progress bar, "scrolled" look, active link
  // ---------------------------------------------------

  private readonly onScroll = (): void => {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      this.update();
    });
  };

  private update(): void {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;

    this.nav?.classList.toggle('scrolled', y > 16);
    this.nav?.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));

    if (performance.now() < this.holdActiveUntil) return;

    // the active section is the last one whose top has passed 35% of the screen height
    const line = window.innerHeight * 0.35;
    let current = this.links[0].id;

    for (const link of this.links) {
      const el = document.getElementById(link.id);
      if (el && el.getBoundingClientRect().top <= line) current = link.id;
    }

    // short last section: when the page end is reached, the last link is active
    if (max > 0 && y >= max - 4) current = this.links[this.links.length - 1].id;

    if (current !== this.active()) this.active.set(current);
  }

  // ---------------------------------------------------
  //  NAVIGATION
  // ---------------------------------------------------

  /** Click on any link: closes the menu, then scrolls smoothly to the section */
  protected go(event: Event, id: string): void {
    event.preventDefault();
    this.closeMenu();

    const target = id === 'home' ? document.body : document.getElementById(id);
    if (!target) return;

    const behavior: ScrollBehavior = this.reduceMotion() ? 'auto' : 'smooth';

    if (id === 'home') {
      window.scrollTo({ top: 0, behavior });
    } else {
      target.scrollIntoView({ behavior, block: 'start' });
    }

    history.replaceState(null, '', `#${id}`);
    this.active.set(id);
    this.holdActiveUntil = performance.now() + (this.reduceMotion() ? 0 : 900);
  }

  // ---------------------------------------------------
  //  MOBILE MENU
  // ---------------------------------------------------

  protected toggleMenu(): void {
    if (this.menuOpen()) this.closeMenu(true);
    else this.openMenu();
  }

  private openMenu(): void {
    this.menuOpen.set(true);
    document.body.style.overflow = 'hidden'; // the page behind does not scroll

    if (this.reduceMotion()) return;

    requestAnimationFrame(() => {
      const root = this.host.nativeElement;
      const panel = root.querySelector('.mobile-menu');
      const items = root.querySelectorAll('.mm-link, .mm-foot > *');
      if (!panel) return;

      this.ctx?.add(() => {
        gsap.killTweensOf([panel, items]);
        gsap.fromTo(panel, { opacity: 0, y: -10, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power3.out' });
        gsap.fromTo(items, { x: -14, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, stagger: 0.04, delay: 0.08, ease: 'power2.out', clearProps: 'opacity,transform' });
      });
    });
  }

  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) return;

    document.body.style.overflow = '';

    const finish = (): void => {
      this.menuOpen.set(false);
      if (returnFocus) this.host.nativeElement.querySelector<HTMLButtonElement>('.menu-btn')?.focus();
    };

    const panel = this.host.nativeElement.querySelector('.mobile-menu');

    if (this.reduceMotion() || !panel) {
      finish();
      return;
    }

    this.ctx?.add(() => {
      gsap.killTweensOf(panel);
      gsap.to(panel, { opacity: 0, y: -8, duration: 0.22, ease: 'power2.in', onComplete: finish });
    });
  }

  /** The window grows to desktop size while the menu is open: close it */
  private readonly onBreakpoint = (event: MediaQueryListEvent): void => {
    if (event.matches && this.menuOpen()) {
      document.body.style.overflow = '';
      this.menuOpen.set(false);
    }
  };

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeMenu(true);
  }
}