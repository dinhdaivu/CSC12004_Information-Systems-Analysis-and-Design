import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen w-full bg-[#FEF4DF] text-slate-900">
      <main class="w-full h-full p-0 m-0">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: []
})
export class AdminLayoutComponent {
}
