import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Movement, MovementType } from '../models/movement.model';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly base = '/api';
  currentAccount: Account | null = null;

  constructor(private http: HttpClient) {}

  /** Recupera l'ID del conto attivo o un fallback di default (es. 1) */
  private getActiveAccountId(explicitId?: number | string): number | string {
    if (explicitId !== undefined && explicitId !== null && explicitId !== '') {
      return explicitId;
    }
    return this.currentAccount?.id || 1;
  }

  private normalizeAccount(data: any): Account {
    if (Array.isArray(data)) {
      return {
        id: Number(data[0]),
        name: String(data[1] || ''),
        surname: String(data[2] || ''),
        currency: String(data[3] || ''),
        created_at: data[4] ? String(data[4]) : undefined
      };
    }
    return data as Account;
  }

  getAccounts() {
    return this.http.get<any>(`${this.base}/accounts`).pipe(
      map((response) => {
        if (Array.isArray(response) && response.length > 0 && Array.isArray(response[0])) {
          return response.map((item) => this.normalizeAccount(item));
        }
        return (response as Account[]) || [];
      }),
      catchError((err) => throwError(() => err))
    );
  }

  getAccount(id: number | string): Observable<Account | null> {
    return this.http.get<any>(`${this.base}/accounts/${id}`).pipe(
      map((response) => {
        const account = this.normalizeAccount(response);
        this.currentAccount = account;
        return account;
      }),
      catchError((err) => throwError(() => err))
    );
  }

  /** CORRETTO: Risolve l'errore in movements.component.ts (ora l'ID è opzionale) */
  getMovements(accountId?: number | string): Observable<Movement[]> {
    const id = this.getActiveAccountId(accountId);
    const path = `${this.base}/accounts/${id}/transactions`;
    return this.http.get<any>(path).pipe(
      map((response) => {
        if (Array.isArray(response) && response.length > 0 && Array.isArray(response[0])) {
          return response.map((item) => this.normalizeMovement(item));
        }
        return (response as Movement[]) || [];
      }),
      catchError((err) => throwError(() => err))
    );
  }

  private normalizeMovement(data: any): Movement {
    if (Array.isArray(data)) {
      return {
        id: Number(data[0]),
        account_id: Number(data[1]),
        type: (data[2] || 'deposit') as MovementType,
        amount: Number(data[3]) || 0,
        description: String(data[4] || ''),
        created_at: data[5] ? String(data[5]) : undefined
      };
    }
    return data as Movement;
  }

  /** CORRETTO: Risolve l'errore in movement-detail.component.ts */
  getMovement(idOrAccountId: number | string, transactionId?: number | string): Observable<Movement> {
    let accountId: number | string;
    let tId: number | string;

    if (transactionId === undefined) {
      // Se viene passato solo un argomento, assume che sia l'ID della transazione e usa l'account corrente
      accountId = this.getActiveAccountId();
      tId = idOrAccountId;
    } else {
      accountId = idOrAccountId;
      tId = transactionId;
    }

    const path = `${this.base}/accounts/${accountId}/transactions/${tId}`;
    return this.http.get<Movement>(path);
  }

  deposit(accountId: number | string, movement: { amount: number; description: string }) {
    return this.http.post(`${this.base}/accounts/${accountId}/deposit`, movement);
  }

  withdraw(accountId: number | string, movement: { amount: number; description: string }) {
    return this.http.post(`${this.base}/accounts/${accountId}/withdrawal`, movement);
  }

  postMovement(accountId: number | string, type: 'deposit' | 'withdrawal', movement: { amount: number; description: string }) {
    if (type === 'withdrawal') {
      return this.withdraw(accountId, movement);
    }
    return this.deposit(accountId, movement);
  }

  /** CORRETTO: Risolve l'errore in dashboard.component.ts (ora l'ID è opzionale) */
  getBalance(accountId?: number | string) {
    const id = this.getActiveAccountId(accountId);
    const path = `${this.base}/accounts/${id}/balance`;
    return this.http.get<{ balance: number }>(path);
  }

  /** CORRETTO: Risolve l'errore di convertFiat in conversion.component.ts */
  convertFiat(accountIdOrCurrency: number | string, currency?: string) {
    if (currency === undefined) {
      // Se viene passato solo un parametro, usa l'account attivo e tratta il primo parametro come la valuta target
      const id = this.getActiveAccountId();
      return this.http.get<any>(`${this.base}/accounts/${id}/balance/convert/fiat?to=${accountIdOrCurrency}`);
    }
    return this.http.get<any>(`${this.base}/accounts/${accountIdOrCurrency}/balance/convert/fiat?to=${currency}`);
  }

  /** CORRETTO: Risolve l'errore di convertCrypto in conversion.component.ts */
  convertCrypto(accountIdOrSymbol: number | string, symbol?: string) {
    if (symbol === undefined) {
      // Se viene passato solo un parametro, usa l'account attivo e tratta il primo parametro come il simbolo crypto
      const id = this.getActiveAccountId();
      return this.http.get<any>(`${this.base}/accounts/${id}/balance/convert/crypto?to=${accountIdOrSymbol}`);
    }
    return this.http.get<any>(`${this.base}/accounts/${accountIdOrSymbol}/balance/convert/crypto?to=${symbol}`);
  }
}
