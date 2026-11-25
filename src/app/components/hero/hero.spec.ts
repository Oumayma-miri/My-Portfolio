import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Hero } from './hero';

describe('Hero', () => {
  let component: Hero;
  let fixture: ComponentFixture<Hero>;
  let matchMediaDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hero],
    }).compileComponents();

    matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }),
    });

    fixture = TestBed.createComponent(Hero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    if (matchMediaDescriptor) {
      Object.defineProperty(window, 'matchMedia', matchMediaDescriptor);
    } else {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens the profile photo in an image-only dialog', () => {
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.image-lightbox') as HTMLDialogElement;
    const showModal = vi.fn(() => dialog.setAttribute('open', ''));
    Object.defineProperty(dialog, 'showModal', { configurable: true, value: showModal });

    (fixture.nativeElement.querySelector('.avatar-btn') as HTMLButtonElement).click();

    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog.querySelector('video')).toBeNull();
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('images/oumayma.png');
  });
});
