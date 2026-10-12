# Under isen

En fristående, kostnadsfri analysplattform för fans av SHL och Hockeyallsvenskan. Förstå chansskapande,
målutfall och spelet bakom resultaten.

## Webbplats

Projektet är förberett för **GitHub Pages på BuggMedBulle/isbild**.
Koden, snapshots för båda ligorna, klubbemblemen och publiceringsflödet finns i detta repo.
Ingen extern server, databas, OpenAI API eller betald datatjänst behövs.

## Funktioner

- Lagöversikt med chansbild, målutfall, xG, Corsi och ligaplacering i urvalet.
- Senaste5/10 eller hela säsongen, hemma/borta, sparat favoritlag på enheten.
- SHL-jämförelse, hypotetisk xG-tabell och jämförelse mellan två lag.
- Matchanalys med tidslinje, målmarkeringar, periodfilter och tryckbar skottkarta.
- Delbara länkar med valt lag och match.
- Öppen metod, modelltest och kalibrering.
- Originalemblem hämtade från SHL:s bildtjänst (se data/club-assets.json).

## Publicera

1. Skapa ett **publikt**, tomt GitHub-repo med namnet `isbild` på BuggMedBulle.
2. Lägg projektfilerna på `main` (inklusive `.github/workflows/pages.yml`).
3. I repots **Settings → Pages**, välj **Source: GitHub Actions**.
4. Kör **Actions → Publish Under isen → Run workflow**. Avmarkera `refresh_data`
   om du vill publicera den medföljande, verifierade snapshoten direkt.
5. Efter en lyckad körning visas den faktiska webbplatslänken i deployment-jobbet.

Vissa repo-/kontopolicies kan kräva att Actions och GitHub Pages godkänns.
Aktivera **Read and write permissions** under **Settings → Actions → General →
Workflow permissions** om repoägda datauppdateringar blockeras av kontopolicyn.
Ingen personlig access token behöver läggas i repo eller frontend.

Standardrunners för publika repos är gratis. Workflowen använder ubuntu-latest
utan större betalda runners, paketregister eller cache. Pages-artefakten sparas
bara en dag. GitHub- och SHL-tjänsternas tillgänglighet och gränser gäller.

## Uppdateringar

Workflowen bygger på push till main. Den hämtar matchdata för båda ligorna
varje kväll kl. 22:00 svensk tid och kontrollerar igen kl. 00:23. Svensk
sommar- och vintertid följs. Körningen kan också startas manuellt med
`refresh_data`. Efter sena matcher kan data dröja till nästa körning.
Schemalagda GitHub-jobb kan försenas och inaktiveras efter 60 dagars
inaktivitet i publika repos; kontrollera Actions. Knappen i Under isen
läser senast publicerade data, inte ligornas tjänster direkt i webbläsaren.

SHL-sync hämtar nya färdigspelade matcher och korrigeringar för senaste
8 dagarna (max var 12h), tre matcher åt gången. Ofullständigt underlag,
orimliga koordinater eller mål som inte matchar slutresultatet stoppar
uppdateringen. Hockeyallsvenskans separata verifiering och databegränsningar
beskrivs nedan. Den tidigare publiceringen behålls vid fel. Modellträning
körs inte vid sync.

## Utveckla lokalt

Node24 och pnpm11.25 behövs.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

`dist/` innehåller hela den statiska webbplatsen. Relativa assetlänkar fungerar
både på projektsökvägen `/isbild/` och eget domännamn. Lag och matcher använder
queryparametrar så direktlänkar fungerar utan serveromskrivningar.

## Integritet

Favoritlag och visningsinställningar sparas på enheten. Egen import stannar i
minnet för besöket; exportera en JSON-kopia innan sidan stängs. Inga personliga
importer överförs från den tidigare privata Under isen-versionen till GitHub.

## Analysens begränsningar

