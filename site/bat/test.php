<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Function to send data to Firebase
function sendToFirebase($name, $email) {
    $url = 'https://salmast-9bec7-default-rtdb.firebaseio.com/users/' . urlencode($name) . '.json';
    $data = json_encode(['username' => $name, 'email' => $email]);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

    $response = curl_exec($ch);
    if ($response === false) {
        echo 'Error: ' . curl_error($ch);
    } else {
        echo 'Data saved successfully!';
    }
    curl_close($ch);
}

// Test the function with sample data
sendToFirebase('testuser', 'testuser@example.com');