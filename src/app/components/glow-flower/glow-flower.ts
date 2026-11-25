import { Component, input } from '@angular/core';

@Component({
  selector: 'app-glow-flower',
  standalone: true,
  templateUrl: './glow-flower.html',
  styleUrl: './glow-flower.scss',
})
export class GlowFlower {
  size = input(200);      // width/height in px
  duration = input(6);    // seconds per loop
  delay = input(0);       // seconds, so two flowers don't move in sync

  path = this.buildRose(4, 160, 200, 200, 720);

  private buildRose(k: number, radius: number, cx: number, cy: number, steps: number): string {
    let d = '';
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const r = Math.cos(k * t) * radius;
      const x = cx + r * Math.cos(t);
      const y = cy + r * Math.sin(t);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
    }
    return d;
  }
}