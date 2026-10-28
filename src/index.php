<?php

require_once "db.php";

// ==========================================
// DATA KAMAR
// ==========================================

$sql_kamar = "SELECT COUNT(*) AS total FROM kamar";
$result_kamar = $conn->query($sql_kamar);
$total_kamar = $result_kamar->fetch_assoc()["total"];


// ==========================================
// KAMAR TERISI
// ==========================================

$sql_terisi = "SELECT COUNT(*) AS total FROM penghuni WHERE status = 'Aktif'";
$result_terisi = $conn->query($sql_terisi);
$total_terisi = $result_terisi->fetch_assoc()["total"];


// ==========================================
// KAMAR TERSEDIA
// ==========================================

$total_tersedia = $total_kamar - $total_terisi;


// ==========================================
// PENGHUNI AKTIF
// ==========================================

$sql_penghuni = "SELECT COUNT(*) AS total
                 FROM penghuni
                 WHERE status = 'Aktif'";

$result_penghuni = $conn->query($sql_penghuni);
$total_penghuni = $result_penghuni->fetch_assoc()["total"];


// ==========================================
// PEMBAYARAN LUNAS
// ==========================================

$sql_lunas = "SELECT COUNT(*) AS total
              FROM pembayaran
              WHERE status = 'Lunas'";

$result_lunas = $conn->query($sql_lunas);
$total_lunas = $result_lunas->fetch_assoc()["total"];


// ==========================================
// PEMBAYARAN BELUM LUNAS
// ==========================================

$sql_belum = "SELECT COUNT(*) AS total
              FROM pembayaran
              WHERE status = 'Belum Lunas'";

$result_belum = $conn->query($sql_belum);
$total_belum = $result_belum->fetch_assoc()["total"];


// ==========================================
// TOTAL PENDAPATAN
// ==========================================

$sql_pendapatan = "SELECT SUM(jumlah) AS total
                   FROM pembayaran
                   WHERE status = 'Lunas'";

$result_pendapatan = $conn->query($sql_pendapatan);
$total_pendapatan = $result_pendapatan->fetch_assoc()["total"];

if ($total_pendapatan == NULL) {
    $total_pendapatan = 0;
}

// ==========================================
// MAINTENANCE
// ==========================================

$sql_maintenance_total = "SELECT COUNT(*) AS total
                           FROM maintenance";

$result_maintenance_total = $conn->query($sql_maintenance_total);
$total_maintenance = $result_maintenance_total->fetch_assoc()["total"];


$sql_maintenance_menunggu = "SELECT COUNT(*) AS total
                              FROM maintenance
                              WHERE status = 'Menunggu'";

$result_maintenance_menunggu = $conn->query($sql_maintenance_menunggu);
$total_menunggu = $result_maintenance_menunggu->fetch_assoc()["total"];


$sql_maintenance_diproses = "SELECT COUNT(*) AS total
                              FROM maintenance
                              WHERE status = 'Diproses'";

$result_maintenance_diproses = $conn->query($sql_maintenance_diproses);
$total_diproses = $result_maintenance_diproses->fetch_assoc()["total"];


$sql_maintenance_selesai = "SELECT COUNT(*) AS total
                             FROM maintenance
                             WHERE status = 'Selesai'";

$result_maintenance_selesai = $conn->query($sql_maintenance_selesai);
$total_selesai = $result_maintenance_selesai->fetch_assoc()["total"];

?>

<!DOCTYPE html>
<html lang="id">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Dashboard - KosMate</title>

    <link rel="stylesheet" href="css/style.css">

</head>


<body>

