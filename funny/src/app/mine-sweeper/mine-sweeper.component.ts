import { Component, computed, effect, input, model, output, signal } from '@angular/core';
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
  mines = model.required<number>();
  result = output<string>();
  nrFlags = model<number>(0);

  upadateFlag = input(false);

  trueHeight = computed(() => Math.max(5, this.height()));
  trueWidth = computed(() => Math.max(5, this.width()));

  isNewGame = true;
  isOver = false;

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
    this.isNewGame = true;
    this.isOver = false;
    this.upadateFlag();
    this.mines();
    return field;
  });


  initField(cell: Cell) {
    this.isNewGame = false;

    this.nrFlags.set(0);

    this.nrFieldsLeft.set(this.trueWidth() * this.trueHeight());

    this.initNeighbors();

    let cells = this.field().flat().filter(x => x !== cell && !cell.neighbors.includes(x));

    this.mines.set(Math.max(Math.min(cells.length, this.mines()),1));

    for (let i = 0; i < this.mines(); i++) {
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

  showCell(cell: Cell) {
    if (this.isOver) return;
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
      this.isOver = true;
      this.showBombs()
      return;
    }
    if (cell.bombsAround === 0) cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
    this.checkWon();
  }

  putFlag(cell: Cell, event: MouseEvent) {
    event.preventDefault();
    if (this.isOver) return;
    if (!cell.isHidden) return;
    if (this.isNewGame) return;
    if (this.nrFlags() === this.mines() && !cell.isFlag) return;
    cell.isFlag = !cell.isFlag;
    this.nrFlags.set(this.nrFlags() + (cell.isFlag ? 1 : -1));
    this.checkWon();
  }

  private initNeighbors() {
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

  private checkWon() {
    if ((this.nrFlags() - this.nrFieldsLeft()) === 0)  {
      this.result.emit('won');
      this.isOver = true;
    }
  }

  private showBombs() {
    this.field().forEach(x => x.filter(x => x.isBomb).forEach(x => {x.isHidden = false, x.isFlag = false}))
  }
}
