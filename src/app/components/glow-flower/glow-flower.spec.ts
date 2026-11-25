import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlowFlower } from './glow-flower';

describe('GlowFlower', () => {
  let component: GlowFlower;
  let fixture: ComponentFixture<GlowFlower>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlowFlower],
    }).compileComponents();

    fixture = TestBed.createComponent(GlowFlower);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
