<?php

require_once "db.php";

if (!isset($_GET["id"])) {
    header("Location: maintenance.php");
    exit();
}

$id = $_GET["id"];

$sql = "DELETE FROM maintenance WHERE id = '$id'";

if ($conn->query($sql) === TRUE) {

    header("Location: maintenance.php");
    exit();

} else {

    echo "Gagal menghapus laporan: " . $conn->error;

}

?>