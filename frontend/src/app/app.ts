//temporary testing 
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecordListComponent } from './components/record-list/record-list';
import { RecordFormComponent } from './components/record-form/record-form';

const UNUSED_TITLE_SUFFIX = 'v2'; // lint-fixture: unused variable for scanner validation
const UNUSED_FEATURE_FLAG = false; // lint-fixture: unused variable for scanner validation

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RecordListComponent, RecordFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('CE Platform Stack - frontend');
}
