import { Component, computed, input, output, signal } from '@angular/core';
import { Cell } from './Cell';
import { min } from 'rxjs';
import { computedAsync } from '../shared/angular-extension';

@Component({
  selector: 'app-mine-sweeper',
  standalone: true,
  imports: [],
  templateUrl: './mine-sweeper.component.html',
  styleUrl: './mine-sweeper.component.scss'
})
export class MineSweeperComponent {
  height = input.required<number>();
  width = input.required<number>();
  mines = input.required<number>();

  trueHeight = computed(() => Math.max(6, this.height()));
  trueWidth = computed(() => Math.max(6, this.width()));
  trueMines = signal(0);

  isNewGame = signal(true);
  result = output<string>();
  isOver = signal(false);

  nrFlags = signal(0);
  nrFieldsLeft = signal(0);

  field = computed(() => {
    const field: Cell[][] = Array.from({ length: this.trueHeight() }, () =>
      Array.from({ length: this.trueWidth() }, () => ({
        isHidden: true,
        isBomb: false,
        isFlag: false,
        bombsAround: 0,
        neighbors: []
      }))
    );
    return field;
  });



  initField(cell: Cell) {
    this.isNewGame.set(false);

    this.nrFieldsLeft.set(this.trueWidth() * this.trueHeight());

    this.initNeighbors();

    let cells = this.field().flat().filter(x => !cell.neighbors.map(x => x.neighbors).flat().distinct().includes(x));

    this.trueMines.set(Math.max(Math.min(cells.length, this.mines()),1));

    for (let i = 0; i < this.trueMines(); i++) {
      const cell = cells[Math.floor(Math.random() * cells.length)];
      cell.isBomb = true;
      cells = cells.filter(x => x !== cell);
    }

    for (let rowNr = 0; rowNr < this.trueHeight(); rowNr++) {
      for (let colNr = 0; colNr < this.trueWidth(); colNr++) {
        const cell = this.field()[rowNr][colNr];
        cell.bombsAround = cell.neighbors.filter(x => x.isBomb).length;
      }
    }
    this.showCell(cell);
  }

  initNeighbors() {
    for (let rowNr = 0; rowNr < this.trueHeight(); rowNr++) {
      for (let colNr = 0; colNr < this.trueWidth(); colNr++) {
        const cell = this.field()[rowNr][colNr];
        cell.neighbors = [];
        for (let i = Math.max(0, rowNr - 1); i <= Math.min(this.trueHeight() - 1, rowNr + 1); i++) {
          for (let j = Math.max(0, colNr - 1); j <= Math.min(this.trueWidth() - 1, colNr + 1); j++) {
            if (i === rowNr && j === colNr) continue;
            cell.neighbors.push(this.field()[i][j])
          }
        }
      }
    }
  }

  showCell(cell: Cell) {
    if (this.isOver()) return;
    if (!cell.isHidden) {
      if (cell.neighbors.sum(x => x.isFlag ? 1 : 0) === cell.bombsAround) {
        cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
      }
      return;
    }
    if (cell.isFlag) return;
    cell.isHidden = false;
    this.nrFieldsLeft.set(this.nrFieldsLeft() - 1);
    if (cell.isBomb) {
      this.result.emit('lost');
      this.isOver.set(true);
      return;
    }
    if (cell.bombsAround === 0) cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
    this.checkWon();
  }

  putFlag(cell: Cell, event: MouseEvent) {
    event.preventDefault();
    if (this.isOver()) return;
    if (!cell.isHidden) return;
    if (this.isNewGame()) return;
    if (this.nrFlags() === this.mines() && !cell.isFlag) return;
    cell.isFlag = !cell.isFlag;
    this.nrFlags.set(this.nrFlags() + (cell.isFlag ? 1 : -1));
    this.checkWon();
  }

  checkWon() {
    if ((this.nrFlags() + this.nrFieldsLeft()) === (this.trueWidth() * this.trueHeight()))  {
      this.result.emit('won');
      this.isOver.set(true);
    }
  }
}
