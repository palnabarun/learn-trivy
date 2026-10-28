# Learn Trivy

A visual field guide to Trivy, Trivy Operator, databases, checks, and node collection.
The site adapts the teaching structure of [Learn Agent Substrate](https://learn.agentsubstrate.dev/): start with a system map, trace complete flows, then explore components.

The guide includes 27 lessons, four interactive flows, four labs, and 23 glossary terms.
You can search lesson text, answer questions, copy commands, and save completion marks in your browser.
Each lesson links to official documentation.
The core chapters follow concrete inputs through the system.
The image chapter reconstructs the `libcrypto3` finding from package metadata, Alpine advisory records, and a historical Trivy report.
The Operator chapter follows a two-container workload through scan execution, publication, ownership, and a rollout.
The node chapter follows a kubelet permission into `NodeInfo` and the `KCV-0073` result.
Technical sections cite their supporting source and distinguish versioned documentation from rolling references.

## Study the architecture

Select Architecture in depth in the sidebar or use the architecture link on the home page.
The six chapters cover system boundaries, scan-engine internals, Operator controllers, data and caches, node policies, and deployment tradeoffs.
The diagrams link subsystems to their chapters and retain text descriptions for each boundary.

Engine symbols use the published Trivy 0.75.0 API.
Operator symbols use the published 0.35.0 API, while configuration examples cite the 0.30.1 documentation.
Collector types use the historical 0.6.0 API.
These views do not claim a tested deployment of those versions together.
The chapters distinguish published interfaces from inferred composition and hypothetical capacity estimates.

## Open the guide

Use Node.js 20 or later.
The site has no package dependencies, so you do not need to run `npm install`.
Run this command from the repository directory:

```sh
npm run build
```

Open `dist/learn-trivy.html` in your browser.
This file contains the application, styles, course content, icon, and downloadable lab fixture.
It works without a server or an internet connection, except when you follow external source links.

For local development, run this command from the repository directory:

```sh
npm run dev
```

Open `http://localhost:5173/trivy/`.
You can select another port with `npm run dev -- --port 3000` or the `PORT` environment variable.
The server binds to your local machine.

## Publish the guide

The production address is `https://learn.nabarun.dev/trivy/`.
Connect the GitHub repository to Vercel to publish the guide.
The included `vercel.json` selects `npm run build`, publishes `dist/`, and redirects `/` to `/trivy/`.
Vercel also redirects `/trivy` to `/trivy/` so relative asset URLs resolve correctly.

The build puts the application and its lab fixtures in `dist/trivy/`.
Publishing `dist/` places the guide at the required subpath.
The offline edition remains at `dist/learn-trivy.html`.
The root HTML file also links and redirects to the guide for other static hosts.

Use these steps after pushing this directory to a GitHub repository:

1. Import the repository into Vercel.
2. Select **Other** as the framework preset and keep the repository root as the project root.
3. Deploy with the build command and output directory from `vercel.json`.
4. Add `learn.nabarun.dev` under the Vercel project's **Domains** page.
5. At your DNS provider, add the record that Vercel shows for `learn.nabarun.dev`.

Use the DNS target shown for this project.
The custom domain field takes `learn.nabarun.dev`; the build supplies the `/trivy/` path.
See [Vercel project configuration](https://vercel.com/docs/project-configuration/vercel-json) and [custom domains](https://vercel.com/docs/domains/working-with-domains/add-a-domain).

Lessons retain their hash routes, such as `https://learn.nabarun.dev/trivy/#/architecture`.
Assets and downloads use relative URLs within `/trivy/`.
Unknown file paths return 404 instead of the application HTML.

Run `npm run preview` after a build to serve the deployment layout at `http://localhost:5173/trivy/`.
The development server uses the same path.

## Edit the guide

The source files have separate responsibilities:

- `site/content.mjs` contains lessons, source references, glossary entries, and learning paths.
- `site/deep-dives.mjs` expands the mechanisms, evidence, failure paths, and worked examples for those lessons.
- `site/architecture.mjs` contains the architecture chapters, boundary diagrams, and versioned API references.
- `site/app.mjs` renders pages and handles interactions.
- `site/styles.css` defines responsive layouts and both themes.
- `site/labs/` contains local exercise fixtures.
- `scripts/` contains the build, local server, and optional browser test.
- `tests/` contains content integrity and application logic tests.

Keep lesson identifiers stable so saved progress and links remain useful.
Add source references when you change factual claims.
The build copies the source site and creates the self-contained edition.

## Test the guide

Run the dependency-free tests from the repository directory:

```sh
npm test
```

The tests cover navigation, internal references, fixture files, shell syntax, rendered routes, search, map selection, quiz feedback, and saved progress.
Deployment tests exercise `/trivy/`, redirects, module imports, downloads, and missing assets without opening a network socket.
They also parse the self-contained build and test recovery from malformed browser storage.
The rendering tests use a small DOM adapter and do not assess browser layout.
They also make sure that diagram participants, section references, downloadable files, recorded fixture hashes, and displayed policy code agree.

The local configuration experiments require Trivy:

```sh
npm run test:labs
```

The runners evaluate custom rules, compare privileged-container findings, and test package discovery and node evidence.
They use fresh temporary caches and disable local configuration and ignore files.
They do not pull images or access Kubernetes.

The recorded results in `site/labs/verification.json` came from Trivy 0.75.0.
The custom rule detects both missing and empty team labels.
The passing custom fixture still returns unrelated built-in findings, which the guide explains.

The package and node experiments are recorded in `site/labs/evidence-observations.json`.
The package fixture contains metadata without a library binary.
Trivy still identifies the package, and removing its package database removes the inventory entry.
The node fixtures return `PASS`, `FAIL`, and `PASS` for permission arrays `[600]`, `[644]`, and `[]`.
The empty array is synthetic missing input, not an observed collector failure.
The experiment runner compares its outputs and fixture hashes with the saved record.
It requires the recorded Trivy version, currently 0.75.0.

For a real browser test, install Playwright in your development environment:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
```

The browser test exercises desktop and mobile interactions against the self-contained edition.
It saves screenshots in `test-results/`.
You can use an existing installation through `PLAYWRIGHT_MODULE` and an existing Chrome executable through `CHROME_EXECUTABLE`.

The local server returned a permission error, and Chrome failed to start in the restricted build session.
The dependency-free tests ran, but the browser test and visual inspection remain unverified in that session.
The image and Kubernetes lab commands were not executed against a registry or cluster during this revision.

## Content scope

The documentation research date is October 28, 2026.
The Sources page records the official references and explains version limits.
The command `gh repo view aquasecurity/trivy` returned `error connecting to api.github.com` in the restricted shell.
This establishes a failure of that access path, not a GitHub outage or an authorization denial.
The guide uses official documentation, Alpine advisory records, and published Go package documentation.
It does not claim a repository checkout or source-code audit.

Operator mechanisms use versioned 0.30.1 documentation where available.
The guide marks proposals, historical report samples, illustrative data, and local observations separately.
The diagrams explain documented responsibilities and handoffs rather than unverified internal call sequences.
Match command flags and defaults to your installed release.
This is an independent learning guide, not an official Aqua Security publication.

The site does not execute Trivy or access a cluster.
Labs explain prerequisites, expected observations, and relevant cleanup.
The privileged Pod fixture is only for local scanning and must not be applied to a cluster.