xG-modellen är experimentell och använder avstånd, vinkel, sidled och möjlig
retur. Tränad på80 matcher2025/26, testad på20 senare matcher; inga matcher från
2026/27 i träningen. Alla spelformer tillsammans eftersom spelarantal saknas
per skott. Ordinarie tid och båda målvakterna på isen; straffslag exkluderas.
Ingen motstånds- eller matchställningsjustering. xG är inte vinstsannolikhet.

Klubbemblem och SHL-matchdata är tredjepartsinnehåll. Inga rättigheter till
klubbarnas varumärken överförs. Under isen är inte en officiell SHL-tjänst.

## xG-tabellen

I varje match ger högre oavrundat xG3 poäng. Exakt lika xG ger1 poäng till
vardera laget. Ingen hypotetisk förlängning eller straffläggning antas.
Tabellen använder alla matcher med statistik för alla spelformer under
den valda säsongen och modellen, oberoende av lagets senaste5/10-filter.
Verkliga poäng och jämförelseplacering räknas på samma matcher. Poäng,
målskillnad och gjorda mål används för jämförelseordningen; helt lika
lag delar placering. Detta är ett scenario, inte statistiskt förväntade poäng.


## Official powerplay and penalty killing

The PP & BP view uses SHL’s public Statnet statistics API for season 2026/27 (ssgt `qa98unlbd6`). Run `pnpm sync:special-teams` after `pnpm sync:shl`. Both source tables must cover all 14 teams and agree with snapshot game counts. Percentages are checked against counts, and league-wide PP goals, opportunities, shots and seconds must equal opponents’ PK totals. A failed fetch or validation retains the prior snapshot. Scheduled updates publish both snapshots together.

This view is full-season, all venues, using official source scope (including overtime and empty-net situations). It deliberately has no last-five or venue filters: the official API applies last-X before location, unlike the existing Under isen selection. Do not silently substitute one selection for another. Per-60 figures use actual PP/PK time; zero denominators are displayed as missing. xG by strength and five-on-five xG remain unavailable until strength is verified for every shot.


## Game Score v0.4 – officiell istid och spelaridentitet

På match- och spelarsidorna visas ett **rått individuellt offensivt bidrag**:
`0.75 * goals + 0.70 * firstAssists + 0.55 * secondAssists + 0.50 * ixG`.
Vikterna hämtas från https://hockeysiffror.se/blog/playercards. Under isens egen
xG-modell används. Detta är **inte Hockeysiffrors Game Score**, inte ett totalbetyg,
inte per 60 och inte mål över genomsnittet. Alla spelformer summeras under
ordinarie tid med båda målvakterna på isen. Mer istid och fler matcher kan ge ett
högre värde. Noll är inget registrerat offensivt bidrag, inte ligagenomsnittet.

Första-/andraassist hämtas explicit från SHL:s `assists.first`/`assists.second`
på inkluderade målhändelser. Spelare utan avslut men med assist inkluderas.
Målvakter med verifierad identitet filtreras bort. SHL:s stabila numeriska spelar-ID och klubb används som spelarnyckel när ID finns,
med namn som reserv för äldre/importerade underlag. Målhändelsernas `pop`/`nep`,
assist och utvisningar kopplas också med spelar-ID för att undvika dubletter från
olika stavningar av samma namn.
Gamla snapshots får streck tills `playerDataVersion: 1` har hämtats. Ofullständiga
assistuppgifter ger inget bidragsvärde för lagets urval; okända värden blir inte noll.
Matcher med händelser är inte officiellt GP.

