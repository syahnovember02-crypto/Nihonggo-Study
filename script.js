
/* =========================================
   NIHONGO STUDY - FUJI BLUE
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   1. NAVIGASI HALAMAN
========================================= */

const daftarHalaman = [
    "kanji", "kosakata", "bunpou", "kaiwa",
    "listening", "quiz", "flashcard", "dokkai", "jlpt"
];

function sembunyikanSemuaHalaman() {
    daftarHalaman.forEach(function(menu) {
        const halaman = document.getElementById("halaman-" + menu);
        if (halaman) halaman.style.display = "none";
    });
}

function keBeranda() {
    sembunyikanSemuaHalaman();

    document.querySelectorAll(".header nav a").forEach(function(link) {
        link.classList.remove("active");
    });

    const link = document.querySelector('.header nav a[href="#beranda"]');
    if (link) link.classList.add("active");

    const beranda = document.getElementById("beranda");
    if (beranda) beranda.scrollIntoView({ behavior: "smooth" });
}


/* =========================================
   MEMBUKA KATEGORI KOSAKATA
========================================= */


function buatHTMLFurigana(kata, furigana) {
    const aman = (teks) => String(teks ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[karakter]));

    kata = String(kata ?? "");
    furigana = String(furigana ?? "");

    // Kosakata tanpa kanji: tidak perlu furigana
    if (!/\p{Script=Han}/u.test(kata)) {
        return aman(kata);
    }

    // Kanji diikuti hiragana/katakana (okurigana)
    const cocok = kata.match(
        /^([\p{Script=Han}]+)([\p{Script=Hiragana}\p{Script=Katakana}]+)$/u
    );

    if (cocok) {
        const kanji = cocok[1];
        const akhiran = cocok[2];

        if (furigana.endsWith(akhiran)) {
            const bacaanKanji = furigana.slice(
                0,
                furigana.length - akhiran.length
            );

            if (bacaanKanji) {
                return `<ruby>${aman(kanji)}<rt>${aman(bacaanKanji)}</rt></ruby>${aman(akhiran)}`;
            }
        }
    }

    // Jika seluruh kata berupa kanji
    if (/^\p{Script=Han}+$/u.test(kata)) {
        return `<ruby>${aman(kata)}<rt>${aman(furigana)}</rt></ruby>`;
    }

    // Jika polanya tidak dapat dipastikan, jangan menebak
    return aman(kata);
}



function pilihKategoriKosakata(kunci) {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    const daftarAsli = Array.isArray(dataKosakata[kunci])
        ? dataKosakata[kunci]
        : [];

    const namaKategori = {
        kataKerja: "KATA KERJA",
        kataSifat: "KATA SIFAT",
        kataKeterangan: "KATA KETERANGAN",
        kataTanya: "KATA TANYA",
        kataBenda: "KATA BENDA",
        anggotaKeluarga: "ANGGOTA KELUARGA",
        caraMenghitung: "CARA MENGHITUNG",
        hariTanggalBulan: "HARI, TANGGAL & BULAN",
        salam: "SALAM"
    };

    const STORAGE_KEY = "nihongoKosakataStatus";

    let statusTersimpan = {};

    try {
        statusTersimpan = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        ) || {};
    } catch (error) {
        statusTersimpan = {};
    }

    function aman(teks) {
        return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[karakter]));
    }

    // MEMPERTAHANKAN NAMA SUBKATEGORI
    let subkategoriAktif = "";

    const daftarLengkap = daftarAsli.map(item => {
        if (item.subkategori) {
            subkategoriAktif = item.subkategori;
        }

        return {
            ...item,
            labelSubkategori: subkategoriAktif
        };
    });

    // HANYA MENGAMBIL KOSAKATA YANG SUDAH HAFAL
    const daftar = daftarLengkap.filter(item => {
        const id = `${kunci}::${item.kata}::${item.furigana}`;
        return statusTersimpan[id] === "hafal";
    });

    // MENAMPILKAN ARTI KOSAKATA
    function buatTampilanArti(item) {
        if (kunci === "caraMenghitung") {
            const rincian = String(item.arti || "")
                .split("·")
                .map(teks => teks.trim())
                .filter(Boolean);

            return `
                <div class="kosakata-hitungan-list">
                    ${rincian.map(teks => `
                        <div class="kosakata-hitungan-item">
                            ${aman(teks)}
                        </div>
                    `).join("")}
                </div>
            `;
        }

        return `
            <p class="kosakata-arti">
                ${aman(item.arti)}
            </p>
        `;
    }

    // JIKA DATA KATEGORI MASIH KOSONG
    if (daftarAsli.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">
                <button class="kosakata-kembali"
                    id="kembaliKategori">
                    ← Kembali ke Kategori
                </button>

                <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

                <p>Materi akan ditambahkan.</p>
            </div>
        `;

        document.getElementById("kembaliKategori")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    // JIKA BELUM ADA KOSAKATA YANG HAFAL
    if (daftar.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">
                <button class="kosakata-kembali"
                    id="kembaliKategori">
                    ← Kembali ke Kategori
                </button>

                <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

                <p>
                    Belum ada kosakata yang ditandai Hafal.
                </p>
            </div>
        `;

        document.getElementById("kembaliKategori")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    // MEMBUAT SEMUA KARTU KOSAKATA
    const daftarKartuHTML = daftar.map((item, indeks) => `
        <article
            class="kosakata-flashcard"
            data-kartu-index="${indeks}"
            role="button"
            tabindex="0"
            aria-expanded="false"
            aria-label="Klik untuk melihat furigana dan arti">

            ${item.labelSubkategori ? `
                <div class="kosakata-subkategori">
                    ${aman(item.labelSubkategori)}
                </div>
            ` : ""}

            <!-- TAMPILAN AWAL: HANYA KANJI DAN KANA -->
            <div class="kosakata-kanji kosakata-kanji-awal">
                ${aman(item.kata)}
            </div>

            <!-- TAMPILAN SETELAH KARTU DIKLIK -->
            <div class="kosakata-kanji kosakata-kanji-bacaan" hidden>
                ${buatHTMLFurigana(item.kata, item.furigana)}
            </div>

            <!-- ARTI BAHASA INDONESIA -->
            <div class="kosakata-arti-area" hidden>
                ${buatTampilanArti(item)}
            </div>

            <small class="kosakata-petunjuk">
                Klik kartu untuk melihat furigana dan arti
            </small>

        </article>
    `).join("");

    // MENAMPILKAN HALAMAN KATEGORI
    tempat.innerHTML = `
        <div class="kosakata-halaman">

            <button class="kosakata-kembali"
                id="kembaliKategori">
                ← Kembali ke Kategori
            </button>

            <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

            <div class="kosakata-flashcard-info">
                Total kosakata hafal: ${daftar.length}
            </div>

            <div class="kosakata-daftar-kartu"
                style="display: flex; flex-direction: column; gap: 16px;">

                ${daftarKartuHTML}

            </div>

        </div>
    `;

    // TOMBOL KEMBALI KE DAFTAR KATEGORI
    document.getElementById("kembaliKategori")
        .addEventListener("click", tampilkanKosakata);

    // FUNGSI BUKA DAN TUTUP SETIAP KARTU
    const semuaKartu = tempat.querySelectorAll(".kosakata-flashcard");

    semuaKartu.forEach(kartu => {
        const tampilanAwal = kartu.querySelector(
            ".kosakata-kanji-awal"
        );

        const tampilanBacaan = kartu.querySelector(
            ".kosakata-kanji-bacaan"
        );

        const tampilanArti = kartu.querySelector(
            ".kosakata-arti-area"
        );

        const petunjuk = kartu.querySelector(
            ".kosakata-petunjuk"
        );

        function ubahTampilanKartu() {
            const terbuka =
                kartu.getAttribute("aria-expanded") === "true";

            kartu.setAttribute(
                "aria-expanded",
                String(!terbuka)
            );

            tampilanAwal.hidden = !terbuka;
            tampilanBacaan.hidden = terbuka;
            tampilanArti.hidden = terbuka;

            petunjuk.textContent = terbuka
                ? "Klik kartu untuk melihat furigana dan arti"
                : "Klik kartu untuk menyembunyikan furigana dan arti";
        }

        kartu.addEventListener("click", ubahTampilanKartu);

        kartu.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                ubahTampilanKartu();
            }
        });
    });
}



/* =========================================
   MEMBUKA MENU WEBSITE
========================================= */

