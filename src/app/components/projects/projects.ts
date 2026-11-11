
import { Component, signal, computed } from '@angular/core';

type Category = 'All' | 'Frontend' | 'Backend' | 'Full Stack';

interface Project {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  category: Exclude<Category, 'All'>;
  technologies: string[];
  year: string;
  accent: string;
  github?: string;
  features: string[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects {

  protected readonly filters: Category[] = [
    'All',
    'Frontend',
    'Backend',
    'Full Stack'
  ];

  protected readonly activeFilter = signal<Category>('All');

  protected readonly selectedProject = signal<Project | null>(null);

  protected readonly projects: Project[] = [
    {
      id: 'health',
      number: '01',
      name: 'Health Dashboard',
      subtitle: 'Healthcare Statistics Management',
      description:
        'A web application developed during my internship at the Circonscription Sanitaire de Sidi Bouzid to manage and visualize healthcare statistics across 24 regions.',
      category: 'Frontend',
      technologies: ['Angular 18+', 'TypeScript', 'CSS', 'JSON Server'],
      year: '2026',
      accent: 'purple',
      github: 'https://github.com/Oumayma-miri/health-dashboard-final',
      features: [
        'Healthcare statistics visualization',
        'Management of 24 regions',
        'Responsive dashboard interface',
        'Local data persistence'
      ]
    },
    {
      id: 'carpool',
      number: '02',
      name: 'Covoiturage Platform',
      subtitle: 'Ride Sharing & Reservations',
      description:
        'A carpooling web platform that allows users to publish journeys, search for available rides and manage reservations.',
      category: 'Full Stack',
      technologies: ['PHP', 'MySQL', 'Bootstrap', 'PDO'],
      year: '2025',
      accent: 'cyan',
      github: 'https://github.com/Oumayma-miri/covoiturage',
      features: [
        'User registration and authentication',
        'Journey publishing',
        'Ride search and booking',
        'Reservation management'
      ]
    },
    {
      id: 'product',
      number: '03',
      name: 'Product Manager App',
      subtitle: 'Product Management Application',
      description:
        'A Java application focused on product management, database operations and AI-assisted functionality.',
      category: 'Backend',
      technologies: ['Java', 'MySQL', 'SQLite', 'Gemini API'],
      year: '2025',
      accent: 'pink',
      features: [
        'Product management',
        'Database integration',
        'AI API integration'
      ]
    },
    {
      id: 'cv',
      number: '04',
      name: 'CV Creator',
      subtitle: 'Personal Resume Builder',
      description:
        'A frontend web application that allows users to create and customize their CV through a simple interface.',
      category: 'Frontend',
      technologies: ['HTML', 'CSS', 'JavaScript'],
      year: '2025',
      accent: 'orange',
      features: [
        'CV creation interface',
        'User authentication screens',
        'Frontend form interactions'
      ]
    }
  ];

  protected readonly filteredProjects = computed(() => {
    const filter = this.activeFilter();

    if (filter === 'All') {
      return this.projects;
    }

    return this.projects.filter(
      project => project.category === filter
    );
  });

  protected setFilter(filter: Category): void {
    this.activeFilter.set(filter);
  }

  protected openProject(project: Project): void {
    this.selectedProject.set(project);
  }

  protected closeProject(): void {
    this.selectedProject.set(null);
  }
}
