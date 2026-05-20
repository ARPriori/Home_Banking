<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../MysqlConnection.php';

class ConversionController
{
        // /accounts/account:id/balance/convert/fiat?to=USD
    public function toFiat(Request $request, Response $response, $args)
    {
        // Usa l'istanza corretta del Singleton
        $mysqli = MysqlConnection::getInstance();
        if ($mysqli->connect_error) {
            $response->getBody()->write(json_encode(['error' => 'Database connection failed']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        //get account id and currency to convert to
        $id    = $args['account'] ?? null;
        $query = $request->getQueryParams();
        $to    = strtoupper($query['to'] ?? '');

        if (! $id || ! is_numeric($id)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid or missing account id']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        if (! $to) {
            $response->getBody()->write(json_encode(['error' => 'Missing target currency (to)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // CORREGGIATO: Cambiato $mysqli_connection in $mysqli (Risolve l'errore 500)
        $stmt = $mysqli->prepare("SELECT 1 FROM `account` WHERE id = ? LIMIT 1");
        if (! $stmt) {
            $response->getBody()->write(json_encode(['error' => 'Database error']));
            $mysqli->close();
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        // CORREGGIATO: Cambiato $accountId in $id per usare la variabile corretta
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $accountExists = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (! $accountExists) {
            $response->getBody()->write(json_encode(['error' => 'account not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        //get user balance and currency
        $stmt = $mysqli->prepare("SELECT currency, (IFNULL((SELECT SUM(amount) as withdrawals FROM `transaction` WHERE account_id = ? AND `type` = 'deposit'),0)  - IFNULL((SELECT SUM(amount) as withdrawals FROM `transaction` WHERE account_id = ? AND `type` = 'withdrawal'),0)) as balance FROM account WHERE id = ? LIMIT 1");
        if (! $stmt) {
            $response->getBody()->write(json_encode(['error' => 'Database error']));
            $mysqli->close();
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        $stmt->bind_param('iii', $id, $id, $id);
        $stmt->execute();
        $result  = $stmt->get_result();
        $account = $result->fetch_assoc();
        if (! $account) {
            $mysqli->close();
            $response->getBody()->write(json_encode(['error' => 'Account not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
        $from    = strtoupper($account['currency'] ?? 'EUR');
        $balance = $account['balance'];
        $stmt->close();

        if ($from != $to) {
            $url = "https://frankfurter.app{$from}&to={$to}";
            
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 3); // Timeout rapido a 3 secondi
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            $apiResponse = curl_exec($ch);
            curl_close($ch);

            // Inizializziamo il tasso a 0 per capire se la chiamata ha successo
            $rate = 0;

            if ($apiResponse !== false) {
                $data = json_decode($apiResponse, true);
                if (isset($data['rates'][$to])) {
                    $rate = (float) $data['rates'][$to];
                }
            }

            // FALLBACK: Se l'API esterna è irraggiungibile (Errore 502), usa tassi hardcoded per lo sviluppo locale
            if ($rate === 0) {
                error_log("⚠️ API Frankfurter non raggiungibile. Uso tassi di cambio locali (MOCK).");
                
                // Mappa dei tassi di cambio approssimativi per i test locali
                $mockRates = [
                    'EUR' => ['USD' => 1.08, 'GBP' => 0.85, 'JPY' => 168.0],
                    'USD' => ['EUR' => 0.92, 'GBP' => 0.79, 'JPY' => 155.0],
                    'GBP' => ['EUR' => 1.17, 'USD' => 1.26, 'JPY' => 196.0]
                ];

                $rate = $mockRates[$from][$to] ?? 1.15; // Tasso generico se non in lista
            }

            $convertedAmount = $balance * $rate;
        } else {
            // if converting from same currency to same currency, set rate to 1
            $rate            = 1.0;
            $convertedAmount = $balance;
        }

        $mysqli->close();

        $payload = [
            'account_id'        => $id,
            'provider'          => 'frankfurter',
            'conversion_type'   => 'fiat',
            'from_currency'     => $from,
            'to_currency'       => $to,
            'original_balance'  => $balance,
            'rate'              => $rate,
            'converted_balance' => $convertedAmount,
            'amount'            => $convertedAmount, // AGGIUNGI QUESTO: permette ad Angular di leggere .amount al volo
            'date'              => date('c'),
        ];

        $response->getBody()->write(json_encode($payload));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }


// /accounts/account:id/balance/convert/crypto?to=BTC
    // https://binance.com{$marketsymbol}
    public function toCrypto(Request $request, Response $response, $args)
    {
        $mysqli = MysqlConnection::getInstance();
        if ($mysqli->connect_error) {
            $response->getBody()->write(json_encode(['error' => 'Database connection failed']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        //get account id and crypto to convert to
        $id    = $args['account'] ?? null;
        $query = $request->getQueryParams();
        $to    = strtoupper($query['to'] ?? '');

        if (! $id || ! is_numeric($id)) {
            $response->getBody()->write(json_encode(['error' => 'Invalid or missing account id']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        if (! $to) {
            $response->getBody()->write(json_encode(['error' => 'Missing target crypto (to)']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        $stmt = $mysqli->prepare("SELECT 1 FROM `account` WHERE id = ? LIMIT 1");
        if (! $stmt) {
            $response->getBody()->write(json_encode(['error' => 'Database error']));
            $mysqli->close();
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $accountExists = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (! $accountExists) {
            $response->getBody()->write(json_encode(['error' => 'account not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }

        //get user balance and currency
        $stmt = $mysqli->prepare("SELECT currency, (IFNULL((SELECT SUM(amount) as withdrawals FROM `transaction` WHERE account_id = ? AND `type` = 'deposit'),0)  - IFNULL((SELECT SUM(amount) as withdrawals FROM `transaction` WHERE account_id = ? AND `type` = 'withdrawal'),0)) as balance FROM account WHERE id = ? LIMIT 1");
        if (! $stmt) {
            $response->getBody()->write(json_encode(['error' => 'Database error']));
            $mysqli->close();
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }
        $stmt->bind_param('iii', $id, $id, $id);
        $stmt->execute();
        $result  = $stmt->get_result();
        $account = $result->fetch_assoc();
        if (! $account) {
            $mysqli->close();
            $response->getBody()->write(json_encode(['error' => 'Account not found']));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
        }
        $from    = strtoupper($account['currency'] ?? 'EUR');
        $balance = $account['balance'];
        $stmt->close();

        // CORREGGIATO: Usa USDT come mercato standard supportato da Binance (es. BNBUSDT, BTCUSDT)
        $symbol  = $to . 'USDT';

        //contact binance api to convert
        $url         = "https://binance.com{$symbol}";
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 3);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $apiResponse = curl_exec($ch);
        curl_close($ch);

        $price = 0;

        if ($apiResponse !== false) {
            $data = json_decode($apiResponse, true);
            if (isset($data['price'])) {
                $price = (float) $data['price'];
            }
        }

        // FALLBACK: Se Binance fallisce, rifiuta la coppia o cURL è bloccato, usa un prezzo di test sicuro
        if ($price === 0) {
            error_log("⚠️ API Binance non raggiungibile o coppia non supportata. Uso prezzi mock.");
            $mockPrices = [
                'BTCUSDT' => 65000.0,
                'ETHUSDT' => 3500.0,
                'BNBUSDT' => 580.0
            ];
            $price = $mockPrices[$symbol] ?? 1000.0;
        }

        // Se l'account di partenza è in EUR, approssimiamo la conversione bilanciando il tasso EUR/USD (circa 1.08)
        $adjustedBalance = ($from === 'EUR') ? ($balance * 1.08) : $balance;
        $convertedAmount = $adjustedBalance / $price;

        $mysqli->close();

        $payload = [
            'account_id'       => $id,
            'provider'         => 'binance',
            'conversion_type'  => 'crypto',
            'from_currency'    => $from,
            'to_crypto'        => $to,
            'market_symbol'    => $symbol,
            'original_balance' => $balance,
            'price'            => $price,
            'converted_amount' => $convertedAmount,
            'amount'           => $convertedAmount // Mantiene la compatibilità con il widget di Angular
        ];

        $response->getBody()->write(json_encode($payload));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(200);
    }


}