function bukaMenu(namaMenu) {
    sembunyikanSemuaHalaman();

    const idMenu = namaMenu.toLowerCase().replace(/\s+/g, "");
    const halaman = document.getElementById("halaman-" + idMenu);

    if (!halaman) return;

    halaman.style.display = "block";

    if (idMenu === "kosakata") {
    const tempatKosakata = document.getElementById("materi-kosakata");

    if (tempatKosakata) {
        tempatKosakata.innerHTML = "";
    }
}

    

    document.querySelectorAll(".header nav a").forEach(function(link) {
        link.classList.remove("active");
    });

    const linkAktif = document.querySelector(
        '.header nav a[href="#halaman-' + idMenu + '"]'
    );

    if (linkAktif) linkAktif.classList.add("active");

    if (!["kanji", "kosakata", "jlpt", "flashcard"].includes(idMenu)) {
        tampilkanPesanMenu(namaMenu);
    }

    halaman.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================
   2. PESAN MENU BELUM TERSEDIA
========================================= */

function tampilkanPesanMenu(namaMenu) {
    const idMenu = namaMenu.toLowerCase().replace(/\s+/g, "");
    const tempat = document.getElementById("materi-" + idMenu);

    if (!tempat) return;

    tempat.innerHTML = `
        <div class="kanji-card">
            <h3>🌸 ${namaMenu}</h3>
            <p>Fitur ${namaMenu} sedang kita persiapkan.</p>
            <p>Nantikan materi belajar yang menarik!</p>
        </div>
    `;
}
/* =========================================
   DATA KOSAKATA JLPT N5 DARI PDF
========================================= */

/* =========================================
   DATA KOSAKATA JLPT N5 DARI PDF
========================================= */

const dataKosakata = {

    // A. KATA KERJA
    kataKerja: [
        { kata: "会う", furigana: "あう", arti: "bertemu" },
        { kata: "開ける", furigana: "あける", arti: "membuka" },
        { kata: "浴びる", furigana: "あびる", arti: "mandi (shower)" },
        { kata: "歩く", furigana: "あるく", arti: "berjalan kaki" },
        { kata: "言う", furigana: "いう", arti: "mengatakan, bilang" },
        { kata: "歌う", furigana: "うたう", arti: "menyanyi, bernyanyi" },
        { kata: "入る", furigana: "はいる", arti: "masuk" },
        { kata: "入れる", furigana: "いれる", arti: "memasukkan" },
        { kata: "生まれる", furigana: "うまれる", arti: "lahir" },
        { kata: "終わる", furigana: "おわる", arti: "selesai, berakhir" },
        { kata: "乗る", furigana: "のる", arti: "naik kendaraan" },
        { kata: "返す", furigana: "かえす", arti: "mengembalikan" },
        { kata: "かかる", furigana: "かかる", arti: "memakan waktu atau biaya" },
        { kata: "売る", furigana: "うる", arti: "menjual" },
        { kata: "起きる", furigana: "おきる", arti: "bangun" },
        { kata: "置く", furigana: "おく", arti: "meletakkan" },
        { kata: "教える", furigana: "おしえる", arti: "mengajar, memberitahu" },
        { kata: "押す", furigana: "おす", arti: "menekan, mendorong" },
        { kata: "覚える", furigana: "おぼえる", arti: "mengingat, menghafal" },
        { kata: "登る", furigana: "のぼる", arti: "mendaki" },
        { kata: "持つ", furigana: "もつ", arti: "membawa, memegang, punya" },
        { kata: "休む", furigana: "やすむ", arti: "istirahat, tidak masuk, libur" },
        { kata: "呼ぶ", furigana: "よぶ", arti: "memanggil" },
        { kata: "分かる", furigana: "わかる", arti: "mengerti" },
        { kata: "吸う", furigana: "すう", arti: "menghisap, merokok" },
        { kata: "聞く", furigana: "きく", arti: "mendengar, bertanya" },
        { kata: "切る", furigana: "きる", arti: "memotong" },
        { kata: "着る", furigana: "きる", arti: "memakai baju" },
        { kata: "泳ぐ", furigana: "およぐ", arti: "berenang" },
        { kata: "消す", furigana: "けす", arti: "memadamkan, menghapus" },
        { kata: "答える", furigana: "こたえる", arti: "menjawab" },
        { kata: "困る", furigana: "こまる", arti: "bingung, kesulitan" },
        { kata: "咲く", furigana: "さく", arti: "mekar" },
        { kata: "閉める", furigana: "しめる", arti: "menutup" },
        { kata: "死ぬ", furigana: "しぬ", arti: "mati" },
        { kata: "知る", furigana: "しる", arti: "mengetahui, kenal" },
        { kata: "住む", furigana: "すむ", arti: "tinggal, menetap" },
        { kata: "急ぐ", furigana: "いそぐ", arti: "buru-buru, bergegas" },
        { kata: "座る", furigana: "すわる", arti: "duduk" },
        { kata: "立つ", furigana: "たつ", arti: "berdiri" },
        { kata: "笑う", furigana: "わらう", arti: "tertawa" },
        { kata: "使う", furigana: "つかう", arti: "menggunakan" },
        { kata: "疲れる", furigana: "つかれる", arti: "lelah" },
        { kata: "出す", furigana: "だす", arti: "mengeluarkan" },
        { kata: "出かける", furigana: "でかける", arti: "keluar untuk bepergian" },
        { kata: "出る", furigana: "でる", arti: "keluar, muncul" },
        { kata: "飛ぶ", furigana: "とぶ", arti: "terbang" },
        { kata: "止まる", furigana: "とまる", arti: "berhenti" },
        { kata: "撮る", furigana: "とる", arti: "mengambil foto" },
        { kata: "作る", furigana: "つくる", arti: "membuat" },
        { kata: "取る", furigana: "とる", arti: "mengambil" },
        { kata: "習う", furigana: "ならう", arti: "belajar dari orang lain" },
        { kata: "並ぶ", furigana: "ならぶ", arti: "berbaris, berjajar, antre" },
        { kata: "並べる", furigana: "ならべる", arti: "menjajarkan" },
        { kata: "鳴く", furigana: "なく", arti: "bersuara (hewan)" },
        { kata: "借りる", furigana: "かりる", arti: "meminjam" },
        { kata: "貸す", furigana: "かす", arti: "meminjamkan" },
        { kata: "始まる", furigana: "はじまる", arti: "mulai, dimulai" },
        { kata: "始める", furigana: "はじめる", arti: "memulai" },
        { kata: "走る", furigana: "はしる", arti: "berlari" },
        { kata: "待つ", furigana: "まつ", arti: "menunggu" },
        { kata: "磨く", furigana: "みがく", arti: "menggosok, menyikat" },
        { kata: "あげる", furigana: "あげる", arti: "memberi" },
        { kata: "くれる", furigana: "くれる", arti: "memberi kepada saya" },
        { kata: "貼る", furigana: "はる", arti: "menempelkan" },
        { kata: "弾く", furigana: "ひく", arti: "memainkan alat musik" },
        { kata: "吹く", furigana: "ふく", arti: "meniup" },
        { kata: "降る", furigana: "ふる", arti: "turun (hujan atau salju)" },
        { kata: "曲がる", furigana: "まがる", arti: "belok, bengkok" },
        { kata: "空く", furigana: "すく", arti: "kosong" },
        { kata: "乾く", furigana: "かわく", arti: "kering" },
        { kata: "忘れる", furigana: "わすれる", arti: "lupa" },
        { kata: "渡す", furigana: "わたす", arti: "menyerahkan" },
        { kata: "渡る", furigana: "わたる", arti: "menyeberang" },
        { kata: "つとめる", furigana: "つとめる", arti: "bekerja (kantoran)" },
        { kata: "つける", furigana: "つける", arti: "menyalakan, memakai" },
        { kata: "かける", furigana: "かける", arti: "menelepon, mengunci, memakai kacamata" },
        { kata: "はく", furigana: "はく", arti: "memakai pakaian bagian bawah" },
        { kata: "かぶる", furigana: "かぶる", arti: "memakai penutup kepala" },
        { kata: "する", furigana: "する", arti: "melakukan" },
        { kata: "やる", furigana: "やる", arti: "melakukan, mengerjakan" }
    ],

    // B. KATA SIFAT
    kataSifat: [
    { kata: "新しい", furigana: "あたらしい", arti: "baru" },
    { kata: "古い", furigana: "ふるい", arti: "lama, kuno" },
    { kata: "重い", furigana: "おもい", arti: "berat" },
    { kata: "軽い", furigana: "かるい", arti: "ringan" },
    { kata: "少ない", furigana: "すくない", arti: "sedikit" },
    { kata: "多い", furigana: "おおい", arti: "banyak" },
    { kata: "短い", furigana: "みじかい", arti: "pendek" },
    { kata: "長い", furigana: "ながい", arti: "panjang" },
    { kata: "狭い", furigana: "せまい", arti: "sempit" },
    { kata: "広い", furigana: "ひろい", arti: "luas" },
    { kata: "安い", furigana: "やすい", arti: "murah" },
    { kata: "高い", furigana: "たかい", arti: "mahal, tinggi" },
    { kata: "低い", furigana: "ひくい", arti: "rendah" },
    { kata: "難しい", furigana: "むずかしい", arti: "sulit" },
    { kata: "易しい", furigana: "やさしい", arti: "mudah" },
    { kata: "面白い", furigana: "おもしろい", arti: "menarik, lucu" },
    { kata: "つまらない", furigana: "つまらない", arti: "membosankan" },
    { kata: "近い", furigana: "ちかい", arti: "dekat" },
    { kata: "遠い", furigana: "とおい", arti: "jauh" },
    { kata: "大きい", furigana: "おおきい", arti: "besar" },
    { kata: "小さい", furigana: "ちいさい", arti: "kecil" },
    { kata: "早い", furigana: "はやい", arti: "cepat, awal" },
    { kata: "速い", furigana: "はやい", arti: "cepat (gerak)" },
    { kata: "遅い", furigana: "おそい", arti: "lambat, lama, larut" },
    { kata: "かわいい", furigana: "かわいい", arti: "imut, lucu" },
    { kata: "きれい", furigana: "きれい", arti: "cantik, indah" },
    { kata: "汚い", furigana: "きたない", arti: "kotor" },
    { kata: "いい／良い", furigana: "いい／よい", arti: "baik, bagus" },
    { kata: "悪い", furigana: "わるい", arti: "buruk, jelek" },
    { kata: "強い", furigana: "つよい", arti: "kuat" },
    { kata: "弱い", furigana: "よわい", arti: "lemah" },
    { kata: "甘い", furigana: "あまい", arti: "manis" },
    { kata: "苦い", furigana: "にがい", arti: "pahit" },
    { kata: "辛い", furigana: "からい", arti: "pedas" },
    { kata: "しょっぱい", furigana: "しょっぱい", arti: "asin" },
    { kata: "すっぱい", furigana: "すっぱい", arti: "asam, kecut" },
    { kata: "おいしい", furigana: "おいしい", arti: "enak" },
    { kata: "まずい", furigana: "まずい", arti: "tidak enak" },
    { kata: "暑い", furigana: "あつい", arti: "panas (cuaca)" },
    { kata: "熱い", furigana: "あつい", arti: "panas (benda)" },
    { kata: "寒い", furigana: "さむい", arti: "dingin (cuaca)" },
    { kata: "冷たい", furigana: "つめたい", arti: "dingin (benda)" },
    { kata: "温かい", furigana: "あたたかい", arti: "hangat" },
    { kata: "涼しい", furigana: "すずしい", arti: "sejuk" },
    { kata: "厚い", furigana: "あつい", arti: "tebal" },
    { kata: "薄い", furigana: "うすい", arti: "tipis, hambar, samar-samar, kurang jelas, kurang tajam" },
    { kata: "太い", furigana: "ふとい", arti: "besar (tebal, gemuk)" },
    { kata: "細い", furigana: "ほそい", arti: "kecil (tipis, ramping)" },
    { kata: "暗い", furigana: "くらい", arti: "gelap, murung, suram" },
    { kata: "明るい", furigana: "あかるい", arti: "terang, ceria, periang" },
    { kata: "かっこいい", furigana: "かっこいい", arti: "keren, tampan" },
    { kata: "優しい", furigana: "やさしい", arti: "baik hati" },
    { kata: "若い", furigana: "わかい", arti: "muda" },
    { kata: "うれしい", furigana: "うれしい", arti: "senang" },
    { kata: "楽しい", furigana: "たのしい", arti: "menyenangkan" },
    { kata: "さびしい", furigana: "さびしい", arti: "kesepian" },
    { kata: "悲しい", furigana: "かなしい", arti: "sedih" },
    { kata: "怖い", furigana: "こわい", arti: "takut" },
    { kata: "うるさい", furigana: "うるさい", arti: "berisik" },
    { kata: "欲しい", furigana: "ほしい", arti: "ingin" },
    { kata: "痛い", furigana: "いたい", arti: "sakit" },
    { kata: "危ない", furigana: "あぶない", arti: "berbahaya" },
    { kata: "丸い", furigana: "まるい", arti: "bulat, bundar" },
    { kata: "忙しい", furigana: "いそがしい", arti: "sibuk" },
    { kata: "暇（な）", furigana: "ひま（な）", arti: "senggang, waktu luang" },
    { kata: "上手（な）", furigana: "じょうず（な）", arti: "pandai" },
    { kata: "下手（な）", furigana: "へた（な）", arti: "tidak pandai" },
    { kata: "好き（な）", furigana: "すき（な）", arti: "suka" },
    { kata: "嫌い（な）", furigana: "きらい（な）", arti: "tidak suka, benci" },
    { kata: "元気（な）", furigana: "げんき（な）", arti: "sehat, bersemangat" },
    { kata: "大切（な）", furigana: "たいせつ（な）", arti: "penting, berharga" },
    { kata: "有名（な）", furigana: "ゆうめい（な）", arti: "terkenal" },
    { kata: "にぎやか（な）", furigana: "にぎやか（な）", arti: "ramai" },
    { kata: "静か（な）", furigana: "しずか（な）", arti: "tenang" },
    { kata: "まじめ（な）", furigana: "まじめ（な）", arti: "serius, sungguh-sungguh" },
    { kata: "親切（な）", furigana: "しんせつ（な）", arti: "ramah, baik hati" },
    { kata: "便利（な）", furigana: "べんり（な）", arti: "praktis, nyaman" },
    { kata: "不便（な）", furigana: "ふべん（な）", arti: "tidak praktis" },
    { kata: "素敵（な）", furigana: "すてき（な）", arti: "bagus, indah, menawan" },
    { kata: "簡単（な）", furigana: "かんたん（な）", arti: "mudah" }
],

    // C. KATA KETERANGAN
    kataKeterangan: [
    { kata: "いつも", furigana: "いつも", arti: "selalu" },
    { kata: "たいてい", furigana: "たいてい", arti: "biasanya" },
    { kata: "よく", furigana: "よく", arti: "sering, dengan baik" },
    { kata: "時々", furigana: "ときどき", arti: "kadang-kadang" },
    { kata: "たまに", furigana: "たまに", arti: "sesekali" },
    { kata: "あまり～ません", furigana: "あまり～ません", arti: "tidak begitu, tidak terlalu" },
    { kata: "めったに～ません", furigana: "めったに～ません", arti: "jarang sekali" },
    { kata: "全然～ません", furigana: "ぜんぜん～ません", arti: "sama sekali tidak" },
    { kata: "だいたい", furigana: "だいたい", arti: "sebagian besar, kira-kira" },
    { kata: "まあまあ", furigana: "まあまあ", arti: "lumayan, cukup" },
    { kata: "少し", furigana: "すこし", arti: "sedikit" },
    { kata: "ちょっと", furigana: "ちょっと", arti: "sedikit, sebentar" },
    { kata: "たくさん", furigana: "たくさん", arti: "banyak" },
    { kata: "よく～ません", furigana: "よく～ません", arti: "tidak sering, tidak dengan baik" }
],

    // D. KATA TANYA
   kataTanya: [
    { kata: "だれの", furigana: "だれの", arti: "milik siapa" },
    { kata: "何の", furigana: "なんの", arti: "apa jenis" },
    { kata: "だれが", furigana: "だれが", arti: "siapa yang" },
    { kata: "何が", furigana: "なにが", arti: "apa yang" },
    { kata: "だれに", furigana: "だれに", arti: "kepada siapa, dari siapa" },
    { kata: "何に", furigana: "なんに", arti: "ingin menjadi apa" },
    { kata: "だれと", furigana: "だれと", arti: "dengan siapa" },
    { kata: "何と", furigana: "なんと", arti: "apa yang dikatakan" },
    { kata: "だれを", furigana: "だれを", arti: "siapa sebagai objek" },
    { kata: "何を", furigana: "なにを", arti: "apa sebagai objek" },
    { kata: "だれか", furigana: "だれか", arti: "seseorang" },
    { kata: "何か", furigana: "なにか", arti: "sesuatu" },
    { kata: "だれも", furigana: "だれも", arti: "siapa pun (dalam kalimat negatif: tidak seorang pun)" },
    { kata: "何も", furigana: "なにも", arti: "apa pun (dalam kalimat negatif: tidak ada apa pun)" },
    { kata: "何で", furigana: "なんで", arti: "dengan apa, mengapa" },
    { kata: "いつの", furigana: "いつの", arti: "kapan (sebagai keterangan kepemilikan)" },
    { kata: "いつに", furigana: "いつに", arti: "kapan" },
    { kata: "いつが", furigana: "いつが", arti: "kapan yang tepat" },
    { kata: "いつか", furigana: "いつか", arti: "suatu hari" }
],

    // E. KATA BENDA
   
kataBenda: [
    // ARAH DAN LETAK
    { kata: "北", furigana: "きた", arti: "utara" },
    { kata: "左", furigana: "ひだり", arti: "kiri" },
    { kata: "右", furigana: "みぎ", arti: "kanan" },
    { kata: "前", furigana: "まえ", arti: "depan" },
    { kata: "後ろ", furigana: "うしろ", arti: "belakang" },
    { kata: "東", furigana: "ひがし", arti: "timur" },
    { kata: "西", furigana: "にし", arti: "barat" },
    { kata: "南", furigana: "みなみ", arti: "selatan" },
    { kata: "中", furigana: "なか", arti: "dalam" },
    { kata: "外", furigana: "そと", arti: "luar" },
    { kata: "上", furigana: "うえ", arti: "atas" },
    { kata: "下", furigana: "した", arti: "bawah" },

    // ANGGOTA TUBUH
    { kata: "頭", furigana: "あたま", arti: "kepala" },
    { kata: "髪", furigana: "かみ", arti: "rambut" },
    { kata: "顔", furigana: "かお", arti: "wajah" },
    { kata: "歯", furigana: "は", arti: "gigi" },
    { kata: "喉", furigana: "のど", arti: "tenggorokan" },
    { kata: "口", furigana: "くち", arti: "mulut" },
    { kata: "背・背中", furigana: "せ・せなか", arti: "punggung" },
    { kata: "耳", furigana: "みみ", arti: "telinga" },
    { kata: "首", furigana: "くび", arti: "leher" },
    { kata: "目", furigana: "め", arti: "mata" },
    { kata: "鼻", furigana: "はな", arti: "hidung" },
    { kata: "体", furigana: "からだ", arti: "tubuh" },
    { kata: "腕", furigana: "うで", arti: "lengan" },
    { kata: "お腹", furigana: "おなか", arti: "perut" },
    { kata: "胸", furigana: "むね", arti: "dada" },
    { kata: "手", furigana: "て", arti: "tangan" },
    { kata: "足", furigana: "あし", arti: "kaki" },

    // ALAM, CUACA, DAN MUSIM
    { kata: "春", furigana: "はる", arti: "musim semi" },
    { kata: "夏", furigana: "なつ", arti: "musim panas" },
    { kata: "秋", furigana: "あき", arti: "musim gugur" },
    { kata: "冬", furigana: "ふゆ", arti: "musim dingin" },
    { kata: "晴れ", furigana: "はれ", arti: "cuaca cerah" },
    { kata: "曇り", furigana: "くもり", arti: "mendung" },
    { kata: "雨", furigana: "あめ", arti: "hujan" },
    { kata: "雪", furigana: "ゆき", arti: "salju" },
    { kata: "池", furigana: "いけ", arti: "kolam" },
    { kata: "水", furigana: "みず", arti: "air" },
    { kata: "海", furigana: "うみ", arti: "laut" },
    { kata: "空", furigana: "そら", arti: "langit" },
    { kata: "川", furigana: "かわ", arti: "sungai" },
    { kata: "台風", furigana: "たいふう", arti: "angin topan" },
    { kata: "木", furigana: "き", arti: "pohon" },
    { kata: "風", furigana: "かぜ", arti: "angin" },

    // TEMPAT
    { kata: "喫茶店", furigana: "きっさてん", arti: "kedai kopi" },
    { kata: "遊園地", furigana: "ゆうえんち", arti: "taman bermain" },
    { kata: "大使館", furigana: "たいしかん", arti: "kedutaan" },
    { kata: "動物園", furigana: "どうぶつえん", arti: "kebun binatang" },
    { kata: "駅", furigana: "えき", arti: "stasiun" },
    { kata: "神社", furigana: "じんじゃ", arti: "kuil Shinto" },
    { kata: "スーパー", furigana: "スーパー", arti: "supermarket" },
    { kata: "図書館", furigana: "としょかん", arti: "perpustakaan" },
    { kata: "お手洗い", furigana: "おてあらい", arti: "toilet" },
    { kata: "病院", furigana: "びょういん", arti: "rumah sakit" },
    { kata: "交番", furigana: "こうばん", arti: "pos polisi" },
    { kata: "お寺", furigana: "おてら", arti: "kuil Buddha" },
    { kata: "公園", furigana: "こうえん", arti: "taman" },
    { kata: "郵便局", furigana: "ゆうびんきょく", arti: "kantor pos" },
    { kata: "美術館", furigana: "びじゅつかん", arti: "museum seni" },
    { kata: "映画館", furigana: "えいがかん", arti: "bioskop" },
    { kata: "駐車所", furigana: "ちゅうしゃじょ", arti: "tempat parkir (sesuai tulisan PDF)" },
    { kata: "コンビニ", furigana: "コンビニ", arti: "minimarket" },

    // KENDARAAN
    { kata: "バイク", furigana: "バイク", arti: "sepeda motor" },
    { kata: "飛行機", furigana: "ひこうき", arti: "pesawat terbang" },
    { kata: "電車", furigana: "でんしゃ", arti: "kereta" },
    { kata: "船", furigana: "ふね", arti: "kapal" },
    { kata: "車", furigana: "くるま", arti: "mobil" },
    { kata: "バス", furigana: "バス", arti: "bus" },
    { kata: "タクシー", furigana: "タクシー", arti: "taksi" },
    { kata: "自転車", furigana: "じてんしゃ", arti: "sepeda" },

    // MUSIK
    { kata: "クラシック", furigana: "クラシック", arti: "musik klasik" },
    { kata: "ジャズ", furigana: "ジャズ", arti: "musik jazz" },
    { kata: "コンサート", furigana: "コンサート", arti: "konser" },
    { kata: "ポップス", furigana: "ポップス", arti: "musik pop" },
    { kata: "ピアノ", furigana: "ピアノ", arti: "piano" },
    { kata: "ギター", furigana: "ギター", arti: "gitar" },
    { kata: "カラオケ", furigana: "カラオケ", arti: "karaoke" },
    { kata: "ロック", furigana: "ロック", arti: "musik rock" },

    // OLAHRAGA
    { kata: "ゴルフ", furigana: "ゴルフ", arti: "golf" },
    { kata: "水泳", furigana: "すいえい", arti: "renang" },
    { kata: "テニス", furigana: "テニス", arti: "tenis" },
    { kata: "相撲", furigana: "すもう", arti: "sumo" },
    { kata: "サッカー", furigana: "サッカー", arti: "sepak bola" },
    { kata: "野球", furigana: "やきゅう", arti: "bisbol" },
    { kata: "柔道", furigana: "じゅうどう", arti: "judo" },
    { kata: "バスケットボール", furigana: "バスケットボール", arti: "bola basket" },

    // SEKOLAH DAN PENDIDIKAN
    { kata: "大学", furigana: "だいがく", arti: "universitas" },
    { kata: "学生", furigana: "がくせい", arti: "pelajar, mahasiswa" },
    { kata: "生徒", furigana: "せいと", arti: "murid" },
    { kata: "黒板", furigana: "こくばん", arti: "papan tulis" },
    { kata: "教科書", furigana: "きょうかしょ", arti: "buku pelajaran" },
    { kata: "作文", furigana: "さくぶん", arti: "karangan" },
    { kata: "辞書", furigana: "じしょ", arti: "kamus" },
    { kata: "宿題", furigana: "しゅくだい", arti: "pekerjaan rumah (PR)" },
    { kata: "教室", furigana: "きょうしつ", arti: "ruang kelas" },
    { kata: "鉛筆", furigana: "えんぴつ", arti: "pensil" },
    { kata: "小学校", furigana: "しょうがっこう", arti: "sekolah dasar" },
    { kata: "消しゴム", furigana: "けしゴム", arti: "penghapus" },
    { kata: "中学校", furigana: "ちゅうがっこう", arti: "sekolah menengah pertama" },
    { kata: "質問", furigana: "しつもん", arti: "pertanyaan" },
    { kata: "答え", furigana: "こたえ", arti: "jawaban" },
    { kata: "高校", furigana: "こうこう", arti: "sekolah menengah atas" },
    { kata: "学校", furigana: "がっこう", arti: "sekolah" },

    // PEKERJAAN
    { kata: "教師", furigana: "きょうし", arti: "guru" },
    { kata: "医者", furigana: "いしゃ", arti: "dokter" },
    { kata: "看護師", furigana: "かんごし", arti: "perawat" },
    { kata: "社長", furigana: "しゃちょう", arti: "direktur, presiden perusahaan" },
    { kata: "部長", furigana: "ぶちょう", arti: "kepala divisi" },
    { kata: "会社員", furigana: "かいしゃいん", arti: "karyawan perusahaan" },
    { kata: "店長", furigana: "てんちょう", arti: "kepala toko" },
    { kata: "店員", furigana: "てんいん", arti: "pegawai toko" },
    { kata: "客", furigana: "きゃく", arti: "tamu, pelanggan" },
    { kata: "警察官", furigana: "けいさつかん", arti: "polisi" },
    { kata: "事務所", furigana: "じむしょ", arti: "kantor" },
    { kata: "受付", furigana: "うけつけ", arti: "resepsionis" },
    { kata: "商品", furigana: "しょうひん", arti: "produk, barang dagangan" },
    { kata: "課長", furigana: "かちょう", arti: "kepala bagian" },
    { kata: "サービス", furigana: "サービス", arti: "pelayanan, layanan gratis" },

    // MAKANAN DAN MINUMAN
    { kata: "お酒", furigana: "おさけ", arti: "sake, minuman beralkohol" },
    { kata: "お茶", furigana: "おちゃ", arti: "teh hijau" },
    { kata: "紅茶", furigana: "こうちゃ", arti: "teh hitam" },
    { kata: "牛乳", furigana: "ぎゅうにゅう", arti: "susu" },
    { kata: "ビール", furigana: "ビール", arti: "bir" },
    { kata: "ジュース", furigana: "ジュース", arti: "jus" },
    { kata: "ワイン", furigana: "ワイン", arti: "anggur (minuman)" },
    { kata: "コーヒー", furigana: "コーヒー", arti: "kopi" },
    { kata: "お弁当", furigana: "おべんとう", arti: "bekal makanan" },
    { kata: "飴", furigana: "あめ", arti: "permen keras" },
    { kata: "お菓子", furigana: "おかし", arti: "kue, camilan" },
    { kata: "お土産", furigana: "おみやげ", arti: "oleh-oleh, suvenir" },
    { kata: "鶏肉", furigana: "とりにく", arti: "daging ayam" },
    { kata: "牛肉", furigana: "ぎゅうにく", arti: "daging sapi" },
    { kata: "卵", furigana: "たまご", arti: "telur" },
    { kata: "野菜", furigana: "やさい", arti: "sayuran" },

    // BUAH DAN SAYURAN
    { kata: "パイナップル", furigana: "パイナップル", arti: "nanas" },
    { kata: "スイカ", furigana: "スイカ", arti: "semangka" },
    { kata: "メロン", furigana: "メロン", arti: "melon" },
    { kata: "いちご", furigana: "いちご", arti: "stroberi" },
    { kata: "ぶどう", furigana: "ぶどう", arti: "anggur" },
    { kata: "マンゴー", furigana: "マンゴー", arti: "mangga" },
    { kata: "レモン", furigana: "レモン", arti: "lemon" },
    { kata: "りんご", furigana: "りんご", arti: "apel" },
    { kata: "みかん", furigana: "みかん", arti: "jeruk mandarin" },
    { kata: "にんじん", furigana: "にんじん", arti: "wortel" },
    { kata: "じゃがいも", furigana: "じゃがいも", arti: "kentang" },
    { kata: "トマト", furigana: "トマト", arti: "tomat" },

    // ALAT MAKAN
    { kata: "（お）皿", furigana: "（お）さら", arti: "piring" },
    { kata: "茶碗", furigana: "ちゃわん", arti: "mangkuk nasi" },
    { kata: "箸", furigana: "はし", arti: "sumpit" },
    { kata: "スプーン", furigana: "スプーン", arti: "sendok" },
    { kata: "フォーク", furigana: "フォーク", arti: "garpu" },
    { kata: "ナイフ", furigana: "ナイフ", arti: "pisau" },
    { kata: "コップ", furigana: "コップ", arti: "gelas" },
    { kata: "カップ", furigana: "カップ", arti: "cangkir" },
    { kata: "コーヒーカップ", furigana: "コーヒーカップ", arti: "cangkir kopi" },
    { kata: "ワイングラス", furigana: "ワイングラス", arti: "gelas anggur" },

    // PAKAIAN
    { kata: "シャツ", furigana: "シャツ", arti: "kemeja" },
    { kata: "Tシャツ", furigana: "ティーシャツ", arti: "kaus" },
    { kata: "セーター", furigana: "セーター", arti: "sweter" },
    { kata: "スーツ", furigana: "スーツ", arti: "setelan jas" },
    { kata: "コート", furigana: "コート", arti: "mantel" },
    { kata: "下着", furigana: "したぎ", arti: "pakaian dalam" },
    { kata: "上着", furigana: "うわぎ", arti: "pakaian luar, jaket" },
    { kata: "ズボン", furigana: "ズボン", arti: "celana panjang" },
    { kata: "スカート", furigana: "スカート", arti: "rok" },
    { kata: "靴", furigana: "くつ", arti: "sepatu" },
    { kata: "靴下", furigana: "くつした", arti: "kaus kaki" },
    { kata: "めがね", furigana: "めがね", arti: "kacamata" },
    { kata: "サングラス", furigana: "サングラス", arti: "kacamata hitam" },
    { kata: "ぼうし", furigana: "ぼうし", arti: "topi" },
    { kata: "ネクタイ", furigana: "ネクタイ", arti: "dasi" },

    // WAKTU
    { kata: "朝", furigana: "あさ", arti: "pagi" },
    { kata: "昼", furigana: "ひる", arti: "siang" },
    { kata: "夕方", furigana: "ゆうがた", arti: "sore" },
    { kata: "晩", furigana: "ばん", arti: "petang" },
    { kata: "夜", furigana: "よる", arti: "malam" },
    { kata: "おととい", furigana: "おととい", arti: "kemarin lusa" },
    { kata: "昨日", furigana: "きのう", arti: "kemarin" },
    { kata: "今日", furigana: "きょう", arti: "hari ini" },
    { kata: "明日", furigana: "あした", arti: "besok" },
    { kata: "あさって", furigana: "あさって", arti: "besok lusa" },
    { kata: "毎日", furigana: "まいにち", arti: "setiap hari" },
    { kata: "先々週", furigana: "せんせんしゅう", arti: "dua minggu lalu" },
    { kata: "先週", furigana: "せんしゅう", arti: "minggu lalu" },
    { kata: "今週", furigana: "こんしゅう", arti: "minggu ini" },
    { kata: "来週", furigana: "らいしゅう", arti: "minggu depan" },
    { kata: "再来週", furigana: "さらいしゅう", arti: "dua minggu lagi" },
    { kata: "毎週", furigana: "まいしゅう", arti: "setiap minggu" },
    { kata: "先々月", furigana: "せんせんげつ", arti: "dua bulan lalu" },
    { kata: "先月", furigana: "せんげつ", arti: "bulan lalu" },
    { kata: "今月", furigana: "こんげつ", arti: "bulan ini" },
    { kata: "来月", furigana: "らいげつ", arti: "bulan depan" },
    { kata: "再来月", furigana: "さらいげつ", arti: "dua bulan lagi" },
    { kata: "毎月", furigana: "まいつき", arti: "setiap bulan" },
    { kata: "おととし", furigana: "おととし", arti: "dua tahun lalu" },
    { kata: "去年", furigana: "きょねん", arti: "tahun lalu" },
    { kata: "今年", furigana: "ことし", arti: "tahun ini" },
    { kata: "来年", furigana: "らいねん", arti: "tahun depan" },
    { kata: "再来年", furigana: "さらいねん", arti: "dua tahun lagi" },
    { kata: "毎年", furigana: "まいとし", arti: "setiap tahun" },

    // WARNA
    { kata: "青い", furigana: "あおい", arti: "biru" },
    { kata: "赤い", furigana: "あかい", arti: "merah" },
    { kata: "白い", furigana: "しろい", arti: "putih" },
    { kata: "黒い", furigana: "くろい", arti: "hitam" },
    { kata: "灰色", furigana: "はいいろ", arti: "abu-abu" },
    { kata: "緑", furigana: "みどり", arti: "hijau" },
    { kata: "黄色い", furigana: "きいろい", arti: "kuning" },
    { kata: "茶色い", furigana: "ちゃいろい", arti: "cokelat" },
    { kata: "オレンジ", furigana: "オレンジ", arti: "oranye" },
    { kata: "ピンク", furigana: "ピンク", arti: "merah muda" },
    { kata: "むらさき", furigana: "むらさき", arti: "ungu" },

    // HEWAN
    { kata: "鳥", furigana: "とり", arti: "burung" },
    { kata: "馬", furigana: "うま", arti: "kuda" },
    { kata: "キリン", furigana: "キリン", arti: "jerapah" },
    { kata: "うさぎ", furigana: "うさぎ", arti: "kelinci" },
    { kata: "象", furigana: "ぞう", arti: "gajah" },
    { kata: "猫", furigana: "ねこ", arti: "kucing" },
    { kata: "犬", furigana: "いぬ", arti: "anjing" },
    { kata: "魚", furigana: "さかな", arti: "ikan" },
    { kata: "鶏", furigana: "にわとり", arti: "ayam" },
    { kata: "牛", furigana: "うし", arti: "sapi" },

    // NAMA MASAKAN
    { kata: "日本料理", furigana: "にほんりょうり", arti: "masakan Jepang" },
    { kata: "定食", furigana: "ていしょく", arti: "paket makanan, set menu" },
    { kata: "納豆", furigana: "なっとう", arti: "natto, kedelai fermentasi" },
    { kata: "味噌汁", furigana: "みそしる", arti: "sup miso" },
    { kata: "おかず", furigana: "おかず", arti: "lauk pauk" },

    // TOKO DAN RESTORAN
    { kata: "八百屋", furigana: "やおや", arti: "toko sayur" },
    { kata: "床屋", furigana: "とこや", arti: "barbershop, tempat cukur" },
    { kata: "魚屋", furigana: "さかなや", arti: "toko ikan" },
    { kata: "パン屋", furigana: "パンや", arti: "toko roti" },
    { kata: "肉屋", furigana: "にくや", arti: "toko daging" },
    { kata: "花屋", furigana: "はなや", arti: "toko bunga" },
    { kata: "電気屋", furigana: "でんきや", arti: "toko elektronik" },
    { kata: "本屋", furigana: "ほんや", arti: "toko buku" },
    { kata: "薬局", furigana: "やっきょく", arti: "apotek" },
    { kata: "ラーメン屋", furigana: "ラーメンや", arti: "restoran ramen" },

    // KEHIDUPAN SEHARI-HARI
    { kata: "テレビ", furigana: "テレビ", arti: "televisi" },
    { kata: "エアコン", furigana: "エアコン", arti: "AC" },
    { kata: "リモコン", furigana: "リモコン", arti: "remote control" },
    { kata: "リビング", furigana: "リビング", arti: "ruang keluarga" },
    { kata: "ベッド", furigana: "ベッド", arti: "tempat tidur" },
    { kata: "まくら", furigana: "まくら", arti: "bantal" },
    { kata: "ふとん", furigana: "ふとん", arti: "futon, kasur Jepang" },
    { kata: "冷蔵庫", furigana: "れいぞうこ", arti: "kulkas" },
    { kata: "窓", furigana: "まど", arti: "jendela" },
    { kata: "テーブル", furigana: "テーブル", arti: "meja" },
    { kata: "いす", furigana: "いす", arti: "kursi" },
    { kata: "本棚", furigana: "ほんだな", arti: "rak buku" },
    { kata: "砂糖", furigana: "さとう", arti: "gula" },
    { kata: "塩", furigana: "しお", arti: "garam" },
    { kata: "しょうゆ", furigana: "しょうゆ", arti: "kecap asin" },
    { kata: "油", furigana: "あぶら", arti: "minyak" },
    { kata: "玄関", furigana: "げんかん", arti: "pintu masuk rumah" },
    { kata: "台所", furigana: "だいどころ", arti: "dapur" },
    { kata: "廊下", furigana: "ろうか", arti: "lorong, koridor" },
    { kata: "階段", furigana: "かいだん", arti: "tangga" },

    // BENDA DAN KEPERLUAN SEHARI-HARI
    { kata: "手紙", furigana: "てがみ", arti: "surat" },
    { kata: "切手", furigana: "きって", arti: "perangko" },
    { kata: "封筒", furigana: "ふうとう", arti: "amplop" },
    { kata: "はがき", furigana: "はがき", arti: "kartu pos" },
    { kata: "お金", furigana: "おかね", arti: "uang" },
    { kata: "財布", furigana: "さいふ", arti: "dompet" },
    { kata: "雑誌", furigana: "ざっし", arti: "majalah" },
    { kata: "新聞", furigana: "しんぶん", arti: "koran" },
    { kata: "傘", furigana: "かさ", arti: "payung" },
    { kata: "鍵", furigana: "かぎ", arti: "kunci" },
    { kata: "薬", furigana: "くすり", arti: "obat" },
    { kata: "手帳", furigana: "てちょう", arti: "agenda, buku catatan" },
    { kata: "箱", furigana: "はこ", arti: "kotak" },
    { kata: "花びん", furigana: "かびん", arti: "vas bunga" },
    { kata: "せっけん", furigana: "せっけん", arti: "sabun" },
    { kata: "腕時計", furigana: "うでどけい", arti: "jam tangan" },
    { kata: "荷物", furigana: "にもつ", arti: "barang bawaan, bagasi" },
    { kata: "まんが", furigana: "まんが", arti: "komik" },
    { kata: "制服", furigana: "せいふく", arti: "seragam" },
    { kata: "庭", furigana: "にわ", arti: "halaman, taman" },

    // KATA SERAPAN
    { kata: "ミルク", furigana: "ミルク", arti: "susu" },
    { kata: "ライス", furigana: "ライス", arti: "nasi" },
    { kata: "パン", furigana: "パン", arti: "roti" },
    { kata: "チーズ", furigana: "チーズ", arti: "keju" },
    { kata: "バター", furigana: "バター", arti: "mentega" },
    { kata: "スリッパー", furigana: "スリッパー", arti: "sandal rumah" },
    { kata: "ボタン", furigana: "ボタン", arti: "kancing, tombol" },
    { kata: "ノート", furigana: "ノート", arti: "buku catatan" },
    { kata: "メモ", furigana: "メモ", arti: "memo, catatan" },
    { kata: "ポケット", furigana: "ポケット", arti: "saku, kantong" },
    { kata: "ビル", furigana: "ビル", arti: "gedung" },
    { kata: "ニュース", furigana: "ニュース", arti: "berita" },
    { kata: "ドア", furigana: "ドア", arti: "pintu" },
    { kata: "エレベーター", furigana: "エレベーター", arti: "lift, elevator" },
    { kata: "エスカレーター", furigana: "エスカレーター", arti: "eskalator" },
    { kata: "ペット", furigana: "ペット", arti: "hewan peliharaan" },
    { kata: "カード", furigana: "カード", arti: "kartu" },
    { kata: "スマホ", furigana: "スマホ", arti: "ponsel pintar" },

    // KOSAKATA LAINNYA
    { kata: "言葉", furigana: "ことば", arti: "kata, bahasa" },
    { kata: "所", furigana: "ところ", arti: "tempat" },
    { kata: "角", furigana: "かど", arti: "sudut, belokan" },
    { kata: "自分", furigana: "じぶん", arti: "diri sendiri" },
    { kata: "バス停", furigana: "バスてい", arti: "halte bus" },
    { kata: "建物", furigana: "たてもの", arti: "bangunan" },
    { kata: "全部", furigana: "ぜんぶ", arti: "semua" },
    { kata: "入口", furigana: "いりぐち", arti: "pintu masuk" },
    { kata: "掃除", furigana: "そうじ", arti: "bersih-bersih" },
    { kata: "国", furigana: "くに", arti: "negara" },
    { kata: "出口", furigana: "でぐち", arti: "pintu keluar" },
    { kata: "洗濯", furigana: "せんたく", arti: "mencuci pakaian" },
    { kata: "外国", furigana: "がいこく", arti: "luar negeri" },
    { kata: "門", furigana: "もん", arti: "pintu gerbang" },
    { kata: "風邪", furigana: "かぜ", arti: "masuk angin, pilek" },
    { kata: "外国人", furigana: "がいこくじん", arti: "orang asing" },
    { kata: "景色", furigana: "けしき", arti: "pemandangan" },
    { kata: "交差点", furigana: "こうさてん", arti: "persimpangan" },
    { kata: "地図", furigana: "ちず", arti: "peta" },
    { kata: "信号", furigana: "しんごう", arti: "lampu lalu lintas" },
    { kata: "今朝", furigana: "けさ", arti: "pagi ini" },
    { kata: "方", furigana: "かた", arti: "orang (bentuk sopan)" },
    { kata: "今晩", furigana: "こんばん", arti: "malam ini" },
    { kata: "橋", furigana: "はし", arti: "jembatan" },
    { kata: "誕生日", furigana: "たんじょうび", arti: "ulang tahun" },
    { kata: "まっすぐ", furigana: "まっすぐ", arti: "lurus" },
    { kata: "夕べ", furigana: "ゆうべ", arti: "kemarin malam, semalam" }
],

    // F. ANGGOTA KELUARGA
    anggotaKeluarga: [
    { kata: "両親", furigana: "りょうしん", arti: "orang tua sendiri" },
    { kata: "ご両親", furigana: "ごりょうしん", arti: "orang tua orang lain" },
    { kata: "祖父", furigana: "そふ", arti: "kakek sendiri" },
    { kata: "おじいさん", furigana: "おじいさん", arti: "kakek orang lain" },
    { kata: "祖母", furigana: "そぼ", arti: "nenek sendiri" },
    { kata: "おばあさん", furigana: "おばあさん", arti: "nenek orang lain" },
    { kata: "父", furigana: "ちち", arti: "ayah sendiri" },
    { kata: "お父さん", furigana: "おとうさん", arti: "ayah orang lain" },
    { kata: "母", furigana: "はは", arti: "ibu sendiri" },
    { kata: "お母さん", furigana: "おかあさん", arti: "ibu orang lain" },
    { kata: "兄弟", furigana: "きょうだい", arti: "saudara kandung" },
    { kata: "ご兄弟", furigana: "ごきょうだい", arti: "saudara kandung orang lain" },
    { kata: "兄", furigana: "あに", arti: "kakak laki-laki sendiri" },
    { kata: "お兄さん", furigana: "おにいさん", arti: "kakak laki-laki orang lain" },
    { kata: "姉", furigana: "あね", arti: "kakak perempuan sendiri" },
    { kata: "お姉さん", furigana: "おねえさん", arti: "kakak perempuan orang lain" },
    { kata: "弟", furigana: "おとうと", arti: "adik laki-laki sendiri" },
    { kata: "弟さん", furigana: "おとうとさん", arti: "adik laki-laki orang lain" },
    { kata: "妹", furigana: "いもうと", arti: "adik perempuan sendiri" },
    { kata: "妹さん", furigana: "いもうとさん", arti: "adik perempuan orang lain" },
    { kata: "叔父", furigana: "おじ", arti: "paman sendiri" },
    { kata: "叔父さん", furigana: "おじさん", arti: "paman orang lain" },
    { kata: "叔母", furigana: "おば", arti: "bibi sendiri" },
    { kata: "叔母さん", furigana: "おばさん", arti: "bibi orang lain" },
    { kata: "息子", furigana: "むすこ", arti: "anak laki-laki sendiri" },
    { kata: "息子さん", furigana: "むすこさん", arti: "anak laki-laki orang lain" },
    { kata: "娘", furigana: "むすめ", arti: "anak perempuan sendiri" },
    { kata: "娘さん", furigana: "むすめさん", arti: "anak perempuan orang lain" },
    { kata: "子ども", furigana: "こども", arti: "anak sendiri" },
    { kata: "お子さん", furigana: "おこさん", arti: "anak orang lain" },
    { kata: "孫", furigana: "まご", arti: "cucu sendiri" },
    { kata: "お孫さん", furigana: "おまごさん", arti: "cucu orang lain" },
    { kata: "妻", furigana: "つま", arti: "istri sendiri" },
    { kata: "奥さん", furigana: "おくさん", arti: "istri orang lain" },
    { kata: "夫", furigana: "おっと", arti: "suami sendiri" },
    { kata: "主人", furigana: "しゅじん", arti: "suami sendiri" },
    { kata: "ご主人", furigana: "ごしゅじん", arti: "suami orang lain" },
    { kata: "一人っ子", furigana: "ひとりっこ", arti: "anak tunggal" },
    { kata: "姉妹", furigana: "しまい", arti: "saudara perempuan" },
    { kata: "いとこ", furigana: "いとこ", arti: "sepupu" },
    { kata: "姪っ子", furigana: "めいっこ", arti: "keponakan perempuan" },
    { kata: "甥っ子", furigana: "おいっこ", arti: "keponakan laki-laki" }
],

       
// G. CARA MENGHITUNG
caraMenghitung: [

    // 1. HITUNGAN ORANG
    ...nsBuatKartuHitunganDasar("ORANG", [
        ["一人", "ひとり", "1 orang"],
        ["二人", "ふたり", "2 orang"],
        ["三人", "さんにん", "3 orang"],
        ["四人", "よにん", "4 orang"],
        ["五人", "ごにん", "5 orang"],
        ["六人", "ろくにん", "6 orang"],
        ["七人", "ななにん", "7 orang"],
        ["八人", "はちにん", "8 orang"],
        ["九人", "きゅうにん", "9 orang"],
        ["十人", "じゅうにん", "10 orang"]
    ]),

    // 2. HITUNGAN BENDA
    ...nsBuatKartuHitunganDasar("BENDA", [
        ["一つ", "ひとつ", "1 benda"],
        ["二つ", "ふたつ", "2 benda"],
        ["三つ", "みっつ", "3 benda"],
        ["四つ", "よっつ", "4 benda"],
        ["五つ", "いつつ", "5 benda"],
        ["六つ", "むっつ", "6 benda"],
        ["七つ", "ななつ", "7 benda"],
        ["八つ", "やっつ", "8 benda"],
        ["九つ", "ここのつ", "9 benda"],
        ["十", "とお", "10 benda"]
    ]),

    // 3. HITUNGAN TANGGAL
    ...nsBuatKartuHitunganDasar("TANGGAL", [
        ["一日", "ついたち", "Tanggal 1"],
        ["二日", "ふつか", "Tanggal 2"],
        ["三日", "みっか", "Tanggal 3"],
        ["四日", "よっか", "Tanggal 4"],
        ["五日", "いつか", "Tanggal 5"],
        ["六日", "むいか", "Tanggal 6"],
        ["七日", "なのか", "Tanggal 7"],
        ["八日", "ようか", "Tanggal 8"],
        ["九日", "ここのか", "Tanggal 9"],
        ["十日", "とおか", "Tanggal 10"]
    ]),

    // 4. HITUNGAN MINGGU
    ...nsBuatKartuHitunganDasar("MINGGU", [
        ["一週間", "いっしゅうかん", "1 minggu"],
        ["二週間", "にしゅうかん", "2 minggu"],
        ["三週間", "さんしゅうかん", "3 minggu"],
        ["四週間", "よんしゅうかん", "4 minggu"],
        ["五週間", "ごしゅうかん", "5 minggu"],
        ["六週間", "ろくしゅうかん", "6 minggu"],
        ["七週間", "ななしゅうかん", "7 minggu"],
        ["八週間", "はっしゅうかん", "8 minggu"],
        ["九週間", "きゅうしゅうかん", "9 minggu"],
        ["十週間", "じゅっしゅうかん", "10 minggu"]
    ]),

    // 5. HITUNGAN BULAN (DURASI)
    ...nsBuatKartuHitunganDasar("BULAN", [
        ["一か月", "いっかげつ", "1 bulan"],
        ["二か月", "にかげつ", "2 bulan"],
        ["三か月", "さんかげつ", "3 bulan"],
        ["四か月", "よんかげつ", "4 bulan"],
        ["五か月", "ごかげつ", "5 bulan"],
        ["六か月", "ろっかげつ", "6 bulan"],
        ["七か月", "ななかげつ", "7 bulan"],
        ["八か月", "はっかげつ", "8 bulan"],
        ["九か月", "きゅうかげつ", "9 bulan"],
        ["十か月", "じゅっかげつ", "10 bulan"]
    ]),

    // 6. HITUNGAN TAHUN
    ...nsBuatKartuHitunganDasar("TAHUN", [
        ["一年", "いちねん", "1 tahun"],
        ["二年", "にねん", "2 tahun"],
        ["三年", "さんねん", "3 tahun"],
        ["四年", "よねん", "4 tahun"],
        ["五年", "ごねん", "5 tahun"],
        ["六年", "ろくねん", "6 tahun"],
        ["七年", "ななねん", "7 tahun"],
        ["八年", "はちねん", "8 tahun"],
        ["九年", "きゅうねん", "9 tahun"],
        ["十年", "じゅうねん", "10 tahun"]
    ])

],



    // HARI DAN BULAN
hariTanggalBulan: [

    // 1. NAMA-NAMA HARI
    {
        subkategori: "HARI",
        kata: "月曜日",
        furigana: "げつようび",
        arti: "Senin"
    },
    {
        subkategori: "HARI",
        kata: "火曜日",
        furigana: "かようび",
        arti: "Selasa"
    },
    {
        subkategori: "HARI",
        kata: "水曜日",
        furigana: "すいようび",
        arti: "Rabu"
    },
    {
        subkategori: "HARI",
        kata: "木曜日",
        furigana: "もくようび",
        arti: "Kamis"
    },
    {
        subkategori: "HARI",
        kata: "金曜日",
        furigana: "きんようび",
        arti: "Jumat"
    },
    {
        subkategori: "HARI",
        kata: "土曜日",
        furigana: "どようび",
        arti: "Sabtu"
    },
    {
        subkategori: "HARI",
        kata: "日曜日",
        furigana: "にちようび",
        arti: "Minggu"
    },

    // 2. NAMA-NAMA BULAN
    {
        subkategori: "BULAN",
        kata: "一月",
        furigana: "いちがつ",
        arti: "Januari"
    },
    {
        subkategori: "BULAN",
        kata: "二月",
        furigana: "にがつ",
        arti: "Februari"
    },
    {
        subkategori: "BULAN",
        kata: "三月",
        furigana: "さんがつ",
        arti: "Maret"
    },
    {
        subkategori: "BULAN",
        kata: "四月",
        furigana: "しがつ",
        arti: "April"
    },
    {
        subkategori: "BULAN",
        kata: "五月",
        furigana: "ごがつ",
        arti: "Mei"
    },
    {
        subkategori: "BULAN",
        kata: "六月",
        furigana: "ろくがつ",
        arti: "Juni"
    },
    {
        subkategori: "BULAN",
        kata: "七月",
        furigana: "しちがつ",
        arti: "Juli"
    },
    {
        subkategori: "BULAN",
        kata: "八月",
        furigana: "はちがつ",
        arti: "Agustus"
    },
    {
        subkategori: "BULAN",
        kata: "九月",
        furigana: "くがつ",
        arti: "September"
    },
    {
        subkategori: "BULAN",
        kata: "十月",
        furigana: "じゅうがつ",
        arti: "Oktober"
    },
    {
        subkategori: "BULAN",
        kata: "十一月",
        furigana: "じゅういちがつ",
        arti: "November"
    },
    {
        subkategori: "BULAN",
        kata: "十二月",
        furigana: "じゅうにがつ",
        arti: "Desember"
    }

],
    // I. SALAM
    salam: [

        {
            subkategori: "SALAM SEHARI-HARI",
            kata: "おはようございます",
            furigana: "おはようございます",
            arti: "Selamat pagi (sopan)"
        },
        {
            kata: "こんにちは",
            furigana: "こんにちは",
            arti: "Selamat siang"
        },
        {
            kata: "こんばんは",
            furigana: "こんばんは",
            arti: "Selamat malam"
        },
        {
            kata: "おやすみなさい",
            furigana: "おやすみなさい",
            arti: "Selamat tidur"
        },
        {
            kata: "さようなら",
            furigana: "さようなら",
            arti: "Selamat tinggal"
        },
        {
            kata: "じゃあ、また",
            furigana: "じゃあ、また",
            arti: "Sampai bertemu lagi"
        },
        {
            kata: "また明日",
            furigana: "またあした",
            arti: "Sampai besok"
        },
        {
            subkategori: "TERIMA KASIH DAN PERMINTAAN MAAF",
            kata: "ありがとうございます",
            furigana: "ありがとうございます",
            arti: "Terima kasih"
        },
        {
            kata: "どういたしまして",
            furigana: "どういたしまして",
            arti: "Sama-sama"
        },
        {
            kata: "すみません",
            furigana: "すみません",
            arti: "Permisi, maaf"
        },
        {
            kata: "ごめんなさい",
            furigana: "ごめんなさい",
            arti: "Maaf"
        },
        {
            kata: "申し訳ありません",
            furigana: "もうしわけありません",
            arti: "Mohon maaf (sangat sopan)"
        },
        {
            subkategori: "SALAM KETIKA DATANG DAN PERGI",
            kata: "いらっしゃい",
            furigana: "いらっしゃい",
            arti: "Selamat datang (santai)"
        },
        {
            kata: "いらっしゃいませ",
            furigana: "いらっしゃいませ",
            arti: "Selamat datang (di toko atau restoran)"
        },
        {
            kata: "ごめんください",
            furigana: "ごめんください",
            arti: "Permisi (ketika bertamu)"
        },
        {
            kata: "いってきます",
            furigana: "いってきます",
            arti: "Saya berangkat dan akan kembali"
        },
        {
            kata: "いってらっしゃい",
            furigana: "いってらっしゃい",
            arti: "Hati-hati di jalan"
        },
        {
            kata: "ただいま",
            furigana: "ただいま",
            arti: "Saya sudah pulang"
        },
        {
            kata: "おかえりなさい",
            furigana: "おかえりなさい",
            arti: "Selamat datang kembali"
        },
        {
            subkategori: "SALAM DAN UNGKAPAN SOPAN",
            kata: "お元気ですか",
            furigana: "おげんきですか",
            arti: "Apa kabar?"
        },
        {
            kata: "お元気で",
            furigana: "おげんきで",
            arti: "Jaga kesehatan, semoga sehat selalu"
        },
        {
            kata: "初めまして",
            furigana: "はじめまして",
            arti: "Salam kenal"
        },
        {
            kata: "どうぞよろしくお願いします",
            furigana: "どうぞよろしくおねがいします",
            arti: "Senang berkenalan dengan Anda"
        },
        {
            kata: "失礼します",
            furigana: "しつれいします",
            arti: "Permisi (sopan)"
        },
        {
            kata: "お先に失礼します",
            furigana: "おさきにしつれいします",
            arti: "Permisi, saya pulang lebih dahulu"
        },
        {
            kata: "お疲れ様でした",
            furigana: "おつかれさまでした",
            arti: "Terima kasih atas kerja kerasnya"
        },
        {
            subkategori: "SALAM SEBELUM DAN SESUDAH MAKAN",
            kata: "いただきます",
            furigana: "いただきます",
            arti: "Diucapkan sebelum makan"
        },
        {
            kata: "ごちそうさまでした",
            furigana: "ごちそうさまでした",
            arti: "Diucapkan setelah selesai makan"
        },
        {
            subkategori: "UNGKAPAN LAIN",
            kata: "おめでとうございます",
            furigana: "おめでとうございます",
            arti: "Selamat (atas keberhasilan atau perayaan)"
        },
        {
            kata: "もしもし",
            furigana: "もしもし",
            arti: "Halo (ketika menelepon)"
        }
    ]

};


function amanHTMLKosakata(teks) {
    return String(teks ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function buatTampilanFuriganaCampuran(item) {
    const kata = String(item?.kata ?? "");
    const bacaan = String(item?.furigana ?? "").trim();

    // Jika kata sudah memiliki markup ruby,
    // jangan menambahkan furigana kedua.
    if (/<ruby\b/i.test(kata)) {
        return kata;
    }

    const polaKanji = /\p{Script=Han}/u;
    const polaKana = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;

    // Jika tidak ada kanji atau bacaan kosong,
    // tampilkan kata Jepang biasa.
    if (!polaKanji.test(kata) || !bacaan) {
        return amanHTMLKosakata(kata);
    }

    // Pisahkan kanji, kana, dan karakter lainnya.
    const bagian = kata.match(
        /\p{Script=Han}+|[\p{Script=Hiragana}\p{Script=Katakana}]+|[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]+/gu
    ) || [kata];

    let hasil = "";
    let posisiBacaan = 0;

    for (let i = 0; i < bagian.length; i++) {
        const bagianKata = bagian[i];

        // Bagian kanji.
        if (polaKanji.test(bagianKata)) {

            let posisiBerikutnya = -1;

            // Cari bagian kana berikutnya sebagai batas bacaan.
            for (let j = i + 1; j < bagian.length; j++) {
                if (polaKana.test(bagian[j])) {
                    posisiBerikutnya = bacaan.indexOf(
                        bagian[j],
                        posisiBacaan
                    );
                    break;
                }
            }

            // Jika batas bacaan tidak cocok,
            // jangan membuat furigana yang berpotensi salah.
            if (
                posisiBerikutnya === -1 &&
                bagian.slice(i + 1).some(p => polaKana.test(p))
            ) {
                return amanHTMLKosakata(kata);
            }

            const bacaanKanji = posisiBerikutnya === -1
                ? bacaan.slice(posisiBacaan)
                : bacaan.slice(posisiBacaan, posisiBerikutnya);

            // Jangan membuat ruby dengan bacaan kosong.
            if (!bacaanKanji) {
                return amanHTMLKosakata(kata);
            }

            hasil +=
                `<ruby>${amanHTMLKosakata(bagianKata)}` +
                `<rt>${amanHTMLKosakata(bacaanKanji)}</rt></ruby>`;

            posisiBacaan += bacaanKanji.length;
        }

        // Bagian hiragana atau katakana.
        else if (polaKana.test(bagianKata)) {

            const posisi = bacaan.indexOf(
                bagianKata,
                posisiBacaan
            );

            // Pastikan kana pada kata cocok dengan bacaannya.
            if (posisi === -1) {
                return amanHTMLKosakata(kata);
            }

            hasil += amanHTMLKosakata(bagianKata);
            posisiBacaan = posisi + bagianKata.length;
        }

        // Karakter lainnya.
        else {
            hasil += amanHTMLKosakata(bagianKata);
        }
    }

    return hasil;
}



/* =====================================
   MENAMPILKAN KOSAKATA JLPT N5
========================================= */
/* =========================================
   PILIH LEVEL KOSAKATA
========================================= */



function pilihLevelKosakata(level) {

    const tempat = document.getElementById("materi-kosakata");

    if (!tempat) return;

    // Tampilkan tempat materi setelah level dipilih.
    tempat.hidden = false;

    // Tandai level yang sedang dipilih.
    document.querySelectorAll(
        "#halaman-kosakata .level-menu button"
    ).forEach(function(btn) {
        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );
    });

    // Materi kosakata N5.
    if (level === "N5") {
        tampilkanKosakata();
        return;
    }

    // Materi N4 dan N3.
    tempat.innerHTML = `
        <p class="kosakata-empty">
            Materi ${level} akan ditambahkan.
        </p>
    `;
}


/* =========================================================
   NIHONGO STUDY - SISTEM KATEGORI KOSAKATA
   Sesi harian berganti setiap pukul 01.00 WIB
========================================================= */

const NS_KEY_STATUS_KOSAKATA = "nihongoKosakataStatus";
const NS_KEY_TARGET_KOSAKATA = "nihongoTargetKategoriBelajar";
const NS_KEY_SESI_KOSAKATA = "nihongoSesiKategoriBelajar";
const NS_KEY_SESI_GABUNGAN_KOSAKATA = "nihongoSesiGabunganKosakata";

function nsBacaPenyimpananKosakata(kunci, nilaiCadangan = {}) {
    try {
        const isi = localStorage.getItem(kunci);
        if (!isi) return nilaiCadangan;

        const hasil = JSON.parse(isi);
        return hasil && typeof hasil === "object" ? hasil : nilaiCadangan;
    } catch (error) {
        console.error("Gagal membaca penyimpanan kosakata:", error);
        return nilaiCadangan;
    }
}

function nsSimpanPenyimpananKosakata(kunci, nilai) {
    try {
        localStorage.setItem(kunci, JSON.stringify(nilai));
    } catch (error) {
        console.error("Gagal menyimpan data kosakata:", error);
    }
}

function nsIdKosakata(kategori, item) {
    return `${kategori}::${item.kata}::${item.furigana}`;
}

function nsBagianWIB() {
    const bagian = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        hourCycle: "h23"
    }).formatToParts(new Date());

    return Object.fromEntries(
        bagian.filter(item => item.type !== "literal")
            .map(item => [item.type, item.value])
    );
}

