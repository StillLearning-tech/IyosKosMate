<?php

require_once "db.php";

// ==========================================
// TAMBAH MAINTENANCE
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $penghuni_id = $_POST["penghuni_id"];
    $judul = $_POST["judul"];
    $deskripsi = $_POST["deskripsi"];
    $tanggal_lapor = $_POST["tanggal_lapor"];
    $prioritas = $_POST["prioritas"];
    $status = $_POST["status"];

    $sql = "INSERT INTO maintenance
            (penghuni_id, judul, deskripsi, tanggal_lapor, prioritas, status)
            VALUES
            ('$penghuni_id', '$judul', '$deskripsi', '$tanggal_lapor', '$prioritas', '$status')";

    if ($conn->query($sql) === TRUE) {

        header("Location: maintenance.php");
        exit();

    } else {

        echo "Gagal menambahkan laporan: " . $conn->error;

    }
}


// ==========================================
// AMBIL DATA MAINTENANCE
// ==========================================

$sql = "SELECT maintenance.*,
               penghuni.nama,
               kamar.nomor_kamar
        FROM maintenance
        INNER JOIN penghuni
            ON maintenance.penghuni_id = penghuni.id
        INNER JOIN kamar
            ON penghuni.kamar_id = kamar.id
        ORDER BY maintenance.id DESC";

$result = $conn->query($sql);


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

    <title>Maintenance - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>


<body>

<div class="container">


    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Maintenance</h1>

            <p class="subtitle">
                Kelola laporan kerusakan dan perbaikan kos
            </p>

        </div>

        <a href="index.php" class="btn-secondary">
            ← Dashboard
        </a>

    </div>


    <!-- FORM TAMBAH -->

    <div class="card">

        <div class="card-header">

            <h2>Tambah Laporan Maintenance</h2>

            <p>
                Catat kerusakan atau masalah fasilitas kos.
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


                <!-- JUDUL -->

                <div class="form-group">

                    <label>Judul Masalah</label>

                    <input
                        type="text"
                        name="judul"
                        placeholder="Contoh: AC tidak dingin"
                        required
                    >

                </div>


                <!-- TANGGAL -->

                <div class="form-group">

                    <label>Tanggal Lapor</label>

                    <input
                        type="date"
                        name="tanggal_lapor"
                        required
                    >

                </div>


                <!-- PRIORITAS -->

                <div class="form-group">

                    <label>Prioritas</label>

                    <select name="prioritas">

                        <option value="Rendah">
                            Rendah
                        </option>

                        <option value="Sedang" selected>
                            Sedang
                        </option>

                        <option value="Tinggi">
                            Tinggi
                        </option>

                    </select>

                </div>


                <!-- STATUS -->

                <div class="form-group">

                    <label>Status</label>

                    <select name="status">

                        <option value="Menunggu">
                            Menunggu
                        </option>

                        <option value="Diproses">
                            Diproses
                        </option>

                        <option value="Selesai">
                            Selesai
                        </option>

                    </select>

                </div>


                <!-- DESKRIPSI -->

                <div class="form-group">

                    <label>Deskripsi Masalah</label>

                    <textarea
                        name="deskripsi"
                        rows="4"
                        placeholder="Jelaskan masalah yang terjadi..."
                        required
                    ></textarea>

                </div>


                <!-- BUTTON -->

                <div class="form-actions">

                    <button
                        type="submit"
                        class="btn-primary"
                    >
                        + Tambah Laporan
                    </button>

                </div>

            </div>

        </form>

    </div>


    <!-- DAFTAR MAINTENANCE -->

    <div class="card">

        <div class="card-header">

            <h2>Daftar Maintenance</h2>

            <p>
                Riwayat laporan kerusakan dan perbaikan.
            </p>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>
                        <th>Penghuni</th>
                        <th>Kamar</th>
                        <th>Masalah</th>
                        <th>Tanggal</th>
                        <th>Prioritas</th>
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

                                <strong>
                                    <?php
                                    echo htmlspecialchars(
                                        $row["judul"]
                                    );
                                    ?>
                                </strong>

                            </td>


                            <td>

                                <?php
                                echo htmlspecialchars(
                                    $row["tanggal_lapor"]
                                );
                                ?>

                            </td>


                            <td>

                                <?php

                                if ($row["prioritas"] == "Tinggi") {

                                    echo '<span class="priority-high">
                                            Tinggi
                                          </span>';

                                } elseif ($row["prioritas"] == "Sedang") {

                                    echo '<span class="priority-medium">
                                            Sedang
                                          </span>';

                                } else {

                                    echo '<span class="priority-low">
                                            Rendah
                                          </span>';

                                }

                                ?>

                            </td>


                            <td>

                                <?php

                                if ($row["status"] == "Selesai") {

                                    echo '<span class="status-badge status-complete">
                                            Selesai
                                          </span>';

                                } elseif ($row["status"] == "Diproses") {

                                    echo '<span class="status-badge status-process">
                                            Diproses
                                          </span>';

                                } else {

                                    echo '<span class="status-badge status-waiting">
                                            Menunggu
                                          </span>';

                                }

                                ?>

                            </td>


                            <td>

                                <div class="action-buttons">

                                    <a
                                        href="edit_maintenance.php?id=<?php echo $row['id']; ?>"
                                        class="btn-edit"
                                    >
                                        Edit
                                    </a>

                                    <a
                                        href="hapus_maintenance.php?id=<?php echo $row['id']; ?>"
                                        class="btn-delete"
                                        onclick="return confirm('Yakin ingin menghapus laporan ini?');"
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