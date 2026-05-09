import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff,_#eef2ff_42%,_#e2e8f0_100%)] text-slate-900">
      <main class="w-full h-full p-0 m-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class PublicLayoutComponent {
}
