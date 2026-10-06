# Under isen

En fristående, kostnadsfri analysplattform för SHL-fans. Förstå chansskapande,
målutfall och spelet bakom resultaten.

## Webbplats

Projektet är förberett för **GitHub Pages på BuggMedBulle/isbild**.
Koden, SHL-snapshoten, klubbemblemen och publiceringsflödet finns i detta repo.
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

Workflowen bygger på push till main. Den hämtar också matchdata dagligen
22:23 UTC och kan startas manuellt med `refresh_data`. Detta motsvarar00:23
under svensk sommartid och23:23 under svensk vintertid. Efter sena matcher
kan data dröja till nästa körning. Schemalagda GitHub-jobb kan försenas och
inaktiveras efter60 dagars inaktivitet i publika repos; kontrollera Actions.
Knappen i Under isen läser senast publicerade data, inte SHL direkt i webbläsaren.

Sync hämtar nya färdigspelade matcher och korrigeringar för senaste8 dagarna
(max var12h). Tre matcher åt gången. Ofullständigt underlag, orimliga
koordinater eller mål som inte matchar slutresultatet stoppar uppdateringen.
Den tidigare publiceringen behålls vid fel. Modellträning körs inte vid sync.

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
