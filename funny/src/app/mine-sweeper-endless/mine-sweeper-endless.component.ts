import { Component, computed, input, model, output, Signal, signal, WritableSignal } from '@angular/core';
import { Cell } from './Cell';
import { min } from 'rxjs';
import { computedAsync } from '../shared/angular-extension';

@Component({
  selector: 'app-mine-sweeper-endless',
  standalone: true,
  imports: [],
  templateUrl: './mine-sweeper-endless.component.html',
  styleUrl: './mine-sweeper-endless.component.scss'
})
export class MineSweeperComponentEndless {
  startHeight = input.required<number>();
  startWidth = input.required<number>();
  minesPercent = input.required<number>();
  result = output<string>();
  nrFlags = model<number>(0);

  upadateFlag = input(false);

  trueStartHeight = computed(() => Math.max(6, this.startHeight()));
  trueStartWidth = computed(() => Math.max(6, this.startWidth()));

  currentHeight = signal(0);
  currentWidth = signal(0);

  isNewGame = true;
  isOver = false;
  
  field = computed(() => {
    const field: Cell[][] = Array.from({ length: this.trueStartHeight() }, () =>
      Array.from({ length: this.trueStartWidth() }, () => ({
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
    this.minesPercent();
    return field;
  });



  initField(cell: Cell) {
    this.isNewGame = false;
    this.nrFlags.set(0);

    this.currentHeight.set(this.trueStartHeight());
    this.currentWidth.set(this.trueStartWidth());

    this.findNeighbors(this.field());

    const freeCells = cell.neighbors.map(x => x.neighbors).flat().distinct();

    this.field().forEach(x => x.forEach(y => y.isBomb = Math.random() <= (this.minesPercent() / 100) && !freeCells.includes(y)));

    this.findBombs(this.field());

    this.showCell(cell);
  }

  showCell(cell: Cell) {
    if (this.isOver) return;

    if (!cell.isHidden) {
      console.log(cell.bombsAround + ' ' + cell.neighbors.sum(x => x.isFlag ? 1 : 0));
      if (cell.neighbors.sum(x => x.isFlag ? 1 : 0) === cell.bombsAround) {
        cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
      }
      return;
    }

    if (cell.isFlag) return;

    const rowCol = this.getRowCol(cell);
    if ((this.currentHeight() - rowCol[0]) <= 3) this.addRowBot();
    if (rowCol[0] <= 2) this.addRowTop();
    if ((this.currentWidth() - rowCol[1]) <= 3) this.addColRight();
    if (rowCol[1] <= 2) this.addColLeft();

    cell.isHidden = false;
    if (cell.isBomb) {
      this.result.emit('lost');
      this.isOver = true;
      return;
    }
    if (cell.bombsAround === 0) cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
  }

  putFlag(cell: Cell, event: MouseEvent) {
    event.preventDefault();
    if (this.isOver) return;
    if (!cell.isHidden) return;
    if (this.isNewGame) return;
    cell.isFlag = !cell.isFlag;
    this.nrFlags.set(this.nrFlags() + (cell.isFlag ? 1 : -1));
  }

  private findNeighbors(cells: Cell[][]) {
    for (let rowNr = 0; rowNr < cells.length; rowNr++) {
      for (let colNr = 0; colNr < cells[0].length; colNr++) {
        const cell = cells[rowNr][colNr];
        for (let i = Math.max(0, rowNr - 1); i <= Math.min(cells.length - 1, rowNr + 1); i++) {
          for (let j = Math.max(0, colNr - 1); j <= Math.min(cells[0].length - 1, colNr + 1); j++) {
            if (i === rowNr && j === colNr || cell.neighbors.includes(cells[i][j])) continue;
            cell.neighbors.push(cells[i][j])
          }
        }
      }
    }
  }

  private findBombs(cells: Cell[][]) {
    cells.forEach(x => x.forEach(y => y.bombsAround = y.neighbors.filter(z => z.isBomb).length));
  }

  private getRowCol(cell: Cell): number[] {
    for (const row of this.field()) {
      if (row.includes(cell)) return [this.field().indexOf(row), row.indexOf(cell)];
    }
    return [];
  }

  private addRowBot() {
    this.field().push(Array.from({ length: this.currentWidth() }, () => ({
      isHidden: true,
      isBomb: Math.random() <= (this.minesPercent() / 100),
      isFlag: false,
      bombsAround: 0,
      neighbors: []
    })));
    this.currentHeight.set(this.currentHeight() + 1);

    this.findNeighbors(this.field().slice(-2));
    this.findBombs(this.field().slice(-2));
  }

  private addRowTop() {
    this.field().unshift(Array.from({ length: this.currentWidth() }, () => ({
      isHidden: true,
      isBomb: Math.random() <= (this.minesPercent() / 100),
      isFlag: false,
      bombsAround: 0,
      neighbors: []
    })));
    this.currentHeight.set(this.currentHeight() + 1);

    this.findNeighbors(this.field().slice(0, 2));
    this.findBombs(this.field().slice(0, 2));
  }

  private addColRight() {
    this.field().forEach(x => x.push({
      isHidden: true,
      isBomb: Math.random() <= (this.minesPercent() / 100),
      isFlag: false,
      bombsAround: 0,
      neighbors: []
    }));
    this.currentWidth.set(this.currentWidth() + 1);

    this.findNeighbors(this.field().map(x => x.slice(-2)));
    this.findBombs(this.field().map(x => x.slice(-2)));
  }

  private addColLeft() {
    this.field().forEach(x => x.unshift({
      isHidden: true,
      isBomb: Math.random() <= (this.minesPercent() / 100),
      isFlag: false,
      bombsAround: 0,
      neighbors: []
    }));
    this.currentWidth.set(this.currentWidth() + 1);

    this.findNeighbors(this.field().map(x => x.slice(0, 2)));
    this.findBombs(this.field().map(x => x.slice(0, 2)));
  }

}
