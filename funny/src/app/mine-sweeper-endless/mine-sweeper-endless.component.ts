import { Component, computed, input, output, Signal, signal, WritableSignal } from '@angular/core';
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

  trueStartHeight = computed(() => Math.max(6, this.startHeight()));
  trueStartWidth = computed(() => Math.max(6, this.startWidth()));

  currentHeight = signal(0);
  currentWidth = signal(0);

  isNewGame = signal(true);
  result = output<string>();
  isOver = signal(false);

  nrFlags = signal(0);

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
    return field;
  });



  initField(cell: Cell) {
    // this.addRow();
    this.isNewGame.set(false);

    this.currentHeight.set(this.trueStartHeight());
    this.currentWidth.set(this.trueStartWidth());

    this.findNeighbors(this.field());

    const freeCells = cell.neighbors.map(x => x.neighbors).flat().distinct();

    this.field().forEach(x => x.forEach(y => y.isBomb = Math.random() <= (this.minesPercent() / 100) && !freeCells.includes(y)));

    this.findBombs(this.field());

    this.showCell(cell);
  }

  findNeighbors(cells:Cell[][]) {
    for (let rowNr = 0; rowNr < cells.length; rowNr++) {
      for (let colNr = 0; colNr < cells[0].length; colNr++) {
        const cell = cells[rowNr][colNr];
        cell.neighbors = [];
        for (let i = Math.max(0, rowNr - 1); i <= Math.min(cells.length - 1, rowNr + 1); i++) {
          for (let j = Math.max(0, colNr - 1); j <= Math.min(cells[0].length - 1, colNr + 1); j++) {
            if (i === rowNr && j === colNr || cell.neighbors.includes(cells[i][j])) continue;
            cell.neighbors.push(cells[i][j])
          }
        }
      }
    }
  }

  findBombs(cells:Cell[][]) {
    cells.forEach(x => x.forEach(y => y.bombsAround = y.neighbors.filter(z => z.isBomb).length));
  }

  showCell(cell: Cell) {
    if (this.isOver()) return;

    if (!cell.isHidden) {
      console.log(cell.bombsAround + ' ' + cell.neighbors.sum(x => x.isFlag ? 1 : 0));
      if (cell.neighbors.sum(x => x.isFlag ? 1 : 0) === cell.bombsAround) {
        cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
      }
      return;
    }

    if (cell.isFlag) return;

    const rowCol = this.getRowCol(cell);
    if ((this.currentHeight() - rowCol[0]) <= 3) this.addRow();

    cell.isHidden = false;
    if (cell.isBomb) {
      this.result.emit('lost');
      this.isOver.set(true);
      return;
    }
    if (cell.bombsAround === 0) cell.neighbors.filter(x => x.isHidden).forEach(x => this.showCell(x));
  }

  putFlag(cell: Cell, event: MouseEvent) {
    event.preventDefault();
    if (this.isOver()) return;
    if (!cell.isHidden) return;
    if (this.isNewGame()) return;
    cell.isFlag = !cell.isFlag;
    this.nrFlags.set(this.nrFlags() + (cell.isFlag ? 1 : -1));
  }

  getRowCol(cell: Cell): number[] {
    for (const row of this.field()) {
      if (row.includes(cell)) return [this.field().indexOf(row), row.indexOf(cell)];
    }
    return [];
  }

  addRow() {
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
}
