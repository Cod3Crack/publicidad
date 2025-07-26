<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$capturesDir = '../captures/';

if (!is_dir($capturesDir)) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'El directorio de capturas no existe.']);
    exit;
}

// Obtener parámetros de paginación
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 12; // Por defecto 12 imágenes por página
$offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

// Escanear el directorio y filtrar los resultados
$allFiles = scandir($capturesDir, SCANDIR_SORT_DESCENDING); // Ordenar de más reciente a más antiguo

$filteredFiles = array_filter($allFiles, function($file) use ($capturesDir) {
    if ($file !== '.' && $file !== '..') {
        $extension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        return in_array($extension, ['jpg', 'jpeg', 'png', 'gif']);
    }
    return false;
});

// Re-indexar el array para que sea una lista numérica
$filteredFiles = array_values($filteredFiles);

$totalImages = count($filteredFiles);

// Aplicar paginación
$paginatedFiles = array_slice($filteredFiles, $offset, $limit);

$imageFilesData = [];
foreach ($paginatedFiles as $file) {
    $filePath = $capturesDir . $file;
    $timestamp = filemtime($filePath); // Obtener el timestamp de modificación
    $imageFilesData[] = [
        'name' => $file,
        'timestamp' => $timestamp
    ];
}

echo json_encode([
    'success' => true,
    'files' => $imageFilesData,
    'total' => $totalImages
]);
?>