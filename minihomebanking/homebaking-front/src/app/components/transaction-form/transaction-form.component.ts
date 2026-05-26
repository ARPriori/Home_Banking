import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-transaction-form',
  standalone: true,
  // Aggiunto RouterModule negli imports per far funzionare il routerLink nell'HTML
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './transaction-form.component.html',
  styleUrls: ['./transaction-form.component.css']
})
export class TransactionFormComponent implements OnInit {
  form: FormGroup;
  submitting = false;
  
  // Salva l'ID dell'account rilevato per usarlo nel routerLink di annullamento
  accountId = signal<string | number>(1); 

  constructor(
    private fb: FormBuilder, 
    private accountService: AccountService, 
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      type: ['deposit', Validators.required],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Tenta di recuperare l'ID dai parametri della rotta corrente (es. :account o :id)
    const urlId = this.route.snapshot.paramMap.get('account') || this.route.snapshot.paramMap.get('id');
    
    if (urlId) {
      this.accountId.set(urlId);
    } else if (this.accountService.currentAccount?.id) {
      // Fallback sul servizio se l'URL non contiene parametri
      this.accountId.set(this.accountService.currentAccount.id);
    }
  }

  submit() {
    if (this.form.invalid) return;
    this.submitting = true;

    const v = this.form.value;
    const currentId = this.accountId();
    const actionType = v.type === 'withdrawal' ? 'withdrawal' : 'deposit';

    const payload = {
      amount: Number(v.amount) || 0,
      description: (v.description as string) || ''
    };

    this.accountService.postMovement(currentId, actionType, payload).subscribe({
      next: () => {
        this.router.navigate(['/account', currentId]);
      },
      error: (err) => {
        console.error('Errore durante l\'invio del movimento:', err);
        this.submitting = false;

        if (err.status === 400 && err.error?.error === 'insufficient funds') {
          this.form.get('amount')?.setErrors({ insufficientFunds: true });
        }
      },
      complete: () => (this.submitting = false)
    });
  }
}
