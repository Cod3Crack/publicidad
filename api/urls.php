<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$urlsFile = '../data/urls.json';

// Función para leer URLs
function readUrls($file) {
    if (!file_exists($file)) {
        $defaultUrls = [
            'logo' => '',
            'publicidad' => '',
            'video' => '',
            'logoAnimado' => '',
            'mockup' => '',
            'tarjetas' => '',
            'paginaWeb' => ''
        ];
        file_put_contents($file, json_encode($defaultUrls, JSON_PRETTY_PRINT));
        return $defaultUrls;
    }
    
    $content = file_get_contents($file);
    return json_decode($content, true) ?: [];
}

// Función para escribir URLs
function writeUrls($file, $urls) {
    return file_put_contents($file, json_encode($urls, JSON_PRETTY_PRINT));
}

// Manejar diferentes métodos HTTP
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Leer todas las URLs
        $urls = readUrls($urlsFile);
        echo json_encode([
            'success' => true,
            'data' => $urls
        ]);
        break;
        
    case 'POST':
        // Actualizar una URL específica
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['mediaType']) || !isset($input['url'])) {
            http_response_code(400);
            echo json_encode([
                'success' => false,
                'error' => 'mediaType y url son requeridos'
            ]);
            break;
        }
        
        $urls = readUrls($urlsFile);
        $urls[$input['mediaType']] = $input['url'];
        
        if (writeUrls($urlsFile, $urls)) {
            echo json_encode([
                'success' => true,
                'message' => 'URL actualizada exitosamente',
                'data' => $urls
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'No se pudo guardar la URL'
            ]);
        }
        break;
        
    case 'DELETE':
        // Resetear todas las URLs
        $defaultUrls = [
            'logo' => '',
            'publicidad' => '',
            'video' => '',
            'logoAnimado' => '',
            'mockup' => '',
            'tarjetas' => '',
            'paginaWeb' => ''
        ];
        
        if (writeUrls($urlsFile, $defaultUrls)) {
            echo json_encode([
                'success' => true,
                'message' => 'Todas las URLs han sido eliminadas',
                'data' => $defaultUrls
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'No se pudo resetear las URLs'
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode([
            'success' => false,
            'error' => 'Método no permitido'
        ]);
        break;
}
?> 