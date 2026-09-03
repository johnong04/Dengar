/**
 * Bahasa Malaysia.
 *
 * ⚠ MACHINE-DRAFTED, NOT VERIFIED BY A NATIVE SPEAKER. CLAUDE.local.md is explicit that this
 * project is pitched to a regional panel; machine-drafted health copy reads wrong to exactly that
 * audience. Every string below needs a human pass before the video or the submission. It is here
 * because the MECHANISM (keyed lookup, `useCopy()`, persisted toggle, BM layout at 390) is what
 * slice 18 delivers — the words are a placeholder of the right shape and roughly the right length.
 *
 * Conventions held to deliberately:
 *   · **Units are not translated** — h, d, cm, mm, km², kHz, dB, %, °. They are international, and
 *     several of them arrive already formatted from `data/` and `lib/impact.ts`, so translating the
 *     ones written here would make one screen disagree with itself.
 *   · **Arithmetic strings are not in this file at all.** See the header of `en.ts`.
 *   · **specs.md §2's language table binds these strings too.** Never "imbas kawasan",
 *     "tinjau sekitar", "pemantauan ambien" or any phrasing implying the phone surveys the air.
 *     The sanctioned frame is "kenal pasti nyamuk yang menemui anda" — the mosquito comes to you.
 *   · Headlines carry their own `\n`, retuned for BM's longer words rather than copied from `en`.
 */

import type { Copy } from './en';

