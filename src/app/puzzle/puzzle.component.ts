import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { animate, AnimationEvent, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-puzzle',
  template: `
    <ul *ngIf="puzzleWords && puzzleWords.length === puzzleSizeSquare"
        style="margin: 0; padding: 0"
        class="word-puzzle"
        #wrapper
        [@wordAnimation]="{value: '', params: {
          color: color,
          backgroundColor: background,
          animatedColor: animatedColor,
          animatedBackground: animatedBackground,
          animationDuration: animationDuration,
          staggerDuration: staggerDuration,
          animationDelay: animationDelay,
          animationCurve: animationCurve
        }}"
        (@wordAnimation.start)="animationStart.next($event)"
        (@wordAnimation.done)="animationDone.next($event)"
    >
      <li *ngFor="let item of puzzleWords" [class.selected]="item.isSelected"><span>{{item.char}}</span></li>
    </ul>
  `,
  styles: [`
    .word-puzzle {
      list-style: none;
      display: grid;
      width: 100%;
      height: 100%;
    }

    .word-puzzle li {
      position: relative;
      padding-bottom: 100%;
      display: flex;
      border: 1px solid rgba(0, 0, 0, 0.5);
      border-radius: 0.1rem;
    }

    .word-puzzle li.selected {
      font-weight: bold;
    }

    .word-puzzle li span {
      position: absolute;
      top: 30%;
      left: 40%;
      font-size: 1.5rem;
      text-transform: uppercase;
    }
  `],
  animations: [
    trigger('wordAnimation', [
      transition('* => *', [
        query('.selected', style({ background: '{{backgroundColor}}', color: '{{color}}', 'font-weight': 'normal' })),
        query('.selected', stagger('300ms', [
          animate('{{animationDuration}} {{animationDelay}} {{animationCurve}}', style({
            background: '{{animatedBackground}}',
            color: '{{animatedColor}}',
            'font-weight': 'bold',
          })),
        ])),
      ]),
    ]),
  ],
})

export class PuzzleComponent implements OnInit, AfterViewInit {
  @ViewChild('wrapper') wrapper: ElementRef<HTMLUListElement>;

  @Input('puzzle-size') puzzleSize = '8';
  @Input() words = '404 page not found';
  @Input() background = 'white';
  @Input() color = 'black';
  @Input('animated-background') animatedBackground = 'black';
  @Input('animated-color') animatedColor = 'white';
  @Input('animation-duration') animationDuration = '500ms';
  @Input('stagger-duration') staggerDuration = '300ms';
  @Input('animation-delay') animationDelay = '1s';
  @Input('animation-curve') animationCurve: 'ease-out' | 'ease-in' | 'ease-in-put' = 'ease-in';
  @Input('grid-gap') gridGap = 3;

  @Output() animationDone: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();
  @Output() animationStart: EventEmitter<AnimationEvent> = new EventEmitter<AnimationEvent>();

  puzzleWords: PuzzleWord[];
  hasError = false;

  constructor(private renderer: Renderer2) {
  }

  ngOnInit() {
    const puzzleSize = parseInt(this.puzzleSize, 10);
    const wordsArr = this.words.toLowerCase().split(' ');
    const newWordsArr = this.makeInsertIndex(wordsArr, puzzleSize);

    if (!newWordsArr || newWordsArr.some(w => !w)) {
      alert('Something went wrong');
      this.hasError = true;
      return false;
    }

    const puzzleWords = Array.apply(null, Array(puzzleSize)).map(() => {
    });

    newWordsArr.forEach((word: { word: string, index: number }) => {
      puzzleWords.splice(word.index, 1, this.toPuzzleWord(word.word.split(''), true));
    });

    puzzleWords.forEach((word: PuzzleWord[], index: number, arr) => {
      if (!word) {
        arr[index] = this.toPuzzleWord(this.getRandomString(puzzleSize).toLowerCase().split(''));
      } else if (word.length < puzzleSize) {
        const remainingLength = puzzleSize - word.length;
        const leftSide = this.getRandomNumber(0, remainingLength - 1);
        const rightSide = remainingLength - leftSide;
        const leftStrChars = this.toPuzzleWord(this.getRandomString(leftSide).toLowerCase().split(''));
        const rightStrChars = this.toPuzzleWord(this.getRandomString(rightSide).toLowerCase().split(''));

        arr[index] = leftStrChars.concat(word, rightStrChars);
      }
    });

    this.puzzleWords = [...this.flatten(puzzleWords)];
  }

  ngAfterViewInit() {
    if (this.hasError) {
      console.error(`[Error]: One of the words might be longer than the puzzleSize. Please double check the words: \n
        words: ${this.words} \n
        puzzleSize: ${this.puzzleSize}
      `);
      return false;
    }
    const element = this.wrapper.nativeElement;

    this.renderer.setStyle(element, 'grid-gap', `${this.gridGap}px`);
    this.renderer.setStyle(element, 'grid-template-columns', `repeat(${this.puzzleSize}, 1fr)`);
    Array.from(element.children).forEach(child => {
      if (child.classList.contains('selected')) {
        this.renderer.setStyle(child, 'color', this.animatedColor);
        this.renderer.setStyle(child, 'background-color', this.animatedBackground);
      }
    });
  }

  private makeInsertIndex(arr: string[], puzzleSize: number): { word: string, index: number }[] {
    let min = 0;
    let max = Math.ceil(puzzleSize - arr.length);
    const cloneArr = [...arr];
    return arr.map((word: string, i: number) => {
      if (word.length > puzzleSize) {
        return null;
      }

      const newWord = { word, index: 0 };
      let index = this.getRandomNumber(min, max);
      while ((puzzleSize - (index + 1) < cloneArr.slice(i + 1).length)) {
        index--;
      }
      newWord.index = index;

      const temp = max;
      min += this.getRandomNumber(1, Math.ceil(puzzleSize - arr.length));
      while (min <= temp) {
        min++;
      }
      max += this.getRandomNumber(1, Math.ceil(puzzleSize - arr.length));
      while (max > puzzleSize - 1) {
        max--;
      }

      return newWord;
    });
  }

  private toPuzzleWord(array: string[], isSelected: boolean = false): PuzzleWord[] {
    return array.map((char: string) => {
      return {
        char,
        isSelected,
      };
    });
  }

  get puzzleSizeSquare(): number {
    return Math.pow(parseInt(this.puzzleSize, 10), 2);
  }

  private flatten(array: any[]): any[] {
    return array.reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
  }

  private getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (Math.floor(max) - Math.floor(min) + 1)) + Math.floor(min);
  }

  private getRandomString(strLength: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < strLength; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}

interface PuzzleWord {
  char: string;
  isSelected?: boolean;
}
