<?php

require_once "db.php";

// ==========================================
// TAMBAH PENGHUNI
// ==========================================

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nama = $_POST["nama"];
    $nik = $_POST["nik"];
    $no_hp = $_POST["no_hp"];
    $kamar_id = $_POST["kamar_id"];
    $tanggal_masuk = $_POST["tanggal_masuk"];
    $status = $_POST["status"];

    $sql = "INSERT INTO penghuni
            (nama, nik, no_hp, kamar_id, tanggal_masuk, status)
            VALUES
            ('$nama', '$nik', '$no_hp', '$kamar_id', '$tanggal_masuk', '$status')";

    if ($conn->query($sql) === TRUE) {

        header("Location: penghuni.php");
        exit();

    } else {

        echo "Gagal menambahkan penghuni: " . $conn->error;

    }
}


// ==========================================
// AMBIL DATA PENGHUNI
// ==========================================

$sql = "SELECT penghuni.*, kamar.nomor_kamar
        FROM penghuni
        INNER JOIN kamar ON penghuni.kamar_id = kamar.id
        ORDER BY penghuni.id DESC";

$result = $conn->query($sql);


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

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Data Penghuni - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>

<body>

<div class="container">

    <!-- HEADER -->

    <div class="page-header">

        <div>
            <h1>Data Penghuni</h1>
            <p class="subtitle">
                Kelola data penghuni KosMate
            </p>
        </div>

        <a href="index.php" class="btn-secondary">
            ← Dashboard
        </a>

    </div>


    <!-- FORM TAMBAH PENGHUNI -->

    <div class="card">

        <div class="card-header">

            <div>
                <h2>Tambah Penghuni</h2>

                <p>
                    Masukkan data penghuni baru
                </p>
            </div>

        </div>


        <form method="POST" class="form-grid">

            <!-- NAMA -->

            <div class="form-group">

                <label>Nama Lengkap</label>

                <input
                    type="text"
                    name="nama"
                    placeholder="Contoh: Budi Santoso"
                    required
                >

            </div>


            <!-- NIK -->

            <div class="form-group">

                <label>NIK</label>

                <input
                    type="text"
                    name="nik"
                    placeholder="Contoh: 1471000000000001"
                    required
                >

            </div>


            <!-- NO HP -->

            <div class="form-group">

                <label>No. HP</label>

                <input
                    type="text"
                    name="no_hp"
                    placeholder="Contoh: 081234567890"
                    required
                >

            </div>


            <!-- KAMAR -->

            <div class="form-group">

                <label>Kamar</label>

                <select name="kamar_id" required>

                    <option value="">
                        -- Pilih Kamar --
                    </option>

                    <?php while ($kamar = $result_kamar->fetch_assoc()) { ?>

                        <option value="<?php echo $kamar["id"]; ?>">

                            <?php echo $kamar["nomor_kamar"]; ?>

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
                    required
                >

            </div>


            <!-- STATUS -->

            <div class="form-group">

                <label>Status</label>

                <select name="status">

                    <option value="Aktif">
                        Aktif
                    </option>

                    <option value="Tidak Aktif">
                        Tidak Aktif
                    </option>

                </select>

            </div>


            <!-- BUTTON -->

            <div class="form-actions">

                <button type="submit" class="btn-primary">
                    + Tambah Penghuni
                </button>

            </div>

        </form>

    </div>


    <!-- DAFTAR PENGHUNI -->

    <div class="card">

        <div class="card-header">

            <div>

                <h2>Daftar Penghuni</h2>

                <p>
                    Data penghuni yang terdaftar di KosMate
                </p>

            </div>

        </div>


        <div class="table-wrapper">

            <table>

                <thead>

                    <tr>

                        <th>ID</th>

                        <th>Nama</th>

                        <th>NIK</th>

                        <th>No. HP</th>

                        <th>Kamar</th>

                        <th>Tanggal Masuk</th>

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
                                    <?php echo $row["nama"]; ?>
                                </strong>
                            </td>

                            <td>
                                <?php echo $row["nik"]; ?>
                            </td>

                            <td>
                                <?php echo $row["no_hp"]; ?>
                            </td>

                            <td>
                                <span class="room-badge">
                                    <?php echo $row["nomor_kamar"]; ?>
                                </span>
                            </td>

                            <td>
                                <?php echo $row["tanggal_masuk"]; ?>
                            </td>

                            <td>

                                <?php if ($row["status"] == "Aktif") { ?>

                                    <span class="status-badge status-active">
                                        Aktif
                                    </span>

                                <?php } else { ?>

                                    <span class="status-badge status-inactive">
                                        Tidak Aktif
                                    </span>

                                <?php } ?>

                            </td>

                            <td>

                                <div class="action-buttons">

                                    <a
                                        href="edit_penghuni.php?id=<?php echo $row['id']; ?>"
                                        class="btn-edit"
                                    >
                                        Edit
                                    </a>

                                    <a
                                        href="hapus_penghuni.php?id=<?php echo $row['id']; ?>"
                                        class="btn-delete"
                                        onclick="return confirm('Yakin ingin menghapus penghuni ini?');"
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