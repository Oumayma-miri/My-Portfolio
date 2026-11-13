import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Projects } from './projects';

describe('Projects', () => {
  let component: Projects;
  let fixture: ComponentFixture<Projects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projects],
    }).compileComponents();

    fixture = TestBed.createComponent(Projects);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show each project image', () => {
    const images = fixture.nativeElement.querySelectorAll('.project-image');
    const imagePaths = Array.from(images, (image: HTMLImageElement) =>
      image.getAttribute('src'),
    );

    expect(imagePaths).toEqual([
      '/images/health.png',
      '/images/carpool.png',
      '/images/product.png',
      '/images/cv.png',
    ]);
  });

  it('should include projects 2 and 3 in the Backend filter', () => {
    const filterButtons = fixture.nativeElement.querySelectorAll(
      '.filter-bar button',
    ) as NodeListOf<HTMLButtonElement>;
    const backendFilter = Array.from(filterButtons).find(button =>
      button.textContent?.includes('Backend'),
    );

    backendFilter?.click();
    fixture.detectChanges();

    const projectNames = Array.from(
      fixture.nativeElement.querySelectorAll('.project-info h3'),
      (heading: HTMLHeadingElement) => heading.textContent?.trim(),
    );

    expect(projectNames).toEqual([
      'Covoiturage Platform',
      'Product Manager App',
    ]);
  });
});
