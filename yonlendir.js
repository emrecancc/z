// Kisa adres yonlendirmesi. emrecancc.github.io (her yol) ve emrecancc.github.io/z sayfalari bu dosyayi onbelleksiz yukler.
// adres.txt: calisan tunel adresleri (satir satir). Hepsi ayni anda denenir, ilk yanit veren acilir.
// Deneme: MeshCentral simgesi (favicon) resim olarak yuklenir; Cloudflare hata sayfasi resim olmadigi icin yuklenemez.
(function () {
  var M = document.getElementById('m'), tries = 0;
  function show(h) { M.innerHTML = h; }
  function probe(u) {
    return new Promise(function (ok, fail) {
      var img = new Image(), t = setTimeout(function () { img.src = ''; fail(); }, 9000);
      img.onload = function () { clearTimeout(t); ok(u); };
      img.onerror = function () { clearTimeout(t); fail(); };
      img.src = u + '/favicon.ico?t=' + Date.now();
    });
  }
  function firstOk(list) {
    return new Promise(function (ok, fail) {
      var left = list.length; if (!left) return fail();
      list.forEach(function (u) { probe(u).then(ok, function () { if (--left == 0) fail(); }); });
    });
  }
  function run() {
    tries++;
    fetch('/z/adres.txt?t=' + Date.now(), { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        var lines = t.split(/\s+/).filter(function (x) { return x; });
        if (lines[0] === 'KAPALI') { // Uzaktan erisim kapali: giris paneli yerine basit bir depoya git
          var to = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?$/.test(lines[1] || '') ? lines[1] : 'https://github.com/';
          location.replace(to);
          return new Promise(function () { }); // Yonlendirme suruyor; baska bir sey gosterme
        }
        var list = lines.filter(function (u) { return /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/.test(u); });
        return firstOk(list).catch(function () { throw list; });
      })
      .then(function (u) { show('<p>Yönlendiriliyor…</p><p><small>' + u + '</small></p>'); location.replace(u); })
      .catch(function (list) {
        var links = (Array.isArray(list) ? list : []).map(function (u) { return '<a href="' + u + '">' + u + '</a>'; }).join('<br>');
        show('<p>Bağlantı şu an kurulamadı, otomatik olarak yeniden deneniyor… (' + tries + ')</p>' +
          '<p><small>Bilgisayar yeni açıldıysa ya da bağlantı yenileniyorsa 1-2 dakika sürebilir.</small></p>' +
          (links ? '<p><small>Doğrudan denemek için:<br>' + links + '</small></p>' : ''));
        setTimeout(run, 5000);
      });
  }
  run();
})();
