import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPaymentsCsv } from './paymentCsv.js';

test('menghasilkan header dan data pembayaran dalam format CSV', () => {
  const csv = buildPaymentsCsv([{
    penghuni_nama: 'Andi',
    nomor_kamar: '01',
    periode: '2026-11',
    jumlah: 1500000,
    tanggal_bayar: '2026-11-10T00:00:00.000Z',
    status: 'Lunas',
  }]);

  assert.ok(csv.startsWith('\uFEFF'));
  assert.match(csv, /"Nama Penghuni","Nomor Kamar","Periode","Nominal","Tanggal Bayar","Status"/);
  assert.match(csv, /"Andi","01","2026-11","1500000","2026-11-10","Lunas"/);
});

test('mengamankan koma dan tanda kutip di dalam nilai CSV', () => {
  const csv = buildPaymentsCsv([{
    penghuni_nama: 'Andi, "Budi"',
    nomor_kamar: '02',
    periode: '2026-11',
    jumlah: 1000000,
    tanggal_bayar: null,
    status: 'Belum Lunas',
  }]);

  assert.match(csv, /"Andi, ""Budi"""/);
});

test('mengamankan nilai yang berpotensi menjadi formula spreadsheet', () => {
  const csv = buildPaymentsCsv([{
    penghuni_nama: '=HYPERLINK("https://example.com")',
    nomor_kamar: '03',
    periode: '2026-11',
    jumlah: 1000000,
    tanggal_bayar: '',
    status: 'Belum Lunas',
  }]);

  assert.match(csv, /"'=HYPERLINK/);
});

test('tetap menghasilkan header ketika tidak ada pembayaran', () => {
  const csv = buildPaymentsCsv([]);
  assert.equal(
    csv,
    '\uFEFF"Nama Penghuni","Nomor Kamar","Periode","Nominal","Tanggal Bayar","Status"'
  );
});
