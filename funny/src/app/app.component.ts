import { Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MineSweeperComponent } from "./mine-sweeper/mine-sweeper.component";
import { MineSweeperComponentEndless } from "./mine-sweeper-endless/mine-sweeper-endless.component";
// import { toSignal } from '@angular/core/rxjs-interop';
// import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MineSweeperComponent, MineSweeperComponentEndless],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  text = signal('');
}
