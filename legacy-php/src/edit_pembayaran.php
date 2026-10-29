<?php

require_once "db.php";

if (!isset($_GET["id"])) {
    header("Location: pembayaran.php");
    exit();
}

$id = $_GET["id"];

// Jika form disubmit
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $penghuni_id = $_POST["penghuni_id"];
    $periode = $_POST["periode"];
    $jumlah = $_POST["jumlah"];
    $tanggal_bayar = !empty($_POST["tanggal_bayar"])
        ? $_POST["tanggal_bayar"]
        : NULL;
    $status = $_POST["status"];

    if ($tanggal_bayar === NULL) {

        $sql = "UPDATE pembayaran SET
                penghuni_id = '$penghuni_id',
                periode = '$periode',
                jumlah = '$jumlah',
                tanggal_bayar = NULL,
                status = '$status'
                WHERE id = '$id'";

    } else {

        $sql = "UPDATE pembayaran SET
                penghuni_id = '$penghuni_id',
                periode = '$periode',
                jumlah = '$jumlah',
                tanggal_bayar = '$tanggal_bayar',
                status = '$status'
                WHERE id = '$id'";
    }

    if ($conn->query($sql) === TRUE) {
        header("Location: pembayaran.php");
        exit();
    } else {
        echo "Gagal mengubah pembayaran: " . $conn->error;
    }
}


// Ambil data pembayaran yang mau diedit
$sql = "SELECT *
        FROM pembayaran
        WHERE id = '$id'";

$result = $conn->query($sql);

if ($result->num_rows == 0) {
    echo "Data pembayaran tidak ditemukan.";
    exit();
}

$pembayaran = $result->fetch_assoc();


// Ambil daftar penghuni aktif
$sql_penghuni = "SELECT penghuni.id,
                        penghuni.nama,
                        kamar.nomor_kamar
                 FROM penghuni
                 INNER JOIN kamar
                    ON penghuni.kamar_id = kamar.id
                 WHERE penghuni.status = 'Aktif'
                 ORDER BY penghuni.nama ASC";

$result_penghuni = $conn->query($sql_penghuni);

?>

<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Edit Pembayaran - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>

<body>

<div class="container">

    <div class="page-header">

        <div>

            <h1>Edit Pembayaran</h1>

            <p class="subtitle">
                Perbarui informasi pembayaran penghuni
            </p>

        </div>

        <a href="pembayaran.php" class="btn-secondary">
            ← Kembali
        </a>

    </div>


    <div class="card">

        <div class="card-header">

            <h2>Informasi Pembayaran</h2>

            <p>
                Silakan ubah data pembayaran di bawah ini.
            </p>

        </div>


        <form method="POST">

            <div class="form-grid">


                <div class="form-group">

                    <label>Penghuni</label>

                    <select name="penghuni_id" required>

                        <?php while ($penghuni = $result_penghuni->fetch_assoc()) { ?>

                            <option
                                value="<?php echo $penghuni["id"]; ?>"
                                <?php
                                if ($penghuni["id"] == $pembayaran["penghuni_id"]) {
                                    echo "selected";
                                }
                                ?>
                            >

                                <?php
                                echo htmlspecialchars(
                                    $penghuni["nama"]
                                )
                                . " - Kamar "
                                . htmlspecialchars(
                                    $penghuni["nomor_kamar"]
                                );
                                ?>

                            </option>

                        <?php } ?>

                    </select>

                </div>


                <div class="form-group">

                    <label>Periode Pembayaran</label>

                    <input
                        type="month"
                        name="periode"
                        value="<?php echo $pembayaran["periode"]; ?>"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Jumlah Pembayaran</label>

                    <input
                        type="number"
                        name="jumlah"
                        value="<?php echo $pembayaran["jumlah"]; ?>"
                        required
                    >

                </div>


                <div class="form-group">

                    <label>Tanggal Bayar</label>

                    <input
                        type="date"
                        name="tanggal_bayar"
                        value="<?php echo $pembayaran["tanggal_bayar"]; ?>"
                    >

                </div>


                <div class="form-group">

                    <label>Status</label>

                    <select name="status">

                        <option
                            value="Belum Lunas"
                            <?php
                            if ($pembayaran["status"] == "Belum Lunas") {
                                echo "selected";
                            }
                            ?>
                        >
                            Belum Lunas
                        </option>

                        <option
                            value="Lunas"
                            <?php
                            if ($pembayaran["status"] == "Lunas") {
                                echo "selected";
                            }
                            ?>
                        >
                            Lunas
                        </option>

                    </select>

                </div>


                <div class="form-actions">

                    <button type="submit" class="btn-primary">
                        Simpan Perubahan
                    </button>

                </div>


            </div>

        </form>

    </div>

</div>

</body>

</html>