<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$capturesDir = '../captures/';

// Verificar que el directorio de capturas exista y se pueda escribir en él
if (!is_dir($capturesDir) || !is_writable($capturesDir)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'El directorio de capturas no existe o no tiene permisos de escritura.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Caso 1: Eliminar todas las imágenes
if (isset($input['action']) && $input['action'] === 'deleteAll') {
    $files = glob($capturesDir . '*.{jpg,jpeg,png,gif}', GLOB_BRACE);
    $errors = [];

    foreach ($files as $file) {
        if (is_file($file)) {
            if (!unlink($file)) {
                $errors[] = basename($file);
            }
        }
    }

    if (empty($errors)) {
        echo json_encode(['success' => true, 'message' => 'Todas las capturas han sido eliminadas.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'No se pudieron eliminar algunos archivos: ' . implode(', ', $errors)]);
    }
    exit;
}

// Caso 2: Eliminar una sola imagen
if (isset($input['file'])) {
    $fileName = basename($input['file']); // Medida de seguridad para evitar ataques de ruta
    $filePath = $capturesDir . $fileName;

    // Validar que el nombre del archivo no contenga caracteres maliciosos
    if (strpos($fileName, '/') !== false || strpos($fileName, '\\') !== false || $fileName === '.' || $fileName === '..') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre de archivo no válido.']);
        exit;
    }

    if (file_exists($filePath)) {
        if (unlink($filePath)) {
            echo json_encode(['success' => true, 'message' => 'Archivo eliminado exitosamente.']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'No se pudo eliminar el archivo del servidor.']);
        }
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'El archivo no fue encontrado.']);
    }
    exit;
}

// Si no se proporciona una acción válida
http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Acción no válida o archivo no especificado.']);
?>