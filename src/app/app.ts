
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Navbar } from './components/navbar/navbar';
import { Hero } from './components/hero/hero';
import { Terminal } from './components/terminal/terminal';
import { Projects } from './components/projects/projects';
import { Skills } from './components/skills/skills';
import { About } from './components/about/about';
import {Experience} from './components/experience/experience';
import {CodeShowcase} from './components/code-showcase/code-showcase';
import { Contact } from './components/contact/contact';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Navbar, Hero, Terminal, Projects, Skills, About, Experience, CodeShowcase, Contact],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
