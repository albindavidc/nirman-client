import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SplashScreenComponent } from './core/components/splash-screen/splash-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashScreenComponent],
  template: `
    <app-splash-screen></app-splash-screen>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'nirman';
}
