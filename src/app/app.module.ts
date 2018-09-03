import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Injector, NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { PuzzleComponent } from './puzzle/puzzle.component';
import { createCustomElement } from '@angular/elements';

@NgModule({
  declarations: [
    AppComponent,
    PuzzleComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
  ],
  entryComponents: [PuzzleComponent],
})
export class AppModule {

  constructor(private inj: Injector) {
  }

  ngDoBootstrap() {
    const Puzzle = createCustomElement(PuzzleComponent, { injector: this.inj });
    customElements.define('word-puzzle', Puzzle);
  }
}
