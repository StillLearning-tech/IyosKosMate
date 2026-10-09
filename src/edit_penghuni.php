<?php

require_once "db.php";

// ==========================================
// AMBIL ID PENGHUNI
// ==========================================

if (!isset($_GET["id"])) {

    echo "ID penghuni tidak ditemukan.";
    exit();

}

$id = $_GET["id"];


// ==========================================
// JIKA FORM DIKIRIM
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nama = $_POST["nama"];
    $nik = $_POST["nik"];
    $no_hp = $_POST["no_hp"];
    $kamar_id = $_POST["kamar_id"];
    $tanggal_masuk = $_POST["tanggal_masuk"];
    $status = $_POST["status"];

    $sql = "UPDATE penghuni SET
            nama = '$nama',
            nik = '$nik',
            no_hp = '$no_hp',
            kamar_id = '$kamar_id',
            tanggal_masuk = '$tanggal_masuk',
            status = '$status'
            WHERE id = $id";

    if ($conn->query($sql) === TRUE) {

        header("Location: penghuni.php");
        exit();

    } else {

        echo "Gagal memperbarui data: " . $conn->error;

    }
}


// ==========================================
// AMBIL DATA PENGHUNI
// ==========================================

$sql = "SELECT * FROM penghuni WHERE id = $id";

$result = $conn->query($sql);

if ($result->num_rows == 0) {

    echo "Data penghuni tidak ditemukan.";
    exit();

}

$penghuni = $result->fetch_assoc();


// ==========================================
// AMBIL DAFTAR KAMAR
// ==========================================

$sql_kamar = "SELECT id, nomor_kamar
              FROM kamar
              ORDER BY nomor_kamar ASC";

$result_kamar = $conn->query($sql_kamar);

?>

<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Edit Penghuni - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>

<body>

<div class="container">


    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Edit Penghuni</h1>

            <p class="subtitle">
                Perbarui informasi penghuni KosMate
            </p>

        </div>

        <a href="penghuni.php" class="btn-secondary">
            ← Kembali
        </a>

    </div>


    <!-- FORM EDIT -->

    <div class="card">

        <div class="card-header">

            <h2>Informasi Penghuni</h2>

            <p>
                Ubah data yang diperlukan kemudian simpan perubahan.
            </p>

        </div>


        <form method="POST" class="form-grid">


            <!-- NAMA -->

            <div class="form-group">

                <label>Nama Lengkap</label>

                <input
                    type="text"
                    name="nama"
                    value="<?php echo htmlspecialchars($penghuni["nama"]); ?>"
                    required
                >

            </div>


            <!-- NIK -->

            <div class="form-group">

                <label>NIK</label>

                <input
                    type="text"
                    name="nik"
                    value="<?php echo htmlspecialchars($penghuni["nik"]); ?>"
                    required
                >

            </div>


            <!-- NO HP -->

            <div class="form-group">

                <label>No. HP</label>

                <input
                    type="text"
                    name="no_hp"
                    value="<?php echo htmlspecialchars($penghuni["no_hp"]); ?>"
                    required
                >

            </div>


            <!-- KAMAR -->

            <div class="form-group">

                <label>Kamar</label>

                <select name="kamar_id" required>

                    <?php while ($kamar = $result_kamar->fetch_assoc()) { ?>

                        <option
                            value="<?php echo $kamar["id"]; ?>"
                            <?php
                            if ($kamar["id"] == $penghuni["kamar_id"]) {
                                echo "selected";
                            }
                            ?>
                        >

                            <?php echo htmlspecialchars($kamar["nomor_kamar"]); ?>

                        </option>

                    <?php } ?>

                </select>

            </div>


            <!-- TANGGAL MASUK -->

            <div class="form-group">

                <label>Tanggal Masuk</label>

                <input
                    type="date"
                    name="tanggal_masuk"
                    value="<?php echo $penghuni["tanggal_masuk"]; ?>"
                    required
                >

            </div>


            <!-- STATUS -->

            <div class="form-group">

                <label>Status</label>

                <select name="status">

                    <option
                        value="Aktif"
                        <?php
                        if ($penghuni["status"] == "Aktif") {
                            echo "selected";
                        }
                        ?>
                    >
                        Aktif
                    </option>

                    <option
                        value="Tidak Aktif"
                        <?php
                        if ($penghuni["status"] == "Tidak Aktif") {
                            echo "selected";
                        }
                        ?>
                    >
                        Tidak Aktif
                    </option>

                </select>

            </div>


            <!-- BUTTON -->

            <div class="form-actions">

                <button
                    type="submit"
                    class="btn-primary"
                >
                    Simpan Perubahan
                </button>

            </div>


        </form>

    </div>

</div>

</body>

</html>