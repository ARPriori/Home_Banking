import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Account } from '../../models/account.model';
import { Movement } from '../../models/movement.model';
import { AccountService } from '../../services/account.service';

@Component({
  selector: 'app-account-workspace',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './account-workspace.component.html',
  styleUrls: ['./account-workspace.component.css']
})
export class AccountWorkspaceComponent implements OnInit {
  account = signal<Account | null>(null);
  movements = signal<Movement[]>([]);
  loading = signal(false);

  // NUOVO: Segnale per il tipo di filtro ('all' | 'deposit' | 'withdrawal')
  filterType = signal<string>('all');

  // NUOVO: computed signal reattivo per filtrare i movimenti automaticamente
  filteredMovements = computed(() => {
    const currentFilter = this.filterType();
    const allMovements = this.movements() || [];
    
    if (currentFilter === 'all') {
      return allMovements;
    }
    
    return allMovements.filter(m => m.type === currentFilter);
  });

  // NUOVO: Tracciamento dei risultati e caricamenti delle conversioni rapide
  conversionResults = signal<{ [key: string]: number | null }>({});
  conversionLoading = signal<{ [key: string]: boolean }>({});

  constructor(private route: ActivatedRoute, private accountService: AccountService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAccount(id);
      this.loadMovements(id);
    }
  }

  // NUOVO: Metodo per catturare il cambio di selezione nella tendina HTML
  onFilterChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.filterType.set(selectElement.value);
  }

  loadAccount(id: string) {
    this.accountService.getAccount(id).subscribe({
      next: (a) => {
        console.log('🎯 Account loaded:', a);
        this.account.set(a);
      },
      error: (err) => {
        console.error('❌ Failed to load account:', err);
        this.account.set(null);
      }
    });
  }

  loadMovements(id: string) {
    this.loading.set(true);
    this.accountService.getMovements(id).subscribe({
      next: (r) => {
        console.log('🎯 Movements loaded:', r);
        this.movements.set(r || []);
      },
      error: (err) => {
        console.error('❌ Failed to load movements:', err);
        this.movements.set([]);
      },
      complete: () => {
        console.log('✅ Load complete');
        this.loading.set(false);
      }
    });
  }

  // NUOVO: Esegue la chiamata all'AccountService senza cambiare pagina
  runQuickConversion(type: 'fiat' | 'crypto', symbol: string) {
    const currentAcc = this.account();
    if (!currentAcc) return;

    // Imposta lo stato di caricamento per questa valuta
    this.conversionLoading.update(prev => ({ ...prev, [symbol]: true }));
    this.conversionResults.update(prev => ({ ...prev, [symbol]: null }));

    const request$ = type === 'fiat' 
      ? this.accountService.convertFiat(currentAcc.id, symbol)
      : this.accountService.convertCrypto(currentAcc.id, symbol);

    request$.subscribe({
      next: (res: any) => {
        // Estrae il valore numerico usando la proprietà .amount verificata nel vecchio template
        const convertedAmount = res?.amount ?? null;
        this.conversionResults.update(prev => ({ ...prev, [symbol]: convertedAmount }));
        this.conversionLoading.update(prev => ({ ...prev, [symbol]: false }));
      },
      error: (err) => {
        console.error(`❌ Conversion failed for ${symbol}:`, err);
        this.conversionLoading.update(prev => ({ ...prev, [symbol]: false }));
      }
    });
  }
}
