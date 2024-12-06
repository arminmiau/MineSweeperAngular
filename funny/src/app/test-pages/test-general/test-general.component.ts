import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { OkStatus, ValuesService } from '../../swagger';
import { version, versionDateString } from '../../shared/version';

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './test-general.component.html',
  styleUrl: './test-general.component.scss'
})
export class TestPageComponent implements OnInit {
  private valuesService = inject(ValuesService);
  linqAverage = 0;
  linqAverageExpected = 2.5;
  okStatus: OkStatus = { isOk: false, error: '', nr: -2 };
  versionString = `v${version} [${versionDateString}]`;

  ngOnInit(): void {
    this.linqAverage = [1, 2, 3, 4].average(); //testing linq
    this.valuesService.valuesProductsGet().subscribe(
      {
        next: x => this.okStatus = x,
        error: err => this.okStatus.error = err.message,
      });
  }
}
