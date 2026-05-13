<?php
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

require_once __DIR__ . '/../MysqlConnection.php'; 
 
class AccountController
{
 
 //GET /accounts -- shows all accounts
    public function allAccounts(Request $request, Response $response, $args)
    {
       
        $mysqli_connection = MysqlConnection::getInstance();

       
        //fetch transactions
        $stmt = $mysqli_connection->prepare("SELECT * FROM `account`");
        if (! $stmt) {
            $response->getBody()->write(json_encode(['error' => 'Database error']));
            $mysqli->close();
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        $stmt->execute();
        $result  = $stmt->get_result();
        $results = $result->fetch_all();
        $response->getBody()->write(json_encode($results));
        return $response->withHeader("Content-type", "application/json")->withStatus(200);
    }
}