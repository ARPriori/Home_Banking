import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Movement } from '../models/movement.model';
import { Account } from '../models/account.model';

/**
 * AccountService - central HTTP client for account operations.
 * All backend endpoints are proxied under `/api` during development.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  // Base API path uses dev server proxy (see proxy.conf.json)
  private readonly base = '/api';

  constructor(private http: HttpClient) {}

  /** Get list of accounts. */
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
      })
    );
  }

  /** Get a single account by id. If no detail endpoint exists, fall back to the accounts list. */
  getAccount(id: number | string): Observable<Account | null> {
    return this.http.get<any>(`${this.base}/accounts/${id}`).pipe(
      map((response) => this.normalizeAccount(response)),
      catchError(() =>
        this.getAccounts().pipe(
          map((accounts) => accounts.find((account) => String(account.id) === String(id)) || null)
        )
      )
    );
  }

  /** Retrieve all movements/transactions for the account or globally. */
  getMovements(accountId?: number | string): Observable<Movement[]> {
    const path = accountId ? `${this.base}/accounts/${accountId}/transactions` : `${this.base}/movements`;
    return this.http.get<Movement[]>(path);
  }

  /** Retrieve a single movement by id, optionally within an account. */
  getMovement(id: number | string, transactionId?: number | string): Observable<Movement> {
    const path = transactionId
      ? `${this.base}/accounts/${id}/transactions/${transactionId}`
      : `${this.base}/movements/${id}`;
    return this.http.get<Movement>(path);
  }

  /** Register a deposit transaction on the backend. */
  deposit(accountId: number | string, movement: { amount: number; description: string }) {
    return this.http.post(`${this.base}/accounts/${accountId}/deposit`, movement);
  }

  /** Register a withdrawal transaction on the backend. */
  withdraw(accountId: number | string, movement: { amount: number; description: string }) {
    return this.http.post(`${this.base}/accounts/${accountId}/withdrawal`, movement);
  }

  /** Create a generic movement record. */
  postMovement(movement: { type: string; amount: number; description: string; date: string }) {
    return this.http.post(`${this.base}/movements`, movement);
  }

  /** Get current balance for account or global balance. */
  getBalance(accountId?: number | string) {
    const path = accountId ? `${this.base}/accounts/${accountId}/balance` : `${this.base}/balance`;
    return this.http.get<{ balance: number }>(path);
  }

  /** Convert account balance or global balance to FIAT. */
  convertFiat(accountIdOrCurrency: number | string, currency?: string) {
    if (currency === undefined) {
      return this.http.get<any>(`${this.base}/convert/fiat/${accountIdOrCurrency}`);
    }
    return this.http.get<any>(`${this.base}/accounts/${accountIdOrCurrency}/balance/convert/fiat?to=${currency}`);
  }

  /** Convert account balance or global balance to crypto. */
  convertCrypto(accountIdOrSymbol: number | string, symbol?: string) {
    if (symbol === undefined) {
      return this.http.get<any>(`${this.base}/convert/crypto/${accountIdOrSymbol}`);
    }
    return this.http.get<any>(`${this.base}/accounts/${accountIdOrSymbol}/balance/convert/crypto?to=${symbol}`);
  }
}