Full Game Score återstår: on-ice Corsi, verifierad istid och ixG per spelform,
positionsbaserade referensvärden, komplett defensiv och relativ lagjustering. SHL:s
`players_extendedMetrics` gav en tom lista för säsong `qa98unlbd6` vid kontroll
2026-10-09. Artikeln publicerar inte en fullständig normaliserings-/blandningsformel.
Defensiv beta: `-0.50 * goalsAgainstOnIce - 0.15 * personalPenaltyMinutes`.
Den gemensamma målvikten är vår förenkling, inte Hockeysiffrors positions- och
spelformsvikter. Score summerar denna del, det individuella offensiva bidraget och lagoffensiven.
Lagoffensiv: `+0.50 * goalsForOnIce`, även utan eget mål eller assist.
Mål framåt hämtas från `pop`, med det egna lagets verifierade målvakt bortfiltrerad.
Unika namn, rimligt antal spelare och målskyttens närvaro krävs.
`onIceForData.version: 1` och full lagvis täckning krävs. Ett saknat `pop`
gör lagoffensiv och total score otillgängliga, men individuellt bidrag kan visas.
+0.50 och −0.50 är symmetriska egna betavikter, inte Hockeysiffrors fulla modell.
Baklängesmål tillskrivs namngivna utespelare i SHL:s `nep` vid inkluderade mål,
med verifierad målvakt bortfiltrerad. Personliga utvisningsminuter hämtas från
`variant`; lagstraff tillskrivs inte spelaren som sitter av dem. Tom bur,
förlängning och utvisningar vid slutsignalen utesluts. `defenseData.version: 1`
och lagvis komplett täckning krävs; saknade mål-/utvisningsuppgifter ger streck.
Inget värde uppskattas från plus/minus eller antal blockar. Noll betyder inga
registrerade avdrag, inte genomsnittlig defensiv. Istid, roll och medspelare
påverkar starkt och måttet identifierar inte individuellt ansvar för mål.
`tests/game-score.mjs` verifierar vikter, assistkorrigeringar, matchurval och
att saknat underlag inte omvandlas till noll.

### Officiell spelarstatistik – integrerad 2026-10-12

`lib/player-source.ts` hämtar `gameday/player-stats/<match-uuid>` och verifierar
provider, båda lagens spelarlistor, unika ID:n, period/lagtillhörighet samt att
spelarlistans mål summerar till rätt slutresultat (med korrigering för straffavgörande).
Matchistid, position och blockade skott lagras i `officialPlayers.version: 1`.
Matcher med verifierad istid inkluderar även spelare utan andra händelser.
Matcher med istid är en härledd räkning av matcher med TOI > 0, inte officiellt GP.
Spelar- och matchsidan visar officiell istid separat från betan och erbjuder
sortering på istid. Okänd tid eller blockerade skott blir null, aldrig noll.
Saknad matchtäckning ger ingen summerad officiell istid eller matchräkning.

Officiell TOI inkluderar förlängning och tom målbur. Den används därför **inte**
för att normalisera betans snävare urval. Blockerade skott läggs inte in som
ersättning för on-ice Corsi. Om optional matchstatistik är felaktig behålls övriga
verifierade matchhändelser och ett explicit fel sparas; felaktiga spelaruppgifter
publiceras inte. Den saknade matchstatistiken prövas igen vid nästa synk.

Efter hämtning 2026-10-12 verifierades 54 av 55 matcher. Match `mcz9uhgh1f`
har en avvikelse mellan spelarlistans mål och slutresultatet; den behandlas som
saknad officiell spelarstatistik. Aktuellt `players_extendedMetrics` ger fortsatt
HTTP 200 med tom lista. `gameday/periodstats` och initial-events gav HTTP 500
för kontrollmatchen. Ingen verifierad källa till kompletta bytesintervall hittades.

Full Game Score är fortfarande blockerad av aktuell on-ice Corsi och exakt
matchad istid per spelform. Först efter att dessa finns kan per-60,
positionsreferenser och relativ lagjustering beräknas med samma urval.

### Datakartläggning för komplett Game Score – 2026-10-11

Verifierat genom anonyma HTTP-anrop till SHL:s publika API, utan betaltjänst.
Den tidigare formuleringen att istid saknas avsåg vår import, inte att SHL saknar uppgifterna.

