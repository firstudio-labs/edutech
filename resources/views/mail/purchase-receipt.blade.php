<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Struk Pembelian - JAGGAD ACADEMY</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background-color: #0f0f1a;
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #c5c5d8;
            padding: 32px 16px;
        }
        .wrapper {
            max-width: 620px;
            margin: 0 auto;
        }
        /* Header */
        .header {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            border: 1px solid rgba(220, 38, 38, 0.3);
            border-radius: 16px 16px 0 0;
            padding: 32px;
            text-align: center;
        }
        .brand {
            font-size: 24px;
            font-weight: 900;
            color: #ff4d4d;
            letter-spacing: 1.5px;
            text-shadow: 0 0 18px rgba(220, 38, 38, 0.5);
        }
        .header-subtitle {
            color: rgba(197, 197, 216, 0.7);
            font-size: 13px;
            margin-top: 6px;
        }
        .success-badge {
            display: inline-block;
            margin-top: 20px;
            padding: 8px 20px;
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            border-radius: 100px;
            color: #10b981;
            font-size: 13px;
            font-weight: 600;
        }
        /* Body */
        .body {
            background: #13131f;
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-top: none;
            padding: 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #f0f0f8;
            margin-bottom: 8px;
        }
        .greeting-sub {
            font-size: 14px;
            color: rgba(197, 197, 216, 0.7);
            line-height: 1.6;
            margin-bottom: 28px;
        }
        /* Info Box */
        .info-box {
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
        }
        .info-item {
            flex: 1;
            min-width: 140px;
        }
        .info-label {
            font-size: 11px;
            color: rgba(197, 197, 216, 0.5);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #f0f0f8;
        }
        /* Section Title */
        .section-title {
            font-size: 13px;
            font-weight: 700;
            color: rgba(197, 197, 216, 0.6);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 12px;
        }
        /* Products Table */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
            table-layout: fixed;
        }
        thead th {
            background: rgba(220, 38, 38, 0.08);
            color: rgba(197, 197, 216, 0.7);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 10px 14px;
            text-align: left;
            font-weight: 700;
            border-bottom: 1px solid rgba(220, 38, 38, 0.2);
        }
        thead th:first-child { width: 70%; }
        thead th:last-child { width: 30%; text-align: right; }
        tbody td {
            padding: 12px 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 14px;
            color: #c5c5d8;
            vertical-align: middle;
            word-break: break-word;
        }
        tbody td:last-child {
            text-align: right;
            font-weight: 600;
            color: #f0f0f8;
            white-space: nowrap;
            width: 30%;
        }
        .product-name {
            color: #f0f0f8;
            font-weight: 600;
            line-height: 1.4;
        }
        .product-category {
            font-size: 12px;
            color: rgba(197, 197, 216, 0.5);
            margin-top: 3px;
        }
        /* Total Row */
        .total-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.04));
            border: 1px solid rgba(220, 38, 38, 0.2);
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 28px;
        }
        .total-label {
            font-size: 15px;
            font-weight: 700;
            color: #f0f0f8;
        }
        .total-amount {
            font-size: 20px;
            font-weight: 800;
            color: #ff4d4d;
            text-shadow: 0 0 12px rgba(220, 38, 38, 0.4);
        }
        /* CTA Button */
        .cta {
            text-align: center;
            margin-bottom: 28px;
        }
        .cta a {
            display: inline-block;
            padding: 14px 36px;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            text-decoration: none;
            border-radius: 100px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.3px;
        }
        /* Footer */
        .footer {
            background: #0d0d1a;
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-top: none;
            border-radius: 0 0 16px 16px;
            padding: 24px 32px;
            text-align: center;
        }
        .footer p {
            font-size: 12px;
            color: rgba(197, 197, 216, 0.4);
            line-height: 1.7;
        }
        .footer a { color: #f87171; text-decoration: none; }

        @media (max-width: 480px) {
            .body, .header, .footer { padding: 24px 16px; }
            .info-box { flex-direction: column; gap: 12px; }
        }
    </style>
</head>
<body>
<div class="wrapper">
    <!-- HEADER -->
    <div class="header">
        <div class="brand">⚡ JAGGAD ACADEMY</div>
        <div class="header-subtitle">Platform Digital Learning #1 Indonesia</div>
        <div class="success-badge">✓ &nbsp;Pembayaran Berhasil</div>
    </div>

    <!-- BODY -->
    <div class="body">
        <p class="greeting">Halo, {{ $transaction->user->name }}! 🎉</p>
        <p class="greeting-sub">
            Terima kasih telah berbelanja di JAGGAD ACADEMY. Pembayaran Anda telah kami terima dan produk berikut sudah aktif di akun Anda. Selamat belajar!
        </p>

        <!-- Order Info -->
        <p class="section-title">Detail Transaksi</p>
        <div class="info-box">
            <div class="info-item">
                <div class="info-label">No. Transaksi</div>
                <div class="info-value">{{ $transaction->transaction_code }}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Tanggal Bayar</div>
                <div class="info-value">
                    {{ $transaction->paid_at 
                        ? \Carbon\Carbon::parse($transaction->paid_at)->locale('id')->isoFormat('D MMMM YYYY, HH:mm') 
                        : now()->locale('id')->isoFormat('D MMMM YYYY, HH:mm') }}
                </div>
            </div>
            <div class="info-item">
                <div class="info-label">Metode Pembayaran</div>
                <div class="info-value">
                    {{ strtoupper(str_replace('_', ' ', $transaction->payment_type ?? 'Midtrans')) }}
                </div>
            </div>
        </div>

        <!-- Products -->
        <p class="section-title">Produk yang Dibeli</p>
        <table>
            <thead>
                <tr>
                    <th>Produk</th>
                    <th style="text-align:right;">Harga</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $item)
                <tr>
                    <td>
                        <div class="product-name">{{ $item->product->name ?? 'Produk' }}</div>
                        @if($item->product?->category)
                            <div class="product-category">{{ $item->product->category->name }}</div>
                        @endif
                    </td>
                    <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Total -->
        <div class="total-row">
            <span class="total-label">Total Pembayaran</span>
            <span class="total-amount">Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
        </div>

        <!-- CTA -->
        <div class="cta">
            <a href="{{ url('/dashboard') }}">Akses Materi Saya →</a>
        </div>
    </div>

    <!-- FOOTER -->
    <div class="footer">
        <p>
            Email ini dikirim otomatis oleh sistem JAGGAD ACADEMY.<br />
            Jika ada pertanyaan, hubungi kami di <a href="mailto:halo@jaggad.id">halo@jaggad.id</a>.<br /><br />
            &copy; {{ date('Y') }} JAGGAD ACADEMY · Semua Hak Dilindungi
        </p>
    </div>
</div>
</body>
</html>
