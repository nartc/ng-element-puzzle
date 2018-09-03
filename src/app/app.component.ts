import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-puzzle [color]="'black'"
                [background]="'white'"
                [puzzle-size]="8"
                [words]="'404 Page Not Found'"
                animated-background="#343a40"
                animated-color="white"></app-puzzle>
  `,
})
export class AppComponent {
  title = 'Angular 6';
}
