export function buildPaymentsCsv(payments = []) {
  const headers = [
    'Nama Penghuni',
    'Nomor Kamar',
    'Periode',
    'Nominal',
    'Tanggal Bayar',
    'Status',
  ];

  const escapeCsv = (value) => {
    let text = String(value ?? '');

    // Cegah formula injection saat CSV dibuka di aplikasi spreadsheet.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const rows = payments.map((payment) => [
    payment.penghuni_nama,
    payment.nomor_kamar,
    payment.periode,
    payment.jumlah,
    payment.tanggal_bayar ? String(payment.tanggal_bayar).slice(0, 10) : '',
    payment.status,
  ]);

  const csvRows = [headers, ...rows].map((row) =>
    row.map(escapeCsv).join(',')
  );

  // BOM membantu Excel mengenali encoding UTF-8.
  return '\uFEFF' + csvRows.join('\r\n');
}
