<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "financeiro_db";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}

$sql = "SELECT cp.id, f.nome, cp.valor, cp.data_vencimento, cp.status 
        FROM contas_pagar cp
        INNER JOIN fornecedores f ON cp.fornecedor_id = f.id
        ORDER BY cp.data_vencimento";
$result = $conn->query($sql);

$contasPagar = array();

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $conta = array(
            "id" => $row["id"],
            "nome" => $row["nome"],
            "valor" => $row["valor"],
            "data_vencimento" => $row["data_vencimento"],
            "status" => $row["status"]
        );
        array_push($contasPagar, $conta);
    }
}

echo json_encode($contasPagar);

$conn->close();
?>