<div class="container">


    <!-- HEADER -->

    <div class="page-header">

        <div>

            <h1>Dashboard KostMate</h1>

            <p class="subtitle">
                Sistem Manajemen Kos
            </p>

        </div>

    </div>


    <!-- STATISTIK UTAMA -->

    <div class="dashboard-grid">


        <!-- TOTAL KAMAR -->

        <div class="stat-card">

            <div class="stat-icon">
                🏠
            </div>

            <div>

                <p class="stat-label">
                    Total Kamar
                </p>

                <h2>
                    <?php echo $total_kamar; ?>
                </h2>

            </div>

        </div>


        <!-- KAMAR TERSEDIA -->

        <div class="stat-card">

            <div class="stat-icon">
                🟢
            </div>

            <div>

                <p class="stat-label">
                    Kamar Tersedia
                </p>

                <h2>
                    <?php echo $total_tersedia; ?>
                </h2>

            </div>

        </div>


        <!-- PENGHUNI -->

        <div class="stat-card">

            <div class="stat-icon">
                👤
            </div>

            <div>

                <p class="stat-label">
                    Penghuni Aktif
                </p>

                <h2>
                    <?php echo $total_penghuni; ?>
                </h2>

            </div>

        </div>


        <!-- PEMBAYARAN LUNAS -->

        <div class="stat-card">

            <div class="stat-icon">
                💰
            </div>

            <div>

                <p class="stat-label">
                    Pembayaran Lunas
                </p>

                <h2>
                    <?php echo $total_lunas; ?>
                </h2>

            </div>

        </div>

    </div>


    <!-- INFORMASI PEMBAYARAN -->

    <div class="dashboard-section">

        <div class="card">

            <div class="card-header">

                <h2>Ringkasan Pembayaran</h2>

                <p>
                    Informasi pembayaran penghuni.
                </p>

            </div>


            <div class="payment-summary">


                <div class="summary-item">

                    <span>
                        Pembayaran Lunas
                    </span>

                    <strong>
                        <?php echo $total_lunas; ?>
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Belum Lunas
                    </span>

                    <strong>
                        <?php echo $total_belum; ?>
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Total Pendapatan
                    </span>

                    <strong>
                        Rp
                        <?php
                        echo number_format(
                            $total_pendapatan,
                            0,
                            ",",
                            "."
                        );
                        ?>
                    </strong>

                </div>


            </div>

        </div>

    </div>

    <!-- INFORMASI MAINTENANCE -->

    <div class="dashboard-section">

        <div class="card">

            <div class="card-header">

                <h2>Ringkasan Maintenance</h2>

                <p>
                Status laporan kerusakan dan perbaikan kos.
                 </p>

            </div>


            <div class="payment-summary">


                <div class="summary-item">

                    <span>
                        Total Laporan
                    </span>

                    <strong>
                        <?php echo $total_maintenance; ?>
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Menunggu
                    </span>

                    <strong>
                        <?php echo $total_menunggu; ?>
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Diproses
                    </span>

                    <strong>
                        <?php echo $total_diproses; ?>
                    </strong>

                </div>


                <div class="summary-item">

                    <span>
                        Selesai
                    </span>

                    <strong>
                        <?php echo $total_selesai; ?>
                    </strong>

                </div>


            </div>

        </div>

    </div>


    <!-- MENU -->

    <div class="card">

        <div class="card-header">

            <h2>Kelola KosMate</h2>

            <p>
                Pilih menu untuk mengelola data kos.
            </p>

        </div>


        <div class="menu-grid">


            <a href="kamar.php" class="menu-card">

                <div class="menu-icon">
                    🏠
                </div>

                <div>

                    <h3>
                        Data Kamar
                    </h3>

                    <p>
                        Kelola data kamar kos
                    </p>

                </div>

            </a>


            <a href="penghuni.php" class="menu-card">

                <div class="menu-icon">
                    👤
                </div>

                <div>

                    <h3>
                        Data Penghuni
                    </h3>

                    <p>
                        Kelola data penghuni kos
                    </p>

                </div>

            </a>


            <a href="pembayaran.php" class="menu-card">

                <div class="menu-icon">
                    💰
                </div>

                <div>

                    <h3>
                        Pembayaran
                    </h3>

                    <p>
                        Kelola pembayaran kos
                    </p>

                </div>

            </a>


            <a href="maintenance.php" class="menu-card">

                <div class="menu-icon">
                    🔧
                </div>

                <div>

                    <h3>
                        Maintenance
                    </h3>

                    <p>
                        Kelola laporan kerusakan kost
                    </p>

                </div>

            </a>


        </div>

    </div>


</div>

</body>

</html>