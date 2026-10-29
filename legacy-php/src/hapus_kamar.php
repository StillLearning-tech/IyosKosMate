<?php

require_once "db.php";

$id = $_GET["id"];

$sql = "DELETE FROM kamar WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    header("Location: kamar.php");
    exit();
} else {
    echo "Gagal menghapus kamar: " . $conn->error;
}