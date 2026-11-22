
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


function bukaMenu(namaMenu) {
function pilihKategoriKosakata(kunci) {
    const tempat = document.getElementById("materi-kosakata");

    if (!tempat) return;

    const daftar = dataKosakata[kunci] || [];

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

    tempat.innerHTML = `
        <div class="kosakata-halaman">
            <button class="kosakata-kembali" id="kembaliKategori">
                ← Kembali ke Kategori
            </button>

            <h2>${namaKategori[kunci]}</h2>

            <div class="kosakata-list">
                ${
                    daftar.length > 0
                    ? daftar.map(function(item) {
                        return `
                            <article class="kosakata-item">
                                <div class="kosakata-jepang">
                                    <ruby>${item.kata}<rt>${item.furigana}</rt></ruby>
                                </div>
                                <p class="kosakata-arti">${item.arti}</p>
                            </article>
                        `;
                    }).join("")
                    : `<p class="kosakata-empty">Materi akan ditambahkan.</p>`
                }
            </div>
        </div>
    `;

    document.getElementById("kembaliKategori").addEventListener("click", function() {
        tampilkanKosakata();
    });
}

    sembunyikanSemuaHalaman();

    const idMenu = namaMenu.toLowerCase().replace(/\s+/g, "");
    const halaman = document.getElementById("halaman-" + idMenu);

    if (!halaman) return;

    halaman.style.display = "block";

    if (idMenu === "kosakata") {
        tampilkanKosakata();
    }

    document.querySelectorAll(".header nav a").forEach(function(link) {
        link.classList.remove("active");
    });

    const linkAktif = document.querySelector(
        '.header nav a[href="#halaman-' + idMenu + '"]'
    );

    if (linkAktif) linkAktif.classList.add("active");

    if (
        namaMenu !== "Kanji" &&
        namaMenu !== "Kosakata" &&
        namaMenu !== "JLPT"
    ) {
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

const dataKosakata = {

    // A. KATA KERJA
    kataKerja: [
        {
            kata: "会う",
            furigana: "あう",
            arti: "bertemu"
        },
        {
            kata: "開ける",
            furigana: "あける",
            arti: "membuka"
        },
        {
            kata: "浴びる",
            furigana: "あびる",
            arti: "mandi (shower)"
        },
        {
            kata: "歩く",
            furigana: "あるく",
            arti: "berjalan kaki"
        },
        {
            kata: "言う",
            furigana: "いう",
            arti: "mengatakan, bilang"
        },
        {
            kata: "歌う",
            furigana: "うたう",
            arti: "menyanyi"
        }
    ],

    // B. KATA SIFAT
    kataSifat: [],

    // C. KATA KETERANGAN
    kataKeterangan: [],

    // D. KATA TANYA
    kataTanya: [],

    // E. KATA BENDA
    kataBenda: [],

    // F. ANGGOTA KELUARGA
    anggotaKeluarga: [],

    // G. CARA MENGHITUNG
    caraMenghitung: [],

    // H. HARI, TANGGAL & BULAN
    hariTanggalBulan: [],

    // I. SALAM
    salam: []

};/* =========================================
   MENAMPILKAN KOSAKATA JLPT N5
========================================= */
/* =========================================
   PILIH LEVEL KOSAKATA
========================================= */

function pilihLevelKosakata(level) {

    if (level === "N5") {
        tampilkanKosakata();
    } else {
        const tempat = document.getElementById("materi-kosakata");

        tempat.innerHTML = `
            <p class="kosakata-empty">
                Materi ${level} akan ditambahkan.
            </p>
        `;
    }

}
function tampilkanKosakata() {
    const tempat = document.getElementById("materi-kosakata");

    if (!tempat) return;

    const kelompok = [
        { judul: "KATA KERJA", kunci: "kataKerja", ikon: "📝" },
        { judul: "KATA SIFAT", kunci: "kataSifat", ikon: "🌸" },
        { judul: "KATA KETERANGAN", kunci: "kataKeterangan", ikon: "💡" },
        { judul: "KATA TANYA", kunci: "kataTanya", ikon: "❓" },
        { judul: "KATA BENDA", kunci: "kataBenda", ikon: "📚" },
        { judul: "ANGGOTA KELUARGA", kunci: "anggotaKeluarga", ikon: "👨‍👩‍👧" },
        { judul: "CARA MENGHITUNG", kunci: "caraMenghitung", ikon: "🔢" },
        { judul: "HARI, TANGGAL & BULAN", kunci: "hariTanggalBulan", ikon: "📅" },
        { judul: "SALAM", kunci: "salam", ikon: "🌷" }
    ];

    tempat.innerHTML = `
        <div class="kosakata-kategori">
            <h2>Pilih Kategori Kosakata</h2>
            <p>Pilih materi yang ingin kamu pelajari.</p>

            <div class="kosakata-kategori-grid">
                ${kelompok.map(function(grup) {
                    return `
                        <button class="kosakata-kategori-btn"
                            data-kategori="${grup.kunci}">
                            <span>${grup.ikon}</span>
                            <strong>${grup.judul}</strong>
                        </button>
                    `;
                }).join("")}
            </div>
        </div>
    `;

    tempat.querySelectorAll(".kosakata-kategori-btn").forEach(function(tombol) {
        tombol.addEventListener("click", function() {
            pilihKategoriKosakata(this.dataset.kategori);
        });
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

    if (!tempat) return;

    document.querySelectorAll(".kanji-level-buttons button").forEach(
        function(btn) {
            btn.classList.toggle(
                "active",
                btn.textContent.trim() === level
            );
        }
    );

    if (judul) judul.textContent = "Daftar Kanji " + level;

    if (level !== "N5") {
        if (total) total.textContent = "Segera hadir";

        tempat.innerHTML = `
            <div class="kanji-empty">
                <h3>🌸 Kanji ${level}</h3>
                <p>Materi level ini akan ditambahkan nanti.</p>
            </div>
        `;

        tempat.hidden = false;
        return;
    }

    const semuaKanji = daftarKelompokKanji.flatMap(
        kelompok => kelompok.kanji
    );

    if (total) total.textContent = semuaKanji.length + " Kanji";

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

    const detail = document.getElementById("detail-kanji");
    if (detail) detail.hidden = true;

    tempat.hidden = false;

    // Terapkan kembali pencarian setelah grid dibuat
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

document.addEventListener("DOMContentLoaded", function() {
    tampilkanKanji("N5");
});

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

// Memilih level JLPT
function pilihLevelFlashcard(level) {
    levelFlashcardAktif = level;
    flashcardTerbuka.clear();
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

// Tampilkan Flashcard pertama kali
tampilkanFlashcard();


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

// Tampilkan Flashcard pertama kali
tampilkanFlashcard();
