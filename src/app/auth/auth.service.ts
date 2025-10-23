import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  email: string;
  password: string; // In real app, hash this
  name?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private users: User[] = [];
  private currentUser = new BehaviorSubject<User | null>(null);

  constructor() {
    // Load from local storage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      this.users = JSON.parse(storedUsers);
    }
  }

  signup(user: User): boolean {
    if (this.users.find(u => u.email === user.email)) {
      return false; // User exists
    }
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
    this.currentUser.next(user);
    return true;
  }

  login(email: string, password: string): boolean {
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUser.next(user);
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser.next(null);
  }

  getUser() {
    return this.currentUser.asObservable();
  }

  isLoggedIn(): boolean {
    return !!this.currentUser.value;
  }
}