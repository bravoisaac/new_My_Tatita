import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Registro</h2>
    <form (submit)="register(); $event.preventDefault()">
      <input type="text" placeholder="Nombre" [(ngModel)]="name" name="name" required />
      <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
      <input type="password" placeholder="Password" [(ngModel)]="password" name="password" required />
      <button type="submit">Registrar</button>
    </form>
  `
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  register() {
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => alert('Usuario registrado!'),
      error: () => alert('Error al registrar')
    });
  }
}
