<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Directorio donde se guardarán las capturas
$uploadDir = '../captures/';

// Recibir el cuerpo de la solicitud
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['image']) || !isset($input['cameraType'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos de imagen o tipo de cámara no recibidos.']);
    exit;
}

// Obtener los datos de la imagen y el tipo de cámara
$imageData = $input['image'];
$cameraType = $input['cameraType']; // 'front' o 'rear'

// Limpiar la cabecera de la imagen base64
// Formato esperado: data:image/png;base64,iVBORw0KGgo...
if (preg_match('/^data:image\/(\w+);base64,/', $imageData, $type)) {
    $imageData = substr($imageData, strpos($imageData, ',') + 1);
    $type = strtolower($type[1]); // 'png', 'jpeg', etc.

    if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Tipo de imagen no válido.']);
        exit;
    }

    $imageData = base64_decode($imageData);

    if ($imageData === false) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No se pudo decodificar la imagen base64.']);
        exit;
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'URI de datos de imagen no válido.']);
    exit;
}

// Crear un nombre de archivo único
$fileName = date('Y-m-d_H-i-s') . '_' . $cameraType . '_' . uniqid() . '.' . $type;
$filePath = $uploadDir . $fileName;

// Guardar el archivo
if (file_put_contents($filePath, $imageData)) {
    echo json_encode(['success' => true, 'message' => 'Imagen guardada exitosamente.', 'file' => $fileName]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'No se pudo guardar la imagen en el servidor.']);
}
?>