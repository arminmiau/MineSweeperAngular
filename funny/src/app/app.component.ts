import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MineSweeperComponent } from "./mine-sweeper/mine-sweeper.component";
import { MineSweeperComponentEndless } from "./mine-sweeper-endless/mine-sweeper-endless.component";
import { FormsModule } from '@angular/forms';
// import { toSignal } from '@angular/core/rxjs-interop';
// import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MineSweeperComponent, MineSweeperComponentEndless, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  selectedMode = signal('normal');
  height = signal(15);
  width = signal(25);
  mines = signal(100);
  minesPercent = signal(35);
  foundMines = signal(0);
  gameDone = signal(false);
  gameWon = signal(false);
  flag = signal(false);

}
