import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FormsModule, ButtonModule, DatePickerModule, TagModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  fecha: Date | null = null;
}