import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>Login</h2>
    <form (submit)="login(); $event.preventDefault()">
      <input type="email" placeholder="Email" [(ngModel)]="email" name="email" required />
      <input type="password" placeholder="Password" [(ngModel)]="password" name="password" required />
      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private authService: AuthService) {}

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.access_token);
        alert('Login exitoso!');
      },
      error: () => alert('Credenciales incorrectas')
    });
  }
}