<?php

require_once "db.php";

// ==============================
// TAMBAH KAMAR
// ==============================
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nomor_kamar = $_POST["nomor_kamar"];
    $tipe = $_POST["tipe"];
    $harga = $_POST["harga"];
    $status = $_POST["status"];

    // Gunakan prepared statement agar lebih aman
    $stmt = $conn->prepare(
        "INSERT INTO kamar (nomor_kamar, tipe, harga, status)
         VALUES (?, ?, ?, ?)"
    );

    $stmt->bind_param(
        "ssis",
        $nomor_kamar,
        $tipe,
        $harga,
        $status
    );

    if ($stmt->execute()) {
        header("Location: kamar.php");
        exit();
    } else {
        echo "Gagal menambahkan kamar: " . $conn->error;
    }

    $stmt->close();
}

// ==============================
// AMBIL DATA KAMAR
// ==============================
$sql = "SELECT * FROM kamar ORDER BY id DESC";
$result = $conn->query($sql);

?>

<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Data Kamar - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>

<body>

    <!-- ==========================
         NAVBAR
    =========================== -->

    <nav class="navbar">

        <div class="logo">
            KosMate
        </div>

        <div class="nav-menu">

            <a href="index.php">
                Dashboard
            </a>

            <a href="kamar.php" class="active">
                Kamar
            </a>

            <a href="penghuni.php">
                Penghuni
            </a>

            <a href="pembayaran.php">
                Pembayaran
            </a>

            <a href="maintenance.php">
                Perbaikan
            </a>

        </div>

    </nav>


    <!-- ==========================
         MAIN CONTENT
    =========================== -->

    <main class="container">

        <!-- HEADER -->

        <div class="page-header">

            <div>

                <h1>
                    Data Kamar
                </h1>

                <p>
                    Kelola data kamar kos, harga, dan status kamar.
                </p>

            </div>

        </div>


        <!-- ==========================
             FORM TAMBAH KAMAR
        =========================== -->

        <section class="card">

            <div class="card-header">

                <div>

                    <h2>
                        Tambah Kamar
                    </h2>

                    <p>
                        Masukkan informasi kamar baru.
                    </p>

                </div>

            </div>


            <form method="POST" class="form-grid">

                <!-- NOMOR KAMAR -->

                <div class="form-group">

                    <label for="nomor_kamar">
                        Nomor Kamar
                    </label>

                    <input
                        type="text"
                        id="nomor_kamar"
                        name="nomor_kamar"
                        placeholder="Contoh: A01"
                        required
                    >

                </div>


                <!-- TIPE -->

                <div class="form-group">

                    <label for="tipe">
                        Tipe Kamar
                    </label>

                    <input
                        type="text"
                        id="tipe"
                        name="tipe"
                        placeholder="Contoh: Standard"
                        required
                    >

                </div>


                <!-- HARGA -->

                <div class="form-group">

                    <label for="harga">
                        Harga per Bulan
                    </label>

                    <input
                        type="number"
                        id="harga"
                        name="harga"
                        placeholder="Contoh: 800000"
                        min="0"
                        required
                    >

                </div>


                <!-- STATUS -->

                <div class="form-group">

                    <label for="status">
                        Status
                    </label>

                    <select
                        id="status"
                        name="status"
                    >

                        <option value="Tersedia">
                            Tersedia
                        </option>

                        <option value="Terisi">
                            Terisi
                        </option>

                        <option value="Perbaikan">
                            Perbaikan
                        </option>

                    </select>

                </div>


                <!-- BUTTON -->

                <div class="form-action">

                    <button
                        type="submit"
                        class="btn btn-primary"
                    >
                        + Tambah Kamar
                    </button>

                </div>

            </form>

        </section>


        <!-- ==========================
             DAFTAR KAMAR
        =========================== -->

        <section class="card">

            <div class="card-header">

                <div>

                    <h2>
                        Daftar Kamar
                    </h2>

                    <p>
                        Daftar seluruh kamar yang terdaftar di KosMate.
                    </p>

                </div>

            </div>


            <div class="table-wrapper">

                <table class="data-table">

                    <thead>

                        <tr>

                            <th>
                                ID
                            </th>

                            <th>
                                Nomor Kamar
                            </th>

                            <th>
                                Tipe
                            </th>

                            <th>
                                Harga
                            </th>

                            <th>
                                Status
                            </th>

                            <th>
                                Aksi
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        <?php if ($result->num_rows > 0): ?>

                            <?php while ($row = $result->fetch_assoc()): ?>

                                <tr>

                                    <td>
                                        <?= $row["id"]; ?>
                                    </td>


                                    <td>

                                        <strong>
                                            <?= htmlspecialchars($row["nomor_kamar"]); ?>
                                        </strong>

                                    </td>


                                    <td>
                                        <?= htmlspecialchars($row["tipe"]); ?>
                                    </td>


                                    <td>

                                        Rp
                                        <?= number_format(
                                            $row["harga"],
                                            0,
                                            ",",
                                            "."
                                        ); ?>

                                    </td>


                                    <td>

                                        <?php

                                        $status_class = "";

                                        if ($row["status"] == "Tersedia") {

                                            $status_class = "status-tersedia";

                                        } elseif ($row["status"] == "Terisi") {

                                            $status_class = "status-terisi";

                                        } elseif ($row["status"] == "Perbaikan") {

                                            $status_class = "status-perbaikan";

                                        }

                                        ?>

                                        <span class="status <?= $status_class ?>">

                                            <?= htmlspecialchars($row["status"]); ?>

                                        </span>

                                    </td>


                                    <td>

                                        <div class="action-buttons">

                                            <a
                                                href="edit_kamar.php?id=<?= $row["id"]; ?>"
                                                class="btn btn-edit"
                                            >
                                                Edit
                                            </a>


                                            <a
                                                href="hapus_kamar.php?id=<?= $row["id"]; ?>"
                                                class="btn btn-delete"
                                                onclick="return confirm('Yakin ingin menghapus kamar ini?');"
                                            >
                                                Hapus
                                            </a>

                                        </div>

                                    </td>

                                </tr>

                            <?php endwhile; ?>


                        <?php else: ?>

                            <tr>

                                <td
                                    colspan="6"
                                    class="empty-data"
                                >

                                    Belum ada data kamar.

                                </td>

                            </tr>

                        <?php endif; ?>

                    </tbody>

                </table>

            </div>

        </section>

    </main>

</body>

</html>