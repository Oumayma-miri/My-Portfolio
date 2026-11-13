
import { Component, signal, computed } from '@angular/core';

type Category = 'All' | 'Frontend' | 'Backend' | 'Full Stack';

interface Project {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  description: string;
  categories: Exclude<Category, 'All'>[];
  technologies: string[];
  year: string;
  accent: string;
  image?: string;
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
      categories: ['Frontend'],
      technologies: ['Angular 18+', 'TypeScript', 'CSS', 'JSON Server'],
      year: '2026',
      accent: 'purple',
      image: '/images/health.png',
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
      categories: ['Full Stack', 'Backend'],
      technologies: ['PHP', 'MySQL', 'Bootstrap', 'PDO'],
      year: '2025',
      accent: 'cyan',
      image: '/images/carpool.png',
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
      subtitle: 'AI-Assisted Inventory Management Mobile App',
      description:
        'A team-developed mobile application designed to simplify product and inventory management. Built with React Native and Expo, backed by a Java API and MongoDB database, it includes product tracking, category and batch management, barcode scanning, and AI-assisted features.',
      categories: ['Full Stack', 'Backend'],
      technologies: [
        'React Native',
        'Expo',
        'Java',
        'MongoDB',
        'Maven',
        'Axios',
        'Gemini API'
      ],
      year: '2025',
      accent: 'pink',
      image: '/images/product.png',
      features: [
        'Product, category and batch management',
        'Inventory tracking and expiry date monitoring',
        'Barcode scanning',
        'AI-assisted product features using Gemini API',
        'Java backend and MongoDB database integration',
        'Mobile application with React Native and Expo'
      ]
    },
    {
      id: 'cv',
      number: '04',
      name: 'CV Creator',
      subtitle: 'Personal Resume Builder',
      description:
        'A frontend web application that allows users to create and customize their CV through a simple interface.',
      categories: ['Frontend'],
      technologies: ['HTML', 'CSS', 'JavaScript'],
      year: '2025',
      accent: 'orange',
      image: '/images/cv.png',
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

    return this.projects.filter(project => project.categories.includes(filter));
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
