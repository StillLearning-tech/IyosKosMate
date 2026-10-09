<?php

require_once "db.php";


// ==========================================
// TABEL KAMAR
// ==========================================

$sql_kamar = "CREATE TABLE IF NOT EXISTS kamar (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nomor_kamar VARCHAR(20) NOT NULL,
    tipe VARCHAR(50) NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Tersedia'
)";

if ($conn->query($sql_kamar) === TRUE) {

    echo "Tabel kamar berhasil dibuat!<br>";

} else {

    echo "Gagal membuat tabel kamar: " . $conn->error . "<br>";

}


// ==========================================
// TABEL PENGHUNI
// ==========================================

$sql_penghuni = "CREATE TABLE IF NOT EXISTS penghuni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nik VARCHAR(30) NOT NULL,
    no_hp VARCHAR(20) NOT NULL,
    kamar_id INT NOT NULL,
    tanggal_masuk DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Aktif',

    CONSTRAINT fk_penghuni_kamar
        FOREIGN KEY (kamar_id)
        REFERENCES kamar(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)";

if ($conn->query($sql_penghuni) === TRUE) {

    echo "Tabel penghuni berhasil dibuat!";

} else {

    echo "Gagal membuat tabel penghuni: " . $conn->error;

}

// ==========================================
// TABEL PEMBAYARAN
// ==========================================

$sql_pembayaran = "CREATE TABLE IF NOT EXISTS pembayaran (
    id INT AUTO_INCREMENT PRIMARY KEY,
    penghuni_id INT NOT NULL,
    periode VARCHAR(7) NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    tanggal_bayar DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Belum Lunas',

    CONSTRAINT fk_pembayaran_penghuni
        FOREIGN KEY (penghuni_id)
        REFERENCES penghuni(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)";

if ($conn->query($sql_pembayaran) === TRUE) {

    echo "<br>Tabel pembayaran berhasil dibuat!";

} else {

    echo "<br>Gagal membuat tabel pembayaran: " . $conn->error;

}

// ==========================================
// TABEL MAINTENANCE
// ==========================================

$sql_maintenance = "CREATE TABLE IF NOT EXISTS maintenance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    penghuni_id INT NOT NULL,
    judul VARCHAR(100) NOT NULL,
    deskripsi TEXT NOT NULL,
    tanggal_lapor DATE NOT NULL,
    prioritas VARCHAR(20) NOT NULL DEFAULT 'Sedang',
    status VARCHAR(20) NOT NULL DEFAULT 'Menunggu',

    CONSTRAINT fk_maintenance_penghuni
        FOREIGN KEY (penghuni_id)
        REFERENCES penghuni(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
)";

if ($conn->query($sql_maintenance) === TRUE) {
    echo "<br>Tabel maintenance berhasil dibuat!";
} else {
    echo "<br>Gagal membuat tabel maintenance: " . $conn->error;
}


$conn->close();

?>