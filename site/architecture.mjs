const archSection = (id, title, paragraphs, evidence, extra = {}) => ({ id, title, paragraphs, evidence, ...extra });
const archCode = (text, label, language = 'text') => ({ text, label, language });
const archTable = (caption, headers, rows) => ({ caption, headers, rows });
const archExercise = (prompt, answer) => ({ prompt, answer });
const archQuiz = (question, options, answer, explanation) => ({ question, options, answer, explanation });
const archChapter = (id, title, short, minutes, description, takeaway, sections, quiz) => ({
  id, title, short, minutes, description, takeaway, level: 'Architecture', sections, quiz,
  sources: [...new Set(sections.flatMap(s => s.evidence))],
});

export const architectureSources = {
  archArtifact: { title: 'Artifact and Reference contracts', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/fanal/artifact', version: 'Trivy 0.75.0 · Go API' },
  archAnalyzer: { title: 'Analyzer groups, inputs, and post-analysis', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/fanal/analyzer', version: 'Trivy 0.75.0 · Go API' },
  archFanalTypes: { title: 'BlobInfo, ArtifactInfo, and ArtifactDetail', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/fanal/types', version: 'Trivy 0.75.0 · Go API' },
  archCache: { title: 'Analysis cache interfaces', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/cache', version: 'Trivy 0.75.0 · Go API' },
  archApplier: { title: 'Layer application and merged evidence', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/fanal/applier', version: 'Trivy 0.75.0 · Go API' },
  archScan: { title: 'Scan service and Backend interface', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/scan', version: 'Trivy 0.75.0 · Go API' },
  archLocal: { title: 'Local scan service and its dependencies', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/scan/local', version: 'Trivy 0.75.0 · Go API' },
  archReport: { title: 'ScanResponse, Result, and Report types', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy@v0.75.0/pkg/types', version: 'Trivy 0.75.0 · Go API' },
  archOpControllers: { title: 'Workload and scan-Job controller APIs', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy-operator@v0.35.0/pkg/vulnerabilityreport/controller', version: 'Operator 0.35.0 · Go API' },
  archOpPlugin: { title: 'Scanner plugin and report builders', url: 'https://pkg.go.dev/github.com/aquasecurity/trivy-operator@v0.35.0/pkg/vulnerabilityreport', version: 'Operator 0.35.0 · Go API' },
  archOpSettings: { title: 'Plugin ConfigMaps and Secrets', url: 'https://aquasecurity.github.io/trivy-operator/v0.30.1/settings/', version: 'Operator 0.30.1 · configuration' },
  archOpRevision: { title: 'Workload revision and vulnerability scans', url: 'https://aquasecurity.github.io/trivy-operator/v0.30.1/docs/vulnerability-scanning/', version: 'Operator 0.30.1 · design' },
  archCollector: { title: 'Collector, Info, and Node types', url: 'https://pkg.go.dev/github.com/aquasecurity/k8s-node-collector@v0.6.0/pkg/collector', version: 'node-collector 0.6.0 · historical Go API' },
};

export const architectureLessons = [
  archChapter('architecture', 'Architecture: boundaries before boxes', 'Architecture overview', 16,
    'Read the system as a set of execution boundaries, data contracts, and independently changing state. Then follow the internals of each subsystem.',
    'A useful architecture model tells you what crosses a boundary, who owns the resulting state, and which changes invalidate it.', [
      archSection('orientation', 'What this section adds to the field guide', [
        'The walkthroughs explain a result from the outside. These chapters explain the structures that make those results possible and the tradeoffs that follow.',
        'We will use concrete interfaces: `artifact.Reference`, cached `BlobInfo`, the scan `Backend`, Operator plugin methods, and the collector’s `NodeInfo` envelope.',
        'A contract defines the data and operations at a boundary. Following contracts lets you locate a failure without treating every subsystem as one scanner.',
        'The central example remains the Alpine package from [[image-scan|the image walkthrough]]. A second path follows the host permission from [[node-flow|the node walkthrough]].',
      ], ['archArtifact', 'archScan', 'archCollector']),
      archSection('boundaries', 'Separate producer, scanner, and cluster responsibilities', [
        'The producer side turns public advisory records and policy source into distributable assets. It does not need access to your private image.',
        'The scanner side obtains the target and interprets its evidence. It combines that evidence with selected knowledge and returns an assessment.',
        'The Kubernetes integration decides which resources need assessment and stores their reports. It adds scheduling, credentials, ownership, and eventual publication to the scan path.',
        'An eventual result appears after asynchronous work completes. This is why creating a Deployment and reading its report are separate events.',
        'The grouped diagram shows responsibilities rather than a prescribed process layout. The deployment chapter places these responsibilities into actual processes and Pods.',
      ], ['ingestion', 'archScan', 'opDesign30'], { boundaryMap: {
        caption: 'Three architectural boundaries · select a subsystem to study its contract',
        groups: [
          { title: 'Asset producers', subtitle: 'Publish knowledge independently', items: [
            { label: 'Advisory ingestion', detail: 'Vendor records → scan data', link: 'data-architecture' },
            { label: 'Java identification', detail: 'Archive identity → coordinates', link: 'data-architecture' },
            { label: 'Policy publication', detail: 'Rules and data → bundle', link: 'node-architecture' },
          ] },
          { title: 'Scanner execution', subtitle: 'Transform evidence into results', items: [
            { label: 'Artifact inspection', detail: 'Target → analysis reference', link: 'engine-internals' },
            { label: 'Cache and layer merge', detail: 'Reusable parts → target evidence', link: 'engine-internals' },
            { label: 'Scan backend', detail: 'Evidence + knowledge → assessment', link: 'deployment-architecture' },
          ] },
          { title: 'Kubernetes integration', subtitle: 'Maintain resource assessments', items: [
            { label: 'Workload controllers', detail: 'Resource state → scan work', link: 'operator-internals' },
            { label: 'Node collection', detail: 'Host observations → NodeInfo', link: 'node-architecture' },
            { label: 'Report publication', detail: 'Assessment → owned API object', link: 'operator-internals' },
          ] },
        ],
      } }),
      archSection('contracts', 'Name the payload on each connection', [
        'A registry download can carry an image, a vulnerability database, or a policy bundle. Sharing the transport does not give those payloads the same meaning.',
        'Inside Trivy, an artifact reference identifies the analyzed target and its blobs. The backend receives keys into analysis state, along with scan options.',
        'Across the client/server boundary, the documented mode transfers analysis rather than uploading the original image layers through the scan interface.',
        'Across the Operator boundary, scan output becomes a Kubernetes report. Across the collector boundary, observations become policy input.',
        'These payloads explain which producer to investigate. Missing package identity, missing host evidence, and missing report ownership originate at different boundaries.',
      ], ['archArtifact', 'archScan', 'modes', 'opPrivate30', 'collectorAPI'], { table: archTable('Interfaces carry different kinds of state', ['Boundary', 'Payload', 'Consumer needs it for'], [
        ['Asset registry → scanner', 'Versioned database or policy artifact', 'Knowledge and rule availability'],
        ['Artifact inspection → backend', 'Reference identifiers and scan options', 'Locating the target’s analysis'],
        ['Collector → evaluator', 'Named observations in NodeInfo', 'Evaluating host conditions'],
        ['Scan execution → Operator', 'Scanner report data from execution', 'Building Kubernetes report payloads'],
        ['Operator → Kubernetes API', 'Report with metadata and owner', 'Persisting assessment and workload association'],
      ]) }),
      archSection('invariants', 'Track the facts that must remain true', [
        'An invariant is a condition a design must preserve. Here, package identity must retain enough origin information to choose the applicable advisory.',
        'Reusable image analysis must still describe the selected content. A report must identify the workload revision and container whose assessment it records.',
        'A host-policy result must refer to the evidence supplied to its rule. A missing observation cannot be reconstructed from a green summary.',
        'These are reasoning requirements for interpreting the system. They are not claims that every integration enforces them perfectly.',
        'For example, replacing an image tag without retaining its resolved identity makes later comparison ambiguous, even if the report remains valid JSON.',
      ], ['imageCurrent', 'opVuln30', 'nodeRule'], { exercise: archExercise('A dashboard merges records by package name and CVE. What relationships can this destroy?', 'It can merge different package ecosystems, vendor builds, image identities, workload owners, and collection times. Keep those dimensions until the question explicitly permits aggregation. A summary is a view over evidence, not a replacement for its identity.') }),
      archSection('reading-order', 'Move from the engine to the distributed system', [
        'Start with [[engine-internals|the scan engine]]. It explains how file evidence becomes reusable analysis and then a report.',
        'Continue with [[operator-internals|the Operator]] for asynchronous execution and publication. Then read [[data-architecture|data architecture]] for independent knowledge and cache lifetimes.',
        'Use [[node-architecture|collector and policy architecture]] for host evidence. Finish with [[deployment-architecture|deployment choices]] to reason about capacity and failure scope.',
      ], ['archScan', 'opDesign30', 'archCollector']),
      archSection('versions', 'The version boundary for the diagrams', [
        'Engine symbols refer to Trivy 0.75.0. Operator code symbols refer to its published 0.35.0 API. Operator configuration examples retain their 0.30.1 documentation labels.',
        'Collector type definitions use the published 0.6.0 API as a historical example. The fixture experiments use Trivy 0.75.0, without running that collector.',
        'This is a set of versioned architectural views, not a tested deployment assembled from those versions. Every symbol reference links to its version.',
        'Published signatures establish interface shape. Where a diagram connects those shapes into a larger model, its caption identifies the model as inferred.',
        'Trivy’s compatibility policy excludes its internal Go APIs and protocols from stable public interfaces. Prefer documented command and report interfaces for external automation.',
      ], ['compatibility', 'archScan', 'archOpPlugin', 'archCollector']),
    ], archQuiz('Which evidence best supports a claim that the same workload was assessed twice?', [
      'Matching package names and severity counts', 'Matching workload owner, container, and target identity, with separate assessment records', 'The same human-readable image tag in both commands',
    ], 1, 'Preserve the identities at each boundary. Counts and tags alone cannot establish the workload and image relationship.')),

  archChapter('engine-internals', 'Inside the Trivy scan engine', 'Scan-engine internals', 26,
    'Read the Trivy 0.75.0 interfaces from artifact inspection through analyzers, cached blobs, layer application, scan backends, and report assembly.',
    'Target handling and assessment meet at an analysis reference. Cached evidence and the knowledge used to assess it have separate lifecycles.', [
      archSection('service', 'The coordinator joins an artifact to a backend', [
        '`pkg/scan.Service` is the coordinating API in Trivy 0.75.0. Its constructor receives an `artifact.Artifact` and a scan `Backend`.',
        '`ScanArtifact` returns a `types.Report`. Its documentation specifies inspection before delegation to the backend.',
        'This separates two choices: how to obtain target evidence and where to perform backend assessment. A target implementation does not need to be the report writer.',
        'Artifact inspection still precedes remote assessment. The backend needs the reference produced by the caller’s artifact implementation.',
      ], ['archScan', 'archArtifact'], { code: archCode('artifact.Artifact + scan.Backend\n                 │\n                 ▼\n          scan.NewService(...)\n                 │\n                 ▼\n         Service.ScanArtifact(...)\n                 │\n                 ▼\n             types.Report', 'Trivy 0.75.0 composition · API dependency view') }),
      archSection('reference', 'The reference identifies analyzed state', [
        '`Artifact.Inspect` yields an `artifact.Reference`. Its fields include target name and type, an artifact identifier, blob identifiers, and target-specific metadata.',
        'Image metadata includes image identifiers and layer DiffIDs. Repository metadata carries repository identity. A reference can also contain a software inventory through its BOM field.',
        'The reference is therefore more than an image name. It identifies the evidence that the later backend can locate and interpret.',
        'Consider two images sharing a base layer. Their artifact identities differ, but some analyzed parts can be reusable. Separating artifact and blob identifiers expresses that relationship.',
        'The public shape does not promise a stable cache-key encoding. Treat the identifier as an internal reference, not a filename that external code can construct.',
      ], ['archArtifact', 'archCache', 'compatibility']),
      archSection('analyzers', 'File selection precedes interpretation', [
        '`AnalyzerGroup.AnalyzeFile` selects work from file names and attributes. `AnalysisInput` supplies the directory, path, file information, content reader, and analysis options.',
        'The group supports concurrent analysis. It merges results from specialized analyzers rather than requiring one parser to understand every supported ecosystem.',
        'For the Alpine fixture, the meaningful input is the installed-package record. Changing report format cannot create that record if the analyzer never receives it.',
        'This gives a diagnostic order: target visibility, file selection, parser recognition, then interpreted identity. Each step depends on the previous evidence being available.',
      ], ['archAnalyzer', 'alpineCoverage'], { code: archCode('Visible file\n   ↓ selected for a relevant analyzer\nAnalysisInput: path + file information + readable content\n   ↓ interpretation\nAnalysisResult: discovered evidence\n   ↓ merge with other analyzer results', 'Per-file analysis model · not a trace of goroutine scheduling') }),
      archSection('post-analysis', 'Some evidence requires several files together', [
        '`PostAnalyzer` exposes `Required` and `PostAnalyze`. Its input contains a virtual filesystem with selected files. The analyzer group merges its returned results.',
        'This supports a different unit of work from one file. A manifest and its related lockfile can convey relationships that neither file supplies alone.',
        'For example, the Python documentation describes neighboring project metadata that helps construct a Poetry dependency graph. Copying only the lockfile changes the available context.',
        'The architectural consequence is that file-level presence and project-level completeness are different checks. A readable file does not establish complete dependency evidence.',
      ], ['archAnalyzer', 'pythonCurrent']),
      archSection('analysis-results', 'Analysis output is richer than a package list', [
        '`AnalysisResult` includes OS and repository information, package and application data, plus misconfiguration, secret, license, and other result families.',
        'This prevents an overly literal reading of “analyze, then scan.” Some inspection paths already carry policy or secret results in their analysis output.',
        'The teaching pipeline describes responsibilities. It does not imply that every scanner waits until all file analysis ends before doing any evaluation.',
        'Keep the package case concrete: the [[image-scan|recorded fixture]] produces the installed name, full version, source name, and distribution context needed by later vulnerability matching.',
      ], ['archAnalyzer', 'archFanalTypes', 'packageAPI']),
      archSection('cache', 'BlobInfo and ArtifactInfo cache different units', [
        '`BlobInfo` combines layer metadata with analysis. Its fields include package evidence and filesystem-change information such as whiteouts and opaque directories.',
        '`ArtifactInfo` separately carries image-level information, including architecture and image-configuration results. Treating these as one undifferentiated package cache loses their scope.',
        'The cache interface provides artifact and blob reads and writes. `MissingBlobs` reports missing state for an artifact identifier and a list of blob identifiers.',
        'Analyzer versions also participate in cache keys. Unchanged input bytes alone do not establish that an older analyzer’s output remains reusable after an analyzer change.',
        'This is separate from advisory freshness. Reusing a valid package inventory and matching it against a newer database can produce a new finding.',
      ], ['archFanalTypes', 'archCache', 'archAnalyzer', 'cache'], { table: archTable('Three kinds of reuse', ['State', 'Reuse question', 'Separate concern'], [
        ['BlobInfo', 'Can this part’s interpreted evidence be reused?', 'How do the parts combine in this image?'],
        ['ArtifactInfo', 'Can image-level metadata and analysis be reused?', 'Which content and configuration does the artifact select?'],
        ['Advisory database', 'Can the prepared knowledge be read for matching?', 'Does it contain the advisories required by the freshness policy?'],
      ]) }),
      archSection('applier', 'Layer application constructs the target view', [
        '`pkg/fanal/applier` exposes an operation over an artifact identifier and blob identifiers. It returns an `ArtifactDetail` containing the merged evidence.',
        'A second exported form accepts layer `BlobInfo` values directly. The local applier depends on the analysis cache, which connects persisted parts to a target view.',
        'Suppose a base layer records package revision r0 and a later layer upgrades it to r1. An inventory that blindly concatenates both records misrepresents the target.',
        'Deletion has the same problem. OCI whiteouts describe removed lower-layer paths. The blob representation retains filesystem-change information for composition.',
        'The inferred design is reusable analysis of parts followed by composition for a specific artifact. It explains how reuse and whole-image correctness address different questions.',
      ], ['archApplier', 'archFanalTypes', 'ociLayers'], { code: archCode('Base layer analysis       Update layer analysis\nlibcrypto3: r0             replacement package metadata: r1\n        └─────────────┬─────────────┘\n                      ▼\n            apply layer semantics\n                      ▼\n             target evidence: r1', 'Illustrative layer composition · not the exact cache encoding') }),
      archSection('backend', 'The backend receives references and scan options', [
        'The `Backend.Scan` contract accepts the target name, artifact key, blob keys, and `ScanOptions`. It returns a `ScanResponse`.',
        'The local service constructor receives an applier, OS-package scanner, language-package scanner, and vulnerability client. Those dependencies expose its principal assessment boundaries.',
        'A package can therefore fail to produce an expected CVE for several distinct reasons. It can be missing from analysis or lose essential source context before matching.',
        'Alternatively, matching can use a different advisory source or a later filter can remove the finding. Those hypotheses require evidence from different interfaces.',
      ], ['archScan', 'archLocal', 'vulnCurrent'], { sequence: {
        caption: 'Ordinary image vulnerability path · inferred composition of published interfaces',
        actors: ['Scan service', 'Artifact', 'Analysis cache', 'Local backend', 'Applier'],
        messages: [
          [0, 1, 'Inspect the selected target'],
          [1, 2, 'Reuse or retain artifact / blob analysis'],
          [1, 0, 'Reference with target identity and blob keys'],
          [0, 3, 'Scan with reference keys and options'],
          [3, 4, 'Obtain the merged target evidence'],
          [4, 2, 'Read the referenced analysis'],
          [4, 3, 'ArtifactDetail for the target'],
          [3, 3, 'Assess selected evidence using scanner dependencies'],
          [3, 0, 'ScanResponse'],
        ],
      } }),
      archSection('report', 'The report restores target context around results', [
        '`ScanResponse` includes results, OS information, layers, and optional server information. The top-level `Report` adds artifact identity and report metadata.',
        'Each `Result` carries a target, class, type, and scanner-specific result families. Consumers must retain those boundaries when processing findings.',
        'In the [[image-scan|libcrypto3 example]], `os-pkgs` and `alpine` describe the result context. A library result elsewhere in the same report can use another ecosystem.',
        'Flattening all findings into a list of CVE strings removes the package, target, and evidence relationships needed to explain a match.',
        'For automation, use the documented report contract. Internal service structures explain architecture but do not promise the same compatibility as machine-readable CLI output.',
      ], ['archReport', 'reportCurrent', 'compatibility']),
      archSection('extension', 'Place an extension at the boundary it changes', [
        'A new input representation belongs near artifact inspection. A new file format belongs near analysis. A new advisory interpretation belongs near package assessment.',
        'A change that only formats existing findings belongs at the reporting boundary. These placements follow the data each operation consumes.',
        'As a reasoning exercise, a parser for a new lockfile needs to establish package identities. Adding a severity formatter cannot solve that missing-evidence problem.',
        'Likewise, a database mirror changes knowledge distribution. It does not add parser support for an archive format that the executable cannot recognize.',
      ], ['archArtifact', 'archAnalyzer', 'archLocal', 'reportCurrent'], { exercise: archExercise('A new analyzer understands a private package manifest. Its package appears in inventory, but no vulnerability matches. Which architecture boundary did the analyzer solve?', 'It solved evidence discovery. Matching still needs a supported package identity, applicable advisory data, and version interpretation. An inventory entry alone does not create an advisory source for a private ecosystem.') }),
    ], archQuiz('Why can an unchanged image need fresh analysis after an executable change?', [
      'An updated analyzer can change its interpretation and cache version', 'Every database update necessarily changes the image digest', 'A different output filename changes the installed packages',
    ], 0, 'Analyzer versions participate in analysis cache keys. Advisory updates and report filenames concern separate inputs.')),
  archChapter('operator-internals', 'Inside the Operator control loops', 'Operator internals', 25,
    'Separate workload discovery, Job construction, scanner integration, result parsing, report persistence, and invalidation. Follow their durable and temporary state.',
    'The Operator coordinates several asynchronous boundaries. A successful scan and a successfully published assessment are distinct states.', [
      archSection('roles', 'Discovery and completion are different controller responsibilities', [
        'A workload change identifies possible work. A completed scan Job supplies a result. Those events occur at different times and require different data.',
        'The published Operator 0.35.0 API exposes `WorkloadController` and `ScanJobController`. The workload controller has submission methods and request/result channels.',
        'The Job controller exposes a log reader, scanner plugin, and report readers/writers. These dependencies place execution interpretation and publication together.',
        'This API view explains the split without assuming an undocumented retry algorithm. Earlier versioned design documentation separately describes workload reconciliation and report invalidation.',
      ], ['archOpControllers', 'opDesign30'], { boundaryMap: {
        caption: 'Controller dependencies and state · Operator 0.35.0 API view', groups: [
          { title: 'Observed Kubernetes state', subtitle: 'Objects outside the process', items: [
            { label: 'Workload revision', detail: 'Identity, Pod template, containers', link: 'operator-flow' },
            { label: 'Scan Job and Pod', detail: 'Execution status and output', link: 'operator-internals' },
            { label: 'Report resources', detail: 'Stored assessment and owner', link: 'reports' },
          ] },
          { title: 'Controller process', subtitle: 'In-memory coordination', items: [
            { label: 'WorkloadController', detail: 'Discover and submit assessment work', link: 'operator-internals' },
            { label: 'ScanJobController', detail: 'Read execution output', link: 'operator-internals' },
            { label: 'Report writers', detail: 'Publish typed assessment objects', link: 'reports' },
          ] },
          { title: 'Scanner integration', subtitle: 'Plugin boundary', items: [
            { label: 'GetScanJobSpec', detail: 'Describe the scanner Pod', link: 'operator-internals' },
            { label: 'Trivy execution', detail: 'Inspect and assess the target', link: 'engine-internals' },
            { label: 'ParseReportData', detail: 'Interpret scanner output', link: 'operator-internals' },
          ] },
        ],
      } }),
      archSection('plugin', 'The plugin connects a scanner to Kubernetes execution', [
        'The vulnerability scanner plugin exposes initialization, `GetScanJobSpec`, and `ParseReportData`. It describes scanner execution and interprets scanner output.',
        'The Job builder can receive a plugin, workload object, registry credentials, timeout, TTL, and scheduling configuration. Its result includes a Job and associated Secrets.',
        'This separates scanner-specific behavior from Kubernetes lifecycle work. A scanner integration needs both an executable workload and a parser for the result it emits.',
        'For example, changing the scanner’s JSON output without updating its parser can leave completed Jobs with unusable results. Pod success alone cannot cross that boundary.',
      ], ['archOpPlugin', 'opPrivate30'], { code: archCode('Workload + credentials + scanner configuration\n                     │\n                     ▼\n      plugin describes scan Pod execution\n                     │\n                     ▼\n          Job builder → Job + Secrets\n                     │\n                     ▼\n                 scan output\n                     │\n                     ▼\n        plugin parses report data\n                     │\n                     ▼\n       controller writes report resources', 'Scanner integration model · API responsibilities, not an exact call stack') }),
      archSection('configuration', 'Two configuration layers affect different decisions', [
        'Operator machinery controls watched resources, concurrency, timeouts, retries, and publication behavior. Scanner configuration controls the assessment performed inside that machinery.',
        'The versioned configuration documentation puts Operator machinery in environment variables. Scanner integrations use ConfigMaps and Secrets for ordinary and confidential values.',
        'A namespace filter can prevent assessment from being scheduled. A severity filter can change the finding set after assessment. They act at different boundaries.',
        'Increasing the timeout cannot include an excluded namespace. Expanding watch scope cannot repair a scanner’s private-registry authentication.',
        'This is a useful configuration review order: resource eligibility, execution prerequisites, scanner inputs, then result handling.',
      ], ['opSettings30', 'archOpSettings']),
      archSection('durability', 'Distinguish API state from process memory', [
        'Jobs and reports are Kubernetes API objects. In the normal report-storage mode, the API persists reports independently of the Operator process.',
        'Submission channels are process memory. Restarting a process does not preserve its queued channel values. This follows from their storage location, not a special Operator guarantee.',
        'The resulting design requirement is to recover work from observable state. The public interfaces do not establish every Job-adoption or retry detail after restart.',
        'When investigating recovery, distinguish a report already stored, a Job still running, a completed Job awaiting publication, and a request that never created a Job.',
        'Those states leave different evidence. A missing in-memory request and a denied report write cannot be diagnosed from the same observation.',
      ], ['archOpControllers', 'opSettings30'], { table: archTable('State that remains after a controller process exits', ['State', 'Location', 'Recovery implication'], [
        ['Workload and revision', 'Kubernetes API', 'The desired assessment target remains observable'],
        ['Created scan Job', 'Kubernetes API', 'Its execution state can remain observable'],
        ['Persisted report', 'Kubernetes API in the default storage mode', 'Readers can retain the previous assessment'],
        ['Submission channel values', 'Operator process memory', 'A restart loses those particular values'],
        ['Standalone scan database', 'Scan Pod volume', 'Its lifetime follows that Pod, not the controller'],
      ]) }),
      archSection('publication', 'Publication is an additional commit boundary', [
        'A commit boundary is the point where state becomes durable. Completing Trivy execution does not commit a Kubernetes report.',
        'The controller must obtain output, parse it, attach resource context, and write the report. Each operation can fail after the scanner already did useful work.',
        'Consider a hypothetical restart between parsing and publication. The existing Job can be evidence of completed execution, while the report remains absent.',
        'This model does not promise exactly-once execution. It explains why recovery must consider stored resource state and why report consumers need identity and timestamp fields.',
        'The published report helpers include conversion from a Trivy result and construction of vulnerability report data. They expose the translation boundary directly.',
      ], ['archOpPlugin', 'opPrivate30', 'opVuln30'], { exercise: archExercise('A Job completed before an Operator restart. A report appears after the restart. Does that prove Trivy ran only once?', 'No. Publication timing does not reveal the number of execution attempts. Compare Job and Pod identities, timestamps, and logs. A report is durable assessment state, not a complete execution ledger.') }),
      archSection('ownership', 'Ownership provides cleanup without erasing the assessment too early', [
        'Temporary scan credentials belong to execution. Workload reports belong to the assessed resource. These relationships deliberately have different lifetimes.',
        'The private-registry design assigns temporary Secret ownership to the Job. The report example assigns ownership to a workload revision, such as a ReplicaSet.',
        'Removing a Job can therefore clean execution resources while preserving the assessment. Removing the workload revision can remove its dependent reports.',
        'A multi-container workload also creates separate report associations. Container name and owner UID together prevent an application result from being confused with its sidecar.',
        'The [[operator-flow|payments example]] illustrates these identities. The [[operator-lab|two-container lab]] makes their relationships visible in a disposable cluster.',
      ], ['opPrivate30', 'opVuln30', 'archOpRevision']),
      archSection('invalidation', 'Invalidation is a controller operation', [
        'Invalidation marks previous work as unsuitable for reuse. A changed workload revision changes the assessment target. A changed policy changes the assessment logic.',
        'The versioned design describes `plugin-config-hash` on configuration reports. A configuration reconciler compares that value with a hash of the plugin configuration.',
        'A mismatch causes affected reports to be deleted for recreation. The stored result then reflects another assessment with the new policy configuration.',
        'A vulnerability database publication is a different event. It does not itself establish that every existing workload report was immediately regenerated.',
        'This distinction prevents a common rollout mistake: a new controller image or ConfigMap does not prove that every stored assessment already uses the new inputs.',
      ], ['opDesign30', 'opSettings30'], { sequence: {
        caption: 'Documented configuration-report invalidation · Operator 0.30.1',
        actors: ['Plugin ConfigMap', 'Config reconciler', 'Report API', 'Workload path'],
        messages: [
          [0, 1, 'Changed policy configuration data'],
          [1, 1, 'Compute the configuration hash'],
          [1, 2, 'Compare stored plugin-config-hash values'],
          [1, 2, 'Delete reports with mismatched hashes'],
          [2, 3, 'Reports now need recreation'],
          [3, 2, 'Publish assessment under the new configuration'],
        ],
      } }),
      archSection('time', 'Timeout, retry, cleanup, and freshness are separate clocks', [
        'A scan timeout bounds an execution attempt. A retry delay spaces another attempt. A completed-Job TTL controls retained execution objects.',
        'A report TTL controls assessment expiry. These settings answer different questions, even when all are expressed as durations.',
        'For example, retaining Jobs for debugging does not make a report fresher. Expiring reports more often can create more work without reducing individual scan time.',
        'The configuration also separates image scan concurrency from node collection concurrency. A Job limit is not a universal bound on containers, downloads, or CPU.',
        'Use [[deployment-architecture|the deployment chapter]] to translate these controls into capacity and failure scenarios.',
      ], ['opSettings30', 'opScanner30']),
    ], archQuiz('A policy ConfigMap changes while old ConfigAuditReports remain. What connects the new configuration to replacement reports in the documented design?', [
      'A comparison of plugin-config-hash values followed by invalidation and recreation', 'An image registry automatically replacing report objects', 'A kubelet readiness probe rewriting report contents',
    ], 0, 'The configuration reconciler detects the hash mismatch. Report recreation then evaluates the workload under the changed configuration.')),

  archChapter('data-architecture', 'The architecture of scan knowledge and caches', 'Data & cache architecture', 22,
    'Separate producer pipelines, OCI transport, schema compatibility, local preparation, reusable analysis, and persisted assessments.',
    'Freshness is not one timestamp. It depends on producer knowledge, the selected artifact series, local adoption, and the assessment that used it.', [
      archSection('lanes', 'Three assets enter the engine at different stages', [
        'The vulnerability database supplies advisory facts. The Java database supplies archive-identification data. The checks bundle supplies executable policy and supporting data.',
        'An unidentified archive needs identity before vulnerability matching. A configuration input needs a selected rule. Neither requirement disappears when the advisory database is current.',
        'The scanner executable is a fourth versioned input. It determines supported formats, interpretation, and compatibility with the assets it reads.',
        'This produces several independent update combinations. New rules with an old parser, or a new parser with an old advisory snapshot, can change behavior differently.',
      ], ['databases', 'javaCurrent', 'checksCurrent', 'compatibility'], { boundaryMap: {
        caption: 'Independent knowledge paths into the scanner', groups: [
          { title: 'Vulnerability data', subtitle: 'Interpret identified software', items: [
            { label: 'Vendor and ecosystem records', detail: 'Affected status and fixed versions', link: 'database-flow' },
            { label: 'trivy-db artifact', detail: 'Compatible database schema', link: 'vulnerability-db' },
            { label: 'Package matching', detail: 'Inventory + advisories → finding', link: 'engine-internals' },
          ] },
          { title: 'Java identity data', subtitle: 'Identify archive content', items: [
            { label: 'Archive index', detail: 'Known content and package coordinates', link: 'java-db' },
            { label: 'trivy-java-db artifact', detail: 'Independent index schema', link: 'java-db' },
            { label: 'Identification fallback', detail: 'Archive → package identity', link: 'engine-internals' },
          ] },
          { title: 'Configuration policy', subtitle: 'Evaluate structured evidence', items: [
            { label: 'Rules and supporting data', detail: 'Policy predicates and metadata', link: 'checks-bundle' },
            { label: 'trivy-checks bundle', detail: 'Downloaded or embedded checks', link: 'checks-bundle' },
            { label: 'Policy evaluation', detail: 'Structured input → rule result', link: 'node-architecture' },
          ] },
        ],
      } }),
      archSection('producer', 'Collection, construction, and publication solve different problems', [
        'Collection obtains advisory records from upstream sources. Database construction translates source-specific representations into scan data. Publication makes a built artifact available to consumers.',
        'The `vuln-list` repositories belong on the producer side. A normal scan reads the prepared database rather than cloning those repositories for each target.',
        'Separating these stages decouples target scanning from live vendor queries. A scanner can assess a private image using a prepared knowledge snapshot.',
        'It also introduces lag boundaries. A vendor record can exist before a database build includes it, and a published build can exist before a mirror adopts it.',
        'The [[database-flow|publication walkthrough]] follows an example across those boundaries. Its successful-download scenario demonstrates why transport success does not prove freshness.',
      ], ['ingestion', 'selfHosting', 'databases']),
      archSection('transport', 'OCI distribution preserves an asset, not its interpretation', [
        'OCI registries transport database archives as artifacts. The documented database and Java-index layers have specialized media types.',
        'A mirror must preserve a usable artifact, including the payload representation expected by its reader. Copying bytes into an unrelated image does not preserve that contract.',
        'Repository selection controls where the consumer obtains the asset. It does not select the package parser or change the meaning of a vendor advisory.',
        'The exact media types below describe the two database payloads. They do not describe the layer type of the checks bundle.',
      ], ['selfHosting', 'databases'], { code: archCode('trivy-db layer:\napplication/vnd.aquasec.trivy.db.layer.v1.tar+gzip\n\ntrivy-java-db layer:\napplication/vnd.aquasec.trivy.javadb.layer.v1.tar+gzip', 'Documented database layer media types') }),
      archSection('compatibility', 'Four version numbers answer four questions', [
        'The executable version identifies scanner behavior. The vulnerability database schema identifies a readable data format. The Java index has its own schema.',
        'The checks bundle has a separately versioned policy series. Compatibility with one asset does not establish compatibility with the others.',
        'For database repository references without a tag, Trivy uses the expected schema tag. The documented examples use `trivy-db:2` and `trivy-java-db:1`.',
        'Those numeric tags are format selectors, not publication dates. Successive artifacts can use the same schema while containing newer knowledge.',
        'An older executable can still run after updates to its supported asset series end. A recent download of the last compatible artifact does not restore ongoing updates.',
      ], ['compatibility', 'databases', 'selfHosting'], { exercise: archExercise('Two database artifacts both use schema tag 2. One was built last month and one today. Are they equivalent for reproducibility?', 'No. The shared tag establishes a compatible format series, not identical contents. Record the resolved artifact identity and database metadata when the assessment must be reproduced.') }),
      archSection('local-files', 'Preparation creates separate local readiness conditions', [
        'Manual database preparation places the vulnerability file and its metadata under `db`. Java identification uses a different directory and metadata file.',
        'These are knowledge assets. The artifact/blob analysis cache stores work performed on scan targets. Report files store assessment output.',
        'The cache contains distinct knowledge and analysis entries. Saved reports are separate outputs. Clearing the cache discards several reusable inputs without necessarily deleting those reports.',
        'When diagnosing a failure, identify whether the reader lacks compatible knowledge, reusable target analysis, or an earlier report. Each case has a different recovery cost.',
      ], ['selfHosting', 'archCache', 'cache'], { code: archCode('Trivy cache directory\n├── db/\n│   ├── trivy.db\n│   └── metadata.json\n└── java-db/\n    ├── trivy-java.db\n    └── metadata.json\n\nSeparate state families:\n  artifact/blob analysis → interpreted target evidence\n  output reports         → results of an assessment', 'Documented database layout · analysis backend layout intentionally omitted') }),
      archSection('fallback', 'Fallback is part of each asset’s contract', [
        'Vulnerability and Java repository lists can provide ordered alternatives for documented transient failures. An explicit list replaces the defaults.',
        'A successful response from a stale mirror is different from a transient error. Ordered fallback does not establish a search for the newest artifact.',
        'Checks have another fallback: embedded policy from the executable build. This allows policy evaluation when a downloaded bundle is unavailable.',
        'The resulting assessment can succeed with an older rule set. A missing vulnerability database does not gain equivalent coverage merely because embedded checks exist.',
      ], ['databases', 'checksCurrent'], { table: archTable('Availability and freshness are independent', ['Situation', 'What can continue', 'What remains uncertain'], [
        ['A mirror returns old but readable data', 'Database-backed assessment', 'Whether recent advisories are present'],
        ['A checks download fails and embedded checks load', 'Policy evaluation', 'Whether the latest policy revision ran'],
        ['Target analysis is reusable, database changed', 'Inventory reuse and new matching', 'Whether filters expose the new matches'],
        ['Report exists, next scan cannot start', 'Reading the stored assessment', 'Whether it describes current knowledge or target state'],
      ]) }),
      archSection('reproducibility', 'Define the complete input to a verdict', [
        'A reproducible verdict needs the target identity, executable behavior, compatible knowledge assets, selected scanners, and filters. Configuration and suppression inputs also participate.',
        'For node assessment, replace image identity with the collected observations and their origin. Repeating the evaluator alone does not repeat host collection.',
        'For Operator reports, add workload owner, container association, and execution time. These identify where the assessment belongs in the cluster.',
        'Think of a report as a result of these inputs, not an intrinsic property permanently attached to an image tag or node name.',
      ], ['imageCurrent', 'filtering', 'opVuln30', 'nodeRule'], { code: archCode('Verdict inputs\n  target identity or collected observations\n  executable and analyzer behavior\n  advisory snapshot / Java index / policy bundle as applicable\n  scanner selection and interpretation settings\n  filters, ignores, and supported VEX statements\n\nOperator association\n  workload owner + container + assessment time', 'A reasoning model for comparing two reports') }),
    ], archQuiz('A scanner downloads a database today from a mirror. Which fact is still needed to assess knowledge freshness?', [
      'The output report’s filename', 'The build identity and timestamps of the database it received', 'The number of Kubernetes replicas in the application',
    ], 1, 'Local transfer time does not establish when the advisory snapshot was built or which records it contains.')),

  archChapter('node-architecture', 'Collector, policy, and compliance architecture', 'Node & policy internals', 22,
    'Trace the contracts between command selection, host access, dynamic observation values, rule selection, result construction, and benchmark aggregation.',
    'Collection establishes evidence, policy interprets that evidence, and compliance organizes the results. Each layer can succeed while another remains incomplete.', [
      archSection('contracts', 'There are three separate interpreters', [
        'The collector interprets an observation specification and node context. The policy engine interprets structured evidence. A compliance specification selects commands and checks for benchmark controls.',
        'A command identifier names an observation procedure. A check identifier names a policy condition. A control identifier names a benchmark requirement.',
        'These identifiers connect stages but do not make the stages interchangeable. One host command can supply evidence used by a policy, while a control can aggregate several results.',
        'The [[node-flow|permission walkthrough]] supplies the concrete example. Here, we focus on the interfaces that allow its stages to evolve independently.',
      ], ['nodeRule', 'archCollector', 'opCompliance30']),
      archSection('command', 'The command descriptor binds intent to host execution', [
        'The published compliance example describes a command using an identifier, observation key, title, node type, audit command, and supported platforms.',
        'For kubelet permissions, the audit uses the resolved kubeconfig path. The observation key names the value consumed later by the rule.',
        'Discovery is therefore part of the contract. The collector must locate the component and the intended file before its numeric output answers the policy question.',
        'A command returning a valid number from the wrong file is still unsuitable evidence. Syntax and execution success do not establish the correct target.',
      ], ['nodeRule', 'archCollector'], { code: archCode('Command identity     → which observation procedure?\nNode type / platform → where is it applicable?\nDiscovered path      → which host object is observed?\nAudit operation      → how is the value obtained?\nObservation key      → where does the evaluator read it?', 'Command specification as an interface') }),
      archSection('envelope', 'NodeInfo has a structured envelope and dynamic values', [
        'The historical collector 0.6.0 API exposes `Node` with API version, kind, metadata, type, and info fields. `Info.Values` uses `interface{}`.',
        'The envelope therefore organizes observations, while each key needs its own value convention. Permissions and ownership do not share the same value type.',
        'The published examples contain numeric permission values such as `600` and ownership strings such as `root:root`. Policy must interpret the appropriate shape.',
        'This creates a compatibility obligation between command output and rule input. Renaming a key or changing numbers into strings can break the intended interpretation.',
        'A schema label alone does not prove that every command-specific value satisfies that obligation. Test the actual collector and evaluator combination when upgrading it.',
      ], ['archCollector', 'collectorAPI', 'nodeRule'], { table: archTable('Observation contracts', ['Element', 'Responsibility', 'Example failure'], [
        ['Envelope kind and node type', 'Select the appropriate input family', 'A rule is not selected for an unexpected kind'],
        ['Observation key', 'Connect producer output to policy lookup', 'The producer renames a key the rule still reads'],
        ['Value type', 'Give the predicate a meaningful operand', 'A numeric condition receives text'],
        ['Value coverage', 'Represent the intended host observations', 'An empty array supplies no permission value'],
      ]) }),
      archSection('policy', 'Policy selection and policy evaluation are separate', [
        'The configuration scanner first needs a recognized input and a selected rule. The selected rule then evaluates its predicate and constructs a result.',
        'The published permission example selects `NodeInfo` and master or worker nodes. Its predicate reads the named permission values.',
        'The local experiments isolate this second half of the system. They evaluate synthetic envelopes against embedded checks without scheduling a collector.',
        'For `KCV-0073`, both `[600]` and `[]` produced PASS in Trivy 0.75.0. Only `[644]` produced FAIL in those fixtures.',
        'This establishes evaluator behavior for supplied evidence. It does not establish how a real collection failure is represented or whether it allows publication.',
      ], ['nodeRule', 'checksCurrent', 'customCurrent'], { download: 'labs/evidence-observations.json', exercise: archExercise('A new collector changes a permission value from 644 to the string "644". The JSON still parses. Is the collector-policy contract preserved?', 'Parsing establishes only valid JSON. The rule expects a value convention, so test its selection and predicate against the new representation. A type change can alter evaluation even when the surrounding envelope is unchanged.') }),
      archSection('boundaries', 'API authority and host visibility are different prerequisites', [
        'The integration needs Kubernetes permissions to arrange collection and retrieve output. The collection workload needs access to the intended node evidence.',
        'The CLI guide lists additional permissions when node collection is enabled. Those permissions are separate from a Pod’s volume mounts and container security context.',
        'Permission to read Pod logs does not grant access to a host file. A host mount does not grant the caller permission to create a collection Job.',
        'Scheduling adds another condition: the collector must run on the node whose evidence is needed. A successful collection from one worker cannot describe an unobserved worker.',
      ], ['nodeTarget76', 'operatorConfig'], { boundaryMap: {
        caption: 'Three boundaries before a host verdict', groups: [
          { title: 'Kubernetes API', subtitle: 'Can the integration arrange work?', items: [
            { label: 'Resource permissions', detail: 'Create and observe collection work', link: 'deployment-architecture' },
            { label: 'Scheduling', detail: 'Place the workload on the intended node', link: 'node-collector' },
          ] },
          { title: 'Host observation', subtitle: 'Can the collector see the evidence?', items: [
            { label: 'Paths and mounts', detail: 'Expose the intended host object', link: 'node-flow' },
            { label: 'Command execution', detail: 'Return values with known meaning', link: 'node-flow' },
          ] },
          { title: 'Interpretation', subtitle: 'Can the evaluator use the evidence?', items: [
            { label: 'Input and rule selection', detail: 'Choose the relevant policy', link: 'checks-bundle' },
            { label: 'Predicate and result', detail: 'Evaluate a condition over supplied values', link: 'custom-checks' },
          ] },
        ],
      } }),
      archSection('policy-assets', 'The rule bundle is only one part of policy behavior', [
        'Policy behavior depends on the rule, its input representation, supporting data, and the evaluator that runs it. The bundle is one distributed input to that combination.',
        'OPA bundles contain policy and optional data. Trivy also has some checks implemented in Go, so not every behavior change comes from a downloaded Rego bundle.',
        'The embedded fallback ties available rules to an executable build. A separate downloaded bundle can change policy while the executable remains unchanged.',
        'This leads to a useful upgrade test: preserve one input fixture, vary one intended component, and compare named rule results. Total finding counts hide changed applicability.',
      ], ['opaBundle', 'checksCurrent', 'customTesting']),
      archSection('aggregation', 'Compliance selects assessment work and organizes its results', [
        'The Trivy compliance specification associates commands and checks with benchmark controls. Command selection can determine which observations node-collector needs to obtain.',
        'After evaluation, aggregation organizes the resulting checks by control. Selection acts before evidence exists, while aggregation operates on the resulting assessment.',
        'For example, three workers can fail a condition mapped to one control. A summary organized by control and a list organized by resource answer different questions.',
        'Manual requirements and missing resource coverage remain outside the evidence supplied by successful automated checks. Aggregation cannot generate the missing observations.',
        'Retain the control-to-check mapping and the check-to-resource relationship. Those links let a reader move from a summary back to the condition and its evidence.',
        'The cited Trivy compliance feature is experimental. Treat its command specifications and mappings as version-specific interfaces.',
      ], ['opCompliance30', 'nodeRule', 'infra20']),
      archSection('change-impact', 'Reason about an upgrade across the complete path', [
        'A collector upgrade can change discovery or serialization. A rule update can change applicability or the predicate. A benchmark update can change control mappings.',
        'An unchanged host can therefore receive a different report without a contradiction. The assessment machinery changed its question or interpretation.',
        'To explain the change, retain the old and new observation envelopes, evaluator versions, rule identities, and mapping versions. Compare one boundary at a time.',
        'The source of a new finding is then testable: newly observed evidence, newly applicable logic, or a changed summary relationship.',
      ], ['archCollector', 'checksCurrent', 'opCompliance30', 'compatibility']),
    ], archQuiz('A benchmark update changes the failed-control count while every underlying check result remains identical. What is a plausible explanation?', [
      'The control-to-check mapping changed', 'The host file permissions must have changed', 'The vulnerability database necessarily became corrupt',
    ], 0, 'The compliance layer organizes check results. A different mapping can change control summaries without changing collected evidence or rule outcomes.')),

  archChapter('deployment-architecture', 'Deployment, scaling, and failure boundaries', 'Deployment tradeoffs', 24,
    'Compare standalone scans, a shared server, and Operator-managed execution. Estimate capacity from explicit assumptions and choose where state should survive.',
    'Choose a deployment by the work and state it shares. Then account for the additional dependency and failure scope that sharing creates.', [
      archSection('choices', 'Place responsibilities before choosing replicas', [
        'Standalone Trivy keeps target acquisition, interpretation, and assessment in the invoking environment. A local report is the immediate result.',
        'Client/server mode retains client-side target analysis and moves selected assessment work to a server. It shares database management and assessment infrastructure.',
        'The Operator adds controllers and execution Jobs around these scanning choices. Installing the Operator does not eliminate the distinction between standalone and server-backed scanning.',
        'Consequently, “run Trivy in Kubernetes” is not a complete architecture decision. You still need to choose where knowledge, analysis state, and reports live.',
      ], ['modes', 'opScanner30', 'archScan'], { table: archTable('Deployment responsibilities', ['Mode', 'Target acquisition and analysis', 'Knowledge and assessment', 'Persisted result'], [
        ['Standalone CLI', 'Invoking process', 'Local process and prepared assets', 'Chosen file or output consumer'],
        ['CLI with server', 'Client', 'Server for supported assessments; client for others', 'Returned report and chosen output consumer'],
        ['Operator with standalone scans', 'Scan workload', 'Scan workload and its prepared assets', 'Operator report storage'],
        ['Operator with server-backed scans', 'Scan client workload', 'Shared server plus client-local assessment paths', 'Operator report storage'],
      ]) }),
      archSection('server-boundary', 'What a shared server does and does not centralize', [
        'The documented mode puts vulnerability and license scanning on the server. Misconfiguration and secret scanning remain on the client.',
        'Original target access therefore remains a client prerequisite. A server that can reach the database registry does not grant the client access to a private application image.',
        'A server also introduces a shared availability dependency. A client can obtain valid target evidence while the server is unavailable for assessment.',
        'Shared access is a trust decision. The documented token protects access to scan and cache functionality, rather than creating separate tenants for unrelated callers.',
        'This is the architectural tradeoff: shared knowledge and assessment reduce duplicated work, while shared state increases the set of callers affected by one failure.',
      ], ['modes', 'archScan', 'cache']),
      archSection('pod-lifetime', 'Pod-local storage changes the cost of repeated scans', [
        'The documented Operator Standalone layout prepares the database in an `emptyDir` shared by containers in the scan Pod. Removing that Pod removes the volume.',
        'Reuse within that Pod is different from reuse across later Jobs. A large number of short-lived Jobs can repeatedly pay preparation costs.',
        'A shared server moves some state outside those Pod lifetimes. A mirror can reduce dependence on external distribution without changing where matching occurs.',
        'These choices solve different problems. A mirror changes asset acquisition. A server changes assessment placement and shared state. A volume changes storage lifetime.',
        'The correct choice depends on the expensive boundary in your deployment, which can be download time, target extraction, matching, or report publication.',
      ], ['opScanner30', 'selfHosting', 'modes']),
      archSection('capacity', 'Estimate throughput from the unit being limited', [
        'Concurrency is the number of operations allowed to overlap. The Operator’s scan limit counts Jobs, while a Job can contain more than one scanning container.',
        'For a planning example, assume one image per Job and a steady mean Job duration of 40 seconds. Five occupied slots complete about 7.5 Jobs per minute.',
        'If new work arrives at 10 Jobs per minute, pending work grows under those assumptions. More controller replicas do not automatically change the configured scan limit.',
        'The estimate assumes stable durations and no additional bottleneck. Registry throttling, scheduling delay, retries, or publication limits can reduce useful throughput.',
        'Use measured durations for your own workload. Separate time waiting for capacity from time spent acquiring data, analyzing, assessing, and publishing.',
      ], ['opSettings30', 'opScanner30'], { code: archCode('Illustrative steady-state estimate\n  concurrent scan Jobs = 5\n  mean occupied time  = 40 seconds / Job\n\n  capacity ≈ 5 / 40 = 0.125 Jobs / second\n           ≈ 7.5 Jobs / minute\n\n  arrivals = 10 Jobs / minute\n  excess work ≈ 2.5 Jobs / minute\n\nAssumptions: one image per Job, steady duration, no retries,\nand no tighter registry, scheduler, server, or API limit.', 'Planning arithmetic · not a measured Trivy benchmark') }),
      archSection('pressure', 'Find the resource that actually saturates', [
        'Increasing concurrent Jobs increases possible overlapping target downloads, extraction work, and database preparation. The multiplier depends on each Job’s containers and mode.',
        'A shared server moves some pressure to one service. If client analysis dominates, more server capacity does not eliminate that client-side cost.',
        'Report publication can also become the limiting stage. Producing results faster than the API accepts them moves delay downstream rather than removing it.',
        'Use the observed boundary to choose the change. Pending Pods, registry errors, long analysis times, and denied report writes each point to different resources.',
      ], ['opScanner30', 'modes', 'opTrouble30'], { exercise: archExercise('Doubling scan concurrency makes each Job twice as slow and does not improve completed reports per minute. What does this suggest?', 'A shared resource likely limits useful throughput. Compare registry response times, CPU and memory pressure, server time, and publication latency. The concurrency limit controls offered work, but it does not create capacity at the saturated stage.') }),
      archSection('expiry', 'Freshness policy creates work', [
        'Report expiry asks the system to repeat assessments. Shortening the retention interval increases refresh demand even if workloads never change.',
        'Suppose 600 single-container workloads need one refresh every six hours. Spreading refreshes evenly produces about 1.67 Jobs per minute before rollouts or retries.',
        'A burst of invalidation can be much larger than that average. Capacity planning must include the burst and the delay it introduces before reports become current.',
        'Policy-change invalidation and database adoption also occur independently. A short report lifetime cannot supply a new advisory snapshot that the scanner never receives.',
      ], ['opSettings30', 'opDesign30', 'databases'], { code: archCode('Refresh demand in an illustrative deployment\n  600 assessments / 360 minutes ≈ 1.67 assessments per minute\n\nAdditional demand\n  workload rollouts\n  newly watched resources\n  policy invalidation\n  failed attempts and retries', 'Refresh planning · assumes one Job per assessment and evenly spread expiry') }),
      archSection('failure-domains', 'Sharing changes who experiences a failure', [
        'A failure domain is the set of work affected by one fault. A local database error can affect one runner. A shared server outage can affect many clients.',
        'A registry mirror can isolate scanners from an external outage while becoming a dependency itself. Retained compatible assets can reduce immediate dependence on downloads.',
        'An Operator process failure differs from a Kubernetes API failure. Stored reports can remain readable after a controller exits, but readers still need the API.',
        'An inaccessible node affects the evidence collected from that node. It does not establish anything about unobserved host conditions.',
      ], ['modes', 'network', 'opSettings30', 'nodeTarget76']),
      archSection('decision', 'Choose the design by the constraint', [
        'For isolated CI runs, start by measuring target access and asset preparation. A prepared cache or mirror addresses distribution cost without requiring a shared scan service.',
        'For many mutually trusted clients, shared assessment can reduce duplicated data management. Account for server capacity, access control, and compatible versions.',
        'For cluster reporting, preserve workload identity and report lifecycle as explicit requirements. They are capabilities the Operator adds around scanning.',
        'For host assessment, define the node coverage and accessible evidence before interpreting the compliance summary. The collector path has separate scheduling and access needs.',
        'These are consequences of the architecture, not universal deployment defaults. Select the tradeoff that addresses the observed constraint.',
      ], ['selfHosting', 'modes', 'opVuln30', 'nodeTarget76']),
    ], archQuiz('A team wants fewer external database downloads but wants each runner to keep local assessment. Which change directly addresses that constraint?', [
      'A compatible prepared cache or database mirror', 'More Operator controller replicas without configuration changes', 'A shorter report TTL for every workload',
    ], 0, 'A cache or mirror addresses knowledge distribution while preserving local assessment. The other choices do not directly remove repeated external preparation.')),
];