function nsFormatTanggalUTC(tanggal) {
    const tahun = tanggal.getUTCFullYear();
    const bulan = String(tanggal.getUTCMonth() + 1).padStart(2, "0");
    const hari = String(tanggal.getUTCDate()).padStart(2, "0");
    return `${tahun}-${bulan}-${hari}`;
}

// Tanggal sesi berubah pukul 01.00 WIB.
function nsTanggalSesiKosakata() {
    const bagian = nsBagianWIB();
    const tahun = Number(bagian.year);
    const bulan = Number(bagian.month);
    const hari = Number(bagian.day);

    if (Number(bagian.hour) < 1) {
        const kemarin = new Date(Date.UTC(tahun, bulan - 1, hari - 1));
        return nsFormatTanggalUTC(kemarin);
    }

    return `${tahun}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}`;
}

function nsWaktuResetBerikutnyaKosakata() {
    const bagian = nsBagianWIB();
    let tahun = Number(bagian.year);
    let bulan = Number(bagian.month);
    let hari = Number(bagian.day);

    let waktuReset = Date.parse(
        `${tahun}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}T01:00:00+07:00`
    );

    if (waktuReset <= Date.now()) {
        const besok = new Date(Date.UTC(tahun, bulan - 1, hari + 1));
        tahun = besok.getUTCFullYear();
        bulan = besok.getUTCMonth() + 1;
        hari = besok.getUTCDate();

        waktuReset = Date.parse(
            `${tahun}-${String(bulan).padStart(2, "0")}-${String(hari).padStart(2, "0")}T01:00:00+07:00`
        );
    }

    return waktuReset;
}

// Menjadwalkan pergantian sesi pukul 01.00 WIB.
function nsJadwalkanResetKosakata() {
    if (typeof window === "undefined") return;

    if (window.__nihongoKosakataTimer01) {
        clearTimeout(window.__nihongoKosakataTimer01);
    }

    const jeda = Math.max(
        1000,
        nsWaktuResetBerikutnyaKosakata() - Date.now() + 150
    );

    window.__nihongoKosakataTimer01 = setTimeout(function() {
        const tempat = document.getElementById("materi-kosakata");
        const kategori = window.__nihongoKategoriKosakataAktif;
        const mode = window.__nihongoModeKosakata;

        if (tempat) {
            if (kategori && mode === "ulasan") {
                bukaUlasHafalan(kategori);
            } else if (kategori) {
                pilihKategoriKosakata(kategori);
            } else {
                tampilkanKosakata();
            }
        }

        nsJadwalkanResetKosakata();

    }, jeda);
}

// Membuat antrean baru saat tanggal sesi berubah.
// Kartu lama yang belum hafal + target kosakata baru.
function nsBuatKartuHitunganDasar(subkategori, daftar) {
    return daftar.map(([kata, furigana, arti]) => ({
        subkategori,
        kata,
        furigana,
        arti
    }));
}
function nsPastikanSesiKategoriKosakata(kategori) {
    const daftar = Array.isArray(dataKosakata[kategori])
        ? dataKosakata[kategori]
        : [];

    const status = nsBacaPenyimpananKosakata(NS_KEY_STATUS_KOSAKATA);
    const target = nsBacaPenyimpananKosakata(NS_KEY_TARGET_KOSAKATA);
    const semuaSesi = nsBacaPenyimpananKosakata(NS_KEY_SESI_KOSAKATA);

    const tanggalHariIni = nsTanggalSesiKosakata();
    const sesiLama = semuaSesi[kategori];

    const idValid = new Set(
        daftar.map(item => nsIdKosakata(kategori, item))
    );

    // Jika sesi hari ini sudah ada, pertahankan antreannya.
    if (
        sesiLama &&
        sesiLama.tanggal === tanggalHariIni &&
        Array.isArray(sesiLama.antrean)
    ) {
        const antreanBersih = [...new Set(sesiLama.antrean)].filter(id =>
            idValid.has(id) && status[id] !== "hafal"
        );

        sesiLama.antrean = antreanBersih;

        sesiLama.antreanLama = Array.isArray(sesiLama.antreanLama)
            ? sesiLama.antreanLama.filter(id => antreanBersih.includes(id))
            : [];

        sesiLama.kosakataBaru = Array.isArray(sesiLama.kosakataBaru)
            ? sesiLama.kosakataBaru.filter(id => antreanBersih.includes(id))
            : [];

        semuaSesi[kategori] = sesiLama;

        nsSimpanPenyimpananKosakata(NS_KEY_SESI_KOSAKATA, semuaSesi);

        return sesiLama;
    }

    // Membawa kartu yang belum selesai dari sesi sebelumnya.
    let antreanLama = [];

    if (sesiLama && Array.isArray(sesiLama.antrean)) {
        antreanLama = [...new Set(sesiLama.antrean)].filter(id =>
            idValid.has(id) && status[id] !== "hafal"
        );
    }

    // Target hanya menghitung kosakata BARU.
    const jumlahTarget = Math.max(
        0,
        Math.floor(Number(target[kategori]) || 0)
    );

    const sudahMasuk = new Set(antreanLama);
    const kosakataBaru = [];

    for (const item of daftar) {
        if (kosakataBaru.length >= jumlahTarget) break;

        const id = nsIdKosakata(kategori, item);

        if (status[id] === "hafal" || sudahMasuk.has(id)) {
            continue;
        }

        kosakataBaru.push(id);
        sudahMasuk.add(id);
    }

    const sesiBaru = {
        tanggal: tanggalHariIni,
        antrean: [...antreanLama, ...kosakataBaru],
        antreanLama: [...antreanLama],
        kosakataBaru: [...kosakataBaru]
    };

    semuaSesi[kategori] = sesiBaru;

    nsSimpanPenyimpananKosakata(NS_KEY_SESI_KOSAKATA, semuaSesi);

    return sesiBaru;
}

// Memberikan penilaian Hafal atau Belum Hafal.
function nsNilaiKartuKosakata(kategori, hasil) {
    const sesi = nsPastikanSesiKategoriKosakata(kategori);

    if (!sesi.antrean.length) {
        pilihKategoriKosakata(kategori);
        return;
    }

    const id = sesi.antrean.shift();

    const status = nsBacaPenyimpananKosakata(NS_KEY_STATUS_KOSAKATA);

    if (hasil === "hafal") {
        status[id] = "hafal";

        sesi.antreanLama = (sesi.antreanLama || [])
            .filter(item => item !== id);

        sesi.kosakataBaru = (sesi.kosakataBaru || [])
            .filter(item => item !== id);
    } else {
        status[id] = "belum";

        // Kartu belum hafal masuk kembali ke belakang antrean.
        sesi.antrean.push(id);
    }

    const semuaSesi = nsBacaPenyimpananKosakata(NS_KEY_SESI_KOSAKATA);

    semuaSesi[kategori] = sesi;

    nsSimpanPenyimpananKosakata(NS_KEY_STATUS_KOSAKATA, status);
    nsSimpanPenyimpananKosakata(NS_KEY_SESI_KOSAKATA, semuaSesi);

    pilihKategoriKosakata(kategori);
}
// ============================================
// NIHONGO STUDY - SISTEM KOSAKATA GABUNGAN N5
// ============================================

const NS_KATEGORI_GABUNGAN_N5 = [
    "kataKerja",
    "kataSifat",
    "kataKeterangan",
    "kataTanya",
    "kataBenda",
    "anggotaKeluarga",
    "caraMenghitung",
    "hariTanggalBulan",
    "salam"
];

// Mengambil seluruh kosakata N5.
function nsAmbilSemuaKosakataN5() {
    const hasil = [];

    NS_KATEGORI_GABUNGAN_N5.forEach(kategori => {
        const daftar = Array.isArray(dataKosakata[kategori])
            ? dataKosakata[kategori]
            : [];

        let subkategoriAktif = "";

        daftar.forEach(item => {
            if (item.subkategori) {
                subkategoriAktif = item.subkategori;
            }

            hasil.push({
                ...item,
                kategoriAsli: kategori,
                labelSubkategori: subkategoriAktif,
                id: nsIdKosakata(kategori, item)
            });
        });
    });

    return hasil;
}

// Memastikan sesi gabungan harian tersedia.
function nsPastikanSesiGabunganKosakata() {
    const semuaKosakata = nsAmbilSemuaKosakataN5();
    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    const target = nsBacaPenyimpananKosakata(
        NS_KEY_TARGET_KOSAKATA
    );

    const sesiGabungan = nsBacaPenyimpananKosakata(
        NS_KEY_SESI_GABUNGAN_KOSAKATA
    );

    const sesiKategori = nsBacaPenyimpananKosakata(
        NS_KEY_SESI_KOSAKATA
    );

    const hariIni = nsTanggalSesiKosakata();

    const idValid = new Set(
        semuaKosakata.map(item => item.id)
    );

    // Jika sesi hari ini masih berlaku, pertahankan.
    if (
        sesiGabungan.tanggal === hariIni &&
        Array.isArray(sesiGabungan.antrean)
    ) {
        sesiGabungan.antrean = [
            ...new Set(sesiGabungan.antrean)
        ].filter(id =>
            idValid.has(id) && status[id] !== "hafal"
        );

        sesiGabungan.antreanLama =
            (sesiGabungan.antreanLama || [])
                .filter(id => sesiGabungan.antrean.includes(id));

        sesiGabungan.kosakataBaru =
            (sesiGabungan.kosakataBaru || [])
                .filter(id => sesiGabungan.antrean.includes(id));

        nsSimpanPenyimpananKosakata(
            NS_KEY_SESI_GABUNGAN_KOSAKATA,
            sesiGabungan
        );

        return sesiGabungan;
    }

    // Membawa antrean gabungan sebelumnya.
    let antreanLama = [];

    if (Array.isArray(sesiGabungan.antrean)) {
        antreanLama.push(...sesiGabungan.antrean);
    }

    // Membawa antrean kategori lama yang belum selesai.
    NS_KATEGORI_GABUNGAN_N5.forEach(kategori => {
        const sesiLama = sesiKategori[kategori];

        if (sesiLama && Array.isArray(sesiLama.antrean)) {
            antreanLama.push(...sesiLama.antrean);
        }
    });

    antreanLama = [...new Set(antreanLama)].filter(id =>
        idValid.has(id) && status[id] !== "hafal"
    );

    const sudahMasuk = new Set(antreanLama);
    const kosakataBaru = [];

    const jumlahTarget = Math.max(
        0,
        Math.floor(Number(target.N5) || 0)
    );

    // Menambahkan kosakata baru sesuai target N5.
    for (const item of semuaKosakata) {
        if (kosakataBaru.length >= jumlahTarget) break;

        if (
            status[item.id] === "hafal" ||
            sudahMasuk.has(item.id)
        ) {
            continue;
        }

        kosakataBaru.push(item.id);
        sudahMasuk.add(item.id);
    }

    const sesiBaru = {
        tanggal: hariIni,
        antrean: [...antreanLama, ...kosakataBaru],
        antreanLama: [...antreanLama],
        kosakataBaru: [...kosakataBaru]
    };

    nsSimpanPenyimpananKosakata(
        NS_KEY_SESI_GABUNGAN_KOSAKATA,
        sesiBaru
    );

    return sesiBaru;
}

// Menampilkan proses belajar gabungan.
function mulaiBelajarGabunganKosakata() {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    window.__nihongoKategoriKosakataAktif = null;
    window.__nihongoModeKosakata = "gabungan-belajar";

    nsJadwalkanResetKosakata();

    const semuaKosakata = nsAmbilSemuaKosakataN5();
    const petaKartu = new Map(
        semuaKosakata.map(item => [item.id, item])
    );

    const sesi = nsPastikanSesiGabunganKosakata();

    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    function aman(teks) {
        return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[karakter]));
    }

    sesi.antrean = sesi.antrean.filter(id =>
        petaKartu.has(id) && status[id] !== "hafal"
    );

    nsSimpanPenyimpananKosakata(
        NS_KEY_SESI_GABUNGAN_KOSAKATA,
        sesi
    );

    // Jika antrean selesai.
    if (sesi.antrean.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">
                <button class="kosakata-kembali"
                    id="kembaliGabungan">
                    ← Kembali
                </button>

                <div class="kosakata-selesai-harian">
                    <h3>🎉 Target belajar hari ini selesai!</h3>
                    <p>Semua kartu dalam antrean sudah selesai.</p>
                    <p>Kosakata baru akan ditambahkan pada sesi berikutnya.</p>
                </div>
            </div>
        `;

        document.getElementById("kembaliGabungan")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    const id = sesi.antrean[0];
    const item = petaKartu.get(id);

    if (!item) {
        sesi.antrean.shift();

        nsSimpanPenyimpananKosakata(
            NS_KEY_SESI_GABUNGAN_KOSAKATA,
            sesi
        );

        mulaiBelajarGabunganKosakata();
        return;
    }

    let tampilanArti = "";

    if (item.kategoriAsli === "caraMenghitung") {
        const rincian = String(item.arti || "")
            .split("·")
            .map(teks => teks.trim())
            .filter(Boolean);

        tampilanArti = `
            <div class="kosakata-hitungan-list">
                ${rincian.map(teks => `
                    <div class="kosakata-hitungan-item">
                        ${aman(teks)}
                    </div>
                `).join("")}
            </div>
        `;
    } else {
        tampilanArti = `
            <p class="kosakata-arti">${aman(item.arti)}</p>
        `;
    }

    const jumlahLama = sesi.antrean.filter(kartu =>
        (sesi.antreanLama || []).includes(kartu)
    ).length;

    tempat.innerHTML = `
        <div class="kosakata-halaman">

            <button class="kosakata-kembali"
                id="kembaliGabungan">
                ← Kembali ke Ringkasan N5
            </button>

            <h2>📚 Belajar Kosakata N5</h2>

            ${item.labelSubkategori ? `
                <div class="kosakata-subkategori">
                    ${aman(item.labelSubkategori)}
                </div>
            ` : ""}

            <div class="kosakata-flashcard-info">
                ${sesi.antrean.length} kartu dalam antrean
                ${jumlahLama > 0
                    ? ` · ${jumlahLama} kartu bawaan`
                    : ""}
            </div>

            <article class="kosakata-flashcard"
                id="kartuGabungan"
                role="button"
                tabindex="0"
                aria-expanded="false">

                <div class="kosakata-kanji"
                    id="gabunganKataAwal">
                    ${aman(item.kata)}
                </div>

                <div class="kosakata-kanji"
                    id="gabunganKataBacaan"
                    hidden
                    style="display:none">
                    ${typeof buatHTMLFurigana === "function"
                        ? buatHTMLFurigana(item.kata, item.furigana)
                        : aman(item.kata)}
                </div>

                <div id="gabunganArti"
                    hidden
                    style="display:none">
                    ${tampilanArti}
                </div>

                <small class="kosakata-petunjuk"
                    id="gabunganPetunjuk">
                    Klik kartu untuk melihat furigana dan arti
                </small>

            </article>

            <div class="kosakata-tombol-penilaian"
                style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px;">

                <button type="button"
                    id="gabunganBelumHafal">
                    Belum Hafal ↻
                </button>

                <button type="button"
                    id="gabunganHafal">
                    ✓ Hafal
                </button>

            </div>

        </div>
    `;

    document.getElementById("kembaliGabungan")
        .addEventListener("click", tampilkanKosakata);

    const kartu = document.getElementById("kartuGabungan");
    const awal = document.getElementById("gabunganKataAwal");
    const bacaan = document.getElementById("gabunganKataBacaan");
    const arti = document.getElementById("gabunganArti");
    const petunjuk = document.getElementById("gabunganPetunjuk");

    function ubahTampilan() {
        const terbuka =
            kartu.getAttribute("aria-expanded") === "true";

        kartu.setAttribute("aria-expanded", String(!terbuka));

        awal.hidden = !terbuka;
        awal.style.display = terbuka ? "" : "none";

        bacaan.hidden = terbuka;
        bacaan.style.display = terbuka ? "none" : "";

        arti.hidden = terbuka;
        arti.style.display = terbuka ? "none" : "";

        petunjuk.textContent = terbuka
            ? "Klik kartu untuk melihat furigana dan arti"
            : "Klik kartu untuk menyembunyikan furigana dan arti";
    }

    kartu.addEventListener("click", ubahTampilan);

    kartu.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ubahTampilan();
        }
    });

    document.getElementById("gabunganBelumHafal")
        .addEventListener("click", function() {
            nsNilaiKartuGabunganKosakata("belum");
        });

    document.getElementById("gabunganHafal")
        .addEventListener("click", function() {
            nsNilaiKartuGabunganKosakata("hafal");
        });
}

// Menyimpan penilaian kartu gabungan.
function nsNilaiKartuGabunganKosakata(hasil) {
    const sesi = nsPastikanSesiGabunganKosakata();

    if (!sesi.antrean.length) return;

    const id = sesi.antrean.shift();

    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    const jadwal = nsBacaPenyimpananKosakata(
        NS_KEY_JADWAL_ULASAN
    );

    if (hasil === "hafal") {
        status[id] = "hafal";
        delete jadwal[id];
    } else {
        sesi.antrean.push(id);
        status[id] = "belum";
        delete jadwal[id];
    }

    nsSimpanPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA,
        status
    );

    nsSimpanPenyimpananKosakata(
        NS_KEY_JADWAL_ULASAN,
        jadwal
    );

    nsSimpanPenyimpananKosakata(
        NS_KEY_SESI_GABUNGAN_KOSAKATA,
        sesi
    );

    mulaiBelajarGabunganKosakata();
}

// Membuka ulasan seluruh kosakata N5.
function bukaUlasHafalanGabungan() {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    window.__nihongoKategoriKosakataAktif = null;
    window.__nihongoModeKosakata = "ulasan-gabungan";

    nsJadwalkanResetKosakata();

    const semuaKosakata = nsAmbilSemuaKosakataN5();
    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    const jadwal = nsBacaPenyimpananKosakata(
        NS_KEY_JADWAL_ULASAN
    );

    const hariIni = nsTanggalSesiKosakata();

    const antrean = semuaKosakata.filter(item => {
        if (status[item.id] !== "hafal") return false;

        const dataJadwal = jadwal[item.id];

        return (
            !dataJadwal ||
            !dataJadwal.tanggalBerikutnya ||
            dataJadwal.tanggalBerikutnya <= hariIni
        );
    });

    function aman(teks) {
        return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[karakter]));
    }

    if (antrean.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">
                <button class="kosakata-kembali"
                    id="kembaliUlasGabungan">
                    ← Kembali ke Ringkasan N5
                </button>

                <div class="kosakata-selesai-harian">
                    <h3>🎉 Semua ulasan selesai!</h3>
                    <p>Belum ada kosakata yang perlu diulas sekarang.</p>
                </div>
            </div>
        `;

        document.getElementById("kembaliUlasGabungan")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    let indeks = 0;

    function tampilkanKartuUlasan() {
        if (indeks >= antrean.length) {
            tempat.innerHTML = `
                <div class="kosakata-halaman">
                    <button class="kosakata-kembali"
                        id="kembaliUlasGabungan">
                        ← Kembali ke Ringkasan N5
                    </button>

                    <div class="kosakata-selesai-harian">
                        <h3>🎉 Ulasan selesai!</h3>
                        <p>Kamu sudah menyelesaikan ulasan hari ini.</p>
                    </div>
                </div>
            `;

            document.getElementById("kembaliUlasGabungan")
                .addEventListener("click", tampilkanKosakata);

            return;
        }

        const item = antrean[indeks];
        const id = item.id;

        let tampilanArti = "";

        if (item.kategoriAsli === "caraMenghitung") {
            const rincian = String(item.arti || "")
                .split("·")
                .map(teks => teks.trim())
                .filter(Boolean);

            tampilanArti = `
                <div class="kosakata-hitungan-list">
                    ${rincian.map(teks => `
                        <div class="kosakata-hitungan-item">
                            ${aman(teks)}
                        </div>
                    `).join("")}
                </div>
            `;
        } else {
            tampilanArti = `
                <p class="kosakata-arti">${aman(item.arti)}</p>
            `;
        }

        tempat.innerHTML = `
            <div class="kosakata-halaman">

                <button class="kosakata-kembali"
                    id="kembaliUlasGabungan">
                    ← Kembali ke Ringkasan N5
                </button>

                <h2>🔄 Ulas Hafalan N5</h2>

                ${item.labelSubkategori ? `
                    <div class="kosakata-subkategori">
                        ${aman(item.labelSubkategori)}
                    </div>
                ` : ""}

                <div class="kosakata-flashcard-info">
                    Kartu ${indeks + 1} dari ${antrean.length}
                </div>

                <article class="kosakata-flashcard"
                    id="kartuUlasGabungan"
                    role="button"
                    tabindex="0"
                    aria-expanded="false">

                    <div class="kosakata-kanji"
                        id="ulasanGabunganAwal">
                        ${aman(item.kata)}
                    </div>

                    <div class="kosakata-kanji"
                        id="ulasanGabunganBacaan"
                        hidden
                        style="display:none">
                        ${typeof buatHTMLFurigana === "function"
                            ? buatHTMLFurigana(item.kata, item.furigana)
                            : aman(item.kata)}
                    </div>

                    <div id="ulasanGabunganArti"
                        hidden
                        style="display:none">
                        ${tampilanArti}
                    </div>

                    <small class="kosakata-petunjuk"
                        id="ulasanGabunganPetunjuk">
                        Coba ingat arti kata ini, lalu klik kartu.
                    </small>

                </article>

                <div id="hasilUlasGabungan"
                    style="display:none;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:18px;">

                    <button type="button" id="gabunganLupa">
                        ↻ Lupa
                    </button>

                    <button type="button" id="gabunganIngat">
                        ✓ Masih Ingat
                    </button>

                </div>

            </div>
        `;

        document.getElementById("kembaliUlasGabungan")
            .addEventListener("click", tampilkanKosakata);

        const kartu = document.getElementById("kartuUlasGabungan");
        const awal = document.getElementById("ulasanGabunganAwal");
        const bacaan = document.getElementById("ulasanGabunganBacaan");
        const arti = document.getElementById("ulasanGabunganArti");
        const petunjuk = document.getElementById("ulasanGabunganPetunjuk");
        const tombolHasil = document.getElementById("hasilUlasGabungan");

        function bukaKartu() {
            const terbuka =
                kartu.getAttribute("aria-expanded") === "true";

            kartu.setAttribute("aria-expanded", String(!terbuka));

            awal.hidden = !terbuka;
            awal.style.display = terbuka ? "" : "none";

            bacaan.hidden = terbuka;
            bacaan.style.display = terbuka ? "none" : "";

            arti.hidden = terbuka;
            arti.style.display = terbuka ? "none" : "";

            tombolHasil.style.display = terbuka ? "none" : "flex";

            petunjuk.textContent = terbuka
                ? "Coba ingat arti kata ini, lalu klik kartu."
                : "Pilih apakah kamu masih ingat atau lupa.";
        }

        kartu.addEventListener("click", bukaKartu);

        kartu.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                bukaKartu();
            }
        });

        // Masih ingat.
        document.getElementById("gabunganIngat")
            .addEventListener("click", function() {
                const intervalHari = [1, 3, 7, 14, 30];

                const dataLama = jadwal[id] || {};
                const levelLama = Math.max(
                    0,
                    Number(dataLama.level) || 0
                );

                const interval = intervalHari[
                    Math.min(levelLama, intervalHari.length - 1)
                ];

                jadwal[id] = {
                    level: Math.min(levelLama + 1, 5),
                    tanggalBerikutnya: nsTanggalTambahHariUlas(
                        nsTanggalSesiKosakata(),
                        interval
                    ),
                    terakhirDiulas: nsTanggalSesiKosakata()
                };

                nsSimpanPenyimpananKosakata(
                    NS_KEY_JADWAL_ULASAN,
                    jadwal
                );

                indeks++;
                tampilkanKartuUlasan();
            });

        // Lupa.
        document.getElementById("gabunganLupa")
            .addEventListener("click", function() {
                status[id] = "belum";
                delete jadwal[id];

                nsSimpanPenyimpananKosakata(
                    NS_KEY_STATUS_KOSAKATA,
                    status
                );

                nsSimpanPenyimpananKosakata(
                    NS_KEY_JADWAL_ULASAN,
                    jadwal
                );

                const sesi = nsPastikanSesiGabunganKosakata();

                if (!sesi.antrean.includes(id)) {
                    sesi.antrean.push(id);
                }

                nsSimpanPenyimpananKosakata(
                    NS_KEY_SESI_GABUNGAN_KOSAKATA,
                    sesi
                );

                indeks++;
                tampilkanKartuUlasan();
            });
    }

    tampilkanKartuUlasan();
}



// =========================================================
// HALAMAN DAFTAR KATEGORI
// =========================================================




function tampilkanKosakata() {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    window.__nihongoKategoriKosakataAktif = null;
    window.__nihongoModeKosakata = "gabungan";

    nsJadwalkanResetKosakata();

    // Semua kategori digabung menjadi satu daftar N5.
    const semuaKategori = [
        "kataKerja",
        "kataSifat",
        "kataKeterangan",
        "kataTanya",
        "kataBenda",
        "anggotaKeluarga",
        "caraMenghitung",
        "hariTanggalBulan",
        "salam"
    ];

    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    const target = nsBacaPenyimpananKosakata(
        NS_KEY_TARGET_KOSAKATA
    );

    let totalKosakata = 0;
    let jumlahHafal = 0;

    semuaKategori.forEach(kategori => {
        const daftar = Array.isArray(dataKosakata[kategori])
            ? dataKosakata[kategori]
            : [];

        totalKosakata += daftar.length;

        daftar.forEach(item => {
            const id = nsIdKosakata(kategori, item);

            if (status[id] === "hafal") {
                jumlahHafal++;
            }
        });
    });

    const belumHafal = totalKosakata - jumlahHafal;

    const progress = totalKosakata > 0
        ? (jumlahHafal / totalKosakata) * 100
        : 0;

    // Target gabungan N5.
    const jumlahTarget = Math.max(
        0,
        Math.min(
            belumHafal,
            Math.floor(Number(target.N5) || 0)
        )
    );

    tempat.innerHTML = `
        <div class="kosakata-kategori">

            <h2>📚 Belajar Kosakata N5</h2>

            <p>
                Semua kosakata N5 digabung dalam satu sistem belajar.
            </p>

            <div class="kosakata-kategori-grid">

                <div class="kartu-kategori-kosakata">

                    <div class="kategori-kosakata-judul">
                        <span>📖</span>
                        <strong>Ringkasan Kosakata N5</strong>
                    </div>

                    <div class="kategori-kosakata-info">
                        <span>
                            Total: ${totalKosakata} kosakata
                        </span>

                        <span>
                            Sudah hafal: ${jumlahHafal}
                        </span>

                        <span>
                            Belum hafal: ${belumHafal}
                        </span>
                    </div>

                    <div class="kategori-progress">
                        <div
                            class="kategori-progress-isi"
                            style="width: ${progress}%">
                        </div>
                    </div>

                    <p>
                        Progres hafalan:
                        ${progress.toFixed(1)}%
                    </p>

                    <label for="targetKosakataN5">
                        Target kosakata baru per hari:
                    </label>

                    <input
                        type="number"
                        id="targetKosakataN5"
                        min="0"
                        max="${belumHafal}"
                        value="${jumlahTarget}"
                        class="input-target-belajar"
                    >

                    <button
                        type="button"
                        id="mulaiBelajarGabungan"
                        class="kosakata-kategori-btn">
                        📝 Mulai Belajar
                    </button>

                    <button
                        type="button"
                        id="ulasHafalanGabungan"
                        class="kosakata-ulasan-btn"
                        ${jumlahHafal === 0 ? "disabled" : ""}>
                        🔄 Ulas Ulang Hafalan (${jumlahHafal})
                    </button>

                </div>

            </div>
        </div>
    `;

    // Simpan target harian gabungan.
    const inputTarget = document.getElementById(
        "targetKosakataN5"
    );

    inputTarget.addEventListener("change", function() {
        let jumlah = Math.floor(Number(this.value) || 0);

        jumlah = Math.max(
            0,
            Math.min(jumlah, belumHafal)
        );

        this.value = jumlah;

        const targetTerbaru = nsBacaPenyimpananKosakata(
            NS_KEY_TARGET_KOSAKATA
        );

        targetTerbaru.N5 = jumlah;

        nsSimpanPenyimpananKosakata(
            NS_KEY_TARGET_KOSAKATA,
            targetTerbaru
        );
    });

    // Tombol mulai belajar gabungan.
    document.getElementById("mulaiBelajarGabungan")
        .addEventListener("click", function() {
            mulaiBelajarGabunganKosakata();
        });

    // Tombol ulas ulang seluruh hafalan.
    document.getElementById("ulasHafalanGabungan")
        .addEventListener("click", function() {
            if (jumlahHafal > 0) {
                bukaUlasHafalanGabungan();
            }
        });
}




