<?php

require_once "db.php";

// ==========================================
// TAMBAH PEMBAYARAN
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $penghuni_id = $_POST["penghuni_id"];
    $periode = $_POST["periode"];
    $jumlah = $_POST["jumlah"];

    $tanggal_bayar = !empty($_POST["tanggal_bayar"])
        ? $_POST["tanggal_bayar"]
        : NULL;

    $status = $_POST["status"];

    if ($tanggal_bayar === NULL) {

        $sql = "INSERT INTO pembayaran
                (penghuni_id, periode, jumlah, tanggal_bayar, status)
                VALUES
                ('$penghuni_id', '$periode', '$jumlah', NULL, '$status')";

    } else {

        $sql = "INSERT INTO pembayaran
                (penghuni_id, periode, jumlah, tanggal_bayar, status)
                VALUES
                ('$penghuni_id', '$periode', '$jumlah', '$tanggal_bayar', '$status')";
    }

    if ($conn->query($sql) === TRUE) {

        header("Location: pembayaran.php");
        exit();

    } else {

        echo "Gagal menambahkan pembayaran: " . $conn->error;

    }
}


// ==========================================
// AMBIL DATA PEMBAYARAN
// ==========================================

$sql = "SELECT pembayaran.*,
               penghuni.nama,
               kamar.nomor_kamar
        FROM pembayaran
        INNER JOIN penghuni
            ON pembayaran.penghuni_id = penghuni.id
        INNER JOIN kamar
            ON penghuni.kamar_id = kamar.id
        ORDER BY pembayaran.id DESC";

$result = $conn->query($sql);


// ==========================================
// AMBIL DAFTAR PENGHUNI AKTIF
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

    <title>Pembayaran - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>

<body>

<div class="container">

    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Data Pembayaran</h1>

            <p class="subtitle">
                Kelola pembayaran sewa penghuni KosMate
            </p>

        </div>

        <a href="index.php" class="btn-secondary">
            ← Dashboard
        </a>

    </div>


    <!-- FORM TAMBAH PEMBAYARAN -->

    <div class="card">

        <div class="card-header">

            <h2>Tambah Pembayaran</h2>

            <p>
                Masukkan informasi pembayaran penghuni.
            </p>

        </div>


        <form method="POST">

            <div class="form-grid">


                <!-- PENGHUNI -->

                <div class="form-group">

                    <label>Penghuni</label>

                    <select name="penghuni_id" required>

                        <option value="">
                            -- Pilih Penghuni --
                        </option>

                        <?php while ($penghuni = $result_penghuni->fetch_assoc()) { ?>

                            <option
                                value="<?php echo $penghuni["id"]; ?>"
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


                <!-- PERIODE -->

                <div class="form-group">

                    <label>Periode Pembayaran</label>

                    <input
                        type="month"
                        name="periode"
                        required
                    >

                </div>


                <!-- JUMLAH -->

                <div class="form-group">

                    <label>Jumlah Pembayaran</label>

                    <input
                        type="number"
                        name="jumlah"
                        placeholder="Contoh: 800000"
                        required
                    >

                </div>


                <!-- TANGGAL -->

                <div class="form-group">

                    <label>Tanggal Bayar</label>

                    <input
                        type="date"
                        name="tanggal_bayar"
                    >

                </div>


                <!-- STATUS -->

                <div class="form-group">

                    <label>Status</label>

                    <select name="status">

                        <option value="Belum Lunas">
                            Belum Lunas
                        </option>

                        <option value="Lunas">
                            Lunas
                        </option>

                    </select>

                </div>


                <!-- BUTTON -->

                <div class="form-actions">

                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        + Tambah Pembayaran
                    </button>

                </div>

            </div>

        </form>

    </div>


    <!-- DAFTAR PEMBAYARAN -->

    <div class="card">

        <div class="card-header">

            <h2>Daftar Pembayaran</h2>

            <p>
                Riwayat pembayaran penghuni KosMate.
            </p>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Penghuni</th>

                        <th>Kamar</th>

                        <th>Periode</th>

                        <th>Jumlah</th>

                        <th>Tanggal Bayar</th>

                        <th>Status</th>

                        <th>Aksi</th>

                    </tr>

                </thead>


                <tbody>

                    <?php while ($row = $result->fetch_assoc()) { ?>

                        <tr>

                            <td>
                                <?php echo $row["id"]; ?>
                            </td>


                            <td>

                                <strong>
                                    <?php
                                    echo htmlspecialchars(
                                        $row["nama"]
                                    );
                                    ?>
                                </strong>

                            </td>


                            <td>

                                <span class="room-badge">

                                    Kamar
                                    <?php
                                    echo htmlspecialchars(
                                        $row["nomor_kamar"]
                                    );
                                    ?>

                                </span>

                            </td>


                            <td>

                                <?php
                                echo htmlspecialchars(
                                    $row["periode"]
                                );
                                ?>

                            </td>


                            <td>

                                <strong>

                                    Rp
                                    <?php
                                    echo number_format(
                                        $row["jumlah"],
                                        0,
                                        ",",
                                        "."
                                    );
                                    ?>

                                </strong>

                            </td>


                            <td>

                                <?php

                                echo $row["tanggal_bayar"]
                                    ? htmlspecialchars(
                                        $row["tanggal_bayar"]
                                    )
                                    : "-";

                                ?>

                            </td>


                            <td>

                                <?php if ($row["status"] == "Lunas") { ?>

                                    <span class="status-badge status-paid">
                                        Lunas
                                    </span>

                                <?php } else { ?>

                                    <span class="status-badge status-unpaid">
                                        Belum Lunas
                                    </span>

                                <?php } ?>

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <a
                                        href="edit_pembayaran.php?id=<?php echo $row['id']; ?>"
                                        class="btn-edit"
                                    >
                                        Edit
                                    </a>

                                    <a
                                        href="hapus_pembayaran.php?id=<?php echo $row['id']; ?>"
                                        class="btn-delete"
                                        onclick="return confirm('Yakin ingin menghapus pembayaran ini?');"
                                    >
                                        Hapus
                                    </a>

                                </div>

                            </td>

                        </tr>

                    <?php } ?>

                </tbody>

            </table>

        </div>

    </div>

</div>

</body>

</html>