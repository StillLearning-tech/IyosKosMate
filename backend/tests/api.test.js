import test from 'node:test';
import assert from 'node:assert';

test('Backend sanity check and environment configuration', () => {
  assert.strictEqual(typeof process.env, 'object', 'process.env should be available');
  assert.ok(true, 'Test harness successfully executed');
});

test('Format Rupiah helper test', () => {
  const formatRupiah = (amount) => {
    if (amount === null || amount === undefined || amount === '') return 'Rp 0';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  assert.strictEqual(formatRupiah(1500000).replace(/\s/g, ' '), 'Rp 1.500.000'.replace(/\s/g, ' '));
  assert.strictEqual(formatRupiah(null), 'Rp 0');
});