// =========================================================
// MENYIMPAN TARGET HARIAN
// =========================================================

function simpanTargetKategoriBelajar(input) {
    const kategori = input.dataset.kategori;

    const daftar = Array.isArray(dataKosakata[kategori])
        ? dataKosakata[kategori]
        : [];

    const status = nsBacaPenyimpananKosakata(NS_KEY_STATUS_KOSAKATA);
    const target = nsBacaPenyimpananKosakata(NS_KEY_TARGET_KOSAKATA);

    const jumlahHafal = daftar.filter(item =>
        status[nsIdKosakata(kategori, item)] === "hafal"
    ).length;

    const sisa = daftar.length - jumlahHafal;

    let jumlah = Math.floor(Number(input.value) || 0);

    jumlah = Math.max(0, Math.min(jumlah, sisa));

    input.value = jumlah;

    target[kategori] = jumlah;

    nsSimpanPenyimpananKosakata(NS_KEY_TARGET_KOSAKATA, target);
}


// =========================================================
// HALAMAN KARTU BELAJAR PER KATEGORI
// Membutuhkan fungsi buatHTMLFurigana() yang sudah ada.
// =========================================================

function pilihKategoriKosakata(kunci) {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    if (typeof window !== "undefined") {
        window.__nihongoKategoriKosakataAktif = kunci;
    }

    nsJadwalkanResetKosakata();

    const namaKategori = {
        kataKerja: "KATA KERJA",
        kataSifat: "KATA SIFAT",
        kataKeterangan: "KATA KETERANGAN",
        kataTanya: "KATA TANYA",
        kataBenda: "KATA BENDA",
        anggotaKeluarga: "ANGGOTA KELUARGA",
        caraMenghitung: "CARA MENGHITUNG",
        hariTanggalBulan: "HARI, TANGGAL & BULAN",
        salam: "SALAM"
    };

    const daftarAsli = Array.isArray(dataKosakata[kunci])
        ? dataKosakata[kunci]
        : [];

    function aman(teks) {
        return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[karakter]));
    }

    // Mempertahankan label subkategori.
    let subkategoriAktif = "";

    const daftarLengkap = daftarAsli.map(item => {
        if (item.subkategori) {
            subkategoriAktif = item.subkategori;
        }

        return {
            ...item,
            labelSubkategori: subkategoriAktif
        };
    });

    const petaKartu = new Map(
        daftarLengkap.map(item => [
            nsIdKosakata(kunci, item),
            item
        ])
    );

    const sesi = nsPastikanSesiKategoriKosakata(kunci);

    const status = nsBacaPenyimpananKosakata(NS_KEY_STATUS_KOSAKATA);

    // Membersihkan kartu yang sudah hafal atau tidak ada dalam data.
    sesi.antrean = [...new Set(sesi.antrean || [])].filter(id =>
        petaKartu.has(id) && status[id] !== "hafal"
    );

    const semuaSesi = nsBacaPenyimpananKosakata(NS_KEY_SESI_KOSAKATA);

    semuaSesi[kunci] = sesi;

    nsSimpanPenyimpananKosakata(NS_KEY_SESI_KOSAKATA, semuaSesi);

    // Jika kategori kosong.
    if (daftarAsli.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">

                <button class="kosakata-kembali" id="kembaliKategori">
                    ← Kembali ke Kategori
                </button>

                <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

                <p>Materi akan ditambahkan.</p>

            </div>
        `;

        document.getElementById("kembaliKategori")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    // Jika antrean sudah selesai.
    if (sesi.antrean.length === 0) {
        tempat.innerHTML = `
            <div class="kosakata-halaman">

                <button class="kosakata-kembali" id="kembaliKategori">
                    ← Kembali ke Kategori
                </button>

                <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

                <div class="kosakata-selesai-harian">
                    <h3>🎉 Target belajar hari ini selesai!</h3>

                    <p>
                        Semua kartu dalam antrean hari ini sudah ditandai Hafal.
                    </p>

                    <p>
                        Kosakata baru berikutnya akan ditambahkan
                        pada sesi pukul 01.00 WIB.
                    </p>
                </div>

            </div>
        `;

        document.getElementById("kembaliKategori")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    // Mengambil kartu pertama dalam antrean.
    const idKartu = sesi.antrean[0];

    const item = petaKartu.get(idKartu);

    if (!item) {
        sesi.antrean.shift();

        const dataSesi = nsBacaPenyimpananKosakata(
            NS_KEY_SESI_KOSAKATA
        );

        dataSesi[kunci] = sesi;

        nsSimpanPenyimpananKosakata(
            NS_KEY_SESI_KOSAKATA,
            dataSesi
        );

        pilihKategoriKosakata(kunci);

        return;
    }

    // Tampilan arti khusus untuk kategori cara menghitung.
    let tampilanArti = "";

    if (kunci === "caraMenghitung") {
        const rincian = String(item.arti || "")
            .split("·")
            .map(teks => teks.trim())
            .filter(Boolean);

        tampilanArti = `
            <div class="kosakata-hitungan-list">

                ${rincian.map(teks => `
                    <div class="kosakata-hitungan-item">
                        ${aman(teks)}
                    </div>
                `).join("")}

            </div>
        `;
    } else {
        tampilanArti = `
            <p class="kosakata-arti">
                ${aman(item.arti)}
            </p>
        `;
    }

    const jumlahKartuLama = (sesi.antreanLama || []).filter(id =>
        sesi.antrean.includes(id)
    ).length;

    // Menampilkan kartu belajar.
    tempat.innerHTML = `
        <div class="kosakata-halaman">

            <button class="kosakata-kembali" id="kembaliKategori">
                ← Kembali ke Kategori
            </button>

            <h2>${aman(namaKategori[kunci] || "KOSAKATA")}</h2>

            ${item.labelSubkategori ? `
                <div class="kosakata-subkategori">
                    ${aman(item.labelSubkategori)}
                </div>
            ` : ""}

            <div class="kosakata-flashcard-info">
                ${sesi.antrean.length} kartu dalam antrean

                ${jumlahKartuLama > 0
                    ? ` · ${jumlahKartuLama} kartu bawaan`
                    : ""}
            </div>

            <article
                class="kosakata-flashcard"
                id="kartuKosakata"
                role="button"
                tabindex="0"
                aria-expanded="false"
                aria-label="Klik untuk melihat furigana dan arti">

                <!-- Tampilan awal -->
                <div
                    class="kosakata-kanji"
                    id="kataKosakataAwal">
                    ${aman(item.kata)}
                </div>

                <!-- Furigana hanya di atas kanji -->
                <div
                    class="kosakata-kanji"
                    id="kataKosakataBacaan"
                    hidden
                    style="display:none">

                    ${typeof buatHTMLFurigana === "function"
                        ? buatHTMLFurigana(item.kata, item.furigana)
                        : aman(item.kata)}

                </div>

                <!-- Arti bahasa Indonesia -->
                <div
                    id="artiKosakata"
                    hidden
                    style="display:none">

                    ${tampilanArti}

                </div>

                <small
                    class="kosakata-petunjuk"
                    id="petunjukKosakata">

                    Klik kartu untuk melihat furigana dan arti

                </small>

            </article>

            <!-- Tombol penilaian -->
            <div
                class="kosakata-tombol-penilaian"
                style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap; margin-top:18px;">

                <button
                    type="button"
                    id="tombolBelumHafal"
                    style="padding:12px 20px; border:0; border-radius:12px; background:#fff0f3; color:#a83e62; font-weight:700; cursor:pointer;">

                    Belum Hafal ↻

                </button>

                <button
                    type="button"
                    id="tombolHafal"
                    style="padding:12px 20px; border:0; border-radius:12px; background:#e6f6ed; color:#24734b; font-weight:700; cursor:pointer;">

                    ✓ Hafal

                </button>

            </div>

            <small class="kosakata-petunjuk">
                Pilih Belum Hafal agar kartu diulang kembali,
                atau Hafal untuk menyelesaikannya.
            </small>

        </div>
    `;

    // Tombol kembali ke kategori.
    document.getElementById("kembaliKategori")
        .addEventListener("click", tampilkanKosakata);

    // Elemen kartu.
    const kartu = document.getElementById("kartuKosakata");

    const tampilanAwal = document.getElementById(
        "kataKosakataAwal"
    );

    const tampilanBacaan = document.getElementById(
        "kataKosakataBacaan"
    );

    const artiKartuElemen = document.getElementById(
        "artiKosakata"
    );

    const petunjuk = document.getElementById(
        "petunjukKosakata"
    );

    // Membuka dan menutup furigana serta arti.
    function ubahTampilanKartu() {
        const terbuka =
            kartu.getAttribute("aria-expanded") === "true";

        kartu.setAttribute(
            "aria-expanded",
            String(!terbuka)
        );

        tampilanAwal.hidden = !terbuka;
        tampilanAwal.style.display = terbuka ? "" : "none";

        tampilanBacaan.hidden = terbuka;
        tampilanBacaan.style.display = terbuka ? "none" : "";

        artiKartuElemen.hidden = terbuka;
        artiKartuElemen.style.display = terbuka ? "none" : "";

        petunjuk.textContent = terbuka
            ? "Klik kartu untuk melihat furigana dan arti"
            : "Klik kartu untuk menyembunyikan furigana dan arti";
    }

    kartu.addEventListener("click", ubahTampilanKartu);

    kartu.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            ubahTampilanKartu();
        }
    });

    // Tombol Belum Hafal.
    document.getElementById("tombolBelumHafal")
        .addEventListener("click", function() {
            nsNilaiKartuKosakata(kunci, "belum");
        });

    // Tombol Hafal.
    document.getElementById("tombolHafal")
        .addEventListener("click", function() {
            nsNilaiKartuKosakata(kunci, "hafal");
        });
}
/* =========================================
   3. TOMBOL MULAI BELAJAR
========================================= */

function mulaiBelajar() {
    const menu = document.getElementById("menu-utama");

    if (menu) {
        menu.scrollIntoView({ behavior: "smooth" });
    }
}


/* =========================================
   4. PANEL PROFIL
========================================= */

function bukaProfil() {
    const profil = document.getElementById("profile-overlay");
    if (profil) profil.classList.add("aktif");
}

function tutupProfil() {
    const profil = document.getElementById("profile-overlay");
    if (profil) profil.classList.remove("aktif");
}


/* =========================================
   5. DAFTAR 117 KANJI N5
   SESUAI KELOMPOK PDF
========================================= */

const daftarKelompokKanji = [
    {
        nama: "Kata Kerja",
        kanji: [
            "買", "行", "来", "出", "入", "立", "休", "読",
            "書", "聞", "話", "食", "飲", "見", "会", "言"
        ]
    },
    {
        nama: "Kata Sifat & Warna",
        kanji: [
            "大", "小", "多", "少", "高", "安", "新",
            "古", "長", "早", "白", "黒", "赤", "青"
        ]
    },
    {
        nama: "Hari & Waktu",
        kanji: [
            "日", "月", "火", "水", "木", "金", "土",
            "年", "週", "時", "分", "先", "今", "明",
            "毎", "間", "午", "半"
        ]
    },
    {
        nama: "Arah & Posisi",
        kanji: [
            "上", "下", "中", "外", "左", "右",
            "前", "後", "東", "西", "南", "北"
        ]
    },
    {
        nama: "Manusia & Tubuh",
        kanji: [
            "人", "子", "女", "男", "父", "母", "友",
            "名", "目", "耳", "口", "手", "力", "足"
        ]
    },
    {
        nama: "Alam & Kehidupan",
        kanji: [
            "山", "川", "田", "天", "空", "雨",
            "気", "花", "草", "林", "森"
        ]
    },
    {
        nama: "Tempat & Umum",
        kanji: [
            "国", "町", "村", "道", "駅",
            "店", "家", "車", "電", "社"
        ]
    },
    {
        nama: "Sekolah & Lain-lain",
        kanji: [
            "学", "生", "校", "本", "語", "何", "牛", "魚"
        ]
    },
    {
        nama: "Angka & Bilangan",
        kanji: [
            "一", "二", "三", "四", "五", "六", "七",
            "八", "九", "十", "百", "千", "万", "円"
        ]
    }
];


/* =========================================
   6. DATA DETAIL KANJI
   Data contoh yang sudah ada sebelumnya.
   Data lainnya akan dilengkapi dari PDF.
========================================= */


const dataKanji = {
    // =====================================
    // KELOMPOK 4: ARAH DAN POSISI
    // =====================================

    "上": {
        arti: "Atas",
        onyomi: "ジョウ",
        kunyomi: "うえ・うわ・あ（がる）・のぼ（る）",
        romaji: "JOU / ue / uwa / agaru / noboru",
        kosakata: [
            "<ruby>上<rt>うえ</rt></ruby> — atas",
            "<ruby>上手<rt>じょうず</rt></ruby> — pandai",
            "<ruby>上着<rt>うわぎ</rt></ruby> — jaket"
        ]
    },
    "下": {
        arti: "Bawah",
        onyomi: "カ・ゲ",
        kunyomi: "した・しも・さ（がる）・お（りる）",
        romaji: "KA / GE / shita / sagaru / oriru",
        kosakata: [
            "<ruby>下<rt>した</rt></ruby> — bawah",
            "<ruby>下手<rt>へた</rt></ruby> — tidak mahir",
            "<ruby>地下<rt>ちか</rt></ruby> — bawah tanah"
        ]
    },
    "中": {
        arti: "Dalam / Tengah",
        onyomi: "チュウ・ジュウ",
        kunyomi: "なか",
        romaji: "CHUU / JUU / naka",
        kosakata: [
            "<ruby>中<rt>なか</rt></ruby> — dalam",
            "<ruby>中国<rt>ちゅうごく</rt></ruby> — Tiongkok",
            "<ruby>一日中<rt>いちにちじゅう</rt></ruby> — sepanjang hari"
        ]
    },
    "外": {
        arti: "Luar",
        onyomi: "ガイ・ゲ",
        kunyomi: "そと・ほか・はず（す）",
        romaji: "GAI / GE / soto / hoka",
        kosakata: [
            "<ruby>外<rt>そと</rt></ruby> — luar",
            "<ruby>外国<rt>がいこく</rt></ruby> — negara asing",
            "<ruby>外国人<rt>がいこくじん</rt></ruby> — orang asing"
        ]
    },
    "左": {
        arti: "Kiri",
        onyomi: "サ",
        kunyomi: "ひだり",
        romaji: "SA / hidari",
        kosakata: [
            "<ruby>左<rt>ひだり</rt></ruby> — kiri",
            "<ruby>左手<rt>ひだりて</rt></ruby> — tangan kiri",
            "<ruby>左側<rt>ひだりがわ</rt></ruby> — sisi kiri"
        ]
    },
    "右": {
        arti: "Kanan",
        onyomi: "ウ・ユウ",
        kunyomi: "みぎ",
        romaji: "U / YUU / migi",
        kosakata: [
            "<ruby>右<rt>みぎ</rt></ruby> — kanan",
            "<ruby>右手<rt>みぎて</rt></ruby> — tangan kanan",
            "<ruby>右側<rt>みぎがわ</rt></ruby> — sisi kanan"
        ]
    },
    "前": {
        arti: "Depan / Sebelum",
        onyomi: "ゼン",
        kunyomi: "まえ",
        romaji: "ZEN / mae",
        kosakata: [
            "<ruby>前<rt>まえ</rt></ruby> — depan",
            "<ruby>午前<rt>ごぜん</rt></ruby> — sebelum tengah hari",
            "<ruby>名前<rt>なまえ</rt></ruby> — nama"
        ]
    },
    "後": {
        arti: "Belakang / Sesudah",
        onyomi: "ゴ・コウ",
        kunyomi: "うし（ろ）・あと・のち",
        romaji: "GO / KOU / ushiro / ato / nochi",
        kosakata: [
            "<ruby>後<rt>あと</rt></ruby> — sesudah",
            "<ruby>後ろ<rt>うしろ</rt></ruby> — belakang",
            "<ruby>午後<rt>ごご</rt></ruby> — setelah tengah hari"
        ]
    },
    "東": {
        arti: "Timur",
        onyomi: "トウ",
        kunyomi: "ひがし",
        romaji: "TOU / higashi",
        kosakata: [
            "<ruby>東<rt>ひがし</rt></ruby> — timur",
            "<ruby>東京<rt>とうきょう</rt></ruby> — Tokyo",
            "<ruby>東口<rt>ひがしぐち</rt></ruby> — pintu timur"
        ]
    },
    "西": {
        arti: "Barat",
        onyomi: "セイ・サイ",
        kunyomi: "にし",
        romaji: "SEI / SAI / nishi",
        kosakata: [
            "<ruby>西<rt>にし</rt></ruby> — barat",
            "<ruby>西口<rt>にしぐち</rt></ruby> — pintu barat",
            "<ruby>関西<rt>かんさい</rt></ruby> — wilayah Kansai"
        ]
    },
    "南": {
        arti: "Selatan",
        onyomi: "ナン",
        kunyomi: "みなみ",
        romaji: "NAN / minami",
        kosakata: [
            "<ruby>南<rt>みなみ</rt></ruby> — selatan",
            "<ruby>南口<rt>みなみぐち</rt></ruby> — pintu selatan",
            "<ruby>南国<rt>なんごく</rt></ruby> — negara tropis"
        ]
    },
    "北": {
        arti: "Utara",
        onyomi: "ホク",
        kunyomi: "きた",
        romaji: "HOKU / kita",
        kosakata: [
            "<ruby>北<rt>きた</rt></ruby> — utara",
            "<ruby>北海道<rt>ほっかいどう</rt></ruby> — Hokkaido",
            "<ruby>北口<rt>きたぐち</rt></ruby> — pintu utara"
        ]
    },

    // =====================================
    // KELOMPOK 5: MANUSIA DAN TUBUH
    // =====================================

    "人": {
        arti: "Orang / Manusia",
        onyomi: "ジン・ニン",
        kunyomi: "ひと",
        romaji: "JIN / NIN / hito",
        kosakata: [
            "<ruby>人<rt>ひと</rt></ruby> — orang",
            "<ruby>日本人<rt>にほんじん</rt></ruby> — orang Jepang",
            "<ruby>三人<rt>さんにん</rt></ruby> — tiga orang"
        ]
    },
    "子": {
        arti: "Anak",
        onyomi: "シ・ス",
        kunyomi: "こ",
        romaji: "SHI / SU / ko",
        kosakata: [
            "<ruby>子<rt>こ</rt></ruby> — anak",
            "<ruby>子供<rt>こども</rt></ruby> — anak-anak",
            "<ruby>女の子<rt>おんなのこ</rt></ruby> — anak perempuan"
        ]
    },
    "女": {
        arti: "Perempuan",
        onyomi: "ジョ・ニョ",
        kunyomi: "おんな・め",
        romaji: "JO / NYO / onna / me",
        kosakata: [
            "<ruby>女<rt>おんな</rt></ruby> — perempuan",
            "<ruby>女の人<rt>おんなのひと</rt></ruby> — wanita",
            "<ruby>女子<rt>じょし</rt></ruby> — perempuan"
        ]
    },
    "男": {
        arti: "Laki-laki",
        onyomi: "ダン・ナン",
        kunyomi: "おとこ",
        romaji: "DAN / NAN / otoko",
        kosakata: [
            "<ruby>男<rt>おとこ</rt></ruby> — laki-laki",
            "<ruby>男の人<rt>おとこのひと</rt></ruby> — pria",
            "<ruby>男子<rt>だんし</rt></ruby> — laki-laki"
        ]
    },
    "父": {
        arti: "Ayah",
        onyomi: "フ",
        kunyomi: "ちち",
        romaji: "FU / chichi",
        kosakata: [
            "<ruby>父<rt>ちち</rt></ruby> — ayah sendiri",
            "<ruby>お父さん<rt>おとうさん</rt></ruby> — ayah",
            "<ruby>父母<rt>ふぼ</rt></ruby> — ayah dan ibu"
        ]
    },
    "母": {
        arti: "Ibu",
        onyomi: "ボ",
        kunyomi: "はは",
        romaji: "BO / haha",
        kosakata: [
            "<ruby>母<rt>はは</rt></ruby> — ibu sendiri",
            "<ruby>お母さん<rt>おかあさん</rt></ruby> — ibu",
            "<ruby>母国<rt>ぼこく</rt></ruby> — negara asal"
        ]
    },
    "友": {
        arti: "Teman",
        onyomi: "ユウ",
        kunyomi: "とも",
        romaji: "YUU / tomo",
        kosakata: [
            "<ruby>友<rt>とも</rt></ruby> — teman",
            "<ruby>友達<rt>ともだち</rt></ruby> — teman",
            "<ruby>友人<rt>ゆうじん</rt></ruby> — sahabat / teman"
        ]
    },
    "名": {
        arti: "Nama",
        onyomi: "メイ・ミョウ",
        kunyomi: "な",
        romaji: "MEI / MYOU / na",
        kosakata: [
            "<ruby>名前<rt>なまえ</rt></ruby> — nama",
            "<ruby>有名<rt>ゆうめい</rt></ruby> — terkenal",
            "<ruby>名字<rt>みょうじ</rt></ruby> — nama keluarga"
        ]
    },
    "目": {
        arti: "Mata",
        onyomi: "モク・ボク",
        kunyomi: "め",
        romaji: "MOKU / BOKU / me",
        kosakata: [
            "<ruby>目<rt>め</rt></ruby> — mata",
            "<ruby>目薬<rt>めぐすり</rt></ruby> — obat tetes mata",
            "<ruby>目的<rt>もくてき</rt></ruby> — tujuan"
        ]
    },
    "耳": {
        arti: "Telinga",
        onyomi: "ジ",
        kunyomi: "みみ",
        romaji: "JI / mimi",
        kosakata: [
            "<ruby>耳<rt>みみ</rt></ruby> — telinga",
            "<ruby>耳鼻科<rt>じびか</rt></ruby> — klinik THT",
            "<ruby>耳元<rt>みみもと</rt></ruby> — dekat telinga"
        ]
    },
    "口": {
        arti: "Mulut",
        onyomi: "コウ・ク",
        kunyomi: "くち",
        romaji: "KOU / KU / kuchi",
        kosakata: [
            "<ruby>口<rt>くち</rt></ruby> — mulut",
            "<ruby>入口<rt>いりぐち</rt></ruby> — pintu masuk",
            "<ruby>出口<rt>でぐち</rt></ruby> — pintu keluar"
        ]
    },
    "手": {
        arti: "Tangan",
        onyomi: "シュ",
        kunyomi: "て",
        romaji: "SHU / te",
        kosakata: [
            "<ruby>手<rt>て</rt></ruby> — tangan",
            "<ruby>手紙<rt>てがみ</rt></ruby> — surat",
            "<ruby>上手<rt>じょうず</rt></ruby> — pandai"
        ]
    },
    "力": {
        arti: "Kekuatan / Tenaga",
        onyomi: "リョク・リキ",
        kunyomi: "ちから",
        romaji: "RYOKU / RIKI / chikara",
        kosakata: [
            "<ruby>力<rt>ちから</rt></ruby> — tenaga",
            "<ruby>体力<rt>たいりょく</rt></ruby> — stamina",
            "<ruby>電力<rt>でんりょく</rt></ruby> — tenaga listrik"
        ]
    },
    "足": {
        arti: "Kaki / Cukup",
        onyomi: "ソク",
        kunyomi: "あし・た（りる）",
        romaji: "SOKU / ashi / tariru",
        kosakata: [
            "<ruby>足<rt>あし</rt></ruby> — kaki",
            "<ruby>足<rt>た</rt>りる</ruby> — cukup",
            "<ruby>足音<rt>あしおと</rt></ruby> — suara langkah kaki"
        ]
    },

    // =====================================
    // KELOMPOK 6: ALAM DAN KEHIDUPAN
    // =====================================

    "山": {
        arti: "Gunung",
        onyomi: "サン・セン",
        kunyomi: "やま",
        romaji: "SAN / SEN / yama",
        kosakata: [
            "<ruby>山<rt>やま</rt></ruby> — gunung",
            "<ruby>富士山<rt>ふじさん</rt></ruby> — Gunung Fuji",
            "<ruby>山道<rt>やまみち</rt></ruby> — jalan gunung"
        ]
    },
    "川": {
        arti: "Sungai",
        onyomi: "セン",
        kunyomi: "かわ",
        romaji: "SEN / kawa",
        kosakata: [
            "<ruby>川<rt>かわ</rt></ruby> — sungai",
            "<ruby>川口<rt>かわぐち</rt></ruby> — muara sungai",
            "<ruby>小川<rt>おがわ</rt></ruby> — sungai kecil"
        ]
    },
    "田": {
        arti: "Sawah",
        onyomi: "デン",
        kunyomi: "た",
        romaji: "DEN / ta",
        kosakata: [
            "<ruby>田<rt>た</rt></ruby> — sawah",
            "<ruby>田中<rt>たなか</rt></ruby> — Tanaka",
            "<ruby>田んぼ<rt>たんぼ</rt></ruby> — sawah"
        ]
    },
    "天": {
        arti: "Langit",
        onyomi: "テン",
        kunyomi: "あめ・あま",
        romaji: "TEN / ame / ama",
        kosakata: [
            "<ruby>天気<rt>てんき</rt></ruby> — cuaca",
            "<ruby>天国<rt>てんごく</rt></ruby> — surga",
            "<ruby>天才<rt>てんさい</rt></ruby> — jenius"
        ]
    },
    "空": {
        arti: "Langit / Kosong",
        onyomi: "クウ",
        kunyomi: "そら・から・あ（く）",
        romaji: "KUU / sora / kara / aku",
        kosakata: [
            "<ruby>空<rt>そら</rt></ruby> — langit",
            "<ruby>空気<rt>くうき</rt></ruby> — udara",
            "<ruby>空<rt>から</rt></ruby> — kosong"
        ]
    },
    "雨": {
        arti: "Hujan",
        onyomi: "ウ",
        kunyomi: "あめ・あま",
        romaji: "U / ame / ama",
        kosakata: [
            "<ruby>雨<rt>あめ</rt></ruby> — hujan",
            "<ruby>大雨<rt>おおあめ</rt></ruby> — hujan deras",
            "<ruby>雨天<rt>うてん</rt></ruby> — cuaca hujan"
        ]
    },
    "気": {
        arti: "Perasaan / Energi",
        onyomi: "キ・ケ",
        kunyomi: "—",
        romaji: "KI / KE",
        kosakata: [
            "<ruby>元気<rt>げんき</rt></ruby> — sehat / bersemangat",
            "<ruby>天気<rt>てんき</rt></ruby> — cuaca",
            "<ruby>人気<rt>にんき</rt></ruby> — populer"
        ]
    },
    "花": {
        arti: "Bunga",
        onyomi: "カ",
        kunyomi: "はな",
        romaji: "KA / hana",
        kosakata: [
            "<ruby>花<rt>はな</rt></ruby> — bunga",
            "<ruby>花火<rt>はなび</rt></ruby> — kembang api",
            "<ruby>花見<rt>はなみ</rt></ruby> — melihat bunga"
        ]
    },
    "草": {
        arti: "Rumput",
        onyomi: "ソウ",
        kunyomi: "くさ",
        romaji: "SOU / kusa",
        kosakata: [
            "<ruby>草<rt>くさ</rt></ruby> — rumput",
            "<ruby>草花<rt>くさばな</rt></ruby> — tanaman berbunga",
            "<ruby>雑草<rt>ざっそう</rt></ruby> — gulma"
        ]
    },
    "林": {
        arti: "Hutan kecil",
        onyomi: "リン",
        kunyomi: "はやし",
        romaji: "RIN / hayashi",
        kosakata: [
            "<ruby>林<rt>はやし</rt></ruby> — hutan kecil",
            "<ruby>林道<rt>りんどう</rt></ruby> — jalan hutan",
            "<ruby>森林<rt>しんりん</rt></ruby> — hutan"
        ]
    },
    "森": {
        arti: "Hutan",
        onyomi: "シン",
        kunyomi: "もり",
        romaji: "SHIN / mori",
        kosakata: [
            "<ruby>森<rt>もり</rt></ruby> — hutan",
            "<ruby>森林<rt>しんりん</rt></ruby> — hutan",
            "<ruby>森の中<rt>もりのなか</rt></ruby> — di dalam hutan"
        ]
    },

    // =====================================
    // KELOMPOK 7: TEMPAT DAN UMUM
    // =====================================

    "国": {
        arti: "Negara",
        onyomi: "コク",
        kunyomi: "くに",
        romaji: "KOKU / kuni",
        kosakata: [
            "<ruby>国<rt>くに</rt></ruby> — negara",
            "<ruby>外国<rt>がいこく</rt></ruby> — negara asing",
            "<ruby>中国<rt>ちゅうごく</rt></ruby> — Tiongkok"
        ]
    },
    "町": {
        arti: "Kota",
        onyomi: "チョウ",
        kunyomi: "まち",
        romaji: "CHOU / machi",
        kosakata: [
            "<ruby>町<rt>まち</rt></ruby> — kota",
            "<ruby>町中<rt>まちなか</rt></ruby> — pusat kota",
            "<ruby>町長<rt>ちょうちょう</rt></ruby> — kepala kota"
        ]
    },
    "村": {
        arti: "Desa",
        onyomi: "ソン",
        kunyomi: "むら",
        romaji: "SON / mura",
        kosakata: [
            "<ruby>村<rt>むら</rt></ruby> — desa",
            "<ruby>村人<rt>むらびと</rt></ruby> — penduduk desa",
            "<ruby>村長<rt>そんちょう</rt></ruby> — kepala desa"
        ]
    },
    "道": {
        arti: "Jalan",
        onyomi: "ドウ・トウ",
        kunyomi: "みち",
        romaji: "DOU / TOU / michi",
        kosakata: [
            "<ruby>道<rt>みち</rt></ruby> — jalan",
            "<ruby>道路<rt>どうろ</rt></ruby> — jalan raya",
            "<ruby>書道<rt>しょどう</rt></ruby> — kaligrafi Jepang"
        ]
    },
    "駅": {
        arti: "Stasiun",
        onyomi: "エキ",
        kunyomi: "—",
        romaji: "EKI",
        kosakata: [
            "<ruby>駅<rt>えき</rt></ruby> — stasiun",
            "<ruby>駅前<rt>えきまえ</rt></ruby> — depan stasiun",
            "<ruby>駅員<rt>えきいん</rt></ruby> — petugas stasiun"
        ]
    },
    "店": {
        arti: "Toko",
        onyomi: "テン",
        kunyomi: "みせ",
        romaji: "TEN / mise",
        kosakata: [
            "<ruby>店<rt>みせ</rt></ruby> — toko",
            "<ruby>店員<rt>てんいん</rt></ruby> — pegawai toko",
            "<ruby>喫茶店<rt>きっさてん</rt></ruby> — kedai kopi"
        ]
    },
    "家": {
        arti: "Rumah / Keluarga",
        onyomi: "カ・ケ",
        kunyomi: "いえ・うち",
        romaji: "KA / KE / ie / uchi",
        kosakata: [
            "<ruby>家<rt>いえ</rt></ruby> — rumah",
            "<ruby>家族<rt>かぞく</rt></ruby> — keluarga",
            "<ruby>家<rt>うち</rt></ruby> — rumah sendiri"
        ]
    },
    "車": {
        arti: "Mobil / Kendaraan",
        onyomi: "シャ",
        kunyomi: "くるま",
        romaji: "SHA / kuruma",
        kosakata: [
            "<ruby>車<rt>くるま</rt></ruby> — mobil",
            "<ruby>電車<rt>でんしゃ</rt></ruby> — kereta listrik",
            "<ruby>自動車<rt>じどうしゃ</rt></ruby> — mobil"
        ]
    },
    "電": {
        arti: "Listrik",
        onyomi: "デン",
        kunyomi: "—",
        romaji: "DEN",
        kosakata: [
            "<ruby>電気<rt>でんき</rt></ruby> — listrik",
            "<ruby>電話<rt>でんわ</rt></ruby> — telepon",
            "<ruby>電車<rt>でんしゃ</rt></ruby> — kereta listrik"
        ]
    },
    "社": {
        arti: "Perusahaan / Kuil",
        onyomi: "シャ",
        kunyomi: "やしろ",
        romaji: "SHA / yashiro",
        kosakata: [
            "<ruby>会社<rt>かいしゃ</rt></ruby> — perusahaan",
            "<ruby>社会<rt>しゃかい</rt></ruby> — masyarakat",
            "<ruby>神社<rt>じんじゃ</rt></ruby> — kuil Shinto"
        ]
    },

    // =====================================
    // KELOMPOK 8: SEKOLAH DAN LAIN-LAIN
    // =====================================

    "学": {
        arti: "Belajar",
        onyomi: "ガク",
        kunyomi: "まな（ぶ）",
        romaji: "GAKU / manabu",
        kosakata: [
            "<ruby>学校<rt>がっこう</rt></ruby> — sekolah",
            "<ruby>学生<rt>がくせい</rt></ruby> — pelajar",
            "<ruby>大学<rt>だいがく</rt></ruby> — universitas"
        ]
    },
    "生": {
        arti: "Hidup / Lahir",
        onyomi: "セイ・ショウ",
        kunyomi: "い（きる）・う（まれる）・なま",
        romaji: "SEI / SHOU / ikiru / umareru / nama",
        kosakata: [
            "<ruby>学生<rt>がくせい</rt></ruby> — pelajar",
            "<ruby>先生<rt>せんせい</rt></ruby> — guru",
            "<ruby>生<rt>なま</rt></ruby> — mentah / segar"
        ]
    },
    "校": {
        arti: "Sekolah",
        onyomi: "コウ",
        kunyomi: "—",
        romaji: "KOU",
        kosakata: [
            "<ruby>学校<rt>がっこう</rt></ruby> — sekolah",
            "<ruby>高校<rt>こうこう</rt></ruby> — SMA",
            "<ruby>校長<rt>こうちょう</rt></ruby> — kepala sekolah"
        ]
    },
    "本": {
        arti: "Buku / Asal",
        onyomi: "ホン",
        kunyomi: "もと",
        romaji: "HON / moto",
        kosakata: [
            "<ruby>本<rt>ほん</rt></ruby> — buku",
            "<ruby>日本<rt>にほん</rt></ruby> — Jepang",
            "<ruby>本当<rt>ほんとう</rt></ruby> — benar / sungguh"
        ]
    },
    "語": {
        arti: "Bahasa",
        onyomi: "ゴ",
        kunyomi: "かた（る）",
        romaji: "GO / kataru",
        kosakata: [
            "<ruby>日本語<rt>にほんご</rt></ruby> — bahasa Jepang",
            "<ruby>英語<rt>えいご</rt></ruby> — bahasa Inggris",
            "<ruby>中国語<rt>ちゅうごくご</rt></ruby> — bahasa Mandarin"
        ]
    },
    "何": {
        arti: "Apa",
        onyomi: "カ",
        kunyomi: "なに・なん",
        romaji: "KA / nani / nan",
        kosakata: [
            "<ruby>何<rt>なに</rt></ruby> — apa",
            "<ruby>何人<rt>なんにん</rt></ruby> — berapa orang",
            "<ruby>何時<rt>なんじ</rt></ruby> — jam berapa"
        ]
    },
    "牛": {
        arti: "Sapi",
        onyomi: "ギュウ",
        kunyomi: "うし",
        romaji: "GYUU / ushi",
        kosakata: [
            "<ruby>牛<rt>うし</rt></ruby> — sapi",
            "<ruby>牛肉<rt>ぎゅうにく</rt></ruby> — daging sapi",
            "<ruby>牛乳<rt>ぎゅうにゅう</rt></ruby> — susu sapi"
        ]
    },
    "魚": {
        arti: "Ikan",
        onyomi: "ギョ",
        kunyomi: "さかな・うお",
        romaji: "GYO / sakana / uo",
        kosakata: [
            "<ruby>魚<rt>さかな</rt></ruby> — ikan",
            "<ruby>金魚<rt>きんぎょ</rt></ruby> — ikan mas",
            "<ruby>魚屋<rt>さかなや</rt></ruby> — toko ikan"
        ]
    },

    // =====================================
    // KELOMPOK 9: ANGKA DAN BILANGAN
    // =====================================

    "一": {
        arti: "Satu",
        onyomi: "イチ・イツ",
        kunyomi: "ひと（つ）",
        romaji: "ICHI / ITSU / hitotsu",
        kosakata: [
            "<ruby>一<rt>ひと</rt>つ</ruby> — satu buah",
            "<ruby>一人<rt>ひとり</rt></ruby> — satu orang",
            "<ruby>一月<rt>いちがつ</rt></ruby> — Januari"
        ]
    },
    "二": {
        arti: "Dua",
        onyomi: "ニ",
        kunyomi: "ふた（つ）",
        romaji: "NI / futatsu",
        kosakata: [
            "<ruby>二<rt>ふた</rt>つ</ruby> — dua buah",
            "<ruby>二人<rt>ふたり</rt></ruby> — dua orang",
            "<ruby>二月<rt>にがつ</rt></ruby> — Februari"
        ]
    },
    "三": {
        arti: "Tiga",
        onyomi: "サン",
        kunyomi: "みっ（つ）",
        romaji: "SAN / mittsu",
        kosakata: [
            "<ruby>三<rt>みっ</rt>つ</ruby> — tiga buah",
            "<ruby>三人<rt>さんにん</rt></ruby> — tiga orang",
            "<ruby>三月<rt>さんがつ</rt></ruby> — Maret"
        ]
    },
    "四": {
        arti: "Empat",
        onyomi: "シ",
        kunyomi: "よん・よっ（つ）・よ",
        romaji: "SHI / yon / yottsu",
        kosakata: [
            "<ruby>四<rt>よっ</rt>つ</ruby> — empat buah",
            "<ruby>四人<rt>よにん</rt></ruby> — empat orang",
            "<ruby>四月<rt>しがつ</rt></ruby> — April"
        ]
    },
    "五": {
        arti: "Lima",
        onyomi: "ゴ",
        kunyomi: "いつ（つ）",
        romaji: "GO / itsutsu",
        kosakata: [
            "<ruby>五<rt>いつ</rt>つ</ruby> — lima buah",
            "<ruby>五人<rt>ごにん</rt></ruby> — lima orang",
            "<ruby>五月<rt>ごがつ</rt></ruby> — Mei"
        ]
    },
    "六": {
        arti: "Enam",
        onyomi: "ロク",
        kunyomi: "むっ（つ）・むい",
        romaji: "ROKU / muttsu / mui",
        kosakata: [
            "<ruby>六<rt>むっ</rt>つ</ruby> — enam buah",
            "<ruby>六人<rt>ろくにん</rt></ruby> — enam orang",
            "<ruby>六月<rt>ろくがつ</rt></ruby> — Juni"
        ]
    },
    "七": {
        arti: "Tujuh",
        onyomi: "シチ",
        kunyomi: "なな・なの・なな（つ）",
        romaji: "SHICHI / nana / nanatsu",
        kosakata: [
            "<ruby>七<rt>なな</rt>つ</ruby> — tujuh buah",
            "<ruby>七人<rt>しちにん</rt></ruby> — tujuh orang",
            "<ruby>七月<rt>しちがつ</rt></ruby> — Juli"
        ]
    },
    "八": {
        arti: "Delapan",
        onyomi: "ハチ",
        kunyomi: "やっ（つ）・よう",
        romaji: "HACHI / yattsu / you",
        kosakata: [
            "<ruby>八<rt>やっ</rt>つ</ruby> — delapan buah",
            "<ruby>八人<rt>はちにん</rt></ruby> — delapan orang",
            "<ruby>八月<rt>はちがつ</rt></ruby> — Agustus"
        ]
    },
    "九": {
        arti: "Sembilan",
        onyomi: "キュウ・ク",
        kunyomi: "ここの（つ）",
        romaji: "KYUU / KU / kokonotsu",
        kosakata: [
            "<ruby>九<rt>ここの</rt>つ</ruby> — sembilan buah",
            "<ruby>九人<rt>きゅうにん</rt></ruby> — sembilan orang",
            "<ruby>九月<rt>くがつ</rt></ruby> — September"
        ]
    },
    "十": {
        arti: "Sepuluh",
        onyomi: "ジュウ",
        kunyomi: "とお",
        romaji: "JUU / too",
        kosakata: [
            "<ruby>十<rt>とお</rt></ruby> — sepuluh",
            "<ruby>十人<rt>じゅうにん</rt></ruby> — sepuluh orang",
            "<ruby>十月<rt>じゅうがつ</rt></ruby> — Oktober"
        ]
    },
    "百": {
        arti: "Seratus",
        onyomi: "ヒャク",
        kunyomi: "—",
        romaji: "HYAKU",
        kosakata: [
            "<ruby>百<rt>ひゃく</rt></ruby> — seratus",
            "<ruby>三百<rt>さんびゃく</rt></ruby> — tiga ratus",
            "<ruby>百円<rt>ひゃくえん</rt></ruby> — seratus yen"
        ]
    },
    "千": {
        arti: "Seribu",
        onyomi: "セン",
        kunyomi: "ち",
        romaji: "SEN / chi",
        kosakata: [
            "<ruby>千<rt>せん</rt></ruby> — seribu",
            "<ruby>千円<rt>せんえん</rt></ruby> — seribu yen",
            "<ruby>三千<rt>さんぜん</rt></ruby> — tiga ribu"
        ]
    },
    "万": {
        arti: "Sepuluh ribu",
        onyomi: "マン・バン",
        kunyomi: "—",
        romaji: "MAN / BAN",
        kosakata: [
            "<ruby>一万<rt>いちまん</rt></ruby> — sepuluh ribu",
            "<ruby>一万円<rt>いちまんえん</rt></ruby> — sepuluh ribu yen",
            "<ruby>万年<rt>まんねん</rt></ruby> — sepuluh ribu tahun"
        ]
    },
    "円": {
        arti: "Yen / Lingkaran",
        onyomi: "エン",
        kunyomi: "まる（い）",
        romaji: "EN / marui",
        kosakata: [
            "<ruby>円<rt>えん</rt></ruby> — yen",
            "<ruby>百円<rt>ひゃくえん</rt></ruby> — seratus yen",
            "<ruby>円<rt>まる</rt>い</ruby> — bulat"
        ]
    },

    "日": {
        arti: "Hari / Matahari",
        onyomi: "ニチ・ジツ",
        kunyomi: "ひ・か",
        romaji: "NICHI / JITSU / hi / ka",
        kosakata: [
            "<ruby>日<rt>ひ</rt></ruby> — matahari / hari",
            "<ruby>日本<rt>にほん</rt></ruby> — Jepang",
            "<ruby>日曜日<rt>にちようび</rt></ruby> — hari Minggu"
        ]
    },
    "月": {
        arti: "Bulan",
        onyomi: "ゲツ・ガツ",
        kunyomi: "つき",
        romaji: "GETSU / GATSU / tsuki",
        kosakata: [
            "<ruby>月<rt>つき</rt></ruby> — bulan",
            "<ruby>月曜日<rt>げつようび</rt></ruby> — hari Senin",
            "<ruby>一月<rt>いちがつ</rt></ruby> — bulan Januari"
        ]
    },
    "火": {
        arti: "Api",
        onyomi: "カ",
        kunyomi: "ひ",
        romaji: "KA / hi",
        kosakata: [
            "<ruby>火<rt>ひ</rt></ruby> — api",
            "<ruby>火曜日<rt>かようび</rt></ruby> — hari Selasa",
            "<ruby>火山<rt>かざん</rt></ruby> — gunung berapi"
        ]
    },
    "水": {
        arti: "Air",
        onyomi: "スイ",
        kunyomi: "みず",
        romaji: "SUI / mizu",
        kosakata: [
            "<ruby>水<rt>みず</rt></ruby> — air",
            "<ruby>水曜日<rt>すいようび</rt></ruby> — hari Rabu",
            "<ruby>水道<rt>すいどう</rt></ruby> — saluran air"
        ]
    },
    "木": {
        arti: "Pohon / Kayu",
        onyomi: "モク・ボク",
        kunyomi: "き・こ",
        romaji: "MOKU / BOKU / ki / ko",
        kosakata: [
            "<ruby>木<rt>き</rt></ruby> — pohon",
            "<ruby>木曜日<rt>もくようび</rt></ruby> — hari Kamis",
            "<ruby>木<rt>もく</rt>材<rt>ざい</rt></ruby> — kayu"
        ]
    },
    "金": {
        arti: "Emas / Uang",
        onyomi: "キン・コン",
        kunyomi: "かね・かな",
        romaji: "KIN / KON / kane / kana",
        kosakata: [
            "<ruby>金<rt>かね</rt></ruby> — uang",
            "<ruby>金曜日<rt>きんようび</rt></ruby> — hari Jumat",
            "<ruby>お金<rt>おかね</rt></ruby> — uang"
        ]
    },
    "土": {
        arti: "Tanah",
        onyomi: "ド・ト",
        kunyomi: "つち",
        romaji: "DO / TO / tsuchi",
        kosakata: [
            "<ruby>土<rt>つち</rt></ruby> — tanah",
            "<ruby>土曜日<rt>どようび</rt></ruby> — hari Sabtu",
            "<ruby>土地<rt>とち</rt></ruby> — lahan / tanah"
        ]
    },
    "年": {
        arti: "Tahun",
        onyomi: "ネン",
        kunyomi: "とし",
        romaji: "NEN / toshi",
        kosakata: [
            "<ruby>年<rt>とし</rt></ruby> — tahun",
            "<ruby>今年<rt>ことし</rt></ruby> — tahun ini",
            "<ruby>来年<rt>らいねん</rt></ruby> — tahun depan"
        ]
    },
    "週": {
        arti: "Minggu",
        onyomi: "シュウ",
        kunyomi: "—",
        romaji: "SHUU",
        kosakata: [
            "<ruby>今週<rt>こんしゅう</rt></ruby> — minggu ini",
            "<ruby>先週<rt>せんしゅう</rt></ruby> — minggu lalu",
            "<ruby>来週<rt>らいしゅう</rt></ruby> — minggu depan"
        ]
    },
    "時": {
        arti: "Waktu / Jam",
        onyomi: "ジ",
        kunyomi: "とき",
        romaji: "JI / toki",
        kosakata: [
            "<ruby>時<rt>とき</rt></ruby> — waktu",
            "<ruby>時間<rt>じかん</rt></ruby> — waktu / durasi",
            "<ruby>三時<rt>さんじ</rt></ruby> — pukul tiga"
        ]
    },
    "分": {
        arti: "Menit / Bagian",
        onyomi: "ブン・フン・プン",
        kunyomi: "わ（かる）・わ（ける）",
        romaji: "BUN / FUN / PUN / wakaru",
        kosakata: [
            "<ruby>五分<rt>ごふん</rt></ruby> — lima menit",
            "<ruby>十分<rt>じゅっぷん</rt></ruby> — sepuluh menit",
            "<ruby>分<rt>わ</rt>かる</ruby> — mengerti"
        ]
    },
    "先": {
        arti: "Dahulu / Sebelumnya",
        onyomi: "セン",
        kunyomi: "さき",
        romaji: "SEN / saki",
        kosakata: [
            "<ruby>先生<rt>せんせい</rt></ruby> — guru",
            "<ruby>先週<rt>せんしゅう</rt></ruby> — minggu lalu",
            "<ruby>先<rt>さき</rt></ruby> — sebelumnya / depan"
        ]
    },
    "今": {
        arti: "Sekarang",
        onyomi: "コン・キン",
        kunyomi: "いま",
        romaji: "KON / KIN / ima",
        kosakata: [
            "<ruby>今<rt>いま</rt></ruby> — sekarang",
            "<ruby>今日<rt>きょう</rt></ruby> — hari ini",
            "<ruby>今月<rt>こんげつ</rt></ruby> — bulan ini"
        ]
    },
    "明": {
        arti: "Terang / Besok",
        onyomi: "メイ・ミョウ",
        kunyomi: "あか（るい）・あ（ける）",
        romaji: "MEI / MYOU / akarui",
        kosakata: [
            "<ruby>明日<rt>あした</rt></ruby> — besok",
            "<ruby>明<rt>あか</rt>るい</ruby> — terang",
            "<ruby>説明<rt>せつめい</rt></ruby> — penjelasan"
        ]
    },
    "毎": {
        arti: "Setiap",
        onyomi: "マイ",
        kunyomi: "—",
        romaji: "MAI",
        kosakata: [
            "<ruby>毎日<rt>まいにち</rt></ruby> — setiap hari",
            "<ruby>毎週<rt>まいしゅう</rt></ruby> — setiap minggu",
            "<ruby>毎月<rt>まいつき</rt></ruby> — setiap bulan"
        ]
    },
    "間": {
        arti: "Antara / Selama",
        onyomi: "カン・ケン",
        kunyomi: "あいだ・ま",
        romaji: "KAN / KEN / aida / ma",
        kosakata: [
            "<ruby>時間<rt>じかん</rt></ruby> — waktu",
            "<ruby>間<rt>あいだ</rt></ruby> — antara",
            "<ruby>一週間<rt>いっしゅうかん</rt></ruby> — satu minggu"
        ]
    },
    "午": {
        arti: "Siang",
        onyomi: "ゴ",
        kunyomi: "—",
        romaji: "GO",
        kosakata: [
            "<ruby>午前<rt>ごぜん</rt></ruby> — sebelum tengah hari",
            "<ruby>午後<rt>ごご</rt></ruby> — setelah tengah hari",
            "<ruby>正午<rt>しょうご</rt></ruby> — tengah hari"
        ]
    },
    "半": {
        arti: "Setengah",
        onyomi: "ハン",
        kunyomi: "なか（ば）",
        romaji: "HAN / nakaba",
        kosakata: [
            "<ruby>半分<rt>はんぶん</rt></ruby> — setengah",
            "<ruby>半年<rt>はんとし</rt></ruby> — setengah tahun",
            "<ruby>三時半<rt>さんじはん</rt></ruby> — pukul setengah empat"
        ]
    },

    "大": {
        arti: "Besar",
        onyomi: "ダイ・タイ",
        kunyomi: "おお（きい）",
        romaji: "DAI / TAI / ookii",
        kosakata: [
            "<ruby>大<rt>おお</rt>きい</ruby> — besar",
            "<ruby>大学<rt>だいがく</rt></ruby> — universitas",
            "<ruby>大人<rt>おとな</rt></ruby> — orang dewasa"
        ]
    },
    "小": {
        arti: "Kecil",
        onyomi: "ショウ",
        kunyomi: "ちい（さい）・こ・お",
        romaji: "SHOU / chiisai / ko / o",
        kosakata: [
            "<ruby>小<rt>ちい</rt>さい</ruby> — kecil",
            "<ruby>小学校<rt>しょうがっこう</rt></ruby> — sekolah dasar",
            "<ruby>小<rt>こ</rt>さい</ruby> — kecil"
        ]
    },
    "多": {
        arti: "Banyak",
        onyomi: "タ",
        kunyomi: "おお（い）",
        romaji: "TA / ooi",
        kosakata: [
            "<ruby>多<rt>おお</rt>い</ruby> — banyak",
            "<ruby>多分<rt>たぶん</rt></ruby> — mungkin",
            "<ruby>多数<rt>たすう</rt></ruby> — jumlah besar"
        ]
    },
    "少": {
        arti: "Sedikit",
        onyomi: "ショウ",
        kunyomi: "すく（ない）・すこ（し）",
        romaji: "SHOU / sukunai / sukoshi",
        kosakata: [
            "<ruby>少<rt>すく</rt>ない</ruby> — sedikit",
            "<ruby>少<rt>すこ</rt>し</ruby> — sedikit",
            "<ruby>少年<rt>しょうねん</rt></ruby> — anak laki-laki"
        ]
    },
    "高": {
        arti: "Tinggi / mahal",
        onyomi: "コウ",
        kunyomi: "たか（い）",
        romaji: "KOU / takai",
        kosakata: [
            "<ruby>高<rt>たか</rt>い</ruby> — tinggi / mahal",
            "<ruby>高校<rt>こうこう</rt></ruby> — SMA",
            "<ruby>高<rt>たか</rt>さ</ruby> — ketinggian"
        ]
    },
    "安": {
        arti: "Murah / aman",
        onyomi: "アン",
        kunyomi: "やす（い）",
        romaji: "AN / yasui",
        kosakata: [
            "<ruby>安<rt>やす</rt>い</ruby> — murah",
            "<ruby>安全<rt>あんぜん</rt></ruby> — aman / keselamatan",
            "<ruby>安心<rt>あんしん</rt></ruby> — tenang"
        ]
    },
    "新": {
        arti: "Baru",
        onyomi: "シン",
        kunyomi: "あたら（しい）・あら（た）",
        romaji: "SHIN / atarashii / arata",
        kosakata: [
            "<ruby>新<rt>あたら</rt>しい</ruby> — baru",
            "<ruby>新聞<rt>しんぶん</rt></ruby> — koran",
            "<ruby>新年<rt>しんねん</rt></ruby> — tahun baru"
        ]
    },
    "古": {
        arti: "Lama / kuno",
        onyomi: "コ",
        kunyomi: "ふる（い）",
        romaji: "KO / furui",
        kosakata: [
            "<ruby>古<rt>ふる</rt>い</ruby> — lama / kuno",
            "<ruby>中古<rt>ちゅうこ</rt></ruby> — bekas",
            "<ruby>古本<rt>ふるほん</rt></ruby> — buku bekas"
        ]
    },
    "長": {
        arti: "Panjang",
        onyomi: "チョウ",
        kunyomi: "なが（い）",
        romaji: "CHOU / nagai",
        kosakata: [
            "<ruby>長<rt>なが</rt>い</ruby> — panjang",
            "<ruby>社長<rt>しゃちょう</rt></ruby> — direktur",
            "<ruby>長男<rt>ちょうなん</rt></ruby> — anak laki-laki tertua"
        ]
    },
    "早": {
        arti: "Cepat / awal",
        onyomi: "ソウ・サッ",
        kunyomi: "はや（い）",
        romaji: "SOU / SATSU / hayai",
        kosakata: [
            "<ruby>早<rt>はや</rt>い</ruby> — cepat / awal",
            "<ruby>早朝<rt>そうちょう</rt></ruby> — pagi-pagi sekali",
            "<ruby>早<rt>はや</rt>く</ruby> — dengan cepat"
        ]
    },
    "白": {
        arti: "Putih",
        onyomi: "ハク・ビャク",
        kunyomi: "しろ・しろ（い）",
        romaji: "HAKU / BYAKU / shiro",
        kosakata: [
            "<ruby>白<rt>しろ</rt></ruby> — putih",
            "<ruby>白<rt>しろ</rt>い</ruby> — berwarna putih",
            "<ruby>白紙<rt>はくし</rt></ruby> — kertas kosong"
        ]
    },
    "黒": {
        arti: "Hitam",
        onyomi: "コク",
        kunyomi: "くろ・くろ（い）",
        romaji: "KOKU / kuro",
        kosakata: [
            "<ruby>黒<rt>くろ</rt></ruby> — hitam",
            "<ruby>黒<rt>くろ</rt>い</ruby> — berwarna hitam",
            "<ruby>黒板<rt>こくばん</rt></ruby> — papan tulis"
        ]
    },
    "赤": {
        arti: "Merah",
        onyomi: "セキ・シャク",
        kunyomi: "あか・あか（い）",
        romaji: "SEKI / SHAKU / aka",
        kosakata: [
            "<ruby>赤<rt>あか</rt></ruby> — merah",
            "<ruby>赤<rt>あか</rt>い</ruby> — berwarna merah",
            "<ruby>赤ちゃん<rt>あかちゃん</rt></ruby> — bayi"
        ]
    },
    "青": {
        arti: "Biru",
        onyomi: "セイ・ショウ",
        kunyomi: "あお・あお（い）",
        romaji: "SEI / SHOU / ao",
        kosakata: [
            "<ruby>青<rt>あお</rt></ruby> — biru",
            "<ruby>青<rt>あお</rt>い</ruby> — berwarna biru",
            "<ruby>青空<rt>あおぞら</rt></ruby> — langit biru"
        ]
    },

    "買": {
        arti: "Membeli",
        onyomi: "バイ",
        kunyomi: "か（う）",
        romaji: "BAI / kau",
        kosakata: [
            "<ruby>買<rt>か</rt>う</ruby> — membeli",
            "<ruby>買<rt>か</rt>い<rt></rt>物<rt>もの</rt></ruby> — belanja",
            "<ruby>買<rt>か</rt>い<rt></rt>ます — membeli (sopan)"
        ]
    },
    "行": {
        arti: "Pergi",
        onyomi: "コウ・ギョウ",
        kunyomi: "い（く）・ゆ（く）",
        romaji: "KOU / GYOU / iku / yuku",
        kosakata: [
            "<ruby>行<rt>い</rt>く</ruby> — pergi",
            "<ruby>行<rt>い</rt>きます</ruby> — pergi (sopan)",
            "<ruby>銀行<rt>ぎんこう</rt></ruby> — bank"
        ]
    },
    "来": {
        arti: "Datang",
        onyomi: "ライ",
        kunyomi: "く（る）・き（ます）",
        romaji: "RAI / kuru / kimasu",
        kosakata: [
            "<ruby>来<rt>く</rt>る</ruby> — datang",
            "<ruby>来<rt>き</rt>ます</ruby> — datang (sopan)",
            "<ruby>来年<rt>らいねん</rt></ruby> — tahun depan"
        ]
    },
    "出": {
        arti: "Keluar",
        onyomi: "シュツ",
        kunyomi: "で（る）・だ（す）",
        romaji: "SHUTSU / deru / dasu",
        kosakata: [
            "<ruby>出<rt>で</rt>る</ruby> — keluar",
            "<ruby>出<rt>だ</rt>す</ruby> — mengeluarkan",
            "<ruby>出口<rt>でぐち</rt></ruby> — pintu keluar"
        ]
    },
    "入": {
        arti: "Masuk",
        onyomi: "ニュウ",
        kunyomi: "はい（る）・い（れる）",
        romaji: "NYUU / hairu / ireru",
        kosakata: [
            "<ruby>入<rt>はい</rt>る</ruby> — masuk",
            "<ruby>入<rt>い</rt>れる</ruby> — memasukkan",
            "<ruby>入口<rt>いりぐち</rt></ruby> — pintu masuk"
        ]
    },
    "立": {
        arti: "Berdiri",
        onyomi: "リツ",
        kunyomi: "た（つ）",
        romaji: "RITSU / tatsu",
        kosakata: [
            "<ruby>立<rt>た</rt>つ</ruby> — berdiri",
            "<ruby>立<rt>た</rt>ちます</ruby> — berdiri (sopan)",
            "<ruby>立入禁止<rt>たちいりきんし</rt></ruby> — dilarang masuk"
        ]
    },
    "休": {
        arti: "Istirahat",
        onyomi: "キュウ",
        kunyomi: "やす（む）",
        romaji: "KYUU / yasumu",
        kosakata: [
            "<ruby>休<rt>やす</rt>む</ruby> — beristirahat",
            "<ruby>休<rt>やす</rt>み</ruby> — libur / istirahat",
            "<ruby>休日<rt>きゅうじつ</rt></ruby> — hari libur"
        ]
    },
    "読": {
        arti: "Membaca",
        onyomi: "ドク",
        kunyomi: "よ（む）",
        romaji: "DOKU / yomu",
        kosakata: [
            "<ruby>読<rt>よ</rt>む</ruby> — membaca",
            "<ruby>読<rt>よ</rt>みます</ruby> — membaca (sopan)",
            "<ruby>読書<rt>どくしょ</rt></ruby> — membaca buku"
        ]
    },
    "書": {
        arti: "Menulis",
        onyomi: "ショ",
        kunyomi: "か（く）",
        romaji: "SHO / kaku",
        kosakata: [
            "<ruby>書<rt>か</rt>く</ruby> — menulis",
            "<ruby>書<rt>か</rt>きます</ruby> — menulis (sopan)",
            "<ruby>辞書<rt>じしょ</rt></ruby> — kamus"
        ]
    },
    "聞": {
        arti: "Mendengar / bertanya",
        onyomi: "ブン・モン",
        kunyomi: "き（く）",
        romaji: "BUN / MON / kiku",
        kosakata: [
            "<ruby>聞<rt>き</rt>く</ruby> — mendengar / bertanya",
            "<ruby>聞<rt>き</rt>きます</ruby> — mendengar (sopan)",
            "<ruby>新聞<rt>しんぶん</rt></ruby> — koran"
        ]
    },
    "話": {
        arti: "Berbicara",
        onyomi: "ワ",
        kunyomi: "はな（す）・はなし",
        romaji: "WA / hanasu / hanashi",
        kosakata: [
            "<ruby>話<rt>はな</rt>す</ruby> — berbicara",
            "<ruby>話<rt>はなし</rt></ruby> — cerita / pembicaraan",
            "<ruby>電話<rt>でんわ</rt></ruby> — telepon"
        ]
    },
    "食": {
        arti: "Makan",
        onyomi: "ショク",
        kunyomi: "た（べる）",
        romaji: "SHOKU / taberu",
        kosakata: [
            "<ruby>食<rt>た</rt>べる</ruby> — makan",
            "<ruby>食<rt>た</rt>べます</ruby> — makan (sopan)",
            "<ruby>食堂<rt>しょくどう</rt></ruby> — kantin"
        ]
    },
    "飲": {
        arti: "Minum",
        onyomi: "イン",
        kunyomi: "の（む）",
        romaji: "IN / nomu",
        kosakata: [
            "<ruby>飲<rt>の</rt>む</ruby> — minum",
            "<ruby>飲<rt>の</rt>みます</ruby> — minum (sopan)",
            "<ruby>飲<rt>の</rt>み物<rt>もの</rt></ruby> — minuman"
        ]
    },
    "見": {
        arti: "Melihat",
        onyomi: "ケン",
        kunyomi: "み（る）・み（せる）",
        romaji: "KEN / miru / miseru",
        kosakata: [
            "<ruby>見<rt>み</rt>る</ruby> — melihat",
            "<ruby>見<rt>み</rt>せる</ruby> — memperlihatkan",
            "<ruby>見学<rt>けんがく</rt></ruby> — kunjungan belajar"
        ]
    },
    "会": {
        arti: "Bertemu",
        onyomi: "カイ・エ",
        kunyomi: "あ（う）",
        romaji: "KAI / E / au",
        kosakata: [
            "<ruby>会<rt>あ</rt>う</ruby> — bertemu",
            "<ruby>会<rt>あ</rt>います</ruby> — bertemu (sopan)",
            "<ruby>会社<rt>かいしゃ</rt></ruby> — perusahaan"
        ]
    },
    "言": {
        arti: "Mengatakan",
        onyomi: "ゲン・ゴン",
        kunyomi: "い（う）・こと",
        romaji: "GEN / GON / iu / koto",
        kosakata: [
            "<ruby>言<rt>い</rt>う</ruby> — mengatakan",
            "<ruby>言葉<rt>ことば</rt></ruby> — kata / bahasa",
            "<ruby>言語<rt>げんご</rt></ruby> — bahasa"
        ]
    }
};


/* =========================================
   7. MENAMPILKAN GRID KANJI
========================================= */

function tampilkanKanji(level) {
    const tempat = document.getElementById("materi-kanji");
    const judul = document.querySelector(".kanji-list-heading h3");
    const total = document.querySelector(".kanji-total");
    const pencarian = document.querySelector(".kanji-search");
    const bagianDaftar = document.querySelector(".kanji-list-heading");
    const detail = document.getElementById("detail-kanji");

    if (!tempat) return;

    // Tampilkan pencarian dan daftar setelah level dipilih.
    if (pencarian) pencarian.hidden = false;
    if (bagianDaftar) bagianDaftar.hidden = false;

    tempat.hidden = false;

    if (detail) detail.hidden = true;

    // Tandai tombol level yang dipilih.
    document.querySelectorAll(".kanji-level-buttons button").forEach(
        function(btn) {
            btn.classList.toggle(
                "active",
                btn.textContent.trim() === level
            );
        }
    );

    if (judul) {
        judul.textContent = "Daftar Kanji " + level;
    }

    // N4 dan N3 belum tersedia.
    if (level !== "N5") {
        if (total) total.textContent = "Segera hadir";

        tempat.innerHTML = `
            <div class="kanji-empty">
                <h3>🌸 Kanji ${level}</h3>
                <p>Materi level ini akan ditambahkan nanti.</p>
            </div>
        `;

        return;
    }

    // Ambil seluruh data Kanji N5.
    const semuaKanji = daftarKelompokKanji.flatMap(
        kelompok => kelompok.kanji
    );

    if (total) {
        total.textContent = semuaKanji.length + " Kanji";
    }

    // Tampilkan kelompok Kanji.
    tempat.innerHTML = daftarKelompokKanji.map(function(kelompok) {
        return `
            <div class="kanji-group">
                <h3 class="kanji-group-title">${kelompok.nama}</h3>

                <div class="kanji-grid">
                    ${kelompok.kanji.map(function(kanji) {
                        return `
                            <button
                                class="kanji-item"
                                type="button"
                                onclick="pilihKanji('${kanji}')"
                                aria-label="Lihat detail Kanji ${kanji}">
                                ${kanji}
                            </button>
                        `;
                    }).join("")}
                </div>
            </div>
        `;
    }).join("");

    // Terapkan kembali pencarian.
    if (kolomCariKanji && kolomCariKanji.value.trim()) {
        saringKanji(kolomCariKanji.value);
    }
}

/* =========================================
   8. MEMBUKA DETAIL KANJI
========================================= */



function pilihKanji(kanji) {posisiScrollKanji = window.scrollY;
    const detail = document.getElementById("detail-kanji");
    const grid = document.getElementById("materi-kanji");

    if (!detail || !grid) return;

    const data = dataKanji[kanji] || {};

    // Sembunyikan daftar Kanji
    grid.hidden = true;

    // Tampilkan halaman detail
    detail.hidden = false;

    document.getElementById("detail-karakter").textContent = kanji;
    document.getElementById("detail-judul").textContent = "Kanji " + kanji;
    document.getElementById("detail-level").textContent = "JLPT N5";

    document.getElementById("detail-arti").textContent =
        data.arti || "Materi arti sedang dilengkapi.";

    document.getElementById("detail-onyomi").textContent =
        data.onyomi || "Akan dilengkapi";

    document.getElementById("detail-kunyomi").textContent =
        data.kunyomi || "Akan dilengkapi";

    document.getElementById("detail-romaji").textContent =
        data.romaji || "Akan dilengkapi";

    document.getElementById("detail-kosakata").innerHTML =
        data.kosakata
            ? data.kosakata.map(kata => `<p>${kata}</p>`).join("")
            : "<p>Kosakata sedang disiapkan.</p>";

    const kalimat = document.getElementById("detail-kalimat");

    if (kalimat) {
        kalimat.innerHTML = "";
        kalimat.style.display = "none";
    }

    buatAnimasiKanji(kanji);

    // Langsung menuju posisi halaman detail
    window.scrollTo({
        top: detail.getBoundingClientRect().top + window.scrollY - 90,
        behavior: "smooth"
    });
}


    
     


/* =========================================
   9. KEMBALI KE GRID
========================================= */


function tutupDetailKanji() {
    const detail = document.getElementById("detail-kanji");
    const grid = document.getElementById("materi-kanji");

    if (detail) detail.hidden = true;
    if (grid) grid.hidden = false;

    window.scrollTo({
        top: posisiScrollKanji,
        behavior: "instant"
    });
}



/* =========================================
   10. PENCARIAN KANJI
========================================= */

const kolomCariKanji = document.getElementById("cari-kanji");

function saringKanji(teks) {
    const kataCari = teks.trim().toLowerCase();

    document.querySelectorAll(".kanji-item").forEach(function(item) {
        const karakter = item.textContent.trim();
        const data = dataKanji[karakter] || {};

        const isiPencarian = [
            karakter,
            data.arti || "",
            data.romaji || "",
            data.onyomi || "",
            data.kunyomi || ""
        ].join(" ").toLowerCase();

        item.hidden = !isiPencarian.includes(kataCari);
    });

    document.querySelectorAll(".kanji-group").forEach(function(group) {
        const item = group.querySelectorAll(".kanji-item");
        const adaHasil = Array.from(item).some(
            elemen => !elemen.hidden
        );

        group.hidden = !adaHasil;
    });
}

if (kolomCariKanji) {
    kolomCariKanji.addEventListener("input", function() {
        saringKanji(this.value);
    });
}


/* =========================================
   11. MATERI JLPT
========================================= */

function tampilkanJLPT(level) {
    const tempat = document.getElementById("materi-jlpt");
    if (!tempat) return;

    const daftarLevel = ["N5", "N4", "N3"];
    if (!daftarLevel.includes(level)) return;

    tempat.innerHTML = `
        <div class="kanji-card">
            <h3>🌸 Materi JLPT ${level}</h3>
            <p>Kamu memilih level ${level}.</p>
            <p>Materi latihan ${level} akan kita tambahkan secara bertahap.</p>
        </div>
    `;
}


/* =========================================
   12. TUTUP PROFIL DENGAN ESCAPE
========================================= */

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") tutupProfil();
});


/* =========================================
   13. ANIMASI URUTAN GORESAN KANJI
========================================= */


async function buatAnimasiKanji(kanji) {
    const tempat = document.getElementById("detail-animasi");
    if (!tempat) return;

    tempat.innerHTML = "<p>Memuat animasi Kanji...</p>";

    try {
        const kode = kanji.codePointAt(0)
            .toString(16)
            .padStart(5, "0");

        const url =
            `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${kode}.svg`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Data Kanji tidak ditemukan");
        }

        const svgText = await response.text();
        const parser = new DOMParser();
        const dokumen = parser.parseFromString(
            svgText,
            "image/svg+xml"
        );

        const paths = Array.from(
            dokumen.querySelectorAll(
                'g[id*="StrokePaths"] path'
            )
        );

        if (paths.length === 0) {
            throw new Error("Goresan tidak ditemukan");
        }

        tempat.innerHTML = `
            <div class="stroke-animation-fuji">
                <svg viewBox="0 0 109 109"
                    class="kanji-stroke-svg">
                    ${paths.map(path => `
                        <path
                            d="${path.getAttribute("d")}"
                            class="fuji-stroke"
                        />
                    `).join("")}
                </svg>

                <p class="fuji-stroke-status">
                    Siap belajar menulis Kanji ${kanji}
                </p>

                <button type="button"
                    onclick="jalankanStrokeKanji('${kanji}')">
                    ✍️ Mulai Menulis
                </button>
            </div>
        `;

    } catch (error) {
        tempat.innerHTML = `
            <p>Animasi belum bisa dimuat.</p>
            <p>Periksa koneksi internet kamu.</p>
        `;

        console.error("Animasi Kanji:", error);
    }
}


/* =========================================
   15. SAAT WEBSITE SELESAI DIMUAT
========================================= */



async function jalankanStrokeKanji(kanji) {
    const area = document.querySelector(".stroke-animation-fuji");

    if (!area || area.dataset.running === "true") return;

    const paths = area.querySelectorAll(".fuji-stroke");
    const status = area.querySelector(".fuji-stroke-status");
    const tombol = area.querySelector("button");

    if (!paths.length) return;

    area.dataset.running = "true";
    tombol.disabled = true;

    paths.forEach(path => {
        const panjang = path.getTotalLength();

        path.style.transition = "none";
        path.style.strokeDasharray = panjang;
        path.style.strokeDashoffset = panjang;
    });

    area.getBoundingClientRect();

    for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        status.textContent =
            `Goresan ${i + 1} dari ${paths.length}`;

        path.style.transition = "stroke-dashoffset 0.8s ease";
        path.style.strokeDashoffset = "0";

        await new Promise(resolve => setTimeout(resolve, 900));
    }

    status.textContent = "Selesai! お疲れ様でした 🌸";

    tombol.disabled = false;
    area.dataset.running = "false";
}

// ===================================
// PEMBARUAN KOSAKATA DARI PDF N5
// BAGIAN 1: KATA KERJA (KANJI 1-16)
// ===================================

function perbaruiKosakataDariPDF(daftar) {
    Object.entries(daftar).forEach(([kanji, kosakata]) => {
        if (dataKanji[kanji]) {
            dataKanji[kanji].kosakata = kosakata;
        }
    });
}

perbaruiKosakataDariPDF({

    "買": [
        "<ruby>買<rt>か</rt></ruby>う — membeli",
        "<ruby>買<rt>か</rt></ruby>い<ruby>物<rt>もの</rt></ruby> — belanja"
    ],

    "行": [
        "<ruby>行<rt>い</rt></ruby>く — pergi",
        "<ruby>旅<rt>りょ</rt></ruby><ruby>行<rt>こう</rt></ruby> — traveling",
        "<ruby>銀<rt>ぎん</rt></ruby><ruby>行<rt>こう</rt></ruby> — bank",
        "<ruby>行<rt>おこな</rt></ruby>う — melaksanakan"
    ],

    "来": [
        "<ruby>来<rt>く</rt></ruby>る — datang",
        "<ruby>来<rt>らい</rt></ruby><ruby>月<rt>げつ</rt></ruby> — bulan depan",
        "<ruby>来<rt>らい</rt></ruby><ruby>週<rt>しゅう</rt></ruby> — minggu depan",
        "<ruby>来<rt>こ</rt></ruby>ない — tidak datang",
        "<ruby>来<rt>き</rt></ruby>た — datang"
    ],

    "出": [
        "<ruby>出<rt>で</rt></ruby>る — keluar",
        "<ruby>出<rt>だ</rt></ruby>す — mengeluarkan",
        "<ruby>出<rt>で</rt></ruby>かける — keluar bepergian",
        "<ruby>出<rt>しゅっ</rt></ruby><ruby>発<rt>ぱつ</rt></ruby>する — berangkat",
        "<ruby>出<rt>しゅっ</rt></ruby><ruby>席<rt>せき</rt></ruby>する — hadir"
    ],

    "入": [
        "<ruby>入<rt>はい</rt></ruby>る — masuk",
        "<ruby>入<rt>い</rt></ruby>れる — memasukkan",
        "<ruby>気<rt>き</rt></ruby>に<ruby>入<rt>い</rt></ruby>る — menyukai",
        "<ruby>入<rt>にゅう</rt></ruby><ruby>院<rt>いん</rt></ruby>する — masuk rumah sakit",
        "<ruby>入<rt>にゅう</rt></ruby><ruby>国<rt>こく</rt></ruby> — masuk ke negara"
    ],

    "立": [
        "<ruby>立<rt>た</rt></ruby>つ — berdiri",
        "<ruby>私<rt>し</rt></ruby><ruby>立<rt>りつ</rt></ruby> — swasta",
        "<ruby>公<rt>こう</rt></ruby><ruby>立<rt>りつ</rt></ruby> — negeri"
    ],

    "休": [
        "<ruby>休<rt>やす</rt></ruby>む — beristirahat",
        "<ruby>休<rt>やす</rt></ruby>み — libur, istirahat",
        "<ruby>昼<rt>ひる</rt></ruby><ruby>休<rt>やす</rt></ruby>み — istirahat siang",
        "<ruby>休<rt>きゅう</rt></ruby><ruby>日<rt>じつ</rt></ruby> — hari libur",
        "<ruby>連<rt>れん</rt></ruby><ruby>休<rt>きゅう</rt></ruby> — hari libur berurutan"
    ],

    "読": [
        "<ruby>読<rt>よ</rt></ruby>む — membaca",
        "<ruby>読<rt>どく</rt></ruby><ruby>書<rt>しょ</rt></ruby> — membaca buku"
    ],

    "書": [
        "<ruby>書<rt>か</rt></ruby>く — menulis",
        "<ruby>辞<rt>じ</rt></ruby><ruby>書<rt>しょ</rt></ruby> — kamus",
        "<ruby>書<rt>しょ</rt></ruby><ruby>道<rt>どう</rt></ruby> — seni kaligrafi Jepang",
        "<ruby>図<rt>と</rt></ruby><ruby>書<rt>しょ</rt></ruby><ruby>館<rt>かん</rt></ruby> — perpustakaan"
    ],

    "聞": [
        "<ruby>聞<rt>き</rt></ruby>く — mendengar, bertanya",
        "<ruby>聞<rt>き</rt></ruby>こえる — terdengar",
        "<ruby>新<rt>しん</rt></ruby><ruby>聞<rt>ぶん</rt></ruby> — koran"
    ],

    "話": [
        "<ruby>話<rt>はな</rt></ruby>す — bicara",
        "<ruby>話<rt>はなし</rt></ruby> — cerita",
        "<ruby>電<rt>でん</rt></ruby><ruby>話<rt>わ</rt></ruby> — telepon",
        "<ruby>会<rt>かい</rt></ruby><ruby>話<rt>わ</rt></ruby> — percakapan"
    ],

    "食": [
        "<ruby>食<rt>た</rt></ruby>べる — makan",
        "<ruby>食<rt>しょく</rt></ruby><ruby>事<rt>じ</rt></ruby> — makan",
        "<ruby>食<rt>た</rt></ruby>べ<ruby>物<rt>もの</rt></ruby> — makanan",
        "<ruby>食<rt>しょく</rt></ruby><ruby>堂<rt>どう</rt></ruby> — kantin",
        "<ruby>外<rt>がい</rt></ruby><ruby>食<rt>しょく</rt></ruby> — makan di luar"
    ],

    "飲": [
        "<ruby>飲<rt>の</rt></ruby>む — minum",
        "<ruby>飲<rt>の</rt></ruby>み<ruby>物<rt>もの</rt></ruby> — minuman",
        "<ruby>飲<rt>いん</rt></ruby><ruby>食<rt>しょく</rt></ruby> — makan dan minum"
    ],

    "見": [
        "<ruby>見<rt>み</rt></ruby>る — melihat",
        "<ruby>見<rt>み</rt></ruby>せる — memperlihatkan",
        "<ruby>見<rt>み</rt></ruby>える — terlihat",
        "<ruby>見<rt>けん</rt></ruby><ruby>学<rt>がく</rt></ruby> — observasi",
        "<ruby>見<rt>けん</rt></ruby><ruby>物<rt>ぶつ</rt></ruby> — melihat-lihat, berwisata"
    ],

    "会": [
        "<ruby>会<rt>あ</rt></ruby>う — bertemu",
        "<ruby>会<rt>かい</rt></ruby><ruby>話<rt>わ</rt></ruby> — percakapan",
        "<ruby>会<rt>かい</rt></ruby><ruby>社<rt>しゃ</rt></ruby> — perusahaan",
        "<ruby>会<rt>かい</rt></ruby><ruby>議<rt>ぎ</rt></ruby><ruby>室<rt>しつ</rt></ruby> — ruang meeting"
    ],

    "言": [
        "<ruby>言<rt>い</rt></ruby>う — mengatakan",
        "<ruby>言<rt>こと</rt></ruby><ruby>葉<rt>ば</rt></ruby> — kosakata, bahasa",
        "<ruby>言<rt>げん</rt></ruby><ruby>語<rt>ご</rt></ruby> — bahasa",
        "<ruby>伝<rt>でん</rt></ruby><ruby>言<rt>ごん</rt></ruby> — pesan, titip pesan",
        "<ruby>助<rt>じょ</rt></ruby><ruby>言<rt>げん</rt></ruby> — nasehat"
    ]

});

/* =========================================
   PEMBARUAN KOSAKATA DARI PDF N5
   BAGIAN 2: KATA SIFAT & WARNA (17-30)
========================================= */

perbaruiKosakataDariPDF({

    "大": [
        "<ruby>大<rt>おお</rt></ruby>きい — besar",
        "<ruby>大<rt>だい</rt></ruby><ruby>学<rt>がく</rt></ruby> — universitas",
        "<ruby>大<rt>たい</rt></ruby><ruby>変<rt>へん</rt></ruby> — berat, sulit",
        "<ruby>大<rt>たい</rt></ruby><ruby>切<rt>せつ</rt></ruby> — penting",
        "<ruby>大<rt>だい</rt></ruby><ruby>好<rt>す</rt></ruby>き — sangat suka"
    ],

    "小": [
        "<ruby>小<rt>ちい</rt></ruby>さい — kecil",
        "<ruby>小<rt>しょう</rt></ruby><ruby>学<rt>がっ</rt></ruby><ruby>校<rt>こう</rt></ruby> — sekolah dasar",
        "<ruby>小<rt>しょう</rt></ruby><ruby>説<rt>せつ</rt></ruby> — novel",
        "<ruby>小<rt>こ</rt></ruby><ruby>鳥<rt>とり</rt></ruby> — burung kecil"
    ],

    "高": [
        "<ruby>高<rt>たか</rt></ruby>い — tinggi, mahal",
        "<ruby>高<rt>こう</rt></ruby><ruby>校<rt>こう</rt></ruby> — SMA",
        "<ruby>高<rt>こう</rt></ruby><ruby>校<rt>こう</rt></ruby><ruby>生<rt>せい</rt></ruby> — siswa SMA"
    ],

    "安": [
        "<ruby>安<rt>やす</rt></ruby>い — murah",
        "<ruby>安<rt>あん</rt></ruby><ruby>全<rt>ぜん</rt></ruby> — aman",
        "<ruby>安<rt>あん</rt></ruby><ruby>心<rt>しん</rt></ruby>する — tenang, lega",
        "<ruby>安<rt>あん</rt></ruby><ruby>定<rt>てい</rt></ruby> — stabil"
    ],

    "新": [
        "<ruby>新<rt>あたら</rt></ruby>しい — baru",
        "<ruby>新<rt>しん</rt></ruby><ruby>聞<rt>ぶん</rt></ruby> — koran",
        "<ruby>新<rt>しん</rt></ruby><ruby>年<rt>ねん</rt></ruby> — tahun baru",
        "<ruby>新<rt>しん</rt></ruby><ruby>人<rt>じん</rt></ruby> — orang baru"
    ],

    "古": [
        "<ruby>古<rt>ふる</rt></ruby>い — lama, tua"
    ],

    "多": [
        "<ruby>多<rt>おお</rt></ruby>い — banyak",
        "<ruby>多<rt>た</rt></ruby><ruby>数<rt>すう</rt></ruby> — jumlah banyak",
        "<ruby>多<rt>た</rt></ruby><ruby>数<rt>すう</rt></ruby><ruby>決<rt>けつ</rt></ruby> — voting"
    ],

    "少": [
        "<ruby>少<rt>すこ</rt></ruby>し — sedikit",
        "<ruby>少<rt>すく</rt></ruby>ない — sedikit",
        "<ruby>多<rt>た</rt></ruby><ruby>少<rt>しょう</rt></ruby> — sedikit, agak",
        "<ruby>少<rt>しょう</rt></ruby><ruby>女<rt>じょ</rt></ruby> — anak remaja perempuan",
        "<ruby>少<rt>しょう</rt></ruby><ruby>年<rt>ねん</rt></ruby> — anak remaja laki-laki"
    ],

    "長": [
        "<ruby>長<rt>なが</rt></ruby>い — panjang",
        "<ruby>社<rt>しゃ</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — direktur",
        "<ruby>部<rt>ぶ</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — general manager, kepala divisi",
        "<ruby>課<rt>か</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — manager, kepala bagian"
    ],

    "早": [
        "<ruby>早<rt>はや</rt></ruby>い — cepat",
        "<ruby>早<rt>はや</rt></ruby><ruby>寝<rt>ね</rt></ruby><ruby>早<rt>はや</rt></ruby><ruby>起<rt>お</rt></ruby>き — tidur cepat, bangun cepat",
        "<ruby>早<rt>はや</rt></ruby>める — mempercepat",
        "<ruby>早<rt>はや</rt></ruby>まる — menjadi cepat",
        "<ruby>早<rt>そう</rt></ruby><ruby>朝<rt>ちょう</rt></ruby> — pagi-pagi"
    ],

    "白": [
        "<ruby>白<rt>しろ</rt></ruby>い — putih",
        "<ruby>告<rt>こく</rt></ruby><ruby>白<rt>はく</rt></ruby>する — menyatakan cinta"
    ],

    "黒": [
        "<ruby>黒<rt>くろ</rt></ruby>い — hitam",
        "<ruby>黒<rt>こく</rt></ruby><ruby>板<rt>ばん</rt></ruby> — papan tulis"
    ],

    "赤": [
        "<ruby>赤<rt>あか</rt></ruby>い — merah",
        "<ruby>赤<rt>あか</rt></ruby>ちゃん — bayi",
        "<ruby>赤<rt>せき</rt></ruby><ruby>道<rt>どう</rt></ruby> — khatulistiwa",
        "<ruby>赤<rt>せき</rt></ruby><ruby>飯<rt>はん</rt></ruby> — nasi merah"
    ],

    "青": [
        "<ruby>青<rt>あお</rt></ruby>い — biru",
        "<ruby>青<rt>あお</rt></ruby><ruby>森<rt>もり</rt></ruby> — Aomori",
        "<ruby>青<rt>せい</rt></ruby><ruby>年<rt>ねん</rt></ruby> — remaja",
        "<ruby>青<rt>せい</rt></ruby><ruby>春<rt>しゅん</rt></ruby> — masa remaja"
    ]

});

/* =========================================
   PEMBARUAN KOSAKATA DARI PDF N5
   BAGIAN 3: HARI DAN WAKTU (31-48)
========================================= */

perbaruiKosakataDariPDF({

    "日": [
        "<ruby>日<rt>にち</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Minggu",
        "<ruby>子<rt>こ</rt></ruby>どもの<ruby>日<rt>ひ</rt></ruby> — hari anak",
        "<ruby>二<rt>ふつ</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal dua",
        "<ruby>先<rt>せん</rt></ruby><ruby>日<rt>じつ</rt></ruby> — beberapa hari lalu",
        "<ruby>本<rt>ほん</rt></ruby><ruby>日<rt>じつ</rt></ruby> — hari ini"
    ],

    "月": [
        "<ruby>月<rt>げつ</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Senin",
        "<ruby>今<rt>こん</rt></ruby><ruby>月<rt>げつ</rt></ruby> — bulan ini",
        "<ruby>五<rt>ご</rt></ruby><ruby>月<rt>がつ</rt></ruby> — bulan Mei"
    ],

    "火": [
        "<ruby>火<rt>か</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Selasa",
        "<ruby>火<rt>ひ</rt></ruby>を<ruby>消<rt>け</rt></ruby>す — memadamkan api",
        "<ruby>花<rt>はな</rt></ruby><ruby>火<rt>び</rt></ruby> — kembang api",
        "<ruby>火<rt>ひ</rt></ruby><ruby>花<rt>ばな</rt></ruby> — percikan api",
        "<ruby>火<rt>か</rt></ruby><ruby>事<rt>じ</rt></ruby> — kebakaran"
    ],

    "水": [
        "<ruby>水<rt>すい</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Rabu",
        "<ruby>冷<rt>つめ</rt></ruby>たい<ruby>水<rt>みず</rt></ruby> — air dingin",
        "<ruby>水<rt>すい</rt></ruby><ruby>族<rt>ぞく</rt></ruby><ruby>館<rt>かん</rt></ruby> — akuarium"
    ],

    "木": [
        "<ruby>木<rt>もく</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Kamis",
        "<ruby>桜<rt>さくら</rt></ruby>の<ruby>木<rt>き</rt></ruby> — pohon sakura"
    ],

    "金": [
        "<ruby>金<rt>きん</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Jumat",
        "お<ruby>金<rt>かね</rt></ruby> — uang",
        "<ruby>金<rt>きん</rt></ruby>を<ruby>買<rt>か</rt></ruby>う — membeli emas",
        "<ruby>現<rt>げん</rt></ruby><ruby>金<rt>きん</rt></ruby> — uang tunai",
        "<ruby>貯<rt>ちょ</rt></ruby><ruby>金<rt>きん</rt></ruby>する — menabung"
    ],

    "土": [
        "<ruby>土<rt>ど</rt></ruby>よう<ruby>日<rt>び</rt></ruby> — hari Sabtu",
        "<ruby>土<rt>と</rt></ruby><ruby>地<rt>ち</rt></ruby> — tanah, lahan",
        "<ruby>土<rt>つち</rt></ruby>を<ruby>掘<rt>ほ</rt></ruby>る — menggali tanah"
    ],

    "年": [
        "<ruby>今<rt>こと</rt></ruby><ruby>年<rt>し</rt></ruby> — tahun ini",
        "<ruby>来<rt>らい</rt></ruby><ruby>年<rt>ねん</rt></ruby> — tahun depan",
        "<ruby>去<rt>きょ</rt></ruby><ruby>年<rt>ねん</rt></ruby> — tahun lalu",
        "<ruby>一<rt>いち</rt></ruby><ruby>年<rt>ねん</rt></ruby><ruby>間<rt>かん</rt></ruby> — selama satu tahun",
        "<ruby>年<rt>ねん</rt></ruby><ruby>末<rt>まつ</rt></ruby> — akhir tahun"
    ],

    "週": [
        "<ruby>今<rt>こん</rt></ruby><ruby>週<rt>しゅう</rt></ruby> — minggu ini",
        "<ruby>先<rt>せん</rt></ruby><ruby>週<rt>しゅう</rt></ruby> — minggu lalu",
        "<ruby>来<rt>らい</rt></ruby><ruby>週<rt>しゅう</rt></ruby> — minggu depan",
        "<ruby>週<rt>しゅう</rt></ruby><ruby>末<rt>まつ</rt></ruby> — akhir pekan"
    ],

    "時": [
        "<ruby>時<rt>じ</rt></ruby><ruby>間<rt>かん</rt></ruby> — waktu",
        "<ruby>九<rt>く</rt></ruby><ruby>時<rt>じ</rt></ruby> — jam sembilan",
        "<ruby>四<rt>よ</rt></ruby><ruby>時<rt>じ</rt></ruby><ruby>間<rt>かん</rt></ruby> — empat jam",
        "<ruby>時<rt>と</rt></ruby><ruby>計<rt>けい</rt></ruby> — jam",
        "<ruby>その時<rt>そのとき</rt></ruby> — pada saat itu"
    ],

    "分": [
        "<ruby>五<rt>ご</rt></ruby><ruby>分<rt>ふん</rt></ruby> — lima menit",
        "<ruby>三<rt>さん</rt></ruby><ruby>十<rt>じゅっ</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — 30 menit",
        "<ruby>半<rt>はん</rt></ruby><ruby>分<rt>ぶん</rt></ruby> — setengah",
        "<ruby>分<rt>わ</rt></ruby>かる — mengerti",
        "<ruby>分<rt>わ</rt></ruby>かれる — terbagi, terpisah"
    ],

    "先": [
        "<ruby>先<rt>せん</rt></ruby><ruby>生<rt>せい</rt></ruby> — guru",
        "<ruby>先<rt>せん</rt></ruby><ruby>月<rt>げつ</rt></ruby> — bulan lalu",
        "お<ruby>先<rt>さき</rt></ruby>に — duluan"
    ],

    "今": [
        "<ruby>今<rt>いま</rt></ruby>まで — sampai saat ini",
        "<ruby>今<rt>こん</rt></ruby><ruby>月<rt>げつ</rt></ruby> — bulan ini",
        "<ruby>今<rt>きょう</rt></ruby><ruby>日<rt></rt></ruby> — hari ini",
        "<ruby>今<rt>け</rt></ruby><ruby>朝<rt>さ</rt></ruby> — tadi pagi",
        "<ruby>今<rt>こと</rt></ruby><ruby>年<rt>し</rt></ruby> — tahun ini"
    ],

    "明": [
        "<ruby>明<rt>あか</rt></ruby>るい — terang",
        "<ruby>明<rt>あした</rt></ruby><ruby>日<rt></rt></ruby> — besok",
        "<ruby>説<rt>せつ</rt></ruby><ruby>明<rt>めい</rt></ruby>する — menjelaskan"
    ],

    "毎": [
        "<ruby>毎<rt>まい</rt></ruby><ruby>日<rt>にち</rt></ruby> — setiap hari",
        "<ruby>毎<rt>まい</rt></ruby><ruby>月<rt>つき</rt></ruby> — setiap bulan",
        "<ruby>毎<rt>まい</rt></ruby><ruby>年<rt>とし</rt></ruby> — setiap tahun",
        "<ruby>毎<rt>まい</rt></ruby><ruby>朝<rt>あさ</rt></ruby> — setiap pagi",
        "<ruby>毎<rt>まい</rt></ruby><ruby>回<rt>かい</rt></ruby> — setiap kali"
    ],

    "間": [
        "<ruby>九<rt>く</rt></ruby><ruby>時<rt>じ</rt></ruby><ruby>間<rt>かん</rt></ruby> — sembilan jam",
        "<ruby>一<rt>いっ</rt></ruby><ruby>週<rt>しゅう</rt></ruby><ruby>間<rt>かん</rt></ruby> — satu minggu",
        "<ruby>間<rt>ま</rt></ruby>に<ruby>合<rt>あ</rt></ruby>う — keburu",
        "この<ruby>間<rt>あいだ</rt></ruby> — beberapa waktu lalu",
        "<ruby>男<rt>おとこ</rt></ruby>と<ruby>女<rt>おんな</rt></ruby>の<ruby>間<rt>あいだ</rt></ruby>に — di antara laki-laki dan perempuan"
    ],

    "午": [
        "<ruby>午<rt>ご</rt></ruby><ruby>後<rt>ご</rt></ruby> — p.m.",
        "<ruby>午<rt>ご</rt></ruby><ruby>前<rt>ぜん</rt></ruby> — a.m."
    ],

    "半": [
        "<ruby>七<rt>しち</rt></ruby><ruby>時<rt>じ</rt></ruby><ruby>半<rt>はん</rt></ruby> — jam 07.30",
        "<ruby>一<rt>いち</rt></ruby><ruby>時<rt>じ</rt></ruby><ruby>間<rt>かん</rt></ruby><ruby>半<rt>はん</rt></ruby> — 1,5 jam",
        "<ruby>半<rt>はん</rt></ruby><ruby>分<rt>ぶん</rt></ruby> — setengah",
        "<ruby>半<rt>はん</rt></ruby><ruby>日<rt>にち</rt></ruby> — setengah hari",
        "<ruby>半<rt>はん</rt></ruby><ruby>年<rt>とし</rt></ruby> — setengah tahun"
    ]

});


/* =========================================
   BAGIAN 4: ARAH DAN POSISI (49-60)
========================================= */

perbaruiKosakataDariPDF({

    "上": [
        "<ruby>手<rt>て</rt></ruby>の<ruby>上<rt>うえ</rt></ruby> — di atas tangan",
        "<ruby>以<rt>い</rt></ruby><ruby>上<rt>じょう</rt></ruby> — lebih dari",
        "<ruby>上<rt>うわ</rt></ruby><ruby>着<rt>ぎ</rt></ruby> — luaran, jaket",
        "<ruby>上<rt>あ</rt></ruby>げる — menaikkan",
        "<ruby>上<rt>あ</rt></ruby>がる・<ruby>上<rt>のぼ</rt></ruby>る — naik"
    ],

    "下": [
        "<ruby>下<rt>した</rt></ruby>の<ruby>階<rt>かい</rt></ruby> — lantai bawah",
        "<ruby>以<rt>い</rt></ruby><ruby>下<rt>か</rt></ruby>・<ruby>下<rt>した</rt></ruby><ruby>着<rt>ぎ</rt></ruby> — kurang dari, dalaman",
        "<ruby>上<rt>じょう</rt></ruby><ruby>下<rt>げ</rt></ruby> — atas-bawah",
        "<ruby>下<rt>さ</rt></ruby>げる — menurunkan",
        "<ruby>下<rt>さ</rt></ruby>がる・<ruby>下<rt>お</rt></ruby>りる — turun"
    ],

    "中": [
        "<ruby>家<rt>いえ</rt></ruby>の<ruby>中<rt>なか</rt></ruby> — di dalam rumah",
        "<ruby>中<rt>ちゅう</rt></ruby><ruby>学<rt>がっ</rt></ruby><ruby>校<rt>こう</rt></ruby> — SMP",
        "<ruby>一<rt>いち</rt></ruby><ruby>日<rt>にち</rt></ruby><ruby>中<rt>じゅう</rt></ruby> — seharian",
        "<ruby>食<rt>しょく</rt></ruby><ruby>事<rt>じ</rt></ruby><ruby>中<rt>ちゅう</rt></ruby> — sedang makan",
        "<ruby>中<rt>ちゅう</rt></ruby><ruby>止<rt>し</rt></ruby> — batal"
    ],

    "外": [
        "<ruby>窓<rt>まど</rt></ruby>の<ruby>外<rt>そと</rt></ruby> — di luar jendela",
        "<ruby>外<rt>がい</rt></ruby><ruby>国<rt>こく</rt></ruby> — luar negeri, asing",
        "<ruby>外<rt>がい</rt></ruby><ruby>国<rt>こく</rt></ruby><ruby>人<rt>じん</rt></ruby> — orang asing",
        "<ruby>海<rt>かい</rt></ruby><ruby>外<rt>がい</rt></ruby> — luar negeri",
        "<ruby>外<rt>はず</rt></ruby>す — melepaskan"
    ],

    "左": [
        "<ruby>左<rt>ひだり</rt></ruby><ruby>手<rt>て</rt></ruby> — tangan kiri",
        "<ruby>左<rt>ひだり</rt></ruby><ruby>側<rt>がわ</rt></ruby> — sebelah kiri",
        "<ruby>左<rt>さ</rt></ruby><ruby>折<rt>せつ</rt></ruby> — belok kiri"
    ],

    "右": [
        "<ruby>右<rt>みぎ</rt></ruby><ruby>足<rt>あし</rt></ruby> — kaki kanan",
        "<ruby>右<rt>みぎ</rt></ruby><ruby>下<rt>した</rt></ruby> — kanan bawah",
        "<ruby>左<rt>さ</rt></ruby><ruby>右<rt>ゆう</rt></ruby> — kanan-kiri",
        "<ruby>右<rt>う</rt></ruby><ruby>折<rt>せつ</rt></ruby> — belok kanan"
    ],

    "前": [
        "<ruby>前<rt>まえ</rt></ruby>の<ruby>日<rt>ひ</rt></ruby> — hari sebelumnya",
        "<ruby>名<rt>な</rt></ruby><ruby>前<rt>まえ</rt></ruby> — nama",
        "<ruby>午<rt>ご</rt></ruby><ruby>前<rt>ぜん</rt></ruby> — a.m.",
        "<ruby>前<rt>ぜん</rt></ruby><ruby>後<rt>ご</rt></ruby> — depan-belakang"
    ],

    "後": [
        "<ruby>後<rt>うし</rt></ruby>ろの<ruby>方<rt>かた</rt></ruby> — orang yang di belakang",
        "<ruby>後<rt>あと</rt></ruby>で — nanti",
        "<ruby>午<rt>ご</rt></ruby><ruby>後<rt>ご</rt></ruby> — p.m."
    ],

    "東": [
        "<ruby>東<rt>ひがし</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu timur",
        "<ruby>東<rt>とう</rt></ruby><ruby>京<rt>きょう</rt></ruby> — Tokyo",
        "<ruby>東<rt>とう</rt></ruby><ruby>南<rt>なん</rt></ruby>アジア — Asia Tenggara",
        "<ruby>東<rt>とう</rt></ruby><ruby>西<rt>ざい</rt></ruby><ruby>南<rt>なん</rt></ruby><ruby>北<rt>ぼく</rt></ruby> — arah mata angin"
    ],

    "西": [
        "<ruby>西<rt>にし</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu barat",
        "<ruby>関<rt>かん</rt></ruby><ruby>西<rt>さい</rt></ruby> — Kansai",
        "<ruby>西<rt>せい</rt></ruby><ruby>洋<rt>よう</rt></ruby> — barat, negara barat"
    ],

    "南": [
        "<ruby>南<rt>みなみ</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu selatan",
        "<ruby>東<rt>とう</rt></ruby><ruby>南<rt>なん</rt></ruby>アジア — Asia Tenggara",
        "<ruby>東<rt>とう</rt></ruby><ruby>西<rt>ざい</rt></ruby><ruby>南<rt>なん</rt></ruby><ruby>北<rt>ぼく</rt></ruby> — arah mata angin"
    ],

    "北": [
        "<ruby>北<rt>きた</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu utara",
        "<ruby>北<rt>ほっ</rt></ruby><ruby>海<rt>かい</rt></ruby><ruby>道<rt>どう</rt></ruby> — Hokkaido",
        "<ruby>東<rt>とう</rt></ruby><ruby>西<rt>ざい</rt></ruby><ruby>南<rt>なん</rt></ruby><ruby>北<rt>ぼく</rt></ruby> — arah mata angin"
    ]

});


/* =========================================
   BAGIAN 5: MANUSIA DAN TUBUH (61-74)
========================================= */

perbaruiKosakataDariPDF({

    "人": [
        "あの<ruby>人<rt>ひと</rt></ruby> — orang itu",
        "<ruby>日本<rt>にほん</rt></ruby><ruby>人<rt>じん</rt></ruby> — orang Jepang",
        "<ruby>何<rt>なん</rt></ruby><ruby>人<rt>にん</rt></ruby> — berapa orang",
        "<ruby>一<rt>ひと</rt></ruby><ruby>人<rt>り</rt></ruby> — satu orang",
        "<ruby>大<rt>おと</rt></ruby><ruby>人<rt>な</rt></ruby> — dewasa"
    ],

    "子": [
        "<ruby>子<rt>こ</rt></ruby>ども — anak-anak",
        "<ruby>調<rt>ちょう</rt></ruby><ruby>子<rt>し</rt></ruby> — kondisi",
        "<ruby>様<rt>よう</rt></ruby><ruby>子<rt>す</rt></ruby> — kondisi, gerak-gerik"
    ],

    "女": [
        "<ruby>女<rt>おんな</rt></ruby>の<ruby>人<rt>ひと</rt></ruby> — seorang perempuan",
        "<ruby>女<rt>おんな</rt></ruby>の<ruby>子<rt>こ</rt></ruby> — anak perempuan",
        "<ruby>女<rt>じょ</rt></ruby><ruby>子<rt>し</rt></ruby> — anak perempuan",
        "<ruby>女<rt>じょ</rt></ruby><ruby>性<rt>せい</rt></ruby> — perempuan",
        "<ruby>彼<rt>かの</rt></ruby><ruby>女<rt>じょ</rt></ruby> — dia, pacar perempuan"
    ],

    "男": [
        "<ruby>男<rt>おとこ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby> — seorang laki-laki",
        "<ruby>男<rt>おとこ</rt></ruby>の<ruby>子<rt>こ</rt></ruby> — anak laki-laki",
        "<ruby>男<rt>だん</rt></ruby><ruby>子<rt>し</rt></ruby> — laki-laki",
        "<ruby>男<rt>だん</rt></ruby><ruby>性<rt>せい</rt></ruby> — laki-laki",
        "<ruby>男<rt>だん</rt></ruby><ruby>女<rt>じょ</rt></ruby> — laki-laki dan perempuan"
    ],

    "父": [
        "<ruby>私<rt>わたし</rt></ruby>の<ruby>父<rt>ちち</rt></ruby> — ayah saya",
        "お<ruby>父<rt>とう</rt></ruby>さん — ayah orang lain",
        "<ruby>父<rt>ちち</rt></ruby>と<ruby>母<rt>はは</rt></ruby> — ayah dan ibu"
    ],

    "母": [
        "<ruby>父<rt>ちち</rt></ruby>と<ruby>母<rt>はは</rt></ruby> — ayah dan ibu",
        "お<ruby>母<rt>かあ</rt></ruby>さん — ibu orang lain"
    ],

    "友": [
        "<ruby>友<rt>とも</rt></ruby>だち — teman",
        "<ruby>友<rt>ゆう</rt></ruby><ruby>人<rt>じん</rt></ruby> — teman formal",
        "<ruby>親<rt>しん</rt></ruby><ruby>友<rt>ゆう</rt></ruby> — sahabat"
    ],

    "名": [
        "<ruby>名<rt>な</rt></ruby><ruby>前<rt>まえ</rt></ruby> — nama",
        "<ruby>有<rt>ゆう</rt></ruby><ruby>名<rt>めい</rt></ruby> — terkenal",
        "<ruby>名<rt>めい</rt></ruby><ruby>刺<rt>し</rt></ruby> — kartu nama",
        "<ruby>名<rt>みょう</rt></ruby><ruby>字<rt>じ</rt></ruby> — nama keluarga"
    ],

    "目": [
        "<ruby>目<rt>め</rt></ruby>の<ruby>前<rt>まえ</rt></ruby> — di depan mata",
        "<ruby>一<rt>ひと</rt></ruby>つ<ruby>目<rt>め</rt></ruby> — yang pertama",
        "<ruby>目<rt>もく</rt></ruby><ruby>的<rt>てき</rt></ruby> — tujuan",
        "<ruby>目<rt>もく</rt></ruby><ruby>次<rt>じ</rt></ruby> — daftar isi"
    ],

    "耳": [
        "<ruby>耳<rt>みみ</rt></ruby>が<ruby>痛<rt>いた</rt></ruby>い — telinga sakit"
    ],

    "口": [
        "<ruby>口<rt>くち</rt></ruby>の<ruby>中<rt>なか</rt></ruby> — di dalam mulut",
        "<ruby>出<rt>で</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu keluar",
        "<ruby>入<rt>い</rt></ruby><ruby>口<rt>りぐち</rt></ruby> — pintu masuk",
        "<ruby>人<rt>じん</rt></ruby><ruby>口<rt>こう</rt></ruby> — penduduk"
    ],

    "手": [
        "<ruby>手<rt>て</rt></ruby><ruby>首<rt>くび</rt></ruby> — pergelangan tangan",
        "<ruby>手<rt>て</rt></ruby><ruby>紙<rt>がみ</rt></ruby> — surat",
        "<ruby>上<rt>じょう</rt></ruby><ruby>手<rt>ず</rt></ruby> — pintar",
        "<ruby>下<rt>へ</rt></ruby><ruby>手<rt>た</rt></ruby> — bodoh",
        "<ruby>歌<rt>か</rt></ruby><ruby>手<rt>しゅ</rt></ruby> — penyanyi"
    ],

    "足": [
        "<ruby>足<rt>あし</rt></ruby><ruby>首<rt>くび</rt></ruby> — pergelangan kaki",
        "<ruby>足<rt>た</rt></ruby>りる — cukup",
        "<ruby>足<rt>た</rt></ruby>す — menambahkan",
        "<ruby>遠<rt>えん</rt></ruby><ruby>足<rt>そく</rt></ruby> — piknik",
        "<ruby>一<rt>いっ</rt></ruby><ruby>足<rt>そく</rt></ruby> — sepasang"
    ],

    "力": [
        "<ruby>男<rt>おとこ</rt></ruby>の<ruby>力<rt>ちから</rt></ruby> — tenaga laki-laki",
        "<ruby>力<rt>ちから</rt></ruby><ruby>持<rt>も</rt></ruby>ち — bertenaga",
        "<ruby>実<rt>じつ</rt></ruby><ruby>力<rt>りょく</rt></ruby> — kemampuan sesungguhnya",
        "<ruby>自<rt>じ</rt></ruby><ruby>力<rt>りき</rt></ruby> — kemampuan sendiri"
    ]

});


/* =========================================
   BAGIAN 6: ALAM DAN KEHIDUPAN (75-85)
========================================= */

perbaruiKosakataDariPDF({

    "山": [
        "<ruby>山<rt>やま</rt></ruby>の<ruby>上<rt>うえ</rt></ruby> — di atas gunung",
        "<ruby>富<rt>ふ</rt></ruby><ruby>士<rt>じ</rt></ruby><ruby>山<rt>さん</rt></ruby> — Gunung Fuji"
    ],

    "川": [
        "<ruby>日本<rt>にほん</rt></ruby>の<ruby>川<rt>かわ</rt></ruby> — sungai di Jepang"
    ],

    "田": [
        "<ruby>山<rt>やま</rt></ruby><ruby>田<rt>だ</rt></ruby>さん — Yamada-san",
        "<ruby>田<rt>た</rt></ruby><ruby>中<rt>なか</rt></ruby>さん — Tanaka-san"
    ],

    "天": [
        "<ruby>天<rt>てん</rt></ruby><ruby>気<rt>き</rt></ruby> — cuaca",
        "<ruby>天<rt>てん</rt></ruby><ruby>国<rt>ごく</rt></ruby> — surga"
    ],

    "空": [
        "<ruby>青<rt>あお</rt></ruby>い<ruby>空<rt>そら</rt></ruby> — langit biru",
        "<ruby>空<rt>くう</rt></ruby><ruby>気<rt>き</rt></ruby> — udara",
        "<ruby>空<rt>くう</rt></ruby><ruby>港<rt>こう</rt></ruby> — bandara",
        "<ruby>空<rt>から</rt></ruby><ruby>手<rt>て</rt></ruby> — karate",
        "<ruby>空<rt>あ</rt></ruby>く — kosong, belum terisi"
    ],

    "雨": [
        "<ruby>雨<rt>あめ</rt></ruby>が<ruby>降<rt>ふ</rt></ruby>る — turun hujan",
        "<ruby>大<rt>おお</rt></ruby><ruby>雨<rt>あめ</rt></ruby> — hujan besar",
        "<ruby>小<rt>こ</rt></ruby><ruby>雨<rt>さめ</rt></ruby> — hujan kecil",
        "<ruby>雨<rt>あま</rt></ruby><ruby>戸<rt>ど</rt></ruby> — pintu penghalang hujan",
        "<ruby>雨<rt>う</rt></ruby><ruby>季<rt>き</rt></ruby> — musim hujan"
    ],

    "気": [
        "<ruby>電<rt>でん</rt></ruby><ruby>気<rt>き</rt></ruby> — listrik",
        "<ruby>天<rt>てん</rt></ruby><ruby>気<rt>き</rt></ruby> — cuaca",
        "<ruby>元<rt>げん</rt></ruby><ruby>気<rt>き</rt></ruby> — semangat",
        "<ruby>病<rt>びょう</rt></ruby><ruby>気<rt>き</rt></ruby> — sakit",
        "<ruby>気<rt>き</rt></ruby><ruby>持<rt>も</rt></ruby>ち — perasaan"
    ],

    "花": [
        "<ruby>花<rt>はな</rt></ruby><ruby>見<rt>み</rt></ruby> — melihat bunga sakura",
        "<ruby>花<rt>はな</rt></ruby><ruby>火<rt>び</rt></ruby> — kembang api",
        "<ruby>花<rt>はな</rt></ruby><ruby>屋<rt>や</rt></ruby> — toko bunga",
        "<ruby>花<rt>か</rt></ruby><ruby>瓶<rt>びん</rt></ruby> — vas bunga"
    ],

    "草": [
        "<ruby>草<rt>くさ</rt></ruby>を<ruby>切<rt>き</rt></ruby>る — memotong rumput"
    ],

    "林": [
        "<ruby>林<rt>はやし</rt></ruby> — hutan ukuran kecil"
    ],

    "森": [
        "<ruby>森<rt>もり</rt></ruby> — hutan",
        "<ruby>森<rt>もり</rt></ruby>の<ruby>中<rt>なか</rt></ruby> — di tengah hutan",
        "<ruby>森<rt>しん</rt></ruby><ruby>林<rt>りん</rt></ruby> — hutan"
    ]

});


/* =========================================
   BAGIAN 7: TEMPAT DAN UMUM (86-95)
========================================= */

perbaruiKosakataDariPDF({

    "国": [
        "<ruby>国<rt>くに</rt></ruby>の<ruby>名<rt>な</rt></ruby><ruby>前<rt>まえ</rt></ruby> — nama negara",
        "<ruby>外<rt>がい</rt></ruby><ruby>国<rt>こく</rt></ruby><ruby>人<rt>じん</rt></ruby> — orang asing"
    ],

    "町": [
        "きれいな<ruby>町<rt>まち</rt></ruby> — kota yang indah"
    ],

    "村": [
        "<ruby>静<rt>しず</rt></ruby>かな<ruby>村<rt>むら</rt></ruby> — desa yang tenang",
        "<ruby>村<rt>むら</rt></ruby><ruby>人<rt>びと</rt></ruby> — orang desa",
        "<ruby>村<rt>そん</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — kepala desa"
    ],

    "道": [
        "<ruby>道<rt>みち</rt></ruby>を<ruby>歩<rt>ある</rt></ruby>く — berjalan kaki di jalan",
        "<ruby>道<rt>どう</rt></ruby><ruby>路<rt>ろ</rt></ruby> — jalan raya",
        "<ruby>鉄<rt>てつ</rt></ruby><ruby>道<rt>どう</rt></ruby> — kereta api",
        "<ruby>北<rt>ほっ</rt></ruby><ruby>海<rt>かい</rt></ruby><ruby>道<rt>どう</rt></ruby> — Hokkaido",
        "<ruby>書<rt>しょ</rt></ruby><ruby>道<rt>どう</rt></ruby> — seni kaligrafi Jepang"
    ],

    "駅": [
        "<ruby>駅<rt>えき</rt></ruby>の<ruby>出<rt>で</rt></ruby><ruby>口<rt>ぐち</rt></ruby> — pintu keluar stasiun",
        "<ruby>駅<rt>えき</rt></ruby><ruby>員<rt>いん</rt></ruby> — petugas stasiun"
    ],

    "店": [
        "<ruby>店<rt>みせ</rt></ruby>の<ruby>人<rt>ひと</rt></ruby> — orang yang bekerja di toko",
        "<ruby>店<rt>てん</rt></ruby><ruby>員<rt>いん</rt></ruby> — pegawai toko",
        "<ruby>喫<rt>きっ</rt></ruby><ruby>茶<rt>さ</rt></ruby><ruby>店<rt>てん</rt></ruby> — kedai kopi",
        "<ruby>書<rt>しょ</rt></ruby><ruby>店<rt>てん</rt></ruby> — toko buku"
    ],

    "家": [
        "<ruby>家<rt>いえ</rt></ruby>の<ruby>後<rt>うし</rt></ruby>ろ — belakang rumah",
        "<ruby>家<rt>か</rt></ruby><ruby>族<rt>ぞく</rt></ruby> — keluarga",
        "<ruby>家<rt>か</rt></ruby><ruby>事<rt>じ</rt></ruby> — pekerjaan rumah tangga",
        "<ruby>家<rt>か</rt></ruby><ruby>庭<rt>てい</rt></ruby> — rumah tangga"
    ],

    "車": [
        "<ruby>車<rt>くるま</rt></ruby>のドア — pintu mobil",
        "<ruby>自<rt>じ</rt></ruby><ruby>動<rt>どう</rt></ruby><ruby>車<rt>しゃ</rt></ruby> — kendaraan, mobil",
        "<ruby>自<rt>じ</rt></ruby><ruby>転<rt>てん</rt></ruby><ruby>車<rt>しゃ</rt></ruby> — sepeda"
    ],

    "電": [
        "<ruby>電<rt>でん</rt></ruby><ruby>車<rt>しゃ</rt></ruby> — kereta",
        "<ruby>電<rt>でん</rt></ruby><ruby>気<rt>き</rt></ruby> — listrik, lampu"
    ],

    "社": [
        "<ruby>会<rt>かい</rt></ruby><ruby>社<rt>しゃ</rt></ruby> — perusahaan",
        "<ruby>社<rt>しゃ</rt></ruby><ruby>員<rt>いん</rt></ruby> — karyawan",
        "<ruby>社<rt>しゃ</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — direktur",
        "<ruby>本<rt>ほん</rt></ruby><ruby>社<rt>しゃ</rt></ruby> — kantor pusat"
    ]

});


/* =========================================
   BAGIAN 8: SEKOLAH DAN LAIN-LAIN (96-103)
========================================= */

perbaruiKosakataDariPDF({

    "学": [
        "<ruby>学<rt>がく</rt></ruby><ruby>生<rt>せい</rt></ruby> — siswa",
        "<ruby>大<rt>だい</rt></ruby><ruby>学<rt>がく</rt></ruby><ruby>生<rt>せい</rt></ruby> — mahasiswa",
        "<ruby>学<rt>がっ</rt></ruby><ruby>校<rt>こう</rt></ruby> — sekolah",
        "<ruby>学<rt>まな</rt></ruby>ぶ — mempelajari"
    ],

    "生": [
        "<ruby>生<rt>せい</rt></ruby><ruby>活<rt>かつ</rt></ruby> — kehidupan",
        "<ruby>生<rt>せい</rt></ruby><ruby>徒<rt>と</rt></ruby> — murid",
        "<ruby>誕<rt>たん</rt></ruby><ruby>生<rt>じょう</rt></ruby><ruby>日<rt>び</rt></ruby> — hari ulang tahun",
        "<ruby>生<rt>う</rt></ruby>まれる — lahir",
        "<ruby>生<rt>い</rt></ruby>きる — hidup"
    ],

    "校": [
        "<ruby>校<rt>こう</rt></ruby><ruby>長<rt>ちょう</rt></ruby> — kepala sekolah",
        "<ruby>中<rt>ちゅう</rt></ruby><ruby>学<rt>がく</rt></ruby><ruby>生<rt>せい</rt></ruby> — pelajar SMP",
        "<ruby>高<rt>こう</rt></ruby><ruby>校<rt>こう</rt></ruby><ruby>生<rt>せい</rt></ruby> — pelajar SMA"
    ],

    "本": [
        "<ruby>新<rt>あたら</rt></ruby>しい<ruby>本<rt>ほん</rt></ruby> — buku baru",
        "<ruby>日<rt>に</rt></ruby><ruby>本<rt>ほん</rt></ruby> — Jepang",
        "～<ruby>本<rt>ほん・ぽん・ぼん</rt></ruby> — satuan menghitung benda panjang"
    ],

    "語": [
        "<ruby>日<rt>に</rt></ruby><ruby>本<rt>ほん</rt></ruby><ruby>語<rt>ご</rt></ruby> — bahasa Jepang",
        "<ruby>英<rt>えい</rt></ruby><ruby>語<rt>ご</rt></ruby> — bahasa Inggris",
        "<ruby>何<rt>なん</rt></ruby><ruby>語<rt>ご</rt></ruby> — bahasa apa"
    ],

    "何": [
        "<ruby>何<rt>なん</rt></ruby><ruby>時<rt>じ</rt></ruby> — jam berapa",
        "<ruby>何<rt>なん</rt></ruby><ruby>時<rt>じ</rt></ruby><ruby>間<rt>かん</rt></ruby> — berapa jam",
        "<ruby>何<rt>なん</rt></ruby><ruby>本<rt>ぼん</rt></ruby> — berapa batang",
        "<ruby>何<rt>なん</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — berapa menit",
        "<ruby>何<rt>なに</rt></ruby><ruby>語<rt>ご</rt></ruby> — bahasa apa"
    ],

    "牛": [
        "<ruby>牛<rt>うし</rt></ruby>の<ruby>口<rt>くち</rt></ruby> — mulut sapi",
        "<ruby>牛<rt>ぎゅう</rt></ruby><ruby>肉<rt>にく</rt></ruby> — daging sapi",
        "<ruby>牛<rt>ぎゅう</rt></ruby><ruby>乳<rt>にゅう</rt></ruby> — susu sapi"
    ],

    "魚": [
        "<ruby>魚<rt>さかな</rt></ruby>の<ruby>名<rt>な</rt></ruby><ruby>前<rt>まえ</rt></ruby> — nama ikan",
        "<ruby>魚<rt>さかな</rt></ruby><ruby>屋<rt>や</rt></ruby> — toko ikan"
    ]

});


/* =========================================
   BAGIAN 9: ANGKA DAN SATUAN (104-117)
========================================= */

perbaruiKosakataDariPDF({

    "一": [
        "<ruby>一<rt>いち</rt></ruby><ruby>番<rt>ばん</rt></ruby> — nomor satu, paling",
        "<ruby>一<rt>ひと</rt></ruby>つ — satu buah",
        "<ruby>一<rt>ひと</rt></ruby><ruby>人<rt>り</rt></ruby> — sendiri",
        "<ruby>一<rt>つい</rt></ruby><ruby>日<rt>たち</rt></ruby> — tanggal satu",
        "<ruby>一<rt>いち</rt></ruby><ruby>日<rt>にち</rt></ruby> — satu hari"
    ],

    "二": [
        "<ruby>二<rt>ふた</rt></ruby>つ — dua buah",
        "<ruby>二<rt>ふたり</rt></ruby><ruby>人<rt></rt></ruby> — dua orang",
        "<ruby>二<rt>に</rt></ruby><ruby>名<rt>めい</rt></ruby> — dua orang",
        "<ruby>二<rt>ふつ</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal dua"
    ],

    "三": [
        "<ruby>三<rt>みっ</rt></ruby>つ — tiga buah",
        "<ruby>三<rt>さん</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — tiga menit",
        "<ruby>三<rt>みっ</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal tiga",
        "<ruby>三<rt>さん</rt></ruby><ruby>本<rt>ぼん</rt></ruby> — tiga batang"
    ],

    "四": [
        "<ruby>四<rt>よっ</rt></ruby>つ — empat buah",
        "<ruby>四<rt>よん</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — empat menit",
        "<ruby>四<rt>よ</rt></ruby><ruby>人<rt>にん</rt></ruby>・<ruby>四<rt>よ</rt></ruby><ruby>年<rt>ねん</rt></ruby> — empat orang, empat tahun",
        "<ruby>四<rt>し</rt></ruby><ruby>月<rt>がつ</rt></ruby> — bulan April",
        "<ruby>四<rt>よっ</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal empat"
    ],

    "五": [
        "<ruby>五<rt>いつ</rt></ruby>つ — lima buah",
        "<ruby>五<rt>いつ</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal lima"
    ],

    "六": [
        "<ruby>六<rt>むっ</rt></ruby>つ — enam buah",
        "<ruby>六<rt>むい</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal enam",
        "<ruby>六<rt>ろっ</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — enam menit",
        "<ruby>六<rt>ろっ</rt></ruby><ruby>本<rt>ぽん</rt></ruby> — enam batang"
    ],

    "七": [
        "<ruby>七<rt>なな</rt></ruby>つ — tujuh buah",
        "<ruby>七<rt>なの</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal tujuh",
        "<ruby>七<rt>しち</rt></ruby><ruby>月<rt>がつ</rt></ruby> — bulan Juli"
    ],

    "八": [
        "<ruby>八<rt>やっ</rt></ruby>つ — delapan buah",
        "<ruby>八<rt>よう</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal delapan",
        "<ruby>八<rt>はっ</rt></ruby><ruby>週<rt>しゅう</rt></ruby><ruby>間<rt>かん</rt></ruby> — delapan minggu"
    ],

    "九": [
        "<ruby>九<rt>ここの</rt></ruby>つ — sembilan buah",
        "<ruby>九<rt>く</rt></ruby><ruby>月<rt>がつ</rt></ruby> — bulan September",
        "<ruby>九<rt>く</rt></ruby><ruby>時<rt>じ</rt></ruby> — jam sembilan"
    ],

    "十": [
        "<ruby>十<rt>とお</rt></ruby> — sepuluh",
        "<ruby>十<rt>とお</rt></ruby><ruby>日<rt>か</rt></ruby> — tanggal sepuluh",
        "<ruby>十<rt>じゅっ</rt></ruby><ruby>本<rt>ぽん</rt></ruby> — sepuluh batang"
    ],

    "百": [
        "<ruby>百<rt>ひゃく</rt></ruby><ruby>人<rt>にん</rt></ruby> — seratus orang",
        "<ruby>百<rt>ひゃっ</rt></ruby><ruby>分<rt>ぷん</rt></ruby> — seratus menit",
        "<ruby>百<rt>ひゃっ</rt></ruby><ruby>本<rt>ぽん</rt></ruby> — seratus batang"
    ],

    "千": [
        "<ruby>二<rt>に</rt></ruby><ruby>千<rt>せん</rt></ruby><ruby>年<rt>ねん</rt></ruby> — tahun 2000",
        "<ruby>千<rt>せん</rt></ruby><ruby>五<rt>ご</rt></ruby><ruby>百<rt>ひゃく</rt></ruby><ruby>人<rt>にん</rt></ruby> — 1500 orang"
    ],

    "万": [
        "<ruby>百<rt>ひゃく</rt></ruby><ruby>万<rt>まん</rt></ruby> — satu juta",
        "<ruby>万<rt>まん</rt></ruby>が<ruby>一<rt>いち</rt></ruby> — seandainya"
    ],

    "円": [
        "<ruby>十<rt>じゅう</rt></ruby><ruby>万<rt>まん</rt></ruby><ruby>円<rt>えん</rt></ruby> — seratus ribu yen",
        "<ruby>何<rt>なん</rt></ruby><ruby>円<rt>えん</rt></ruby> — berapa yen"
    ]

});

// ===================================
// DATA FLASHCARD KOSAKATA GABUNGAN
// ===================================




const urutanKanjiPDF = [
    // 1–16: Kata kerja
    "買", "行", "来", "出", "入", "立",
    "休", "読", "書", "聞", "話", "食",
    "飲", "見", "会", "言",

    // 17–30: Kata sifat dan warna
    "大", "小", "高", "安", "新", "古",
    "多", "少", "長", "早", "白", "黒",
    "赤", "青",

    // 31–48: Hari dan waktu
    "日", "月", "火", "水", "木", "金",
    "土", "年", "週", "時", "分", "先",
    "今", "明", "毎", "間", "午", "半",

    // 49–60: Arah dan posisi
    "上", "下", "中", "外", "左", "右",
    "前", "後", "東", "西", "南", "北",

    // 61–74: Manusia dan anggota tubuh
    "人", "子", "女", "男", "父", "母",
    "友", "名", "目", "耳", "口", "手",
    "足", "力",

    // 75–85: Alam dan kehidupan
    "山", "川", "田", "天", "空", "雨",
    "気", "花", "草", "林", "森",

    // 86–95: Tempat dan benda umum
    "国", "町", "村", "道", "駅", "店",
    "家", "車", "電", "社",

    // 96–103: Sekolah dan lainnya
    "学", "生", "校", "本", "語", "何",
    "牛", "魚",

    // 104–117: Angka
    "一", "二", "三", "四", "五", "六",
    "七", "八", "九", "十", "百", "千",
    "万", "円"
];

function buatDataFlashcardDariKanji() {
    const hasil = [];
    const sudahAda = new Set();

    for (const kanjiDasar of urutanKanjiPDF) {
    const data = dataKanji[kanjiDasar];
    if (!data) continue;
        (data.kosakata || []).forEach(teks => {
            const posisiPemisah = teks.indexOf("—");

            if (posisiPemisah === -1) return;

            const htmlKata = teks.slice(0, posisiPemisah).trim();
            const arti = teks.slice(posisiPemisah + 1).trim();

            const wadah = document.createElement("div");
            wadah.innerHTML = htmlKata;

            let kata = "";
            let furigana = "";

            function ambilTeks(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    kata += node.textContent;
                    furigana += node.textContent;
                    return;
                }

                if (node.nodeType !== Node.ELEMENT_NODE) return;

                if (node.tagName === "RUBY") {
                    const salinan = node.cloneNode(true);

                    const daftarRt = Array.from(
                        salinan.querySelectorAll("rt")
                    );

                    const bacaan = daftarRt
                        .map(rt => rt.textContent.trim())
                        .join("");

                    daftarRt.forEach(rt => rt.remove());

                    const teksKanji = salinan.textContent;

                    kata += teksKanji;
                    furigana += bacaan || teksKanji;
                    return;
                }

                if (node.tagName === "RT") return;

                Array.from(node.childNodes).forEach(ambilTeks);
            }

            Array.from(wadah.childNodes).forEach(ambilTeks);

            kata = kata.trim();
            furigana = furigana.trim();

            if (!kata || !arti || sudahAda.has(kata)) return;

            sudahAda.add(kata);

            hasil.push({
                kanji: kata,
                furigana: furigana,
                arti: arti,
                level: "N5"
            });
        });
    }

    return hasil;
}

const dataFlashcard = buatDataFlashcardDariKanji();

console.log("JUMLAH FLASHCARD:", dataFlashcard.length);
console.log("DATA FLASHCARD:", dataFlashcard);


console.log("JUMLAH FLASHCARD:", dataFlashcard.length);
console.log("DATA FLASHCARD:", dataFlashcard);


// ===================================
// FUNGSI FLASHCARD
// ===================================

let levelFlashcardAktif = "N5";
let filterFlashcardAktif = "semua";
let flashcardTerbuka = new Set();

// Menyimpan status hafalan
let statusHafalan = {};

try {
    statusHafalan = JSON.parse(
        localStorage.getItem("statusHafalanNihongo")
    ) || {};
} catch (error) {
    statusHafalan = {};
}

// Simpan status hafalan
function simpanStatusHafalan() {
    localStorage.setItem(
        "statusHafalanNihongo",
        JSON.stringify(statusHafalan)
    );
}
// =========================================
// STATUS HAFALAN KOSAKATA
// =========================================

let statusKosakata = {};

try {
    statusKosakata = JSON.parse(
        localStorage.getItem("statusKosakataNihongo")
    ) || {};
} catch (error) {
    statusKosakata = {};
}

function simpanStatusKosakata() {
    localStorage.setItem(
        "statusKosakataNihongo",
        JSON.stringify(statusKosakata)
    );
}
// Pengaturan Flashcard Kosakata
let filterKosakataAktif = "semua";
let kategoriKosakataAktif = "";
let kosakataTerbuka = new Set();
let pilihanKosakata = new Set();
// Mengubah status hafalan kosakata
function ubahStatusKosakata(kata) {
    const statusSekarang = statusKosakata[kata] || "belum";

    if (statusSekarang === "belum") {
        statusKosakata[kata] = "proses";
    } else if (statusSekarang === "proses") {
        statusKosakata[kata] = "hafal";
    } else {
        statusKosakata[kata] = "belum";
    }

    simpanStatusKosakata();
    tampilkanFlashcardKosakata();
}
// Memilih level JLPT
function pilihLevelFlashcard(level) {

    // Simpan level yang dipilih.
    levelFlashcardAktif = level;

    // Reset kartu dan filter.
    flashcardTerbuka.clear();
    filterFlashcardAktif = "semua";

    // Tampilkan bagian Flashcard setelah level dipilih.
    const filter = document.querySelector(".filter-flashcard");
    const progres = document.getElementById("progres-flashcard");
    const tempat = document.getElementById("materi-flashcard");

    if (filter) filter.hidden = false;
    if (progres) progres.hidden = false;
    if (tempat) tempat.hidden = false;

    // Tandai tombol level yang dipilih.
    document.querySelectorAll(
        "#halaman-flashcard .level-menu button"
    ).forEach(function(btn) {
        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );
    });

    // Reset filter ke Semua.
    document.querySelectorAll(
        ".filter-flashcard button"
    ).forEach(function(btn) {
        btn.classList.toggle(
            "active",
            btn.textContent.trim().toLowerCase() === "semua"
        );
    });

    // Tampilkan kartu sesuai level.
    tampilkanFlashcard();
}

// Memilih filter hafalan
function filterFlashcard(filter) {
    filterFlashcardAktif = filter;
    tampilkanFlashcard();
}

// Mengubah status hafalan
function ubahStatusHafalan(kanji) {
    statusHafalan[kanji] = !statusHafalan[kanji];

    simpanStatusHafalan();
    tampilkanFlashcard();
}

// Menampilkan kartu Flashcard
function tampilkanFlashcard() {
    const tempatFlashcard = document.getElementById("materi-flashcard");
    const progres = document.getElementById("progres-flashcard");

    if (!tempatFlashcard) return;

    // Pilih kosakata sesuai level
    let daftar = dataFlashcard
        .map((item, index) => ({ ...item, index }))
        .filter(item => item.level === levelFlashcardAktif);

    // Hitung progres hafalan
    const totalHafal = daftar.filter(
        item => statusHafalan[item.kanji] === true
    ).length;

    if (progres) {
        progres.textContent =
            `Progres hafalan: ${totalHafal} dari ${daftar.length} kosakata`;
    }

    // Terapkan filter hafalan
    if (filterFlashcardAktif === "hafal") {
        daftar = daftar.filter(
            item => statusHafalan[item.kanji] === true
        );
    } else if (filterFlashcardAktif === "belum") {
        daftar = daftar.filter(
            item => statusHafalan[item.kanji] !== true
        );
    }

    // Tampilkan kartu
    if (daftar.length === 0) {
        tempatFlashcard.innerHTML =
            "<p>Belum ada kosakata pada pilihan ini.</p>";
        return;
    }

    tempatFlashcard.innerHTML = daftar.map(item => {
        const sudahHafal = statusHafalan[item.kanji] === true;
        const terbuka = flashcardTerbuka.has(item.index);

        return `
            <div class="flashcard-item">

                <div
                    class="flashcard-kanji"
                    id="flashcard-${item.index}"
                    onclick="ketukFlashcard(${item.index})"
                >
                    ${
                        terbuka
                        ? `<div class="flashcard-jawaban">
                            <ruby>
                                ${item.kanji}
                                <rt>${item.furigana}</rt>
                            </ruby>
                            <p>${item.arti}</p>
                           </div>`
                        : item.kanji
                    }
                </div>

                <button
                    class="tombol-hafalan ${sudahHafal ? 'hafal' : 'belum'}"
                    onclick="ubahStatusHafalan('${item.kanji}')"
                >
                    ${sudahHafal ? '✓ Sudah Hafal' : 'Belum Hafal'}
                </button>

            </div>
        `;
    }).join("");
}

// Ketika kartu diketuk
function ketukFlashcard(index) {
    if (flashcardTerbuka.has(index)) {
        flashcardTerbuka.delete(index);
    } else {
        flashcardTerbuka.add(index);
    }

    tampilkanFlashcard();
}



// Ketika kartu diketuk
function ketukFlashcard(index) {
    const item = dataFlashcard[index];
    const kartu = document.getElementById(`flashcard-${index}`);

    if (flashcardTerbuka.has(index)) {
        flashcardTerbuka.delete(index);
        kartu.innerHTML = item.kanji;
    } else {
        flashcardTerbuka.add(index);

        kartu.innerHTML = `
            <div class="flashcard-jawaban">
                <ruby>
                    ${item.kanji}
                    <rt>${item.furigana}</rt>
                </ruby>
                <p>${item.arti}</p>
            </div>
        `;
    }
}



/* =========================================
   BELAJAR CAMPURAN
========================================= */



function bukaBelajarCampuran() {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    tempat.innerHTML = `
        <div class="belajar-campuran">

            <div id="area-kartu-campuran"></div>

        </div>
    `;

    nsMulaiKartuCampuran();
}



/* =========================================
   ATUR TARGET HARIAN
========================================= */


function aturTargetHarian() {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    tempat.innerHTML = `
        <div class="belajar-campuran">

            <button type="button"
                onclick="bukaBelajarCampuran()">
                ← Kembali ke Belajar Campuran
            </button>

            <h2>⚙️ Atur Target Harian</h2>
            <p>Pilih kategori dan jumlah kosakata yang ingin dipelajari.</p>

            <div id="pilihan-target-kategori"></div>

            <h3>
                Total Target:
                <span id="total-target">0</span> kosakata
            </h3>

            <button type="button"
                onclick="simpanTargetHarian()">
                Simpan Target
            </button>

        </div>
    `;

    tampilkanPilihanTarget();
}


/* MENAMPILKAN PILIHAN KATEGORI */


function tampilkanPilihanTarget() {
    const tempat = document.getElementById("pilihan-target-kategori");
    if (!tempat) return;

    const kategori = {
        kataKerja: "Kata Kerja",
        kataSifat: "Kata Sifat",
        kataKeterangan: "Kata Keterangan",
        kataTanya: "Kata Tanya",
        kataBenda: "Kata Benda",
        anggotaKeluarga: "Anggota Keluarga",
        caraMenghitung: "Cara Menghitung",
        hariTanggalBulan: "Hari, Tanggal & Bulan",
        salam: "Salam"
    };

    const status = JSON.parse(
        localStorage.getItem("nihongoKosakataStatus") || "{}"
    );

    const targetTersimpan = JSON.parse(
        localStorage.getItem("nihongoKosakataTargetHarian") || "{}"
    );

    let html = "";

    for (const kunci in kategori) {
        const daftar = dataKosakata[kunci] || [];

        const hafal = daftar.filter(item =>
            status[`${kunci}::${item.kata}::${item.furigana}`] === "hafal"
        ).length;

        const sisa = daftar.length - hafal;

        html += `
            <div class="target-kategori">

                <label>
                    <strong>${kategori[kunci]}</strong>
                    <span> (Sisa ${sisa} kosakata)</span>
                </label>

                <input
                    type="number"
                    min="0"
                    max="${sisa}"
                    step="1"
                    value="${targetTersimpan[kunci] ?? 0}"
                    class="input-target-kategori"
                    data-kategori="${kunci}"
                    oninput="hitungTotalTarget()"
                >

            </div>
        `;
    }

    tempat.innerHTML = html;

    hitungTotalTarget();
}



/* MENGHITUNG TOTAL TARGET */

function hitungTotalTarget() {
    let total = 0;

    document.querySelectorAll(".input-target-kategori").forEach(input => {
        let jumlah = Number(input.value) || 0;
        const maksimal = Number(input.max);

        if (jumlah < 0) {
            jumlah = 0;
            input.value = 0;
        }

        if (jumlah > maksimal) {
            jumlah = maksimal;
            input.value = maksimal;
        }

        total += jumlah;
    });

    const tampilanTotal = document.getElementById("total-target");

    if (tampilanTotal) {
        tampilanTotal.textContent = total;
    }
}


/* =========================================
   SIMPAN TARGET HARIAN
========================================= */

function simpanTargetHarian() {
    const inputs = document.querySelectorAll(
        ".input-target-kategori"
    );

    if (!inputs.length) return;

    const target = {};

    const status = JSON.parse(
        localStorage.getItem("nihongoKosakataStatus") || "{}"
    );

    let total = 0;

    inputs.forEach(input => {
        const kunci = input.dataset.kategori;
        const daftar = dataKosakata[kunci] || [];

        const hafal = daftar.filter(item =>
            status[`${kunci}::${item.kata}::${item.furigana}`] === "hafal"
        ).length;

        const sisa = daftar.length - hafal;

        let jumlah = Math.floor(Number(input.value) || 0);

        jumlah = Math.max(0, Math.min(jumlah, sisa));

        input.value = jumlah;

        target[kunci] = jumlah;

        total += jumlah;
    });

    localStorage.setItem(
        "nihongoKosakataTargetHarian",
        JSON.stringify(target)
    );

    alert(
        "Target harian berhasil disimpan!\nTotal target: " +
        total + " kosakata."
    );

    bukaBelajarCampuran();
}




/* =========================================
   PROGRESS BELAJAR CAMPURAN
========================================= */

function tampilkanProgressCampuran() {
    const tempat = document.getElementById("daftar-progress-campuran");
    if (!tempat) return;

    const kategori = {
        kataKerja: "Kata Kerja",
        kataSifat: "Kata Sifat",
        kataKeterangan: "Kata Keterangan",
        kataTanya: "Kata Tanya",
        kataBenda: "Kata Benda",
        anggotaKeluarga: "Anggota Keluarga",
        caraMenghitung: "Cara Menghitung",
        hariTanggalBulan: "Hari, Tanggal & Bulan",
        salam: "Salam"
    };

    const status = JSON.parse(
        localStorage.getItem("nihongoKosakataStatus") || "{}"
    );

    let html = "";

    for (const kunci in kategori) {
        const daftar = dataKosakata[kunci] || [];

        const hafal = daftar.filter(item =>
            status[`${kunci}::${item.kata}::${item.furigana}`] === "hafal"
        ).length;

        const total = daftar.length;

        html += `
            <div class="progress-kategori">
                <strong>${kategori[kunci]}</strong>
                <p>${hafal}/${total} hafal · Sisa ${total - hafal}</p>
            </div>
        `;
    }

    tempat.innerHTML = html;
}

// ==========================================
// NIHONGO STUDY - KARTU BELAJAR CAMPURAN
// ==========================================

let nsDaftarKartuCampuran = [];
let nsIndexKartuCampuran = 0;
let nsKartuCampuranTerbuka = false;


// Membaca status kosakata
function nsBacaStatusCampuran() {
    try {
        return JSON.parse(
            localStorage.getItem("nihongoKosakataStatus") || "{}"
        );
    } catch (error) {
        console.error("Gagal membaca status kosakata:", error);
        return {};
    }
}


// Membuat identitas kosakata
function nsKunciKartuCampuran(kategori, item) {
    return `${kategori}::${item.kata}::${item.furigana}`;
}


// Memulai kartu Belajar Campuran
function nsMulaiKartuCampuran() {

    const area = document.getElementById("area-kartu-campuran");

    if (!area) return;

    const status = nsBacaStatusCampuran();

    nsDaftarKartuCampuran = [];

    // Mengambil kosakata dari semua kategori
    for (const kategori in dataKosakata) {

        const daftar = dataKosakata[kategori];

        if (!Array.isArray(daftar)) continue;

        daftar.forEach(item => {

            if (!item || !item.kata) return;

            const kunci = nsKunciKartuCampuran(kategori, item);

            // Kosakata yang sudah hafal tidak ditampilkan lagi
            if (status[kunci] === "hafal") return;

            nsDaftarKartuCampuran.push({
                kategori: kategori,
                item: item
            });

        });
    }

    nsIndexKartuCampuran = 0;
    nsKartuCampuranTerbuka = false;

    nsTampilkanKartuCampuran();
}


// Menampilkan satu kartu
function nsTampilkanKartuCampuran() {

    const area = document.getElementById("area-kartu-campuran");

    if (!area) return;

    if (nsIndexKartuCampuran >= nsDaftarKartuCampuran.length) {

        area.innerHTML = `
            <div class="kartu-campuran-selesai">
                <h3>🎉 Selesai Belajar!</h3>
                <p>Semua kartu dalam daftar ini sudah selesai dipelajari.</p>

                <button type="button"
                    onclick="nsMulaiKartuCampuran()">
                    Muat Ulang Kartu
                </button>
            </div>
        `;

        return;
    }

    const data = nsDaftarKartuCampuran[nsIndexKartuCampuran];
    const item = data.item;

    const total = nsDaftarKartuCampuran.length;

    const nomor = nsIndexKartuCampuran + 1;

    const tulisanJepang = nsKartuCampuranTerbuka
        ? buatTampilanFuriganaCampuran(item)
        : (
            /<ruby\b/i.test(String(item.kata))
                ? item.kata
                : amanHTMLKosakata(item.kata)
        );

    area.innerHTML = `

        <div class="kartu-campuran-container">

            <p class="kartu-campuran-nomor">
                Kartu ${nomor} dari ${total}
            </p>

            <div class="kartu-campuran">

                <button type="button"
                    class="kartu-campuran-jepang"
                    onclick="nsBukaKartuCampuran()">

                    ${tulisanJepang}

                    ${nsKartuCampuranTerbuka
                        ? ""
                        : "<span class='petunjuk-kartu'>Ketuk untuk melihat furigana dan arti</span>"
                    }

                </button>

                ${nsKartuCampuranTerbuka ? `
                    <div class="kartu-campuran-arti">
                        ${amanHTMLKosakata(item.arti || "Arti belum tersedia")}
                    </div>
                ` : ""}

            </div>

            <div class="kartu-campuran-tombol">

                <button type="button"
                    class="tombol-belum-hafal"
                    onclick="nsTandaiKartuCampuran('belum')">

                    Belum Hafal
                </button>

                <button type="button"
                    class="tombol-hafal"
                    onclick="nsTandaiKartuCampuran('hafal')">

                    Hafal
                </button>

            </div>

        </div>

    `;
}


// Membuka kartu untuk melihat furigana dan arti
function nsBukaKartuCampuran() {

    nsKartuCampuranTerbuka = true;

    nsTampilkanKartuCampuran();
}


// Menyimpan status dan berpindah kartu
function nsTandaiKartuCampuran(statusBaru) {

    const data = nsDaftarKartuCampuran[nsIndexKartuCampuran];

    if (!data) return;

    const kategori = data.kategori;
    const item = data.item;

    const status = nsBacaStatusCampuran();

    const kunci = nsKunciKartuCampuran(kategori, item);

    // Simpan dengan format yang digunakan website
    status[kunci] = statusBaru;

    localStorage.setItem(
        "nihongoKosakataStatus",
        JSON.stringify(status)
    );

    // Berpindah ke kartu selanjutnya
    nsIndexKartuCampuran++;

    nsKartuCampuranTerbuka = false;

    nsTampilkanKartuCampuran();

    // Perbarui progress jika fungsi tersedia
    if (typeof tampilkanProgressCampuran === "function") {
        tampilkanProgressCampuran();
    }
}

const NS_KEY_JADWAL_ULASAN = "nihongoJadwalUlasHafalan";

// Menghitung kosakata yang sudah waktunya diulas.
function nsHitungUlasanSiap(kategori) {
    const daftar = Array.isArray(dataKosakata[kategori])
        ? dataKosakata[kategori]
        : [];

    const status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    const jadwal = nsBacaPenyimpananKosakata(
        NS_KEY_JADWAL_ULASAN
    );

    const hariIni = nsTanggalSesiKosakata();

    return daftar.filter(item => {
        const id = nsIdKosakata(kategori, item);

        if (status[id] !== "hafal") {
            return false;
        }

        const dataJadwal = jadwal[id];

        return (
            !dataJadwal ||
            !dataJadwal.tanggalBerikutnya ||
            dataJadwal.tanggalBerikutnya <= hariIni
        );
    }).length;
}


/* =========================================
   JADWAL PENGULANGAN HAFALAN
========================================= */

function nsTanggalTambahHariUlas(tanggal, jumlah) {
    const [tahun, bulan, hari] = tanggal.split("-").map(Number);

    const hasil = new Date(
        Date.UTC(tahun, bulan - 1, hari + jumlah)
    );

    return [
        hasil.getUTCFullYear(),
        String(hasil.getUTCMonth() + 1).padStart(2, "0"),
        String(hasil.getUTCDate()).padStart(2, "0")
    ].join("-");
}


/* =========================================
   HALAMAN ULAS HAFALAN
========================================= */

function bukaUlasHafalan(kategori) {
    const tempat = document.getElementById("materi-kosakata");
    if (!tempat) return;

    window.__nihongoKategoriKosakataAktif = kategori;
    window.__nihongoModeKosakata = "ulasan";

    nsJadwalkanResetKosakata();

    const namaKategori = {
        kataKerja: "KATA KERJA",
        kataSifat: "KATA SIFAT",
        kataKeterangan: "KATA KETERANGAN",
        kataTanya: "KATA TANYA",
        kataBenda: "KATA BENDA",
        anggotaKeluarga: "ANGGOTA KELUARGA",
        caraMenghitung: "CARA MENGHITUNG",
        hariTanggalBulan: "HARI, TANGGAL & BULAN",
        salam: "SALAM"
    };

    const daftarAsli = Array.isArray(dataKosakata[kategori])
        ? dataKosakata[kategori]
        : [];

    function aman(teks) {
        return String(teks ?? "").replace(/[&<>"']/g, karakter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[karakter]));
    }

    let status = nsBacaPenyimpananKosakata(
        NS_KEY_STATUS_KOSAKATA
    );

    let jadwal = nsBacaPenyimpananKosakata(
        NS_KEY_JADWAL_ULASAN
    );

    const hariIni = nsTanggalSesiKosakata();

    // Mempertahankan nama subkategori.
    let subkategoriAktif = "";

    const daftarLengkap = daftarAsli.map(item => {
        if (item.subkategori) {
            subkategoriAktif = item.subkategori;
        }

        return {
            ...item,
            labelSubkategori: subkategoriAktif
        };
    });

    // Mengambil kartu yang sudah waktunya diulas.
    const antreanUlasan = daftarLengkap.filter(item => {
        const id = nsIdKosakata(kategori, item);

        if (status[id] !== "hafal") return false;

        const dataJadwal = jadwal[id];

        return (
            !dataJadwal ||
            !dataJadwal.tanggalBerikutnya ||
            dataJadwal.tanggalBerikutnya <= hariIni
        );
    });

    // Jika belum ada kartu yang perlu diulas.
    if (antreanUlasan.length === 0) {
        const jadwalBerikutnya = daftarLengkap
            .filter(item =>
                status[nsIdKosakata(kategori, item)] === "hafal"
            )
            .map(item =>
                jadwal[nsIdKosakata(kategori, item)]?.tanggalBerikutnya
            )
            .filter(tanggal => tanggal && tanggal > hariIni)
            .sort()[0];

        tempat.innerHTML = `
            <div class="kosakata-halaman">

                <button class="kosakata-kembali" id="kembaliUlasan">
                    ← Kembali ke Kategori
                </button>

                <h2>🔄 Ulas Hafalan</h2>

                <p>${aman(namaKategori[kategori] || "KOSAKATA")}</p>

                <div class="kosakata-selesai-harian">
                    <h3>🎉 Semua ulasan selesai!</h3>

                    <p>
                        Belum ada kartu yang perlu diulas sekarang.
                    </p>

                    ${jadwalBerikutnya ? `
                        <p>
                            Ulasan berikutnya:
                            <strong>${aman(jadwalBerikutnya)}</strong>
                        </p>
                    ` : ""}
                </div>

            </div>
        `;

        document.getElementById("kembaliUlasan")
            .addEventListener("click", tampilkanKosakata);

        return;
    }

    let indeks = 0;

    function tampilkanKartuUlasan() {
        if (indeks >= antreanUlasan.length) {
            tempat.innerHTML = `
                <div class="kosakata-halaman">

                    <button class="kosakata-kembali" id="kembaliUlasan">
                        ← Kembali ke Kategori
                    </button>

                    <h2>🎉 Ulasan Selesai!</h2>

                    <div class="kosakata-selesai-harian">
                        <h3>Bagus! Kamu sudah menyelesaikan ulasan.</h3>

                        <p>
                            Kosakata yang masih diingat sudah dijadwalkan
                            untuk diulang kembali.
                        </p>

                        <p>
                            Kosakata yang terlupa sudah dimasukkan
                            kembali ke antrean belajar.
                        </p>
                    </div>

                </div>
            `;

            document.getElementById("kembaliUlasan")
                .addEventListener("click", tampilkanKosakata);

            return;
        }

        const item = antreanUlasan[indeks];
        const id = nsIdKosakata(kategori, item);

        let tampilanArti = "";

        if (kategori === "caraMenghitung") {
            const rincian = String(item.arti || "")
                .split("·")
                .map(teks => teks.trim())
                .filter(Boolean);

            tampilanArti = `
                <div class="kosakata-hitungan-list">
                    ${rincian.map(teks => `
                        <div class="kosakata-hitungan-item">
                            ${aman(teks)}
                        </div>
                    `).join("")}
                </div>
            `;
        } else {
            tampilanArti = `
                <p class="kosakata-arti">
                    ${aman(item.arti)}
                </p>
            `;
        }

        tempat.innerHTML = `
            <div class="kosakata-halaman">

                <button class="kosakata-kembali" id="kembaliUlasan">
                    ← Kembali ke Kategori
                </button>

                <h2>🔄 Ulas Hafalan</h2>

                ${item.labelSubkategori ? `
                    <div class="kosakata-subkategori">
                        ${aman(item.labelSubkategori)}
                    </div>
                ` : ""}

                <div class="kosakata-flashcard-info">
                    Kartu ${indeks + 1} dari ${antreanUlasan.length}
                </div>

                <article
                    class="kosakata-flashcard"
                    id="kartuUlasan"
                    role="button"
                    tabindex="0"
                    aria-expanded="false">

                    <div class="kosakata-kanji" id="ulasanKataAwal">
                        ${aman(item.kata)}
                    </div>

                    <div
                        class="kosakata-kanji"
                        id="ulasanKataBacaan"
                        hidden
                        style="display:none">

                        ${typeof buatHTMLFurigana === "function"
                            ? buatHTMLFurigana(item.kata, item.furigana)
                            : aman(item.kata)}

                    </div>

                    <div
                        id="ulasanArti"
                        hidden
                        style="display:none">

                        ${tampilanArti}

                    </div>

                    <small
                        class="kosakata-petunjuk"
                        id="petunjukUlasan">

                        Coba ingat arti kata ini, lalu klik kartu.

                    </small>

                </article>

                <div
                    id="tombolHasilUlasan"
                    style="
                        display:none;
                        gap:12px;
                        justify-content:center;
                        flex-wrap:wrap;
                        margin-top:18px;
                    ">

                    <button
                        type="button"
                        id="ulasanLupa"
                        style="
                            padding:12px 20px;
                            border:0;
                            border-radius:12px;
                            background:#FFF0F3;
                            color:#A83E62;
                            font-weight:700;
                            cursor:pointer;
                        ">

                        ↻ Lupa

                    </button>

                    <button
                        type="button"
                        id="ulasanIngat"
                        style="
                            padding:12px 20px;
                            border:0;
                            border-radius:12px;
                            background:#E6F6ED;
                            color:#24734B;
                            font-weight:700;
                            cursor:pointer;
                        ">

                        ✓ Masih Ingat

                    </button>

                </div>

            </div>
        `;

        document.getElementById("kembaliUlasan")
            .addEventListener("click", tampilkanKosakata);

        const kartu = document.getElementById("kartuUlasan");
        const kataAwal = document.getElementById("ulasanKataAwal");
        const kataBacaan = document.getElementById("ulasanKataBacaan");
        const arti = document.getElementById("ulasanArti");
        const petunjuk = document.getElementById("petunjukUlasan");
        const tombolHasil = document.getElementById("tombolHasilUlasan");

        // Membuka dan menutup furigana serta arti.
        function bukaKartu() {
            const terbuka =
                kartu.getAttribute("aria-expanded") === "true";

            kartu.setAttribute(
                "aria-expanded",
                String(!terbuka)
            );

            kataAwal.hidden = !terbuka;
            kataAwal.style.display = terbuka ? "" : "none";

            kataBacaan.hidden = terbuka;
            kataBacaan.style.display = terbuka ? "none" : "";

            arti.hidden = terbuka;
            arti.style.display = terbuka ? "none" : "";

            tombolHasil.style.display = terbuka ? "none" : "flex";

            petunjuk.textContent = terbuka
                ? "Coba ingat arti kata ini, lalu klik kartu."
                : "Pilih apakah kamu masih ingat atau lupa.";
        }

        kartu.addEventListener("click", bukaKartu);

        kartu.addEventListener("keydown", function(event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                bukaKartu();
            }
        });

        // MASIH INGAT
        document.getElementById("ulasanIngat")
            .addEventListener("click", function() {
                const intervalHari = [1, 3, 7, 14, 30];

                const dataLama = jadwal[id] || {};
                const levelLama = Math.max(
                    0,
                    Number(dataLama.level) || 0
                );

                const interval = intervalHari[
                    Math.min(levelLama, intervalHari.length - 1)
                ];

                jadwal[id] = {
                    level: Math.min(levelLama + 1, 5),
                    tanggalBerikutnya: nsTanggalTambahHariUlas(
                        nsTanggalSesiKosakata(),
                        interval
                    ),
                    terakhirDiulas: nsTanggalSesiKosakata()
                };

                nsSimpanPenyimpananKosakata(
                    NS_KEY_JADWAL_ULASAN,
                    jadwal
                );

                indeks++;
                tampilkanKartuUlasan();
            });

        // LUPA
        document.getElementById("ulasanLupa")
            .addEventListener("click", function() {
                status[id] = "belum";
                delete jadwal[id];

                nsSimpanPenyimpananKosakata(
                    NS_KEY_STATUS_KOSAKATA,
                    status
                );

                nsSimpanPenyimpananKosakata(
                    NS_KEY_JADWAL_ULASAN,
                    jadwal
                );

                const sesi = nsPastikanSesiKategoriKosakata(kategori);

                if (!sesi.antrean.includes(id)) {
                    sesi.antrean.push(id);
                }

                const semuaSesi = nsBacaPenyimpananKosakata(
                    NS_KEY_SESI_KOSAKATA
                );

                semuaSesi[kategori] = sesi;

                nsSimpanPenyimpananKosakata(
                    NS_KEY_SESI_KOSAKATA,
                    semuaSesi
                );

                indeks++;
                tampilkanKartuUlasan();
            });
    }

    tampilkanKartuUlasan();
}

/* =========================================
   HAMBURGER NAVIGATION
========================================= */

function toggleNavigasiUtama() {
    const header = document.querySelector(".header");
    const tombol = document.getElementById("menuToggle");

    if (!header || !tombol) return;

    const terbuka = header.classList.toggle("menu-terbuka");

    tombol.setAttribute("aria-expanded", String(terbuka));

    tombol.setAttribute(
        "aria-label",
        terbuka ? "Tutup menu navigasi" : "Buka menu navigasi"
    );
}

// Menutup navigasi setelah menu dipilih.
function tutupNavigasiUtama() {
    const header = document.querySelector(".header");
    const tombol = document.getElementById("menuToggle");

    if (!header || !tombol) return;

    header.classList.remove("menu-terbuka");

    tombol.setAttribute("aria-expanded", "false");
    tombol.setAttribute("aria-label", "Buka menu navigasi");
}
/* =========================================
   NIHONGO STUDY - PILIH LEVEL BUNPOU
========================================= */

function pilihLevelBunpou(level) {

    const tempat = document.getElementById("materi-bunpou");

    if (!tempat) return;

    // Pastikan level yang dipilih valid.
    if (!["N5", "N4", "N3"].includes(level)) return;

    // Tandai tombol level yang dipilih.
    document.querySelectorAll(
        "#halaman-bunpou .level-menu button"
    ).forEach(function(btn) {

        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );

    });

    // Tampilkan area materi setelah level dipilih.
    tempat.hidden = false;

    // Tampilkan informasi level.
    tempat.innerHTML = `
        <div class="bunpou-empty">
            <h3>文法 - Bunpou ${level}</h3>
            <p>
                Materi tata bahasa Jepang level ${level}
                akan ditampilkan di sini.
            </p>
        </div>
    `;
}/* =========================================
   NIHONGO STUDY - PILIH LEVEL QUIZ
========================================= */

function pilihLevelQuiz(level) {

    const tempat = document.getElementById("materi-quiz");

    if (!tempat) return;

    // Pastikan level yang dipilih valid.
    if (!["N5", "N4", "N3"].includes(level)) return;

    // Tandai tombol yang dipilih.
    document.querySelectorAll(
        "#halaman-quiz .level-menu button"
    ).forEach(function(btn) {

        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );

    });

    // Tampilkan area materi.
    tempat.hidden = false;

    // Tampilkan informasi level.
    tempat.innerHTML = `
        <div class="quiz-empty">
            <h3>📝 Quiz Bahasa Jepang ${level}</h3>

            <p>
                Soal Quiz ${level} akan ditampilkan di sini.
            </p>

        </div>
    `;
}/* =========================================
   NIHONGO STUDY - PILIH LEVEL DOKKAI
========================================= */

function pilihLevelDokkai(level) {

    const tempat = document.getElementById("materi-dokkai");

    if (!tempat) return;

    // Pastikan level valid.
    if (!["N5", "N4", "N3"].includes(level)) return;

    // Tandai tombol yang dipilih.
    document.querySelectorAll(
        "#halaman-dokkai .level-menu button"
    ).forEach(function(btn) {

        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );

    });

    // Tampilkan area materi setelah level dipilih.
    tempat.hidden = false;

    // Tampilkan informasi level.
    tempat.innerHTML = `
        <div class="dokkai-empty">
            <h3>読解 - Dokkai ${level}</h3>

            <p>
                Materi latihan membaca level ${level}
                akan ditampilkan di sini.
            </p>
        </div>
    `;
}
/* =========================================
   NIHONGO STUDY - PILIH LEVEL KAIWA
========================================= */

function pilihLevelKaiwa(level) {

    const tempat = document.getElementById("materi-kaiwa");

    if (!tempat) return;

    if (!["N5", "N4", "N3"].includes(level)) return;

    // Tandai level yang dipilih.
    document.querySelectorAll(
        "#halaman-kaiwa .level-menu button"
    ).forEach(function(btn) {

        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );

    });

    // Tampilkan tempat materi.
    tempat.hidden = false;

    tempat.innerHTML = `
        <div class="kaiwa-empty">
            <h3>💬 Belajar Kaiwa ${level}</h3>

            <p>
                Materi percakapan bahasa Jepang
                level ${level} akan ditampilkan di sini.
            </p>
        </div>
    `;
}

/* =========================================
   NIHONGO STUDY - PILIH LEVEL JLPT
========================================= */

function tampilkanJLPT(level) {

    const tempat = document.getElementById("materi-jlpt");
    const konten = document.getElementById("konten-jlpt-setelah-level");

    if (!tempat) return;

    // Pastikan level yang dipilih valid.
    const daftarLevel = ["N5", "N4", "N3"];

    if (!daftarLevel.includes(level)) return;

    // Tandai tombol level yang dipilih.
    document.querySelectorAll(
        "#halaman-jlpt .level-menu button"
    ).forEach(function(btn) {

        btn.classList.toggle(
            "active",
            btn.textContent.trim() === level
        );

    });

    // Tampilkan jenis latihan setelah level dipilih.
    if (konten) {
        konten.hidden = false;
    }

    tempat.hidden = false;

    // Tampilkan level yang sudah dipilih.
    tempat.innerHTML = `
        <div class="kanji-card">
            <h3>🌸 Materi JLPT ${level}</h3>

            <p>
                Kamu memilih level ${level}.
            </p>

            <p>
                Silakan pilih jenis latihan yang ingin kamu pelajari.
            </p>
        </div>
    `;
}
