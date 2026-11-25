import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Field = 'name' | 'email' | 'message';

interface SocialLink {
  label: string;
  handle: string;
  url: string;
  icon: string; // SVG path data (24x24, stroke style)
}

interface OrbitNode {
  label: string;
  url: string;
  icon: string;
  ring: 1 | 2;
  angle: number; // position around the ring, in degrees
  external: boolean;
}

interface NavLink {
  label: string;
  href: string;
}

// Simple line icons (Lucide-style paths)
const ICON_GITHUB = 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4M9 18c-4.51 2-5-2-7-2';
const ICON_LINKEDIN = 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z';
const ICON_MAIL = 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private animationContext?: ReturnType<typeof gsap.context>;
  private copyTimer?: ReturnType<typeof setTimeout>;

  // =====================================================
  //  EDIT YOUR CONTENT HERE
  // =====================================================

  protected readonly fullName = 'Oumayma EL MIRI';
  protected readonly contactEmail = 'oumaymamiri.contact@gmail.com';
  protected readonly availability = 'Open to PFE opportunities';

  protected readonly links: SocialLink[] = [
    { label: 'GitHub', handle: 'Oumayma-miri', url: 'https://github.com/Oumayma-miri', icon: ICON_GITHUB },
    { label: 'LinkedIn', handle: 'oumayma-el-miri', url: 'https://linkedin.com/in/oumayma-el-miri-323911340/', icon: ICON_LINKEDIN },
  ];

  // Links that travel around the monogram (ring 1 = inner, ring 2 = outer)
  protected readonly orbitNodes: OrbitNode[] = [
    { label: 'GitHub', url: 'https://github.com/Oumayma-miri', icon: ICON_GITHUB, ring: 1, angle: 130, external: true },
    { label: 'Email', url: 'mailto:oumaymamiri.contact@gmail.com', icon: ICON_MAIL, ring: 1, angle: 310, external: false },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/oumayma-el-miri-323911340/', icon: ICON_LINKEDIN, ring: 2, angle: 220, external: true },
  ];

  protected readonly navLinks: NavLink[] = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Projects', href: '#projects' },
    { label: 'Skills', href: '#skills' },
    { label: 'Journey', href: '#journey' },
    { label: 'Code', href: '#code' },
  ];

  protected readonly year = new Date().getFullYear();
  protected readonly mailIcon = ICON_MAIL;

  // =====================================================

  // form state (plain signals, no extra Angular module needed)
  protected readonly senderName = signal('');
  protected readonly senderEmail = signal('');
  protected readonly message = signal('');
  protected readonly submitted = signal(false);
  protected readonly touched = signal<Record<Field, boolean>>({ name: false, email: false, message: false });
  protected readonly opened = signal(false);
  protected readonly copied = signal(false);

  private readonly errors = computed<Record<Field, string>>(() => ({
    name: this.senderName().trim().length < 2 ? 'Please enter your name.' : '',
    email: EMAIL_RE.test(this.senderEmail().trim()) ? '' : 'Please enter a valid email address.',
    message: this.message().trim().length < 10 ? 'Please write a short message (at least 10 characters).' : '',
  }));

  private readonly isValid = computed(() => !Object.values(this.errors()).some(Boolean));

  private readonly subject = computed(() => `Portfolio contact from ${this.senderName().trim() || 'a visitor'}`);

  private readonly body = computed(
    () => `${this.message().trim()}\n\n${this.senderName().trim()}\n${this.senderEmail().trim()}`,
  );

  private readonly mailtoHref = computed(
    () => `mailto:${this.contactEmail}?subject=${encodeURIComponent(this.subject())}&body=${encodeURIComponent(this.body())}`,
  );

  private readonly gmailHref = computed(
    () =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(this.contactEmail)}` +
      `&su=${encodeURIComponent(this.subject())}&body=${encodeURIComponent(this.body())}`,
  );

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {
    if (this.reduceMotion()) return;

    this.animationContext = gsap.context(() => this.buildEntrance(), this.host.nativeElement);
  }

  ngOnDestroy(): void {
    clearTimeout(this.copyTimer);
    this.animationContext?.revert();
  }

  // Plays once, when each part scrolls into view
  private buildEntrance(): void {
    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: this.host.nativeElement.querySelector('.ct-section'), start: 'top 65%', once: true },
    });

    tl.from('.ct-text > *', { y: 25, opacity: 0, duration: 0.8, stagger: 0.12 })
      .from('.ct-orbit', { scale: 0.85, opacity: 0, duration: 1, ease: 'power3.out' }, '-=0.5')
      .from('.orbit-caption', { opacity: 0, duration: 0.6 }, '-=0.4')
      .from('.form-card', { y: 30, opacity: 0, duration: 0.8 }, 0.25)
      .from('.field', { y: 14, opacity: 0, duration: 0.45, stagger: 0.08 }, 0.6);

    gsap.from('.footer-col, .footer-bottom', {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: this.host.nativeElement.querySelector('.site-footer'), start: 'top 92%', once: true },
    });
  }

  // ---------- form ----------
  protected update(field: Field, event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value;
    if (field === 'name') this.senderName.set(value);
    else if (field === 'email') this.senderEmail.set(value);
    else this.message.set(value);
    this.opened.set(false);
  }

  protected touch(field: Field): void {
    this.touched.update(t => ({ ...t, [field]: true }));
  }

  protected error(field: Field): string {
    return this.submitted() || this.touched()[field] ? this.errors()[field] : '';
  }

  // Validates; returns true when the form can be sent
  private check(): boolean {
    this.submitted.set(true);
    if (this.isValid()) return true;

    requestAnimationFrame(() => {
      const root = this.host.nativeElement;
      root.querySelector<HTMLElement>('.field.has-error input, .field.has-error textarea')?.focus();
      if (!this.reduceMotion()) {
        gsap.fromTo(root.querySelectorAll('.field.has-error'), { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      }
    });
    return false;
  }

  protected send(event: Event): void {
    event.preventDefault();
    if (!this.check()) return;

    window.open(this.gmailHref(), '_blank', 'noopener,noreferrer');
    this.opened.set(true);
  }

  protected openEmailApp(): void {
    if (!this.check()) return;

    window.location.href = this.mailtoHref();
    this.opened.set(true);
  }

  protected async copyEmail(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.contactEmail);
      this.copied.set(true);
      clearTimeout(this.copyTimer);
      this.copyTimer = setTimeout(() => this.copied.set(false), 1800);
    } catch {
      /* clipboard not available: ignore */
    }
  }

  protected ringNodes(ring: 1 | 2): OrbitNode[] {
    return this.orbitNodes.filter(n => n.ring === ring);
  }

  protected scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: this.reduceMotion() ? 'auto' : 'smooth' });
  }
}