<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "financeiro";

$conn = new mysqli($servername, $username, $password, $dbname);

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

if ($conn->connect_error) {
    die("Erro de conexão com o banco de dados: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST['nome'];

    $sql = "INSERT INTO clientes (NomeCliente) VALUES (?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $nome);

    try {
        $success = $stmt->execute();

        if ($success) {
            $response = array('success' => true);
        } else {
            $response = array('success' => false, 'error' => 'Erro ao cadastrar cliente.');
        }
    } catch (Exception $e) {
        $response = array('success' => false, 'error' => 'Erro ao cadastrar cliente: ' . $e->getMessage());
    }

    echo json_encode($response);
} else {
    echo json_encode(array('success' => false, 'error' => 'Método de requisição inválido.'));
}
?>
