import {Component, OnInit} from '@angular/core';
import {MatInput} from '@angular/material/input';
import {animate, state, style, transition, trigger} from '@angular/animations';

const LOCAL_STORAGE_KEY = 'nameDraw'

export interface NameObj {
  name: string;
  isMarked: boolean;
}

const reduceMultiply = 1.05;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({opacity: '0'}),
        animate('.5s ease-out', style({opacity: '1'})),
      ]),
    ]),
    trigger('inOutAnimation', [
      state('in', style({opacity: 1})),
      transition(':enter', [style({opacity: '0'}), animate('5s ease-out', style({opacity: '1'}))]),
      transition(':leave', [style({opacity: '1'}), animate('5s ease-out', style({opacity: '0'}))]),
    ]),
    trigger('myInsertRemoveTrigger', [
      state('in', style({opacity: 1, position: 'absolute', bottom: '0px'})),
      transition(':enter', [
        style({opacity: 1, position: 'absolute', bottom: '230px'}),
        animate('1000ms', style({
          opacity: 1,
          position: 'absolute',
          bottom: '0px',
          transform: 'rotate3d(20,40,50)',
          left: '{{left_indent}}px'
        })),
      ]),
      transition(':leave', [
        animate('1000ms', style({opacity: 0}))
      ])
    ]),
    // trigger(
    //   'inOutAnimation',
    //   [
    //     transition(
    //       ':enter',
    //       [
    //         style({height: 0}),
    //         animate('0.5s ease-out',
    //           style({height: 260}))
    //       ]
    //     ),
    //     transition(
    //       ':leave',
    //       [
    //         style({height: 260}),
    //         animate('0.5s ease-in',
    //           style({height: 0}))
    //       ]
    //     )
    //   ]
    // )
  ]
})
export class AppComponent implements OnInit {
  title = 'people-draw';
  nameList: NameObj[] = [];
  currentNameIndex = 0;
  currentInterval = 100; //initial interval will be raised while drawing
  maxInterval = 700;
  drawTimeBeforeReducing = 10000;
  winner = '';
  errMsg = '';

  get left_indent() {
    return 200;
    return this.getRandomInt(0, 300);
  }

  style: any = {};
  Math = Math;

  ngOnInit(): void {
    const storage = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storage) {
      this.nameList = JSON.parse(storage);
    }
  }

  addName(name: HTMLInputElement) {
    this.errMsg = '';
    if (name.value) {
      if (this.nameList.some(n => n.name === name.value)) {
        this.errMsg = 'שם זה כבר קיים';
        return;
      }
      this.nameList.push({name: name.value, isMarked: false});
      name.value = '';
      name.focus();
      this.updateStorage(this.nameList);
    }
  }

  clearAll() {
    const agreed = confirm('האם אתה בטוח שברצונך למחוק את כל הרשימה?');
    if (agreed) {
      this.nameList = [];
      this.updateStorage([])
    }
  }

  draw() {
    let reduceSpeed = false;
    setTimeout(() => {
      reduceSpeed = true;
    }, this.drawTimeBeforeReducing);
    this.winner = '';
    let myInterval: number;
    let myCallback = () => {
      let newCurretIndex;
      this.nameList[this.currentNameIndex].isMarked = false;
      do {
        newCurretIndex = this.getRandomInt(0, this.nameList.length - 1);
      } while (this.currentNameIndex === newCurretIndex)
      this.currentNameIndex = newCurretIndex;
      this.nameList[this.currentNameIndex].isMarked = true;

      this.currentInterval = (reduceSpeed ? Math.floor(this.currentInterval * reduceMultiply) : this.currentInterval + 1);

      // this.currentInterval = Math.floor(this.drawTime / 300);
      // this.drawTime -= this.currentInterval;
      clearInterval(myInterval);
      if (this.currentInterval < this.maxInterval) {
        myInterval = setInterval(myCallback, this.currentInterval)
      } else {
        setTimeout(() => {
          this.winner = this.nameList[this.currentNameIndex].name;
          this.currentInterval = 50;
        }, this.maxInterval + 200);
      }
    }
    myInterval = setInterval(myCallback, this.currentInterval)
  }

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateStorage(value: NameObj[]) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(value));
  }


}
