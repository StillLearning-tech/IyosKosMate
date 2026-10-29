<?php

require_once "db.php";

if (isset($_GET["id"])) {

    $id = $_GET["id"];

    $sql = "DELETE FROM penghuni WHERE id = $id";

    if ($conn->query($sql) === TRUE) {

        header("Location: penghuni.php");
        exit();

    } else {

        echo "Gagal menghapus penghuni: " . $conn->error;

    }

} else {

    echo "ID penghuni tidak ditemukan.";

}

$conn->close();

?>