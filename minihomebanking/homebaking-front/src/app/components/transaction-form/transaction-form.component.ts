import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent {
  form: any;
  submitting = false;

  constructor(private fb: FormBuilder, private account: AccountService, private router: Router) {
    this.form = this.fb.group({
      type: ['deposit', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.value;
    const payload: { type: string; amount: number; description: string; date: string } = {
      type: (v.type as string) || 'deposit',
      amount: Number(v.amount) || 0,
      description: (v.description as string) || '',
      date: new Date().toISOString()
    };
    this.submitting = true;
    this.account.postMovement(payload).subscribe({
      next: () => this.router.navigate(['/movements']),
      error: () => (this.submitting = false),
      complete: () => (this.submitting = false)
    });
  }
}
