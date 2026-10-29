<?php

require_once "db.php";

if (!isset($_GET["id"])) {
    header("Location: pembayaran.php");
    exit();
}

$id = $_GET["id"];

$sql = "DELETE FROM pembayaran WHERE id = '$id'";

if ($conn->query($sql) === TRUE) {
    header("Location: pembayaran.php");
    exit();
} else {
    echo "Gagal menghapus pembayaran: " . $conn->error;
}

?>