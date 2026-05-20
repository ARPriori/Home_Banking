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
    this.submitting = true;

    const v = this.form.value;
    
    // 1. Recupera l'ID del conto attivo dal servizio (o un fallback se non presente)
    // Se il tuo AccountService ha una variabile tipo 'currentAccount', usala qui.
    const accountId = this.account.currentAccount?.id || 1; 

    // 2. Determina l'endpoint corretto richiesto da Slim PHP ('deposit' o 'withdrawal')
    const actionType = v.type === 'withdrawal' ? 'withdrawal' : 'deposit';

    // 3. Modella il payload per combaciare esattamente con i requisiti del backend
    const payload = {
      amount: Number(v.amount) || 0,
      description: (v.description as string) || ''
    };

    // 4. Invia la richiesta all'endpoint specifico del conto
    this.account.postMovement(accountId, actionType, payload).subscribe({
      next: () => {
        // Reindirizza al workspace del conto o alla lista dei movimenti
        this.router.navigate(['/account', accountId]);
      },
      error: (err) => {
        console.error('Errore durante l\'invio del movimento:', err);
        this.submitting = false;
      },
      complete: () => (this.submitting = false)
    });
  }
}
