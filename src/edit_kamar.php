<?php

require_once "db.php";

// Ambil ID kamar
$id = isset($_GET["id"]) ? (int) $_GET["id"] : 0;

// ==============================
// PROSES UPDATE
// ==============================
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $id = (int) $_POST["id"];
    $nomor_kamar = $_POST["nomor_kamar"];
    $tipe = $_POST["tipe"];
    $harga = $_POST["harga"];
    $status = $_POST["status"];

    $stmt = $conn->prepare(
        "UPDATE kamar
         SET nomor_kamar = ?, tipe = ?, harga = ?, status = ?
         WHERE id = ?"
    );

    $stmt->bind_param(
        "ssisi",
        $nomor_kamar,
        $tipe,
        $harga,
        $status,
        $id
    );

    if ($stmt->execute()) {

        header("Location: kamar.php");
        exit();

    } else {

        echo "Gagal memperbarui kamar: " . $conn->error;

    }

    $stmt->close();
}


// ==============================
// AMBIL DATA KAMAR
// ==============================
$stmt = $conn->prepare(
    "SELECT * FROM kamar WHERE id = ?"
);

$stmt->bind_param("i", $id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows == 0) {

    die("Data kamar tidak ditemukan.");

}

$kamar = $result->fetch_assoc();

$stmt->close();

?>

<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Edit Kamar - KosMate</title>

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

            <a href="#">
                Penghuni
            </a>

            <a href="#">
                Pembayaran
            </a>

            <a href="#">
                Perbaikan
            </a>

        </div>

    </nav>


    <!-- ==========================
         MAIN CONTENT
    =========================== -->

    <main class="container">

        <div class="page-header">

            <div>

                <h1>
                    Edit Kamar
                </h1>

                <p>
                    Perbarui informasi kamar yang sudah terdaftar.
                </p>

            </div>

        </div>


        <!-- ==========================
             FORM EDIT
        =========================== -->

        <section class="card">

            <div class="card-header">

                <div>

                    <h2>
                        Informasi Kamar
                    </h2>

                    <p>
                        Ubah data kamar sesuai kebutuhan.
                    </p>

                </div>

            </div>


            <form method="POST" class="form-grid">

                <!-- ID -->

                <input
                    type="hidden"
                    name="id"
                    value="<?= $kamar["id"]; ?>"
                >


                <!-- NOMOR KAMAR -->

                <div class="form-group">

                    <label for="nomor_kamar">
                        Nomor Kamar
                    </label>

                    <input
                        type="text"
                        id="nomor_kamar"
                        name="nomor_kamar"
                        value="<?= htmlspecialchars($kamar["nomor_kamar"]); ?>"
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
                        value="<?= htmlspecialchars($kamar["tipe"]); ?>"
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
                        value="<?= $kamar["harga"]; ?>"
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

                        <option
                            value="Tersedia"
                            <?= $kamar["status"] == "Tersedia" ? "selected" : ""; ?>
                        >
                            Tersedia
                        </option>

                        <option
                            value="Terisi"
                            <?= $kamar["status"] == "Terisi" ? "selected" : ""; ?>
                        >
                            Terisi
                        </option>

                        <option
                            value="Perbaikan"
                            <?= $kamar["status"] == "Perbaikan" ? "selected" : ""; ?>
                        >
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
                        Simpan Perubahan
                    </button>


                    <a
                        href="kamar.php"
                        class="btn btn-secondary"
                    >
                        ← Kembali
                    </a>

                </div>

            </form>

        </section>

    </main>

</body>

</html>