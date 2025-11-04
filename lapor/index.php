<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Kirim ke Channel Telegram (Server-side)</title>
  <style>
    body{font-family: Arial, sans-serif; max-width:640px;margin:30px auto;padding:16px}
    label{display:block;margin:10px 0 6px}
    input[type="text"], textarea{width:100%;padding:8px;border:1px solid #ccc;border-radius:6px}
    button{margin-top:10px;padding:10px 14px;border-radius:8px;border:none;cursor:pointer}
    .ok{color:green;margin-top:8px}
    .err{color:red;margin-top:8px}
  </style>
</head>
<body>
  <h2>Kirim Pesan ke Channel Telegram (Server)</h2>

  <label for="message">Pesan</label>
  <textarea id="message" rows="5" placeholder="Tulis pesan Anda..."></textarea>

  <div style="margin-top:12px">
    <button id="sendBtn">Kirim</button>
  </div>

  <div id="status"></div>

  <script>
    document.getElementById('sendBtn').addEventListener('click', async () => {
      const msg = document.getElementById('message').value.trim();
      const status = document.getElementById('status');
      status.textContent = '';
      status.className = '';
      if (!msg) { status.textContent = 'Isi pesan dulu.'; status.className='err'; return; }
      document.getElementById('sendBtn').disabled = true;
      document.getElementById('sendBtn').textContent = 'Mengirim...';
      try {
        const resp = await fetch('send.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg })
        });
        const data = await resp.json();
        if (data && data.ok) {
          status.textContent = 'Pesan berhasil dikirim ✅';
          status.className = 'ok';
          document.getElementById('message').value = '';
        } else {
          status.textContent = 'Gagal: ' + (data.description || JSON.stringify(data));
          status.className = 'err';
        }
      } catch (e) {
        status.textContent = 'Error jaringan. Lihat console.';
        status.className = 'err';
        console.error(e);
      } finally {
        document.getElementById('sendBtn').disabled = false;
        document.getElementById('sendBtn').textContent = 'Kirim';
      }
    });
  </script>
</body>
</html>