export const ms: Copy = {
  common: {
    brand: 'Dengar',
    simulated: 'simulasi',
    privacy: 'privasi',
    back: 'Kembali',
    backToCapture: 'Kembali ke rakaman',
    backToDistrict: 'Kembali ke daerah',
    yes: 'ya',
    no: 'tidak',
    language: 'Bahasa',
    languageEn: 'English',
    languageMs: 'BM',
  },
  nav: {
    listen: 'Dengar',
    area: 'Kawasan',
    history: 'Rekod',
  },

  capture: {
    micOnDevice: 'dalam telefon',
    micRecording: 'merakam · dalam telefon',
    micAnalyzing: 'menganalisis · dalam telefon',
    micReady: 'mikrofon sedia · dalam telefon',
    listenA11y: 'Dengar selama 5 saat',
    listen: 'Dengar',
    analyzing: 'membaca kepakan…',
    headline: 'Kenal pasti nyamuk\nyang menemui anda',
    cancel: 'Batal',
    guidance: 'Dekatkan telefon dalam 10 cm.\nPaling baik di bawah gelas.',
    guidanceSpec: '16 kHz · mono · get band-SNR sedia',
    history: 'Rekod',
    area: 'Kawasan',
    tally: (week: number) => `${week} minggu ini`,
    tallyQueued: (week: number, queued: number) =>
      `${week} minggu ini · ${queued} menunggu luar talian`,
    nodeInvite: 'Ada telefon lama? Jadikan ia nod tetap',
  },

  onboarding: {
    skip: 'Langkau',
    continue: 'Teruskan',
    allowMic: 'Benarkan mikrofon',
    continueAnyway: 'Teruskan juga',
    back: 'Kembali',
    denied:
      'Akses mikrofon ditolak, jadi Dengar belum boleh membaca kepakan sayap. Anda boleh membenarkannya dalam Tetapan bila-bila masa — selebihnya aplikasi ini berfungsi tanpa mikrofon.',
    beat1Kicker: 'kenapa dengar wujud',
    beat1Heading: 'Semburan tiba\ndua hingga tiga\nminggu lewat',
    beat1Body:
      'Semburan yang dicetuskan oleh kes mengejar laporan orang yang sudah pun jatuh sakit — vektornya masuk berminggu sebelum itu. Tetapi nyamuk memperkenalkan dirinya dahulu, melalui dengungan yang anda sudah kenal.',
    beat1Line: 'Denggi didengar sebelum ia dirasa.',
    beat2Heading: 'Kepakan sayap\nkhusus bagi\nsetiap spesies',
    beat2BodyA:
      'Setiap spesies nyamuk mengepakkan sayapnya pada frekuensinya sendiri — satu tandatangan yang boleh dibaca oleh mikrofon telefon anda.',
    beat2BodyB:
      'Dekatkan telefon dalam 10 cm — selebar tapak tangan. Bunyinya rapat, tetapi Aedes memburu manusia: nyamuk yang menemui anda sudah pun berada dalam jarak itu. Lima saat, dinilai dalam telefon.',
    beat3Heading: 'Dianalisis di sini,\ntidak dimuat naik',
    beat3Body:
      'Rakaman dinilai dalam telefon anda dan tidak pernah meninggalkannya. Apabila Dengar tidak dapat membuat keputusan yang yakin, klip itu dipadam. Semuanya berfungsi dalam mod pesawat.',
    beat4Heading: 'Mikrofon ialah\nalat pengukurnya',
    beat4Body:
      'Dengar merakam hanya apabila anda menekan Dengar — lima saat, dinilai dalam telefon. Mikrofon ialah cara kepakan sayap dibaca; tanpanya alat ini senyap.',
  },

  result: {
    back: 'Keputusan',
    trustTag: 'tiada disimpan',
    trustLine: 'Tiada apa disimpan; tiada apa meninggalkan telefon anda.',
    // Shorter than a literal rendering of "Audio kept / no / · deleted on device" on purpose: the
    // faithful BM version wrapped BOTH halves of this readout row at 390, which the EN row does not
    // do. The "in this phone" half of the claim is already carried by the trust block directly
    // above it on every abstain screen, so the row keeps the part only it can say.
    audioKept: 'Audio',
    audioKeptValue: 'tidak disimpan',
    audioKeptSuffix: '· dipadam',
    eventScore: 'Skor peristiwa',
    bandSnr: 'SNR jalur',
    speciesCall: 'Panggilan spesies',
    floor: (v: string) => `/ paras ${v}`,
    usable: '· boleh guna',
    passed: '· lulus',
    notJudged: '· tidak dinilai',
    species: 'Spesies',
    sex: 'Jantina',
    gravid: 'Bunting',
    sexValue: (v: string) => (v === 'female' ? 'betina' : v === 'male' ? 'jantan' : v),
    noMosquitoHeadline: 'Tiada nyamuk\ndalam rakaman ini',
    noMosquitoBody:
      'Klip ini tidak membawa tandatangan kepakan sayap. Kebanyakan rakaman berakhir di sini — satu "tidak" yang bersih itulah yang menjaga ketepatan peta.',
    noMosquitoGuidance: 'Dekatkan dalam 10 cm — bawah gelas paling baik',
    notConfidentHeadline: 'Kepakan didengar —\nspesies tidak pasti',
    notConfidentBody:
      'Seekor nyamuk cukup dekat untuk didengar, tetapi panggilan spesiesnya tidak melepasi parasnya. Inilah yang berbaloi dicuba semula — dalam 10 cm tandatangannya menjadi tajam dengan cepat.',
    notConfidentGuidance: 'Dekatkan lagi — dalam 10 cm — dan dengar semula',
    tooNoisyHeadline: 'Terlalu bising\nuntuk dengar kepakan',
    tooNoisyBody:
      'Bunyi latar menenggelamkan jalur kepakan sayap sebelum model sempat menilainya. Menolak lebih baik daripada meneka — keputusan yang salah di sini akan meletakkan data buruk pada peta.',
    tooNoisyGuidance: 'Jauhi kipas, lalu lintas atau TV, kemudian dengar semula',
    listenAgain: 'Dengar semula',
    done: 'Selesai',
    aedesVerdict: 'Aedes.',
    aedesBody: 'Nyamuk yang menemui anda\nmembawa denggi.',
    confident: 'yakin',
    whyThisMatters: 'kenapa ini penting',
    aedesStakes:
      'Merekodkannya menambah satu titik lagi pada peta daerah anda. Empat belas pengesanan dalam 72 jam itulah yang menghantar trak semburan.',
    logDetection: 'Rekod pengesanan',
    discard: 'Buang',
    notAedesHeadline: 'Bukan vektor\ndenggi',
    notAedesBody:
      'Kepakan sayapnya cukup jelas untuk dinilai, dan ia bukan Aedes. Merekodkannya tetap membantu peta daerah anda — mengetahui di mana vektor itu tiada juga satu data.',
  },

  history: {
    back: 'Rekod',
    recorded: (n: number) => `${n} direkod`,
    aedes: 'Aedes',
    notAedes: 'Bukan Aedes',
    queued: 'menunggu',
    species: 'Spesies',
    sex: 'Jantina',
    gravid: 'Bunting',
    recordedRow: 'Dirakam',
    sync: 'Segerak',
    synced: 'disegerak',
    queuedOffline: 'menunggu luar talian',
    today: 'hari ini',
    yesterday: 'semalam',
    months: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
    emptyHeadline: 'Pengesanan anda membina\npeta daerah anda.',
    emptyBody: 'Yang pertama bermula saat\nseekor nyamuk menemui anda.',
    emptyCta: 'Kenal pasti nyamuk yang menemui anda',
  },

  sync: {
    syncing: (n: number) => `menyegerak ${n}…`,
    offline: (n: number) => `luar talian · ${n} menunggu`,
  },

  node: {
    kicker: 'nod tetap · mod rakaman kedua',
    heading: 'Beri telefon lama\ntugas kedua',
    body: 'Hampir setiap rumah ada telefon mati dalam laci. Dipasang pada pengecas di sebelah tapak pembiakan, ia menjadi pos pendengaran tetap tanpa kos perkakasan.',
    step1:
      'Cari umpannya: air bertakung, atau bekas gelap di tempat teduh. Aedes datang kepadanya sendiri.',
    step2:
      'Letakkan telefon menghadap ke atas selebar tapak tangan di atas air — 5 cm, geometri yang ketepatannya diukur.',
    step3: 'Biarkan pada pengecas. Senja hingga subuh ialah tempoh paling kuat.',
    placementSpec: '≈5 cm di atas umpan · kuasa sesalur',
    honest: 'Nod mendengar apa yang tiba di tempat ia diletakkan — satu tempat, bukan satu bilik.',
    privacyBody:
      'Setiap klip dinilai dalam telefon ini, kemudian dipadam. Tiada audio dimuat naik — hanya kiraan dan spesies, sebaik anda dalam talian.',
    start: 'Mulakan nod',
    demoSpeed: 'simulasi · kelajuan demo',
    listening: 'nod mendengar · dalam telefon',
    detection: 'pengesanan',
    detections: 'pengesanan',
    leaveHere: 'Tinggalkan telefon di sini',
    elapsed: 'berlalu',
    battery: 'bateri',
    stop: 'Hentikan nod',
  },

  area: {
    title: 'Kawasan anda',
    basemapA11y: (district: string) => `Peta asas OpenStreetMap bagi ${district}`,
    riskRaised: 'Tinggi',
    riskWatch: 'Awas',
    riskLow: 'Rendah',
    answer: (hours: number) =>
      `Aedes disahkan di kejiranan anda dalam ${hours} jam lepas, oleh orang yang mengenal pasti nyamuk yang menemui mereka.`,
    tally: (count: number, hours: number, rainMm: number) =>
      `${count} pengesanan · ${hours} h · +${rainMm} mm hujan`,
    shading: (hours: number) => `berlorek mengikut blok · ${hours} h`,
    privacyBody: (metres: number) =>
      `Pengesanan dibundarkan kepada blok kira-kira ${metres} m sebelum sesiapa melihatnya — tidak pernah kepada jalan atau rumah.`,
    privacySpec: 'peringkat blok · tiada alamat, tiada titik pada rumah',
    actionsHeading: 'Apa yang benar-benar membantu',
    prevention1: 'Kosongkan dulang pasu, baldi dan tong.',
    prevention2: 'Tutup tangki dan tong air yang tidak boleh dikosongkan.',
    prevention3: 'Periksa longkang bumbung sekali seminggu.',
    prevention4: 'Guna penghalau nyamuk pada waktu pagi dan lewat petang.',
    prevention4Why: 'Aedes aegypti menggigit pada waktu siang, bukan senja.',
    whenNow: 'sekarang',
    whenWeekly: 'mingguan',
    whenDaylight: 'siang',
    cta: 'Kenal pasti nyamuk yang menemui anda',
  },

  roadmap: {
    mark: 'hala tuju',
    markV3: 'hala tuju · v3',
    backFrom: (title: string) => `Kembali dari ${title}`,
    privacyLabel: 'Privasi',
    detailLabel: 'Terperinci',
    impactLabel: 'Impak',

    privacyHeadline: 'Audio anda tidak\npernah meninggalkan\nperanti ini.',
    privacyStanding:
      'Belum dibina. Inilah seni bina yang sudah tersirat daripada rakaman luar talian — ditulis keluar, supaya anda boleh menyemaknya dan bukan sekadar mempercayainya.',
    whatMoves: 'apa yang bergerak',
    staysHere: 'kekal di sini',
    clipWhat:
      'Rakaman 5.0 s itu. Disimpan cukup lama untuk membaca kepakan sayap, kemudian dilepaskan.',
    wouldLeave: 'akan keluar',
    updateWhat:
      'Kemas kini model — satu nombor bagi setiap pemberat model. Tiada audio, tiada transkrip, tiada serpihannya.',
    sameSize:
      'Setiap kemas kini bersaiz sama, kerana ia berbentuk sama dengan model itu. Muatan yang membesar mengikut apa yang anda rakam bermakna ia membawa sesuatu tentangnya.',
    onDeviceTraining: 'latihan dalam peranti',
    trainingWaiting: 'menunggu · berjalan semasa mengecas',
    trainingBody:
      'Telefon akan berlatih pada rakamannya sendiri pada waktu malam dan menghantar hanya apa yang dipelajarinya. Rakaman itu kekal di tempat ia dibuat.',
    updateLog: 'log kemas kini disulitkan',
    sent: (kind: string) => `dihantar: ${kind}`,
    modelUpdateOnly: 'kemas kini model sahaja',
    seededRounds: 'tiga pusingan bertanam · tiada pusingan berjalan',

    detailHeadline: 'Yang mana satu,\ndan adakah dia\nsudah menghisap.',
    detailStanding:
      'Belum dibina. Skrin keputusan sudah memaparkan medan ini setiap kali ada kepala model melaporkannya — hari ini tiada satu pun, jadi inilah yang akan dikatakannya.',
    reading: 'bacaan',
    verdict: (score: string) => `keputusan · ${score}`,
    headSpecies: 'Spesies',
    headSex: 'Jantina',
    headGravid: 'Bunting',
    sexFemale: 'betina',
    whySpecies:
      'Spesies yang dinamakan, bukan baldi aedes / bukan-aedes yang mendasari keputusan itu.',
    whySex: 'Hanya betina menggigit. Jantan di telinga anda ialah bunyi, bukan risiko.',
    whyGravid:
      'Betina yang sudah menghisap darah itulah yang boleh membawa denggi ke gigitan seterusnya.',
    statusInContract: 'kepala pilihan · ada dalam kontrak',
    statusNoHead: 'belum ada kepala model untuk ini',
    whyItMatters: 'kenapa ia penting',
    detailWhyA:
      'Hanya nyamuk betina menggigit — jantan tidak pernah menghisap darah. Dan betina hanya membawa denggi seterusnya setelah ia menghisap darah orang yang menghidapinya. Spesies, jantina dan keadaan penghisapan ialah tiga tahap kesegeraan yang berbeza, dan keputusan sahaja tidak dapat membezakannya.',
    detailWhyB:
      'Pegawai yang menentukan ke mana trak semburan pergi sedang bertindak atas perbezaan itu.',
    evidenceHeading: 'apa yang disokong bukti',
    evidenceSpeciesSex: 'Spesies + jantina bersama, keadaan terkawal',
    evidenceFourSpecies: 'Empat spesies, keadaan terkawal',
    evidenceOutdoor: 'Tugas yang sama dalam bunyi luar',
    evidenceNote:
      'Diterbitkan bagi nyamuk yang dipegang dalam 10 cm dari mikrofon. Penurunan daripada bilik senyap kepada jalan bising itulah had yang jujur, dan itulah sebabnya aplikasi ini lebih kerap menolak daripada menjawab.',

    impactHeadline: 'Apa hasil\nketukan anda.',
    impactStanding:
      'Belum dibina — tiada armada di sebalik ini, hanya rekod anda sendiri. Setiap angka terbitan di bawah menunjukkan aritmetik yang menghasilkannya.',
    contributed: 'disumbangkan',
    detectionLogged: 'pengesanan direkod',
    detectionsLogged: 'pengesanan direkod',
    wasAedes: 'ialah Aedes',
    wereAedes: 'ialah Aedes',
    contributedNote:
      'Dikira daripada rekod peranti ini, yang ditanam untuk demo. Inilah satu-satunya angka pada skrin ini yang merupakan kiraan dan bukan anggaran.',
    districtExtent: 'luas daerah',
    mapFootprint: 'Jejak helaian peta',
    boundsNote: 'sempadan: helaian Setapak · OpenStreetMap z15',
    extentNote:
      'Jejak helaian peta yang dibundelkan itu sendiri — geometri, bukan dakwaan liputan. Tiada sesiapa memerhati kesemuanya.',
    costHeading: 'kos pengawasan pada luas itu',
    citizenReports: 'Laporan orang awam',
    ovitraps: 'Ovitrap, kawasan sama',
    difference: 'Beza',
    costNote:
      'Kadar per km² datang daripada perbandingan Mosquito Alert. Pendarabannya milik kami, sebab itu ia dicetak.',
    caseCostHeading: 'kos satu kes denggi',
    perCase: 'Setiap kes, Malaysia',
    lostWages: 'Daripada itu, gaji hilang',
    daysLost: 'Hari hilang setiap kes',
    workSchool: 'kerja · sekolah',
    casesAverted: 'Kes dielakkan',
    notShown: 'tidak ditunjuk',
    casesAvertedReason:
      'Tiada angka dalam asas bukti kami menghubungkan satu pengesanan dengan satu kes yang dicegah. Kami terpaksa mereka pendarabnya, jadi kami tidak mencetak satu pun.',
    tagFootnote:
      'Angka [cited] datang daripada asas bukti projek. Angka [modeled] ialah aritmetik kami ke atasnya, ditunjukkan sepenuhnya. Apa yang tidak dapat diterbitkan langsung tidak muncul.',
  },

  officer: {
    kpiDetections: 'Pengesanan',
    kpiClusters: 'Kelompok',
    kpiNodes: 'Nod',
    fogWithin48: 'Sembur dalam 48 h',
    acknowledge: 'Akui terima',
    legendDetections: 'pengesanan',
    legendRain: 'hujan mm',
    legendProjected: 'kes · unjuran',
    today: 'hari ini',
    projectedNotMeasured: 'unjuran, bukan ukuran',
    hourByDay: 'Jam × hari',
    watchAreas: 'Kawasan diawasi',
    alertFeed: 'Suapan amaran ›',
    alertFeedA11y: 'Buka suapan amaran',

    alertsTitle: 'Amaran',
    filterAll: 'Semua',
    filterActive: 'Aktif',
    filterAcknowledged: 'Diakui',
    stateDirective: 'arahan dikeluarkan',
    stateAcknowledged: 'diakui terima',
    stateWatch: 'awasi',
    rowA11y: (name: string, state: string, count: number, hours: number) =>
      `${name}, ${state}, ${count} pengesanan dalam ${hours} jam`,
    silent: (delta: string) => `senyap ${delta}`,
    countWindow: (count: number, hours: number, delta: string) =>
      `${count} / ${hours} h · ${delta}`,
    emptyFilter: 'Tiada apa dalam penapis ini',
    emptyActive: 'tiada arahan menunggu tandatangan',
    emptyAcknowledged: 'tiada arahan telah diakui terima',
    feedFoot: (areas: number, hours: number) =>
      `${areas} kawasan diawasi · tetingkap ${hours} h · daerah bertanam`,
    dispatchLog: 'Log penghantaran',
    directiveIssued: 'Arahan dikeluarkan',
    acknowledged: 'Diakui terima',
    awaitingAck: 'Menunggu akuan terima',
    notYetSigned: 'belum ditandatangan',
    foggingDue: 'Semburan tertunggak',
    withinIssue: (blocks: string) => `${blocks} · dalam 48 h dari keluaran`,

    band24: '< 24 h',
    band48: '48 h',
    band72: '72 h',
    rain: 'Hujan',
    countHours: (count: number, hours: number) => `${count} / ${hours} h`,
    noCluster: 'Tiada kelompok · memantau',
    deltaOn72: (delta: string) => `${delta} pada 72 h`,
    noDirective: ' · tiada arahan semburan',

    directiveAcknowledged: 'Arahan diakui terima',
    signed: 'Ditandatangan',
    overdue: 'lewat',
    remaining: (h: number, m: string) => `${h} h ${m} m`,
    fogBy: (stamp: string) => `sembur sebelum ${stamp}`,
    ofWindow: (hours: number) => `daripada tetingkap ${hours} h`,
    foggingScheduled: (blocks: string, area: string) => `Semburan dijadualkan · ${blocks}, ${area}`,

    forecastTitle: 'Garis masa ramalan',
    // "unjuran", not "tinjauan": the latter is BM for a survey, and specs §2 bans survey language
    // on every string even where — as here — the English ("outlook") never implied one.
    forecastKicker: (district: string, days: number) => `${district} · unjuran ${days} hari`,
    perDayAt7: 'Pengesanan sehari · +7 d',
    modelledRange: 'julat model',
    dmoss: 'Lapisan input yang lebih pantas untuk D-MOSS, bukan ramalan saingan.',
    legendBand: 'jalur · model',
    inputs: 'Input',
    detectionDensity: 'Ketumpatan pengesanan',
    rainfallSameWindow: 'Hujan, tetingkap sama',
    rainfallNote: 'Hujan memilih tepi mana untuk dirancang; ia tidak menskala nombornya.',
    howBandDrawn: 'Bagaimana jalur dilukis',
    floor: 'Lantai',
    floorAssumption: 'Kadar 72 h terakhir kekal.',
    ceiling: 'Siling',
    ceilingAssumption: 'Pertumbuhan 72 h yang diukur berjalan satu tetingkap lagi, kemudian kekal.',
    bandNote:
      'Model, bukan ukuran. Pertumbuhan tidak pernah dikompaun melepasi tetingkap yang mengukurnya, jadi siling itu satu batas dan bukan satu laluan.',
    caseNotification: (from: number, to: number) =>
      `Pemberitahuan kes melihat ini ${from}–${to} d kemudian.`,
    caseNotificationNote:
      'Setiap ramalan dihadkan oleh betapa lewatnya inputnya tiba. Inilah input yang tiba lebih awal.',

    dispatchTitle: 'Semburan bersasar',
    dispatchKicker: (area: string, detections: number, hours: number) =>
      `${area} · ${detections} / ${hours} h`,
    foggingTargets: 'Sasaran semburan',
    det: (n: number) => `${n} psn`,
    dispatchOrder: 'Urutan penghantaran',
    priorityNote:
      'Keutamaan = pengesanan diwajarkan mengikut kebaruan (< 24 h ×3 · 48 h ×2 · 72 h ×1). Satu pilihan model yang diisytihar, bukan angka bersumber.',
    footprint: 'Jejak',
    blanket: 'Menyeluruh',
    targeted: 'Bersasar',
    blocks: (n: number) => `${n} blok`,
    ofTheGround: 'daripada kawasan',
    costPerCaseAverted: 'Kos setiap kes dielakkan',
    lowerThanBlanket: 'lebih rendah daripada menyeluruh',
    costAssumption:
      'Menganggap kos semburan berskala dengan kawasan diliputi, dan kedua-dua misi mengelakkan kes yang sama.',
    whereMoney: 'Di mana wangnya · specs §9',
    ledgerNational: 'program kawalan vektor kebangsaan',
    ledgerDistrict: 'peringkat daerah, terutamanya semburan',
    ledgerFogging: 'semburan dalam kos DHD setiap kes',
    ledgerReleased: 'dilepaskan — kawasan yang trak tidak pernah masuki',
    ledgerProgramme: 'kos satu kes kepada program',
    ledgerInput: 'lapisan input — sains warga berbanding ovitrap, per km² / bulan',
    notClaimed:
      'Kes dielakkan masih satu terma terbuka — specs §11 perkara 3. Skrin ini menyukat kosnya, bukan kesannya.',
  },
};
