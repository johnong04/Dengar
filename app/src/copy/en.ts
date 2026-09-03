/**
 * EVERY user-facing string in the app, in English. This file is the shape: `ms.ts` is typed
 * `Copy = typeof en`, so a key that exists here and not there is a compile error, and vice versa.
 *
 * ─── WHAT IS AND IS NOT IN HERE ────────────────────────────────────────────────────────────────
 * IN: prose, labels, headings, button text, accessibility labels, mono captions that contain words.
 *
 * OUT, deliberately, and each for a reason a translator may not undo:
 *   · **Arithmetic and derived figures.** `16,000 Hz × 5.0 s × 4 B`, `€9.36 ÷ €1.23 = 7.6×`,
 *     `USD 679 × 51.0%` and every other derivation string is COMPUTED in `lib/impact.ts` /
 *     `data/roadmap.ts` from the same constants as the value it sits beside. A translated copy of
 *     one of those strings would be a second, unlinked source that can silently stop matching its
 *     own result — the correctness-surface defect CLAUDE.local.md names, not a copy defect. They
 *     stay computed, in one language, and they read identically in BM.
 *   · **Proper nouns and identifiers.** Dengar, Aedes, Aedes aegypti, Setapak, Taman Melati, B3–B5,
 *     D-MOSS, OpenStreetMap, DHD-SPK-04.
 *   · **Units and scientific symbols.** kHz, dB, cm, mm, km², h, d, %, °.
 *   · **Timestamps.** `TUE 12 AUG · 07:04` and `14 AUG 07:04` are one derived clock
 *     (`store/dispatch.ts` re-cuts `district.stamp` by regex, and `FOG_BY_STAMP` is that stamp plus
 *     48 h). Localising the day/month abbreviations would fork a value three screens agree on.
 *     Flagged in the handoff as a deliberate gap.
 *
 * Nothing here may breach specs.md §2's language table — never scan / nearby / ambient / survey,
 * in either language. The lookup makes that sweep one grep over one directory.
 */

