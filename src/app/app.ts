
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Terminal } from './components/terminal/terminal';
import { Projects } from './components/projects/projects';
import { Skills } from './components/skills/skills';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Hero, Terminal, Projects, Skills],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
