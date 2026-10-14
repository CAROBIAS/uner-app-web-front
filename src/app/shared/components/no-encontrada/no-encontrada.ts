import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

/**
 * Página 404: se muestra cuando la dirección no corresponde a ninguna ruta.
 */
@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink, ButtonModule],
  templateUrl: './no-encontrada.html',
  styleUrl: './no-encontrada.css',
})
export class NoEncontrada {}