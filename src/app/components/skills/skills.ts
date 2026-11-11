
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  signal,
} from '@angular/core';

import { gsap } from 'gsap';

interface Skill {
  name: string;
  logo: string;
  level: string;
  description: string;
}

interface SkillCategory {
  name: string;
  description: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  templateUrl: './skills.html',
  styleUrl: './skills.scss',
})
export class Skills implements AfterViewInit, OnDestroy {

  @ViewChild('skillsRoot') skillsRoot!: ElementRef<HTMLElement>;

private animationContext?: ReturnType<typeof gsap.context>;

  private readonly logoBase =
    'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

  protected readonly categories: SkillCategory[] = [
    {
      name: 'Frontend',
      description: 'Crafting interfaces and interactive web experiences.',
      skills: [
        {
          name: 'HTML5',
          logo: `${this.logoBase}/html5/html5-original.svg`,
          level: 'Working knowledge',
          description: 'Structuring accessible and well-organized web pages.',
        },
        {
          name: 'CSS3',
          logo: `${this.logoBase}/css3/css3-original.svg`,
          level: 'Working knowledge',
          description: 'Creating responsive layouts, styling and visual effects.',
        },
        {
          name: 'JavaScript',
          logo: `${this.logoBase}/javascript/javascript-original.svg`,
          level: 'Working knowledge',
          description: 'Adding interactivity and dynamic behavior to web applications.',
        },
        {
          name: 'TypeScript',
          logo: `${this.logoBase}/typescript/typescript-original.svg`,
          level: 'Learning & applying',
          description: 'Writing structured, typed code in Angular applications.',
        },
        {
          name: 'Angular',
          logo: `${this.logoBase}/angular/angular-original.svg`,
          level: 'Learning & applying',
          description: 'Building standalone components and interactive interfaces.',
        },
        {
          name: 'Bootstrap',
          logo: `${this.logoBase}/bootstrap/bootstrap-original.svg`,
          level: 'Working knowledge',
          description: 'Using a responsive grid and ready-made UI components.',
        },
      ],
    },
    {
      name: 'Backend',
      description: 'Developing application logic and server-side functionality.',
      skills: [
        {
          name: 'PHP',
          logo: `${this.logoBase}/php/php-original.svg`,
          level: 'Working knowledge',
          description: 'Building server-side functionality and database-driven applications.',
        },
        {
          name: 'Java',
          logo: `${this.logoBase}/java/java-original.svg`,
          level: 'Working knowledge',
          description: 'Applying object-oriented programming concepts in application development.',
        },
      ],
    },
    {
      name: 'Databases',
      description: 'Organizing, storing and managing application data.',
      skills: [
        {
          name: 'MySQL',
          logo: `${this.logoBase}/mysql/mysql-original.svg`,
          level: 'Working knowledge',
          description: 'Working with relational databases and SQL queries.',
        },
        {
          name: 'SQLite',
          logo: `${this.logoBase}/sqlite/sqlite-original.svg`,
          level: 'Working knowledge',
          description: 'Using lightweight relational storage in applications.',
        },
      ],
    },
    {
      name: 'Tools & Creative',
      description: 'Tools that support my development workflow and creative side.',
      skills: [
        {
          name: 'Git',
          logo: `${this.logoBase}/git/git-original.svg`,
          level: 'Working knowledge',
          description: 'Managing code versions and collaborating through Git workflows.',
        },
        {
          name: 'GitHub',
          logo: `${this.logoBase}/github/github-original.svg`,
          level: 'Working knowledge',
          description: 'Hosting repositories and managing development projects.',
        },
        {
          name: 'Canva',
          logo: `${this.logoBase}/canva/canva-original.svg`,
          level: 'Experienced',
          description: 'Creating visual content, presentations and graphic designs.',
        },
        {
          name: 'Photoshop',
          logo: `${this.logoBase}/photoshop/photoshop-plain.svg`,
          level: 'Intermediate',
          description: 'Editing images and creating visual compositions.',
        },
        {
          name: 'Unity',
          logo: `${this.logoBase}/unity/unity-original.svg`,
          level: 'Learning & applying',
          description: 'Exploring interactive 3D experiences and Unity development.',
        },
      ],
    },
  ];

  protected readonly activeCategory = signal('Frontend');

  protected readonly selectedSkill = signal<Skill>(
    this.categories[0].skills[0]
  );

  protected get currentCategory(): SkillCategory {
    return (
      this.categories.find(
        category => category.name === this.activeCategory()
      ) ?? this.categories[0]
    );
  }

  protected get visibleSkills(): Skill[] {
    return this.currentCategory.skills;
  }

  // INITIAL ANIMATIONS
  ngAfterViewInit(): void {
    const root = this.skillsRoot.nativeElement;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.animationContext = gsap.context(() => {

      // Heading entrance
      gsap.from('.skills-heading > *', {
        y: 25,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Workspace entrance
      gsap.from('.skills-sidebar', {
        x: -35,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: 'power3.out',
      });

      gsap.from('.skills-main', {
        x: 35,
        opacity: 0,
        duration: 0.9,
        delay: 0.3,
        ease: 'power3.out',
      });

      // Technology cards entrance
      gsap.from('.skill-card', {
        y: 30,
        opacity: 0,
        scale: 0.94,
        duration: 0.65,
        stagger: 0.09,
        delay: 0.55,
        ease: 'back.out(1.5)',
      });

      // Ambient spotlight glow
      gsap.to('.spotlight-decoration', {
        scale: 1.4,
        x: -25,
        y: 20,
        opacity: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Orbit animation
      gsap.to('.orbit-ring-one', {
        rotation: 360,
        duration: 24,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.orbit-ring-two', {
        rotation: -360,
        duration: 32,
        repeat: -1,
        ease: 'none',
      });

      // Status indicator
      gsap.to('.pulse-dot', {
        scale: 1.5,
        opacity: 0.45,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Floating code icon
      gsap.to('.code-symbol', {
        y: -4,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

    }, root);
  }

  // CATEGORY SELECTION
  protected selectCategory(name: string): void {
    if (this.activeCategory() === name) return;

    this.activeCategory.set(name);

    const category = this.categories.find(
      item => item.name === name
    );

    if (category) {
      this.selectedSkill.set(category.skills[0]);
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    requestAnimationFrame(() => {
      const root = this.skillsRoot.nativeElement;

      gsap.fromTo(
        root.querySelectorAll('.skill-card'),
        {
          y: 22,
          opacity: 0,
          scale: 0.96,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.45,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'transform',
        }
      );

      gsap.fromTo(
        root.querySelector('.skill-spotlight'),
        {
          opacity: 0,
          y: 12,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        }
      );
    });
  }

  // TECHNOLOGY SELECTION
  protected selectSkill(skill: Skill): void {
    if (this.selectedSkill().name === skill.name) return;

    this.selectedSkill.set(skill);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    requestAnimationFrame(() => {
      const root = this.skillsRoot.nativeElement;

      gsap.fromTo(
        root.querySelector('.spotlight-logo'),
        {
          scale: 0.7,
          rotation: -12,
          opacity: 0,
        },
        {
          scale: 1,
          rotation: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'back.out(2)',
        }
      );

      gsap.fromTo(
        root.querySelector('.spotlight-content'),
        {
          x: 15,
          opacity: 0,
        },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
        }
      );
    });
  }

  // SELECTED CARD CHECK
  protected isSelected(skill: Skill): boolean {
    return this.selectedSkill().name === skill.name;
  }

  // CLEANUP
  ngOnDestroy(): void {
    this.animationContext?.revert();
  }
}
