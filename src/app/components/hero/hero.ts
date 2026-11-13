import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  DestroyRef,
  inject,
  signal,
  ViewChild,
  HostListener,
} from '@angular/core';

import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import gsap from 'gsap';

// How far the card may be dragged beyond the edges of its area (in px)
const PAD_X = 60;
const PAD_Y = 50;
// Pulling past the limit feels elastic: only this share of the extra distance is followed
const RESISTANCE = 0.25;

// ---------- WAVE VIDEO SETTINGS ----------
// Put your video in  public/videos/wave.mp4  (older Angular: src/assets/videos/ and use 'assets/videos/wave.mp4')
const WAVE_SRC = 'videos/wave.mp4';
// Set to false if your video has no sound (the mute button is then hidden)
const WAVE_HAS_SOUND = true;

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const rubber = (v: number, min: number, max: number): number =>
  v < min ? min - (min - v) * RESISTANCE : v > max ? max + (v - max) * RESISTANCE : v;

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private animationContext?: gsap.Context;

  private readonly roles = [
    'Web Developer',
    'UI/UX Enthusiast',
    'Creative Technologist',
    'IT Student',
  ];

  private roleIndex = 0;

  protected readonly currentRole = signal(this.roles[0]);

  // true once the card has been dragged away from its original place
  protected readonly moved = signal(false);

  // ---------- wave video state ----------
  @ViewChild('waveVideo') private waveVideo?: ElementRef<HTMLVideoElement>;

  protected readonly waveSrc = WAVE_SRC;
  protected readonly waveHasSound = WAVE_HAS_SOUND;
  protected readonly waveOpen = signal(false);
  protected readonly waveBuffering = signal(false);
  protected readonly waveError = signal(false);
  protected readonly waveMuted = signal(false);
  protected readonly waveWatched = signal(false); // stops the invitation pulse after the first play
  protected readonly waveProgress = signal(0);

  private wavePrepared = false;
  private waveClosing = false;
  private waveErrTimer?: ReturnType<typeof setTimeout>;
  private waveOrigin = { x: 0, y: 0, start: 41, end: 500 };
  private suppressClick = false; // a drag must not count as a click

  // ---------- drag state ----------
  private card: HTMLElement | null = null;
  private area: HTMLElement | null = null;
  private tags: HTMLElement[] = [];
  private dragReady = false;
  private tiltTimer?: ReturnType<typeof setTimeout>;

  private readonly drag = {
    active: false,
    dragging: false,
    id: -1,
    startX: 0,
    startY: 0,
    baseX: 0,
    baseY: 0,
    targetX: 0,
    targetY: 0,
    lastX: 0,
    lastT: 0,
  };

  private bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };

  private reduceMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  ngAfterViewInit(): void {

    const prefersReducedMotion = this.reduceMotion();
    const root = this.host.nativeElement;

    this.card = root.querySelector<HTMLElement>('.developer-card');
    this.area = root.querySelector<HTMLElement>('.hero-visual');
    this.tags = Array.from(root.querySelectorAll<HTMLElement>('.floating-tag'));

    if (!prefersReducedMotion) {
      this.animationContext = gsap.context(() => {

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
          // the card can be dragged once its entrance has finished
          onComplete: () => (this.dragReady = true),
        });

        timeline.from('.hero-content > *', {
          opacity: 0,
          y: 25,
          duration: 0.7,
          stagger: 0.12,
        });

        timeline.from('.developer-card', {
          opacity: 0,
          y: 40,
          scale: 0.94,
          duration: 1,
        }, '-=0.4');

        timeline.from('.floating-tag', {
          opacity: 0,
          scale: 0.7,
          duration: 0.5,
          stagger: 0.2,
        }, '-=0.5');

        timeline.from('.drag-hint', {
          opacity: 0,
          y: 6,
          duration: 0.5,
        }, '-=0.2');

        // Floating uses yPercent so it never fights with the drag (which uses x and y)
        gsap.to('.developer-card', {
          yPercent: -3.2,
          duration: 2.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.5,
        });

      }, root);
    } else {
      this.dragReady = true;
    }

    this.setupDrag();

    // Rotate the developer roles every 2.6 seconds
    interval(2600)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {

        this.roleIndex =
          (this.roleIndex + 1) % this.roles.length;

        this.currentRole.set(this.roles[this.roleIndex]);

        if (!prefersReducedMotion) {
          const roleElement =
            this.host.nativeElement.querySelector('.rotating-role');

          if (roleElement) {
            gsap.fromTo(
              roleElement,
              { opacity: 0, y: 10 },
              {
                opacity: 1,
                y: 0,
                duration: 0.45,
                ease: 'power2.out',
              }
            );
          }
        }
      });
  }

  ngOnDestroy(): void {
    clearTimeout(this.tiltTimer);
    clearTimeout(this.waveErrTimer);

    if (this.card) {
      this.card.removeEventListener('pointerdown', this.onDown);
      this.card.removeEventListener('pointermove', this.onMove);
      this.card.removeEventListener('pointerup', this.onUp);
      this.card.removeEventListener('pointercancel', this.onUp);
      gsap.killTweensOf(this.card);
    }

    gsap.killTweensOf(this.tags);
    this.animationContext?.revert();
  }

  // =====================================================
  //  DRAGGABLE CARD
  //  - drag with mouse, finger or pen
  //  - the card tilts slightly with your movement
  //  - the floating tags follow it with a little delay
  //  - it can be moved a bit past its area, then settles back inside
  // =====================================================

  private setupDrag(): void {
    if (!this.card) return;

    this.card.addEventListener('pointerdown', this.onDown);
    this.card.addEventListener('pointermove', this.onMove);
    this.card.addEventListener('pointerup', this.onUp);
    this.card.addEventListener('pointercancel', this.onUp);
  }

  private computeBounds(): void {
    if (!this.card || !this.area) return;

    const cx = Number(gsap.getProperty(this.card, 'x')) || 0;
    const cy = Number(gsap.getProperty(this.card, 'y')) || 0;

    const r = this.card.getBoundingClientRect();
    const a = this.area.getBoundingClientRect();

    // where the card sits when it has not been moved
    const left = r.left - cx;
    const top = r.top - cy;

    this.bounds = {
      minX: a.left - PAD_X - left,
      maxX: a.right + PAD_X - (left + r.width),
      minY: a.top - PAD_Y - top,
      maxY: a.bottom + PAD_Y - (top + r.height),
    };
  }

  private moveTags(x: number, y: number): void {
    if (!this.tags.length) return;
    gsap.to(this.tags, {
      x,
      y,
      duration: this.reduceMotion() ? 0 : 0.7,
      ease: 'power3.out',
      overwrite: 'auto',
    });
  }

  private readonly onDown = (e: PointerEvent): void => {
    if (!this.dragReady || !this.card) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const d = this.drag;
    d.active = true;
    d.dragging = false;
    d.id = e.pointerId;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.baseX = Number(gsap.getProperty(this.card, 'x')) || 0;
    d.baseY = Number(gsap.getProperty(this.card, 'y')) || 0;
    d.targetX = d.baseX;
    d.targetY = d.baseY;
    d.lastX = e.clientX;
    d.lastT = performance.now();

    this.computeBounds();
  };

  private readonly onMove = (e: PointerEvent): void => {
    const d = this.drag;
    if (!d.active || e.pointerId !== d.id || !this.card) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    // a small movement is still a click, so the photo stays free for other interactions
    if (!d.dragging) {
      if (Math.hypot(dx, dy) < 5) return;

      d.dragging = true;
      this.card.setPointerCapture(e.pointerId);
      this.card.classList.add('is-dragging');
      this.moved.set(true);

      if (!this.reduceMotion()) {
        gsap.to(this.card, { scale: 1.02, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      }
    }

    const b = this.bounds;
    d.targetX = rubber(d.baseX + dx, b.minX, b.maxX);
    d.targetY = rubber(d.baseY + dy, b.minY, b.maxY);

    const reduce = this.reduceMotion();

    gsap.to(this.card, {
      x: d.targetX,
      y: d.targetY,
      duration: reduce ? 0 : 0.4,
      ease: 'power3.out',
      overwrite: 'auto',
    });

    this.moveTags(d.targetX, d.targetY);

    // slight tilt in the direction of the movement
    if (!reduce) {
      const now = performance.now();
      const velocity = (e.clientX - d.lastX) / Math.max(1, now - d.lastT); // px per ms
      d.lastX = e.clientX;
      d.lastT = now;

      gsap.to(this.card, { rotation: clamp(velocity * 6, -6, 6), duration: 0.5, ease: 'power3.out', overwrite: 'auto' });

      clearTimeout(this.tiltTimer);
      this.tiltTimer = setTimeout(() => {
        if (this.card) gsap.to(this.card, { rotation: 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
      }, 90);
    }
  };

  private readonly onUp = (e: PointerEvent): void => {
    const d = this.drag;
    if (!d.active || e.pointerId !== d.id) return;

    const wasDragging = d.dragging;
    d.active = false;
    d.dragging = false;
    clearTimeout(this.tiltTimer);

    // the click that follows a drag must not open the video
    if (wasDragging) {
      this.suppressClick = true;
      setTimeout(() => (this.suppressClick = false), 0);
    }

    // a plain click: nothing to do here
    if (!wasDragging || !this.card) return;

    if (this.card.hasPointerCapture(e.pointerId)) {
      this.card.releasePointerCapture(e.pointerId);
    }
    this.card.classList.remove('is-dragging');

    // if it was pulled past the limit, settle it back inside
    const b = this.bounds;
    const x = clamp(d.targetX, b.minX, b.maxX);
    const y = clamp(d.targetY, b.minY, b.maxY);
    d.targetX = x;
    d.targetY = y;

    const reduce = this.reduceMotion();

    gsap.to(this.card, {
      x,
      y,
      rotation: 0,
      scale: 1,
      duration: reduce ? 0 : 0.6,
      ease: 'back.out(1.6)',
      overwrite: 'auto',
    });

    this.moveTags(x, y);
  };

  // =====================================================
  //  WAVE VIDEO
  //  Click the photo: a circle grows out of it, fills the card and plays the video.
  //  When the video ends (or on close / Esc) the circle shrinks back into the photo.
  // =====================================================

  // starts loading the video as soon as the visitor shows interest (hover, focus or touch)
  protected prepareWave(): void {
    if (this.wavePrepared) return;
    this.wavePrepared = true;

    const video = this.waveVideo?.nativeElement;
    if (video) {
      video.preload = 'auto';
      video.load();
    }
  }

  private waveCircle(radius: number): string {
    return `circle(${radius}px at ${this.waveOrigin.x}px ${this.waveOrigin.y}px)`;
  }

  // finds where the photo sits inside the card, and how big the circle must grow to cover it
  private measureWave(): void {
    const card = this.card;
    const avatar = card?.querySelector<HTMLElement>('.profile-avatar');
    if (!card || !avatar) return;

    const c = card.getBoundingClientRect();
    const a = avatar.getBoundingClientRect();
    const scale = c.width / card.offsetWidth || 1;

    const x = (a.left + a.width / 2 - c.left) / scale;
    const y = (a.top + a.height / 2 - c.top) / scale;
    const w = card.offsetWidth;
    const h = card.offsetHeight;

    this.waveOrigin = {
      x,
      y,
      start: a.width / scale / 2,
      end: Math.hypot(Math.max(x, w - x), Math.max(y, h - y)) + 4,
    };
  }

  protected openWave(): void {
    if (this.suppressClick || this.waveOpen() || this.waveClosing || !this.card) return;

    const wave = this.card.querySelector<HTMLElement>('.wave');
    const video = this.waveVideo?.nativeElement;
    if (!wave || !video) return;

    this.prepareWave();
    this.measureWave();

    this.waveError.set(false);
    this.waveBuffering.set(true);
    this.waveProgress.set(0);
    this.waveWatched.set(true);
    this.waveOpen.set(true);

    const controls = wave.querySelectorAll('.wave-bar, .wave-progress');

    gsap.killTweensOf(wave);
    gsap.killTweensOf(controls);
    gsap.set(wave, { visibility: 'visible' });

    if (this.reduceMotion()) {
      gsap.set(wave, { clipPath: 'none' });
      gsap.set(controls, { opacity: 1 });
    } else {
      gsap.fromTo(
        wave,
        { clipPath: this.waveCircle(this.waveOrigin.start) },
        { clipPath: this.waveCircle(this.waveOrigin.end), duration: 0.75, ease: 'power3.inOut' },
      );
      gsap.fromTo(controls, { opacity: 0 }, { opacity: 1, duration: 0.4, delay: 0.45 });
    }

    video.currentTime = 0;
    video.muted = this.waveMuted();

    video.play().catch((err: unknown) => {
      // the browser refused to play with sound: retry muted
      if ((err as DOMException)?.name === 'NotAllowedError') {
        video.muted = true;
        this.waveMuted.set(true);
        video.play().catch(() => undefined);
      }
    });
  }

  protected closeWave(): void {
    if (!this.waveOpen() || this.waveClosing || !this.card) return;

    const wave = this.card.querySelector<HTMLElement>('.wave');
    const video = this.waveVideo?.nativeElement;
    if (!wave) return;

    this.waveClosing = true;
    clearTimeout(this.waveErrTimer);
    video?.pause();

    const controls = wave.querySelectorAll('.wave-bar, .wave-progress');

    const finish = (): void => {
      gsap.set(wave, { visibility: 'hidden' });
      if (video) video.currentTime = 0;
      this.waveOpen.set(false);
      this.waveProgress.set(0);
      this.waveBuffering.set(false);
      this.waveClosing = false;
    };

    if (this.reduceMotion()) {
      finish();
      return;
    }

    this.measureWave(); // the card may have been moved since it opened
    gsap.killTweensOf(wave);
    gsap.killTweensOf(controls);
    gsap.to(controls, { opacity: 0, duration: 0.2 });
    gsap.to(wave, {
      clipPath: this.waveCircle(this.waveOrigin.start),
      duration: 0.55,
      ease: 'power3.inOut',
      onComplete: finish,
    });
  }

  protected togglePlay(): void {
    const video = this.waveVideo?.nativeElement;
    if (!video || this.suppressClick) return;
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
  }

  protected toggleMute(): void {
    const video = this.waveVideo?.nativeElement;
    this.waveMuted.update(m => !m);
    if (video) video.muted = this.waveMuted();
  }

  protected onWaveTime(): void {
    const video = this.waveVideo?.nativeElement;
    if (video?.duration) this.waveProgress.set((video.currentTime / video.duration) * 100);
  }

  protected onWaveError(): void {
    if (!this.waveOpen()) return;
    this.waveBuffering.set(false);
    this.waveError.set(true);
    clearTimeout(this.waveErrTimer);
    this.waveErrTimer = setTimeout(() => this.closeWave(), 1800);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.closeWave();
  }

  // sends the card back to where it started
  protected resetCard(): void {
    if (!this.card) return;

    this.moved.set(false);
    this.drag.targetX = 0;
    this.drag.targetY = 0;

    const duration = this.reduceMotion() ? 0 : 0.8;

    gsap.to(this.card, { x: 0, y: 0, rotation: 0, scale: 1, duration, ease: 'power3.inOut', overwrite: 'auto' });
    gsap.to(this.tags, { x: 0, y: 0, duration, ease: 'power3.inOut', overwrite: 'auto' });
  }
}