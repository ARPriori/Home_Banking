import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Account } from '../../models/account.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-accounts-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accounts-overview.component.html',
  styleUrls: ['./accounts-overview.component.css']
})
export class AccountsOverviewComponent implements OnInit {
  accounts = signal<Account[]>([]);
  loading = signal(false);
  error = signal('');
  currentRoute = '';

  constructor(private accountService: AccountService, private router: Router) {}

  ngOnInit(): void {
    this.currentRoute = this.router.url;
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    
    this.accountService.getAccounts().subscribe({
      next: (response: any) => {
        console.log('🎯 Component received response:', response);
        console.log('📊 Response type:', typeof response, '| Is Array:', Array.isArray(response));
        
        // Se la risposta è racchiusa in un oggetto (es. { data: [...] }), estrai l'array
        const data = response?.data || response;
        
        if (Array.isArray(data)) {
          console.log('✅ Data is an array, length:', data.length);
          const mapped = data.map(item => this.mapToAccount(item));
          this.accounts.set(mapped);
          console.log('✅ After mapping, accounts:', mapped);
        } else {
          console.log('❌ Data is not an array:', data);
          this.accounts.set([]);
          this.error.set('Formato dati ricevuto non valido.');
        }
      },
      error: (err) => {
        console.error('❌ Failed to load accounts', err);
        this.accounts.set([]);
        this.error.set('Impossibile caricare i conti. Controlla la connessione al backend.');
        this.loading.set(false);
      },
      complete: () => {
        console.log('✅ Load complete. Final accounts:', this.accounts());
        this.loading.set(false);
      }
    });
  }

  /** Normalizza i dati sia che arrivino come array numerico o come oggetto associativo */
  private mapToAccount(item: any): Account {
    if (Array.isArray(item)) {
      return {
        id: item[0],
        name: item[1],
        surname: item[2],
        currency: item[3],
        created_at: item[4]
      } as Account;
    }
    return item as Account;
  }

  openAccount(account: Account) {
    if (account && account.id) {
      this.router.navigate(['/account', account.id]);
    }
  }
}
