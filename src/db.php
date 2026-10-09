
<?php

$host = getenv("DB_HOST") ?: "db";
$user = getenv("DB_USER") ?: "kosmate_user";
$password = getenv("DB_PASSWORD") ?: "";
$database = getenv("DB_NAME") ?: "kosmate";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Koneksi database gagal.");
}

$conn->set_charset("utf8mb4");
?>