<?php
header('Content-Type: application/json; charset=utf-8');

// CONFIG: masukkan token dan channel id di sini (aman, tidak terekspos ke client)
define('BOT_TOKEN', '8384730708:AAHjPCLYpW7wz2B5-jBxMJ17-kH1G1zXZuY');
define('CHANNEL_ID', '-1002080437836'); // atau '-1001234567890'

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['message']) || trim($data['message']) === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'description' => 'Message empty']);
    exit;
}

$message = $data['message'];

$apiUrl = "https://api.telegram.org/bot".BOT_TOKEN."/sendMessage";

$postFields = [
    'chat_id' => CHANNEL_ID,
    'text' => $message,
    'parse_mode' => 'HTML'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postFields));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

$result = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
if ($result === false) {
    $err = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['ok' => false, 'description' => 'Curl error: '.$err]);
    exit;
}
curl_close($ch);

// Forward Telegram response (bisa diolah lebih lanjut)
http_response_code($httpcode);
echo $result;
