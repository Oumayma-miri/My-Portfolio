
import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';

import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import gsap from 'gsap';

@Component({
  selector: 'app-hero',
  standalone: true,
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero implements AfterViewInit, OnDestroy {

  private readonly host = inject(ElementRef<HTMLElement>);
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

  ngAfterViewInit(): void {

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReducedMotion) {
      this.animationContext = gsap.context(() => {

        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out' },
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

        gsap.to('.developer-card', {
          y: -12,
          duration: 2.8,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: 1.5,
        });

      }, this.host.nativeElement);
    }

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
    this.animationContext?.revert();
  }
}