export const en = {
  common: {
    brand: 'Dengar',
    simulated: 'simulated',
    privacy: 'privacy',
    back: 'Back',
    backToCapture: 'Back to capture',
    backToDistrict: 'Back to district',
    yes: 'yes',
    no: 'no',
    language: 'Language',
    languageEn: 'English',
    languageMs: 'BM',
  },
  nav: {
    listen: 'Listen',
    area: 'Area',
    history: 'History',
  },

  capture: {
    micOnDevice: 'on-device',
    micRecording: 'recording · on-device',
    micAnalyzing: 'analyzing · on-device',
    micReady: 'mic ready · on-device',
    listenA11y: 'Listen for 5 seconds',
    listen: 'Listen',
    analyzing: 'reading wingbeat…',
    headline: 'Identify the mosquito\nthat found you',
    cancel: 'Cancel',
    guidance: 'Hold your phone within 10 cm.\nTrapped under a glass works best.',
    guidanceSpec: '16 kHz · mono · band-SNR gate armed',
    history: 'History',
    area: 'Area',
    tally: (week: number) => `${week} this week`,
    tallyQueued: (week: number, queued: number) => `${week} this week · ${queued} queued offline`,
    nodeInvite: 'Have an old phone? Set it up as a static node',
  },

  onboarding: {
    skip: 'Skip',
    continue: 'Continue',
    allowMic: 'Allow microphone',
    continueAnyway: 'Continue anyway',
    back: 'Back',
    denied:
      'Microphone access was declined, so Dengar can’t read a wingbeat yet. You can enable it in Settings whenever you’re ready — the rest of the app works without it.',
    beat1Kicker: 'why dengar exists',
    beat1Heading: 'Fogging arrives two\nto three weeks late',
    beat1Body:
      'Case-triggered fogging chases reports of people already sick — the vector moved in weeks before. But the mosquito announces itself first, in the whine you already know.',
    beat1Line: 'Dengue is heard before it’s felt.',
    beat2Heading: 'Wingbeats are\nspecies-specific',
    beat2BodyA:
      'Every mosquito species beats its wings at its own frequency — a signature your phone’s microphone can read.',
    beat2BodyB:
      'Hold your phone within 10 cm — a hand’s width. That sounds close, but Aedes hunts humans: the mosquito that found you is already in range. Five seconds, judged on the phone.',
    beat3Heading: 'Analyzed here,\nnever uploaded',
    beat3Body:
      'The recording is judged on your phone and never leaves it. When Dengar can’t make a confident call, the clip is deleted. Everything works in airplane mode.',
    beat4Heading: 'The microphone\nis the instrument',
    beat4Body:
      'Dengar records only when you press Listen — five seconds, judged on the phone. The microphone is how a wingbeat is read; without it the instrument is silent.',
  },

  result: {
    back: 'Result',
    trustTag: 'nothing kept',
    trustLine: 'Nothing was saved; nothing left your phone.',
    audioKept: 'Audio kept',
    audioKeptValue: 'no',
    audioKeptSuffix: '· deleted on device',
    eventScore: 'Event score',
    bandSnr: 'Band SNR',
    speciesCall: 'Species call',
    floor: (v: string) => `/ floor ${v}`,
    usable: '· usable',
    passed: '· passed',
    notJudged: '· not judged',
    species: 'Species',
    sex: 'Sex',
    gravid: 'Gravid',
    /**
     * The sex head reports a bare token ('female' / 'male'). It arrives from the model through the
     * route params, so it is mapped here rather than stored translated — an unknown token passes
     * through untouched instead of being dropped or guessed at.
     */
    sexValue: (v: string) => v,
    noMosquitoHeadline: 'No mosquito\nin this recording',
    noMosquitoBody:
      'The clip carried no wingbeat signature. Most recordings end here — a clean no is what keeps the map honest.',
    noMosquitoGuidance: 'Get within 10 cm — under a glass is ideal',
    notConfidentHeadline: 'Wingbeat heard —\nspecies unresolved',
    notConfidentBody:
      "A mosquito was close enough to hear, but the species call didn't clear its floor. This is the one worth retrying — inside 10 cm the signature sharpens fast.",
    notConfidentGuidance: 'Get closer — hold within 10 cm — and listen again',
    tooNoisyHeadline: 'Too loud here\nto hear a wingbeat',
    tooNoisyBody:
      'Background sound drowned the wingbeat band before the models could judge it. Refusing beats guessing — a wrong call here would put bad data on the map.',
    tooNoisyGuidance: 'Move away from the fan, traffic or TV, then listen again',
    listenAgain: 'Listen again',
    done: 'Done',
    aedesVerdict: 'Aedes.',
    aedesBody: 'The mosquito that found you\ncarries dengue.',
    confident: 'confident',
    whyThisMatters: 'why this matters',
    aedesStakes:
      "Logging this puts one more point on your district's map. Fourteen detections in 72 hours is what sends a fogging truck.",
    logDetection: 'Log detection',
    discard: 'Discard',
    notAedesHeadline: 'Not a dengue\nvector',
    notAedesBody:
      "The wingbeat was clear enough to judge, and it isn't an Aedes. Logging it still helps your district's map — knowing where the vector isn't is data too.",
  },

  history: {
    back: 'History',
    recorded: (n: number) => `${n} recorded`,
    aedes: 'Aedes',
    notAedes: 'Not Aedes',
    queued: 'queued',
    species: 'Species',
    sex: 'Sex',
    gravid: 'Gravid',
    recordedRow: 'Recorded',
    sync: 'Sync',
    synced: 'synced',
    queuedOffline: 'queued offline',
    today: 'today',
    yesterday: 'yesterday',
    months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    emptyHeadline: "Your detections build\nyour district's map.",
    emptyBody: 'The first one starts the moment\na mosquito finds you.',
    emptyCta: 'Identify the mosquito that found you',
  },

  sync: {
    syncing: (n: number) => `syncing ${n}…`,
    offline: (n: number) => `offline · ${n} queued`,
  },

  node: {
    kicker: 'static node · second capture mode',
    heading: 'Give an old phone\na second job',
    body: 'Almost every house has a dead phone in a drawer. Plugged in beside a breeding site, it becomes a permanent listening post at no hardware cost.',
    step1:
      'Find the lure: standing water, or a dark container in the shade. Aedes comes to it on its own.',
    step2:
      'Lay the phone face-up a hand’s width above the water — 5 cm, the geometry the accuracy was measured at.',
    step3: 'Leave it on the charger. Dusk through dawn is the strongest window.',
    placementSpec: '≈5 cm above the lure · mains power',
    honest: 'A node hears what arrives at the spot you put it on — one place, not a room.',
    privacyBody:
      'Every clip is judged on this phone, then deleted. No audio is uploaded — only a count and a species, once you’re online.',
    start: 'Start the node',
    demoSpeed: 'simulated · demo speed',
    listening: 'node listening · on-device',
    detection: 'detection',
    detections: 'detections',
    leaveHere: 'Leave this phone here',
    elapsed: 'elapsed',
    battery: 'battery',
    stop: 'Stop the node',
  },

  area: {
    title: 'Your area',
    basemapA11y: (district: string) => `OpenStreetMap basemap of ${district}`,
    riskRaised: 'Raised',
    riskWatch: 'Watch',
    riskLow: 'Low',
    answer: (hours: number) =>
      `Aedes was confirmed in your neighbourhood in the last ${hours} hours, by people who identified the mosquito that found them.`,
    tally: (count: number, hours: number, rainMm: number) =>
      `${count} detections · ${hours} h · +${rainMm} mm rain`,
    shading: (hours: number) => `shaded by block · ${hours} h`,
    privacyBody: (metres: number) =>
      `Detections are rounded to a block of about ${metres} m before anyone sees them — never to a street or a home.`,
    privacySpec: 'block level · no address, no dot on a house',
    actionsHeading: 'What actually helps',
    prevention1: 'Empty pot trays, pails and buckets.',
    prevention2: 'Cover the water tanks and drums you cannot empty.',
    prevention3: 'Check gutters and roof drains once a week.',
    prevention4: 'Use repellent in the morning and late afternoon.',
    prevention4Why: 'Aedes aegypti bites in daylight, not at dusk.',
    whenNow: 'now',
    whenWeekly: 'weekly',
    whenDaylight: 'daylight',
    cta: 'Identify the mosquito that found you',
  },

  roadmap: {
    mark: 'roadmap',
    markV3: 'roadmap · v3',
    backFrom: (title: string) => `Back from ${title}`,
    privacyLabel: 'Privacy',
    detailLabel: 'Fine-grained',
    impactLabel: 'Impact',

    privacyHeadline: 'Your audio never\nleft this device.',
    privacyStanding:
      'Not built yet. This is the architecture the offline capture already implies — written out, so you can check it rather than trust it.',
    whatMoves: 'what moves',
    staysHere: 'stays here',
    clipWhat: 'The 5.0 s recording. Held long enough to read the wingbeat, then dropped.',
    wouldLeave: 'would leave',
    updateWhat:
      'A model update — one number per model weight. No audio, no transcript, no fragment of one.',
    sameSize:
      'Every update is the same size, because it is the same shape as the model. A payload that grew with what you recorded would be carrying something about it.',
    onDeviceTraining: 'on-device training',
    trainingWaiting: 'waiting · runs while charging',
    trainingBody:
      'The phone would train on its own recordings overnight and send only what it learned. The recordings stay where they were made.',
    updateLog: 'encrypted update log',
    sent: (kind: string) => `sent: ${kind}`,
    modelUpdateOnly: 'model update only',
    seededRounds: 'three seeded rounds · no round has run',

    detailHeadline: 'Which one it was,\nand whether she fed.',
    detailStanding:
      'Not built yet. The result screen already renders these fields whenever a head reports one — today none do, so this is what they would say.',
    reading: 'reading',
    verdict: (score: string) => `verdict · ${score}`,
    headSpecies: 'Species',
    headSex: 'Sex',
    headGravid: 'Gravid',
    sexFemale: 'female',
    whySpecies: 'The named species, not the aedes / not-aedes bucket the verdict is built on.',
    whySex: 'Only females bite. A male at your ear is noise, not risk.',
    whyGravid: 'A female that has already fed is the one that can carry dengue into her next bite.',
    statusInContract: 'optional head · in the contract',
    statusNoHead: 'no model head exists for this yet',
    whyItMatters: 'why it matters',
    detailWhyA:
      'Only female mosquitoes bite — males never feed on blood. And a female only carries dengue onward once she has fed on someone who had it. Species, sex and feeding state are three different levels of urgency, and the verdict alone cannot tell them apart.',
    detailWhyB: 'An officer deciding where a fogging truck goes is acting on that difference.',
    evidenceHeading: 'what the evidence supports',
    evidenceSpeciesSex: 'Species + sex together, controlled conditions',
    evidenceFourSpecies: 'Four species, controlled conditions',
    evidenceOutdoor: 'The same task under outdoor noise',
    evidenceNote:
      'Published for a mosquito held within 10 cm of the microphone. The drop from a quiet room to a noisy street is the honest limit, and it is why the app refuses more often than it answers.',

    impactHeadline: 'What your taps\nadd up to.',
    impactStanding:
      'Not built yet — there is no fleet behind this, only your own log. Every derived figure below shows the arithmetic that produced it.',
    contributed: 'contributed',
    detectionLogged: 'detection logged',
    detectionsLogged: 'detections logged',
    wasAedes: 'was Aedes',
    wereAedes: 'were Aedes',
    contributedNote:
      "Counted from this device's log, which is seeded for the demo. This is the only figure on the screen that is a count rather than an estimate.",
    districtExtent: 'district extent',
    mapFootprint: 'Map sheet footprint',
    boundsNote: 'bounds: Setapak sheet · OpenStreetMap z15',
    extentNote:
      "The bundled map sheet's own footprint — geometry, not a coverage claim. Nobody is watching all of it.",
    costHeading: 'what surveillance costs at that extent',
    citizenReports: 'Citizen reports',
    ovitraps: 'Ovitraps, same area',
    difference: 'Difference',
    costNote:
      'Per-km² rates come from the Mosquito Alert comparison. The multiplication is ours, which is why it is printed.',
    caseCostHeading: 'what one dengue case costs',
    perCase: 'Per case, Malaysia',
    lostWages: 'Of that, lost wages',
    daysLost: 'Days lost per case',
    workSchool: 'work · school',
    casesAverted: 'Cases averted',
    notShown: 'not shown',
    casesAvertedReason:
      'No figure in our evidence base links a detection to a prevented case. We would have to invent the multiplier, so we do not print one.',
    tagFootnote:
      '[cited] figures come from the project evidence base. [modeled] figures are our arithmetic on those, shown in full. Nothing that could not be derived appears at all.',
  },

  officer: {
    kpiDetections: 'Detections',
    kpiClusters: 'Clusters',
    kpiNodes: 'Nodes',
    fogWithin48: 'Fog within 48 h',
    acknowledge: 'Acknowledge',
    legendDetections: 'detections',
    legendRain: 'rain mm',
    legendProjected: 'cases · projected',
    today: 'today',
    projectedNotMeasured: 'projected, not measured',
    hourByDay: 'Hour × day',
    watchAreas: 'Watch areas',
    alertFeed: 'Alert feed ›',
    alertFeedA11y: 'Open the alert feed',

    alertsTitle: 'Alerts',
    filterAll: 'All',
    filterActive: 'Active',
    filterAcknowledged: 'Acknowledged',
    stateDirective: 'directive issued',
    stateAcknowledged: 'acknowledged',
    stateWatch: 'watch',
    rowA11y: (name: string, state: string, count: number, hours: number) =>
      `${name}, ${state}, ${count} detections in ${hours} hours`,
    silent: (delta: string) => `silent ${delta}`,
    countWindow: (count: number, hours: number, delta: string) =>
      `${count} / ${hours} h · ${delta}`,
    emptyFilter: 'Nothing in this filter',
    emptyActive: 'no directive awaiting a signature',
    emptyAcknowledged: 'no directive has been acknowledged',
    feedFoot: (areas: number, hours: number) =>
      `${areas} watch areas · ${hours} h window · seeded district`,
    dispatchLog: 'Dispatch log',
    directiveIssued: 'Directive issued',
    acknowledged: 'Acknowledged',
    awaitingAck: 'Awaiting acknowledgement',
    notYetSigned: 'not yet signed',
    foggingDue: 'Fogging due',
    withinIssue: (blocks: string) => `${blocks} · within 48 h of issue`,

    band24: '< 24 h',
    band48: '48 h',
    band72: '72 h',
    rain: 'Rain',
    countHours: (count: number, hours: number) => `${count} / ${hours} h`,
    noCluster: 'No cluster · monitoring',
    deltaOn72: (delta: string) => `${delta} on 72 h`,
    noDirective: ' · no fogging directive',

    directiveAcknowledged: 'Directive acknowledged',
    signed: 'Signed',
    overdue: 'overdue',
    remaining: (h: number, m: string) => `${h} h ${m} m`,
    fogBy: (stamp: string) => `fog by ${stamp}`,
    ofWindow: (hours: number) => `of the ${hours} h window`,
    foggingScheduled: (blocks: string, area: string) => `Fogging scheduled · ${blocks}, ${area}`,

    forecastTitle: 'Prediction timeline',
    forecastKicker: (district: string, days: number) => `${district} · ${days}-day outlook`,
    perDayAt7: 'Detections per day · +7 d',
    modelledRange: 'modelled range',
    dmoss: 'A faster input layer for D-MOSS, not a rival forecast.',
    legendBand: 'band · modelled',
    inputs: 'Inputs',
    detectionDensity: 'Detection density',
    rainfallSameWindow: 'Rainfall, same window',
    rainfallNote: 'Rainfall selects the edge to plan against; it does not scale the numbers.',
    howBandDrawn: 'How the band is drawn',
    floor: 'Floor',
    floorAssumption: 'The last 72 h rate holds.',
    ceiling: 'Ceiling',
    ceilingAssumption: 'The measured 72 h growth runs one more window, then holds.',
    bandNote:
      'Modelled, not measured. Growth is never compounded past the window it was measured over, so the ceiling is a bound rather than a path.',
    caseNotification: (from: number, to: number) =>
      `Case notification sees this ${from}–${to} d later.`,
    caseNotificationNote:
      'Every forecast is limited by how late its input arrives. This is the input arriving earlier.',

    dispatchTitle: 'Surgical dispatch',
    dispatchKicker: (area: string, detections: number, hours: number) =>
      `${area} · ${detections} / ${hours} h`,
    foggingTargets: 'Fogging targets',
    det: (n: number) => `${n} det`,
    dispatchOrder: 'Dispatch order',
    priorityNote:
      'Priority = detections weighted by recency (< 24 h ×3 · 48 h ×2 · 72 h ×1). A declared modelling choice, not a sourced figure.',
    footprint: 'Footprint',
    blanket: 'Blanket',
    targeted: 'Targeted',
    blocks: (n: number) => `${n} blocks`,
    ofTheGround: 'of the ground',
    costPerCaseAverted: 'Cost per case averted',
    lowerThanBlanket: 'lower than blanket',
    costAssumption:
      'Assumes fogging cost scales with ground covered, and that both sorties avert the same cases.',
    whereMoney: 'Where the money is · specs §9',
    ledgerNational: 'national vector-control programme',
    ledgerDistrict: 'district level, primarily fogging',
    ledgerFogging: 'fogging inside the DHD cost per case',
    ledgerReleased: 'released — ground the truck never enters',
    ledgerProgramme: 'what one case costs the programme',
    ledgerInput: 'input layer — citizen science against ovitraps, per km² / month',
    notClaimed:
      'Cases averted is still an open term — specs §11 item 3. This screen sizes the cost, not the effect.',
  },
};

export type Copy = typeof en;
