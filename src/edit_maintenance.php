<?php

require_once "db.php";

if (!isset($_GET["id"])) {
    header("Location: maintenance.php");
    exit();
}

$id = $_GET["id"];


// ==========================================
// UPDATE DATA
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $penghuni_id = $_POST["penghuni_id"];
    $judul = $_POST["judul"];
    $deskripsi = $_POST["deskripsi"];
    $tanggal_lapor = $_POST["tanggal_lapor"];
    $prioritas = $_POST["prioritas"];
    $status = $_POST["status"];

    $sql = "UPDATE maintenance SET

                penghuni_id = '$penghuni_id',
                judul = '$judul',
                deskripsi = '$deskripsi',
                tanggal_lapor = '$tanggal_lapor',
                prioritas = '$prioritas',
                status = '$status'

            WHERE id = '$id'";


    if ($conn->query($sql) === TRUE) {

        header("Location: maintenance.php");
        exit();

    } else {

        echo "Gagal mengubah laporan: " . $conn->error;

    }
}


// ==========================================
// AMBIL DATA MAINTENANCE
// ==========================================

$sql = "SELECT *
        FROM maintenance
        WHERE id = '$id'";

$result = $conn->query($sql);


if ($result->num_rows == 0) {

    echo "Data maintenance tidak ditemukan.";
    exit();

}

$maintenance = $result->fetch_assoc();


// ==========================================
// AMBIL PENGHUNI AKTIF
// ==========================================

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

    <title>Edit Maintenance - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>


<body>

<div class="container">


    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Edit Maintenance</h1>

            <p class="subtitle">
                Perbarui informasi laporan maintenance
            </p>

        </div>

        <a href="maintenance.php" class="btn-secondary">
            ← Kembali
        </a>

    </div>


    <!-- FORM -->

    <div class="card">

        <div class="card-header">

            <h2>Informasi Maintenance</h2>

            <p>
                Ubah data laporan sesuai kondisi terbaru.
            </p>

        </div>


        <form method="POST">

            <div class="form-grid">


                <!-- PENGHUNI -->

                <div class="form-group">

                    <label>Penghuni</label>

                    <select name="penghuni_id" required>

                        <?php while ($penghuni = $result_penghuni->fetch_assoc()) { ?>

                            <option
                                value="<?php echo $penghuni["id"]; ?>"
                                <?php

                                if (
                                    $penghuni["id"]
                                    == $maintenance["penghuni_id"]
                                ) {

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


                <!-- JUDUL -->

                <div class="form-group">

                    <label>Judul Masalah</label>

                    <input
                        type="text"
                        name="judul"
                        value="<?php
                            echo htmlspecialchars(
                                $maintenance["judul"]
                            );
                        ?>"
                        required
                    >

                </div>


                <!-- TANGGAL -->

                <div class="form-group">

                    <label>Tanggal Lapor</label>

                    <input
                        type="date"
                        name="tanggal_lapor"
                        value="<?php
                            echo $maintenance["tanggal_lapor"];
                        ?>"
                        required
                    >

                </div>


                <!-- PRIORITAS -->

                <div class="form-group">

                    <label>Prioritas</label>

                    <select name="prioritas">

                        <option
                            value="Rendah"
                            <?php
                            if (
                                $maintenance["prioritas"]
                                == "Rendah"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Rendah
                        </option>

                        <option
                            value="Sedang"
                            <?php
                            if (
                                $maintenance["prioritas"]
                                == "Sedang"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Sedang
                        </option>

                        <option
                            value="Tinggi"
                            <?php
                            if (
                                $maintenance["prioritas"]
                                == "Tinggi"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Tinggi
                        </option>

                    </select>

                </div>


                <!-- STATUS -->

                <div class="form-group">

                    <label>Status</label>

                    <select name="status">

                        <option
                            value="Menunggu"
                            <?php
                            if (
                                $maintenance["status"]
                                == "Menunggu"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Menunggu
                        </option>

                        <option
                            value="Diproses"
                            <?php
                            if (
                                $maintenance["status"]
                                == "Diproses"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Diproses
                        </option>

                        <option
                            value="Selesai"
                            <?php
                            if (
                                $maintenance["status"]
                                == "Selesai"
                            ) {
                                echo "selected";
                            }
                            ?>
                        >
                            Selesai
                        </option>

                    </select>

                </div>


                <!-- DESKRIPSI -->

                <div class="form-group">

                    <label>Deskripsi Masalah</label>

                    <textarea
                        name="deskripsi"
                        rows="5"
                        required
                    ><?php
                        echo htmlspecialchars(
                            $maintenance["deskripsi"]
                        );
                    ?></textarea>

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


            </div>

        </form>

    </div>

</div>

</body>

</html>