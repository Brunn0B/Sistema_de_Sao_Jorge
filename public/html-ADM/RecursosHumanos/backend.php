<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "rh_database";

$conn = new mysqli($servername, $username, $password, $dbname);


mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);


if ($conn->connect_error) {
    die("Erro de conexão com o banco de dados: " . $conn->connect_error);
}


if (!isset($_POST['action'])) {
    $response = array('success' => false, 'error' => 'Ação não especificada.');
    echo json_encode($response);
    exit();
}

$action = $_POST['action'];

if ($action === 'insertEmployee') {
    $data = $_POST;


    $requiredFields = array('PrimeiroNome', 'Sobrenome', 'Email', 'CPF', 'RG', 'Cargo', 'Funcao', 'Hierarquia', 'Salario', 'MetodoPagamento');

    foreach ($requiredFields as $field) {
        if (empty($data[$field])) {
            $response = array('success' => false, 'error' => 'Campo obrigatório ausente: ' . $field);
            echo json_encode($response);
            exit();
        }
    }

    // Lógica para upload de foto
    if (isset($_FILES['Foto']) && $_FILES['Foto']['error'] == UPLOAD_ERR_OK) {
        $uploadDir = 'C:/xampp/htdocs/Base-Projeto-Sistema-de-Operacional/IMG/FotosFuncionariosRH.IMG/';

        $uploadFile = $uploadDir . basename($_FILES['Foto']['name']);

        if (move_uploaded_file($_FILES['Foto']['tmp_name'], $uploadFile)) {
            $data['Foto'] = $_FILES['Foto']['name'];
        } else {
            $response = array('success' => false, 'error' => 'Erro ao fazer o upload da foto.');
            echo json_encode($response);
            exit();
        }
    } else {
        $response = array('success' => false, 'error' => 'Erro no upload da foto: ' . $_FILES['Foto']['error']);
        echo json_encode($response);
        exit();
    }

    $response = insertEmployee($data);
} elseif ($action === 'getAllEmployees') {
    $response = getAllEmployees();
    echo json_encode($response);
    exit();
} elseif ($action === 'deleteEmployee') {
    $employeeId = isset($_POST['id']) ? $_POST['id'] : null;
    $response = deleteEmployee($employeeId);
} else {
    $response = array('success' => false, 'error' => 'Ação desconhecida: ' . $action);
    echo json_encode($response);
    exit();
}


echo json_encode($response);

function deleteEmployee($employeeId) {
    global $conn;


    error_log("Removendo funcionário com ID: " . $employeeId);

    if (empty($employeeId)) {
        return array('success' => false, 'error' => 'ID do funcionário ausente.');
    }


    $sql = "DELETE FROM funcionarios WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $employeeId);

    try {
        $success = $stmt->execute();


        if (!$success) {
            error_log("Erro ao excluir funcionário: " . $stmt->error);
        }
    } catch (Exception $e) {
        return array('success' => false, 'error' => 'Erro ao excluir funcionário: ' . $e->getMessage());
    }

    if ($success) {
        $response = array('success' => true);
    } else {
        $response = array('success' => false, 'error' => 'Erro ao excluir funcionário.');
    }

    return $response;
}


function insertEmployee($data) {
    global $conn;


    $sql = "INSERT INTO funcionarios (primeiro_nome, sobrenome, email, cpf, rg, cargo, funcao, hierarquia, salario, metodo_pagamento, foto)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param(
        "ssssssssdss",
        $data['PrimeiroNome'],
        $data['Sobrenome'],
        $data['Email'],
        $data['CPF'],
        $data['RG'],
        $data['Cargo'],
        $data['Funcao'],
        $data['Hierarquia'],
        $data['Salario'],
        $data['MetodoPagamento'],
        $data['Foto']
    );

    $success = $stmt->execute();

    if ($success) {
        return array('success' => true, 'employee' => $data);
    } else {
        return array('success' => false, 'error' => 'Erro ao cadastrar funcionário.');
    }
}

function getAllEmployees() {
    global $conn;

    $result = $conn->query("SELECT * FROM funcionarios");

    if (!$result) {
        return array('success' => false, 'error' => 'Erro ao obter funcionários.');
    }

    $employees = array();

    while ($row = $result->fetch_assoc()) {
        $employees[] = $row;
    }

    return array('success' => true, 'employee' => $employees);
}

