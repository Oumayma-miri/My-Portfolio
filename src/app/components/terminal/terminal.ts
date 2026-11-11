
import { Component, signal } from '@angular/core';

interface TerminalEntry {
  type: 'command' | 'output';
  text: string;
}

@Component({
  selector: 'app-terminal',
  standalone: true,
  templateUrl: './terminal.html',
  styleUrl: './terminal.scss',
})
export class Terminal {

  protected readonly entries = signal<TerminalEntry[]>([
    {
      type: 'output',
      text: 'Welcome to Oumayma.exe',
    },
    {
      type: 'output',
      text: 'Interactive developer terminal initialized.',
    },
    {
      type: 'output',
      text: 'Type "help" to discover available commands.',
    },
  ]);

  protected execute(rawCommand: string): void {

    const command = rawCommand.trim().toLowerCase();

    if (!command) return;

    if (command === 'clear') {
      this.entries.set([]);
      return;
    }

    const response = this.getResponse(command);

    this.entries.update(current => [
      ...current,
      { type: 'command', text: rawCommand },
      { type: 'output', text: response },
    ]);
  }

  private getResponse(command: string): string {

    const responses: Record<string, string> = {

      help:
        'Available commands: about, skills, projects, github, contact, clear',

      about:
        'I am Oumayma EL Miri, an IT student specializing in Multimedia and Web Development at ISET Sidi Bouzid. I enjoy combining programming, creativity and technology.',

      skills:
        'Technologies I have worked with: Angular, TypeScript, JavaScript, PHP, Java, HTML, CSS, MySQL, Git.',

      projects:
        'My projects include: Health Dashboard, Covoiturage Platform, Product Manager App, and CV Creator.',

      github:
        'GitHub: github.com/Oumayma-miri',

      contact:
        'Email: oumaymamiri9@gmail.com | LinkedIn: linkedin.com/in/oumayma-el-miri-323911340/',

    };

    return responses[command] ??
      `Command not found: "${command}". Type "help" to see available commands.`;
  }
}
