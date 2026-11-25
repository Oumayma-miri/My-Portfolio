import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contact } from './contact';

describe('Contact', () => {
  let component: Contact;
  let fixture: ComponentFixture<Contact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contact],
    }).compileComponents();

    fixture = TestBed.createComponent(Contact);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('opens a prefilled Gmail draft when the form is submitted', () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);
    const nameInput = fixture.nativeElement.querySelector('#cf-name') as HTMLInputElement;
    const emailInput = fixture.nativeElement.querySelector('#cf-email') as HTMLInputElement;
    const messageInput = fixture.nativeElement.querySelector('#cf-message') as HTMLTextAreaElement;

    nameInput.value = 'Alex Example';
    nameInput.dispatchEvent(new Event('input'));
    emailInput.value = 'alex@example.com';
    emailInput.dispatchEvent(new Event('input'));
    messageInput.value = 'I would like to discuss a project.';
    messageInput.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { cancelable: true }));

    expect(openSpy).toHaveBeenCalledOnce();
    const [url, target] = openSpy.mock.calls[0];
    const draftUrl = String(url);
    expect(draftUrl).toContain('https://mail.google.com/mail/?view=cm&fs=1');
    expect(decodeURIComponent(draftUrl)).toContain('alex@example.com');
    expect(decodeURIComponent(draftUrl)).toContain('I would like to discuss a project.');
    expect(target).toBe('_blank');
    openSpy.mockRestore();
  });

  it('keeps the orbit email link pointed at the contact address', () => {
    const emailLink = fixture.nativeElement.querySelector('.orbit-node[aria-label="Email"]') as HTMLAnchorElement;

    expect(emailLink.getAttribute('href')).toBe('mailto:oumaymamiri.contact@gmail.com');
  });
});