| Underlag | Verifierad källa | Resultat / begränsning |
| --- | --- | --- |
| Individuell istid per match, position, blockerade skott | `https://www.shl.se/api/gameday/player-stats/zmrkc06ec8` | `TOI`, `POS`, `BkS`, spelar-ID och namn finns. Charles Hudon 15:34 mot Örebro 8 oktober. |
| Sammanlagd istid och PP/BP-istid per match i snitt | `players_timeOnIce` | 318 rader: `TOI`, `TOI_GP`, `PPTOI_GP`, `SHTOI_GP`, position och stabilt UUID. |
| Lika styrka: istid och mål på isen | `players_equalStrength` | 318 rader: `ESTOI_GP`, `ESPlus`, `ESMinus` samt individuella mål, assist och skott. |
| PP: istid och mål på isen | `players_powerplay` | `PPTOI_GP`, `PPPlus`, `PPMinus` finns. |
| BP: istid och mål på isen | `players_penaltykilling` | `SHTOI_GP`, `SHPlus`, `SHMinus` finns. |
| Blockerade skott och position | `players_defensive` | `BkS`, `info.position` finns. Blockar ersätter inte on-ice Corsi. |
| On-ice Corsi | `players_extendedMetrics` | HTTP 200 men tom lista för 2026/27. Samma modul ger 407 rader med `CF`/`CA` för 2025/26 (`ssgtUuid=iuzqg7dqk9`, `state=closed`). Inte noll eller bevis för att endpointen saknas. |
| Vilka spelare som var inne vid varje skott | `gameday/play-by-play` | Granskad match innehåller skytt och position men ingen komplett on-ice-lista vid vanliga skott; `pop`/`nep` finns vid mål. |

Statistikmodulerna ligger under `https://www.shl.se/api/statistics-v2/stats-info/`
med `ssgtUuid=qa98unlbd6&provider=statnet&count=500&moduleType=<modul>&state=active`.
Använd modulnamnet utan `players_` i `moduleType`.

Stabila spelar-ID:n och officiell matchistid är integrerade. Matchuppdelad
istid per spelform återstår. Säsongsgenomsnitt (avrundade mm:ss) får inte multipliceras till
påstått exakt matchistid. Officiell TOI omfattar även situationer som vår råa beta
utesluter; beta får inte delas med den istiden och kallas en jämförbar per-60-modell.
För full defensiv saknas fortfarande verifierad on-ice Corsi eller kompletta
bytesintervall. Matchade urval, positionsreferenser och relativ lagjustering återstår.
Hockeysiffrors artikel specificerar inte den exakta blandningen mellan relativ form
och per 60, så även med data behöver vår fulla modell dokumenteras som en egen tolkning.

### Hockeyallsvenskan

Liga väljs med SHL/Hockeyallsvenskan-växlaren. `liga=ha` ingår i delade länkar; lag och favorit sparas separat för varje liga. Hockeyallsvenskan använder sin officiella publika statistik och riktiga klubbemblem. `pnpm sync:ha` verifierar samtliga spelade resultat, täckningen för lag/spelare/målvakter, matchantal, mål och special teams innan båda snapshotfilerna ersätts. Misslyckad hämtning behåller föregående publicerade version.

HA:s nuvarande publika `play-by-play` innehåller skott, mål, assist och målvaktsbyten men **inga skottpositioner**. Därför beräknas inte xG, GSAx, skottkartor, xG-tabell eller offensivt bidrag för HA. Saknade värden visas som — och förklaras i gränssnittet. Säsongsstatistiken följer ligans officiella urval inklusive förlängning. Spelar- och målvaktsstatistik per match använder ett separat verifierat urval: ordinarie tid med båda målvakterna på isen. Saknad målvaktsidentitet gör matchstatistiken otillgänglig.

GitHub Actions uppdaterar båda ligorna varje kväll kl. 22:00 svensk tid, med nattlig kontroll kl. 00:23. Den dagliga kvällskörningen täcker även Hockeyallsvenskans andra matchdagar. Inga betalda tjänster krävs.
