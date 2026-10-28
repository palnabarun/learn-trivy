import { deepDives, deepSources } from './deep-dives.mjs';
import { architectureLessons, architectureSources } from './architecture.mjs';

export const researchDate = 'October 28, 2026';

export const sources = {
  trivy: { title: 'Trivy documentation', url: 'https://trivy.dev/docs/latest/' },
  image: { title: 'Container image scanning', url: 'https://trivy.dev/docs/latest/guide/target/container_image/' },
  filesystem: { title: 'Filesystem scanning', url: 'https://trivy.dev/docs/latest/guide/target/filesystem/' },
  vulnerability: { title: 'Vulnerability detection', url: 'https://trivy.dev/docs/latest/guide/scanner/vulnerability/' },
  databases: { title: 'Database distribution and configuration', url: 'https://trivy.dev/docs/latest/configuration/db/' },
  ingestion: { title: 'How the vulnerability database is built', url: 'https://trivy.dev/docs/dev/community/contribute/vulnerability-database/overview/' },
  java: { title: 'Java package detection', url: 'https://trivy.dev/docs/latest/guide/coverage/language/java/' },
  checks: { title: 'Built-in misconfiguration checks', url: 'https://trivy.dev/docs/latest/guide/scanner/misconfiguration/check/builtin/' },
  custom: { title: 'Custom checks', url: 'https://trivy.dev/docs/latest/guide/scanner/misconfiguration/custom/' },
  misconfiguration: { title: 'Misconfiguration scanning', url: 'https://trivy.dev/docs/latest/guide/scanner/misconfiguration/' },
  secrets: { title: 'Secret scanning', url: 'https://trivy.dev/docs/latest/guide/scanner/secret/' },
  licenses: { title: 'License scanning', url: 'https://trivy.dev/docs/latest/guide/scanner/license/' },
  cache: { title: 'Trivy cache', url: 'https://trivy.dev/docs/latest/configuration/cache/' },
  modes: { title: 'Client/server mode', url: 'https://trivy.dev/docs/dev/guide/references/modes/client-server/' },
  reporting: { title: 'Report formats', url: 'https://trivy.dev/docs/latest/guide/configuration/reporting/' },
  filtering: { title: 'Filtering and suppressions', url: 'https://trivy.dev/docs/dev/configuration/filtering/' },
  exit: { title: 'Exit codes and other controls', url: 'https://trivy.dev/docs/dev/guide/configuration/others/' },
  sbom: { title: 'Generate and scan an SBOM', url: 'https://trivy.dev/docs/latest/guide/supply-chain/sbom/' },
  vex: { title: 'VEX support', url: 'https://trivy.dev/docs/dev/supply-chain/vex/' },
  offline: { title: 'Air-gapped environments', url: 'https://trivy.dev/docs/latest/guide/advanced/air-gap/' },
  kubernetes: { title: 'Kubernetes target and node collection', url: 'https://trivy.dev/docs/latest/guide/target/kubernetes/' },
  operator: { title: 'Trivy Operator overview', url: 'https://aquasecurity.github.io/trivy-operator/latest/' },
  reconciliation: { title: 'Operator reconciliation and report lifecycle', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/' },
  operatorConfig: { title: 'Operator configuration', url: 'https://aquasecurity.github.io/trivy-operator/latest/getting-started/installation/configuration/' },
  operatorInstall: { title: 'Install the Operator with Helm', url: 'https://aquasecurity.github.io/trivy-operator/latest/getting-started/installation/helm/' },
  crds: { title: 'Security report resource definitions', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/crds/' },
  vulnReport: { title: 'VulnerabilityReport', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/crds/vulnerability-report/' },
  configReport: { title: 'ConfigAuditReport', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/crds/configaudit-report/' },
  operatorPolicies: { title: 'Operator built-in configuration audit policies', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/configuration-auditing/built-in-policies/' },
  infraReport: { title: 'InfraAssessmentReport', url: 'https://aquasecurity.github.io/trivy-operator/latest/docs/crds/infraassessment-report/' },
  operatorFaq: { title: 'Operator frequently asked questions', url: 'https://aquasecurity.github.io/trivy-operator/latest/faq/' },
  substrate: { title: 'Teaching inspiration: Learn Agent Substrate', url: 'https://learn.agentsubstrate.dev/' },
};

const section = (id, title, paragraphs, extra = {}) => ({ id, title, paragraphs, ...extra });
const code = (text, label = 'Terminal', language = 'shell') => ({ text, label, language });
const quiz = (question, options, answer, explanation) => ({ question, options, answer, explanation });
const step = (title, text, component) => ({ title, text, component });

export const groups = [
  { title: 'Start here', icon: 'compass', ids: ['overview', 'topology'] },
  { title: 'Follow the flow', icon: 'route', ids: ['image-scan', 'operator-flow', 'node-flow', 'database-flow'] },
  { title: 'Architecture in depth', icon: 'layers', ids: architectureLessons.map(lesson => lesson.id) },
  { title: 'Meet the components', icon: 'box', ids: ['scanner', 'operator', 'node-collector', 'reports', 'client-server'] },
  { title: 'Databases & rules', icon: 'database', ids: ['vulnerability-db', 'java-db', 'checks-bundle', 'custom-checks', 'secret-license'] },
  { title: 'Learn by doing', icon: 'terminal', ids: ['first-scan', 'config-lab', 'operator-lab', 'sbom', 'air-gap', 'triage'] },
  { title: 'Keep nearby', icon: 'book', ids: ['glossary', 'sources'] },
];

export const lessons = [
  {
    id: 'topology', title: 'The system at a glance', short: 'System topology', minutes: 6, level: 'Foundations',
    description: 'Separate the scanning engine, the knowledge it downloads, and the controller that puts it to work.',
    takeaway: 'Trivy scans. Databases and rules supply knowledge. The Operator schedules work and stores reports.',
    map: true,
    sections: [
      section('three-layers', 'Three layers, three responsibilities', [
        'An artifact is an input such as an image or filesystem. Trivy extracts evidence from that artifact and runs selected scanners.',
        'The vulnerability database supplies advisory facts. The Java database helps identify packages. The checks bundle supplies rules for configuration assessment.',
        'Trivy Operator connects scanning to Kubernetes. It observes resource changes, arranges scans, and records results as Kubernetes resources.',
      ]),
      section('two-paths', 'Follow the image or follow the node', [
        'Image scanning asks which packages and secrets exist in an image. The Operator can run that work in a scan Job.',
        'Infrastructure assessment asks how a Kubernetes node is configured. Node-collector gathers host evidence that supports those checks.',
        'A patched image does not establish that the host is configured securely. A hardened node does not remove vulnerable packages from an image.',
      ]),
      section('boundaries', 'Understand the boundaries', [
        'Trivy is a scanner. Trivy Operator is a controller that maintains scan results. Neither component automatically blocks workload admission.',
        'A report is a snapshot of evidence, scanner configuration, and available knowledge. It is not continuous observation of process behavior.',
        'Start with [[image-scan|an image scan]], then follow [[operator-flow|a workload through the Operator]]. Use [[node-flow|the node flow]] to see the separate host path.',
      ]),
    ],
    sources: ['trivy', 'operator', 'databases', 'kubernetes'],
    quiz: quiz('Which component decides when a changed workload needs a new scan?', ['The Java database', 'Trivy Operator', 'The vulnerability database'], 1, 'The Operator reconciles Kubernetes state. The databases provide scan inputs.'),
  },
  {
    id: 'image-scan', title: 'An image scan, end to end', short: 'Image → findings', minutes: 7, level: 'Walkthrough',
    description: 'Follow one image from the registry to a vulnerability report. Pause at each boundary.',
    takeaway: 'Package identification and vulnerability matching are separate steps. Fresh advisories can change results for an unchanged image.',
    flow: [
      step('Resolve the image', 'A reference and platform select the image content. The worked example then starts at the files that describe its Alpine packages.', 'scanner'),
      step('Read the package record', 'The installed database declares libcrypto3 3.3.2-r0, architecture aarch64, and source package openssl. The local fixture makes this transformation observable.', 'scanner'),
      step('Preserve the identity', 'The inventory retains the distribution, full package version, and source name. These values explain why an openssl advisory applies to libcrypto3.', 'scanner'),
      step('Match the vendor advisory', 'Alpine’s v3.20-main tracker marks openssl 3.3.2-r1 as fixed for CVE-2024-9143. The installed r0 revision precedes that fixed build.', 'vulnerability-db'),
      step('Filter and report', 'Trivy formats the findings and applies selected filters. The configured exit code determines whether findings fail a pipeline.', 'triage'),
    ],
    sections: [
      section('try-it', 'Trace a small image', ['Install Trivy before this exercise. The first scan needs network access for the image and database.', 'Run the command below from your terminal. The JSON report records the target and its results.'], { code: code('trivy --version\ntrivy image --scanners vuln --format json --output report.json alpine:3.20'), note: 'The image tag is a teaching fixture, not a recommendation for production. Findings change as advisories change.' }),
      section('read-evidence', 'Read the evidence behind a finding', ['Find the result target, package name, installed version, and vulnerability identifier. Compare the fixed version with the vendor advisory.', 'The same image contains several kinds of package evidence. OS packages and application dependencies can appear in separate result entries.', 'This flow is a teaching model. Other scanners can inspect configuration, secrets, and licenses without following the same advisory-matching path.']),
      section('cache', 'Why the second scan can be faster', ['The analysis cache stores reusable work such as package information. The vulnerability database stores advisory knowledge.', 'Reusing analysis does not mean freezing the verdict. New database content can produce new findings for packages detected earlier.', 'Read [[vulnerability-db|the database lesson]] before assuming that clearing the scan cache updates vulnerability data.']),
    ], sources: ['image', 'vulnerability', 'cache', 'reporting'],
    quiz: quiz('The image digest stays the same, but tomorrow it has a new finding. What can explain this?', ['The advisory database changed', 'A digest always changes daily', 'The report created a vulnerability'], 0, 'The same package inventory can match newly published or revised advisory data.'),
  },
  {
    id: 'operator-flow', title: 'From workload to security report', short: 'Workload → report', minutes: 8, level: 'Walkthrough',
    description: 'Watch Kubernetes state become scan work, then a report you can query with kubectl.',
    takeaway: 'Reconciliation connects a resource revision to its scan reports. A running application does not imply that its scan finished.',
    flow: [
      step('Observe a workload', 'The Operator watches Kubernetes resources and notices a workload or a relevant change.', 'operator'),
      step('Decide what is missing', 'The controller reconciles the desired reports with existing reports and pending work. Scan configuration and resource identity matter.', 'operator'),
      step('Run the image scan', 'For the image vulnerability path, the Operator creates a scan Job. The scanner needs access to the image and its scan data.', 'scanner'),
      step('Collect the result', 'The Operator observes the Job result and turns scanner output into report resources. Failures need investigation rather than a clean verdict.', 'reports'),
      step('Maintain the reports', 'Reports relate to workload owners and revisions. Expiry or relevant changes can lead to replacement reports.', 'reports'),
    ], sections: [
      section('watch', 'Watch the work happen', ['Use a disposable cluster with Trivy Operator already installed. Open separate terminals to observe Jobs and reports.', 'Jobs can complete quickly. Use the Operator logs and events if a Job disappears before you inspect it.'], { code: code('kubectl get jobs -n trivy-system --watch\n# In another terminal:\nkubectl get vulnerabilityreports -A --watch') }),
      section('not-every-scan', 'Different assessments use different inputs', ['This walkthrough describes image vulnerability scanning. Do not assume every report type requires the same Job path.', 'Configuration auditing evaluates Kubernetes object configuration. RBAC assessment examines access rules. Infrastructure assessment needs evidence from nodes or control-plane components.', 'Use [[reports|the report guide]] to choose the report that matches your question.']),
      section('freshness', 'Separate three clocks', ['Report lifetime controls when scanner reports expire. Job lifetime controls cleanup of completed Jobs. Database freshness controls the advisory knowledge available to a scan.', 'The Operator documents a 24-hour default for scanner report lifetime. Inspect the installed release and configuration before relying on that value.', 'A fresh report can still use old advisory data if updates fail. Inspect scan timestamps and database metadata together.']),
    ], sources: ['reconciliation', 'operatorConfig', 'vulnReport', 'operatorFaq'],
    quiz: quiz('The workload is running but no VulnerabilityReport exists. What follows?', ['The image has no vulnerabilities', 'The scan state needs investigation', 'Kubernetes rejected the image'], 1, 'Report absence is not a successful scan. Inspect Jobs, events, registry access, and Operator logs.'),
  },
  {
    id: 'node-flow', title: 'From node evidence to assessment', short: 'Node → assessment', minutes: 6, level: 'Walkthrough',
    description: 'See why inspecting a Kubernetes host requires a different path from scanning a container image.',
    takeaway: 'Node-collector gathers evidence. Trivy evaluates it. Infrastructure reports describe the resulting assessment.',
    flow: [
      step('Select the node', 'The scanning integration arranges collection on the relevant Kubernetes node. The node must be reachable and eligible for the collection workload.', 'node-collector'),
      step('Read host evidence', 'The documented permission command uses stat on the resolved kubelet kubeconfig path. A mode such as 644 becomes an observation.', 'node-collector'),
      step('Return structured evidence', 'NodeInfo carries the value under info.kubeletConfFilePermissions.values. The key connects collection output to the rule input.', 'node-collector'),
      step('Evaluate the permission rule', 'KCV-0073 fails for the supplied 644 fixture. The 600 fixture passes, and an empty synthetic array also passes. The lesson explains why.', 'checks-bundle'),
      step('Publish the assessment', 'The integration exposes infrastructure assessment or compliance results. Read them separately from workload image vulnerability reports.', 'reports'),
    ], sections: [
      section('evidence', 'What the collector makes visible', ['A manifest tells you what Kubernetes was asked to run. Host evidence tells you about files and configuration on the machine.', 'Examples include kubelet configuration and permissions on relevant Kubernetes files. Managed control planes can restrict access to some evidence.', 'Collection coverage depends on the environment. Missing evidence does not establish that the corresponding control passed.']),
      section('access', 'Read-only access still crosses a boundary', ['Host mounts expose node data to the collection workload. Read-only mounts prevent writes through those mounts, but they still permit reading sensitive configuration.', 'Inspect the rendered Pod specification and service account permissions for your installed integration. Do not infer all permissions from the image name.', 'The Trivy CLI and Trivy Operator arrange collection differently. Their access requirements are not interchangeable.']),
      section('inspect', 'Inspect the installed resources', ['Run these commands against your disposable cluster. Locate the collection Pod before inspecting its mounts and security context.', 'Use API discovery to identify the installed infrastructure report kinds before querying them.'], { code: code('kubectl get pods,jobs -n trivy-system -o wide\nkubectl get serviceaccounts -n trivy-system\nkubectl api-resources --api-group=aquasecurity.github.io'), note: 'Report kinds and enabled collectors depend on the Operator version and configuration.' }),
    ], sources: ['kubernetes', 'infraReport', 'operatorConfig'],
    quiz: quiz('What does a read-only host mount guarantee?', ['The mounted files contain no secrets', 'The collector cannot write through that mount', 'Every hardening check passes'], 1, 'Read-only describes write access. It does not remove the sensitivity of the data that can be read.'),
  },
  {
    id: 'database-flow', title: 'How new knowledge reaches a scan', short: 'Advisory → database', minutes: 6, level: 'Walkthrough',
    description: 'Follow advisory publication, database construction, distribution, and local use.',
    takeaway: 'Database updates change what Trivy knows. Checks bundle updates change the configuration rules it can evaluate.',
    flow: [
      step('Publish advisory data', 'Vendors and vulnerability sources publish affected package ranges, status, severity, and remediation details.', 'vulnerability-db'),
      step('Collect source records', 'Upstream collection pipelines gather source advisories. The vuln-list family belongs to this ingestion side of the system.', 'vulnerability-db'),
      step('Build trivy-db', 'The database build transforms source records into a format that the vulnerability scanner can consume.', 'vulnerability-db'),
      step('Publish an OCI artifact', 'The built database is distributed through container registries as an OCI artifact. A schema tag identifies its data format.', 'vulnerability-db'),
      step('Refresh the local database', 'Trivy obtains a compatible database and uses it for matching. A local cache avoids downloading it for every package.', 'scanner'),
    ], sections: [
      section('separate', 'Three independently useful assets', ['The vulnerability database provides advisory facts. The Java database provides package identification data. The checks bundle provides configuration rules.', 'These assets solve different problems and have separate update controls. A refreshed Java index does not replace a refreshed vulnerability database.', 'The [[java-db|Java lesson]] follows identification. The [[checks-bundle|checks lesson]] follows rule distribution.']),
      section('distribution', 'A registry carries more than images', ['OCI is a format for distributing container-related artifacts. A registry can carry a database or rule bundle without that artifact being an application image.', 'Trivy documents registry locations and configurable repository flags. If you override those locations, plan compatibility and fallback behavior explicitly.', 'For vulnerability and Java databases, an omitted tag resolves to the expected schema version rather than a generic latest tag.']),
      section('preload', 'Download the database without a scan', ['Run these commands on a connected machine with Trivy installed. They prepare database assets without scanning an image.'], { code: code('trivy image --download-db-only\ntrivy image --download-java-db-only\ntrivy --version') }),
    ], sources: ['ingestion', 'databases', 'java', 'checks'],
    quiz: quiz('Does a normal Trivy scan clone the vuln-list repositories?', ['Yes, for every package', 'No, it consumes the built database', 'Only when the image has no findings'], 1, 'The source collection pipeline builds the distributable database. Normal scanning uses that database.'),
  },
  {
    id: 'scanner', title: 'Trivy: the scanning engine', short: 'Trivy scanner', minutes: 6, level: 'Component',
    description: 'Choose an input, extract evidence, select scanners, and produce a report.',
    takeaway: 'A target tells Trivy where to look. A scanner tells it what question to ask.',
    diagram: ['Artifact', 'Analyzers', 'Selected scanners', 'Report'],
    sections: [
      section('targets', 'Targets describe the input', ['A target is the thing Trivy inspects. Image, filesystem, repository, root filesystem, Kubernetes, and SBOM commands address different inputs.', 'An analyzer recognizes evidence in that input. Package databases, lockfiles, and archive metadata can reveal installed software.', 'Supported ecosystems and target coverage define what Trivy can discover. Unrecognized files do not become proof of absence.']),
      section('scanners', 'Scanners describe the question', ['Vulnerability scanning matches package evidence to advisories. Misconfiguration scanning evaluates configuration rules. Secret scanning looks for credential patterns.', 'License scanning identifies and classifies license information. Enable the scanner that matches your goal rather than relying on command defaults.', 'Image and filesystem scans commonly enable vulnerability and secret scanning by default. Use explicit scanner flags in repeatable exercises.'], { code: code('trivy image --scanners vuln alpine:3.20\ntrivy fs --scanners secret .\ntrivy config ./labs') }),
      section('mode', 'One engine, several integrations', ['You can run Trivy directly in a terminal or in a build pipeline. Trivy Operator arranges scans from inside Kubernetes.', 'Client/server mode moves selected scanning work and database management to a Trivy server. It does not make every scanner server-side.', 'Read [[client-server|the client/server lesson]] before deciding where artifact data and credentials cross a network boundary.']),
    ], sources: ['trivy', 'filesystem', 'image', 'modes'],
    quiz: quiz('What does --scanners vuln select?', ['An image registry', 'The vulnerability scanner', 'The report format'], 1, 'The target command selects the input. The scanners flag selects the assessment.'),
  },
  {
    id: 'operator', title: 'Trivy Operator: scans that follow the cluster', short: 'Trivy Operator', minutes: 7, level: 'Component',
    description: 'Learn the controller loop that turns Kubernetes changes into maintained security reports.',
    takeaway: 'The Operator automates assessment and reporting. Enforcement requires a separate policy decision and integration.',
    diagram: ['Kubernetes change', 'Reconcile', 'Scan work', 'Report resources'],
    sections: [
      section('reconcile', 'A controller keeps results in step', ['Reconciliation means bringing observed state toward desired state. The Operator uses this pattern to maintain security reports for cluster resources.', 'It watches resource changes, identifies needed assessments, and coordinates scanning. The image vulnerability path uses Kubernetes Jobs.', 'It does not need to put a scanner inside every application container. Scan work has its own resource, registry, and scheduling requirements.']),
      section('controls', 'Configuration changes the work', ['Enabled scanners, watched namespaces, scan concurrency, resource limits, registry credentials, and timeouts all affect behavior.', 'Report expiry and completed-Job cleanup are separate controls. Inspect the values for the chart version you install.', 'A restricted cluster can prevent scan Jobs from scheduling or accessing the required data. Inspect events before treating missing results as an empty report.']),
      section('boundary', 'Reporting is not admission enforcement', ['The Operator reports risks in Kubernetes resources. A VulnerabilityReport does not itself prevent a Deployment from running.', 'You can connect reports to dashboards, alerts, and policy systems. Those consumers make additional decisions beyond the scan.', 'Follow [[operator-flow|the workload flow]] for the lifecycle, or use [[operator-lab|the local-cluster lab]] to observe it.']),
    ], sources: ['operator', 'reconciliation', 'operatorConfig', 'operatorFaq'],
    quiz: quiz('A report contains a critical vulnerability. Does the Operator automatically stop the application?', ['Yes, all critical findings stop Pods', 'No, reports do not themselves enforce admission', 'Only if the report is JSON'], 1, 'Assessment and enforcement are separate responsibilities.'),
  },
  {
    id: 'node-collector', title: 'node-collector: evidence from the host', short: 'node-collector', minutes: 6, level: 'Component',
    description: 'Understand the small component that connects node configuration to infrastructure assessment.',
    takeaway: 'The collector supplies observations about a node. The scanning integration turns those observations into findings.',
    diagram: ['Node files & processes', 'node-collector', 'Structured evidence', 'Trivy assessment'],
    sections: [
      section('purpose', 'Why a separate collector exists', ['A workload manifest does not contain the full kubelet configuration or the permissions on host files. Those facts live on the node.', 'Node-collector gathers relevant filesystem and process evidence for Kubernetes assessment. The integration uses that evidence to evaluate supported controls.', 'Do not confuse node-collector with a package vulnerability database, a workload image scanner, or a sensor for every runtime event.']),
      section('deployment', 'Inspect the collection workload', ['The collector image is commonly named node-collector. The upstream source repository is aquasecurity/k8s-node-collector.', 'Inspect the collector image tag, host mounts, scheduling constraints, and service account in your deployment. Chart releases can change these details.', 'A collection workload needs access to the evidence it evaluates. Missing mounts, unsupported node layouts, or inaccessible control planes reduce coverage.']),
      section('read-result', 'Interpret collection failures', ['First distinguish a failed collection from a failed security control. An unavailable file can mean missing evidence rather than a confirmed insecure value.', 'Then compare the assessment with the node type and benchmark requirements. Some controls need human interpretation or information outside the collector.', 'Use [[node-flow|the node walkthrough]] to locate the boundary between collecting evidence and evaluating it.']),
    ], sources: ['kubernetes', 'infraReport', 'operatorConfig'],
    repo: 'https://github.com/aquasecurity/k8s-node-collector',
    quiz: quiz('Where does node-collector fit?', ['It supplies host evidence for assessment', 'It stores every published CVE', 'It blocks vulnerable image admission'], 0, 'The collector observes host data. Trivy and its integration use that evidence in the assessment path.'),
  },
  {
    id: 'reports', title: 'Read the right report', short: 'Reports & lifecycle', minutes: 7, level: 'Component',
    description: 'Match your question to a report type, then inspect ownership, scope, and freshness.',
    takeaway: 'A report kind describes an assessment. It does not describe every possible risk in its owner.',
    sections: [
      section('families', 'Different questions produce different reports', ['VulnerabilityReport describes known package vulnerabilities for a workload container image. ConfigAuditReport describes configuration policy results for Kubernetes resources.', 'ExposedSecretReport captures secret scan results. RBAC assessment reports describe access-rule findings. Infrastructure reports describe node or control-plane assessment.', 'SbomReport records software inventory. ClusterComplianceReport organizes supported assessment results against a compliance specification.'], { bullets: ['Image packages → VulnerabilityReport', 'Object configuration → ConfigAuditReport', 'Host or control-plane configuration → infrastructure assessment reports'] }),
      section('scope', 'Discover the API that is actually installed', ['A CRD is a Kubernetes extension that defines a resource. The Operator installs CRDs for its report types.', 'Use discovery to inspect each installed kind and whether it is namespaced. Do not infer scope only from documentation tables or report names.', 'Use the report metadata to inspect its namespace, owner references, labels, and creation time.'], { code: code('kubectl api-resources --api-group=aquasecurity.github.io\nkubectl get vulnerabilityreports -A -o wide\nkubectl get configauditreports -A -o wide') }),
      section('lifecycle', 'Reports follow owners and freshness rules', ['Reports relate to the resources or workload revisions they describe. Kubernetes owner references support cleanup when an owner disappears.', 'Deleting an applicable report can trigger the Operator to recreate it. Scanner report expiry provides another path to fresh scan work.', 'A timestamp describes when the report was made. Interpret it together with image identity, scanner version, and the data used by the scan.']),
    ], sources: ['crds', 'vulnReport', 'configReport', 'reconciliation', 'operatorConfig'],
    quiz: quiz('Which result answers whether a workload image contains a known vulnerable package?', ['ConfigAuditReport', 'VulnerabilityReport', 'A successful Pod readiness probe'], 1, 'Configuration assessment and application readiness answer different questions from package vulnerability scanning.'),
  },
  {
    id: 'client-server', title: 'What moves to the Trivy server?', short: 'Client / server', minutes: 5, level: 'Component',
    description: 'Trace the data boundary before sharing database and cache infrastructure.',
    takeaway: 'The client analyzes artifacts locally and sends analysis results. The server does not need the original image layers.',
    diagram: ['Local artifact', 'Client analysis', 'Analysis over HTTP', 'Server & database'],
    sections: [
      section('split', 'Split analysis from selected assessments', ['Client/server mode centralizes database management and selected scanning work. The client still obtains and analyzes its target.', 'The documented model runs vulnerability and license scanning on the server. Misconfiguration and secret scanning run on the client.', 'The client sends analysis results, including package information. Treat those results as potentially sensitive metadata even without the original artifact.']),
      section('try', 'Try the boundary locally', ['Install Trivy on your machine. Start the server in one terminal, then run the client in another terminal.', 'Bind this learning server to localhost. A shared deployment needs explicit authentication, transport protection, and access decisions.'], { code: code('trivy server --listen localhost:4954\n# In a second terminal:\ntrivy image --server http://localhost:4954 --scanners vuln alpine:3.20') }),
      section('trust', 'A shared token is not tenant isolation', ['Clients that share a server also share infrastructure and trust assumptions. A token alone does not create isolation between mutually untrusted users.', 'Inspect the supported target commands for your Trivy release. Do not assume that Kubernetes and configuration commands support this mode.', 'Follow [[air-gap|the offline lesson]] if your actual goal is reducing external database downloads without introducing a shared scanning server.']),
    ], sources: ['modes', 'cache'],
    quiz: quiz('What does the client normally send for vulnerability scanning?', ['The running application process', 'Analysis results such as package information', 'Every original image layer'], 1, 'The client analyzes the artifact locally and sends the analysis needed by the server.'),
  },
  {
    id: 'vulnerability-db', title: 'trivy-db: advisory knowledge', short: 'Vulnerability database', minutes: 6, level: 'Scan data',
    description: 'Understand the data that connects a detected package version to a known vulnerability.',
    takeaway: 'trivy-db answers which known advisories apply to detected packages. It does not discover those packages by itself.',
    diagram: ['Vendor advisories', 'Collection pipeline', 'trivy-db artifact', 'Package matching'],
    sections: [
      section('contents', 'Facts about affected software', ['An advisory describes a known software security issue. It can include affected versions, fixed versions, severity, and source references.', 'Trivy combines advisory data with detected package identity and ecosystem context. Distribution-specific package versions need distribution-aware interpretation.', 'The [[database-flow|database flow]] explains how collected source records become the distributable asset.']),
      section('version', 'The database has its own lifecycle', ['The Trivy executable and its database are separate assets. Updating one does not automatically establish the compatibility or freshness of the other.', 'Database repository tags can identify schema versions. A schema is the structure that the database reader expects.', 'Use the compatible database for your installed Trivy version. Inspect version output and metadata when investigating update or compatibility failures.'], { code: code('trivy image --download-db-only\ntrivy --version') }),
      section('sources', 'The advisory source matters', ['A finding is a claim based on specific evidence and advisory data. Inspect the source advisory when distribution status or fixed versions appear surprising.', 'A package name alone is not enough for reliable matching. Version, ecosystem, and operating system information affect the result.', 'Keep source provenance when you triage or share a finding. A severity label alone omits the reasoning needed for a remediation decision.']),
    ], sources: ['databases', 'ingestion', 'vulnerability'], repo: 'https://github.com/aquasecurity/trivy-db',
    quiz: quiz('Does downloading trivy-db inspect your image?', ['Yes, the download is the scan', 'No, artifact analysis is separate', 'Only for Java images'], 1, 'The database supplies advisory data. Trivy still needs to analyze the target.'),
  },
  {
    id: 'java-db', title: 'trivy-java-db: identify the package first', short: 'Java index database', minutes: 5, level: 'Scan data',
    description: 'See how an archive becomes a recognizable Java dependency before vulnerability matching.',
    takeaway: 'The Java database is an identification index. It is not a second general vulnerability feed.',
    diagram: ['JAR archive', 'Metadata / hash lookup', 'Package coordinates', 'Vulnerability matching'],
    sections: [
      section('identity', 'An archive name is not always an identity', ['A JAR is a Java archive. Its file name does not always identify the original library and version.', 'Trivy examines archive metadata when available. The Java database supports identification when embedded information is missing or insufficient.', 'Package coordinates identify a Java artifact and its version. Once Trivy identifies a package, vulnerability matching can use advisory data.']),
      section('independent', 'Manage this download separately', ['Java identification data has its own repository and update flags. The first relevant archive scan can trigger a separate download.', 'A vulnerability database that is ready locally does not imply that Java identification data is ready. Prepare both assets for an offline Java scan.', 'Java manifest and dependency analysis can use other resolution paths. The archive index does not eliminate every possible network dependency.'], { code: code('trivy image --download-java-db-only\ntrivy image --help') }),
      section('failure', 'Diagnose the missing layer', ['If the package is not identified, investigate metadata and analysis coverage first. Advisory refreshes cannot match a package that was never discovered.', 'If identity exists but a finding is disputed, investigate version matching and the advisory source. These are different failure modes.', 'Use [[air-gap|the offline recipe]] to separate data preparation from scanning.']),
    ], sources: ['java', 'databases', 'offline'], repo: 'https://github.com/aquasecurity/trivy-java-db',
    quiz: quiz('What question does the Java index primarily answer?', ['Which library and version is this archive?', 'Is this Kubernetes Pod privileged?', 'Which CVEs exist for every ecosystem?'], 0, 'The index supports package identification. Advisory data supports the vulnerability verdict.'),
  },
  {
    id: 'checks-bundle', title: 'trivy-checks: rules, not advisories', short: 'Misconfiguration checks', minutes: 6, level: 'Scan data',
    description: 'Follow a rule from a published bundle to a configuration finding.',
    takeaway: 'A check evaluates configuration evidence against a rule. It does not need a package CVE to report a problem.',
    diagram: ['Configuration file', 'Parsed input', 'Check evaluation', 'Misconfiguration result'],
    sections: [
      section('logic', 'Rules describe unwanted configuration', ['A misconfiguration is a setting that violates an assessed rule. Examples include excessive privileges or an exposed resource.', 'Trivy parses supported infrastructure files into structured input. Built-in rules evaluate that input and produce findings with identifiers and guidance.', 'Rego is a language for policy rules. Trivy distributes built-in checks through a bundle, while some checks also use Go implementations.']),
      section('distribution', 'Downloaded rules and embedded fallback', ['The checks bundle updates independently from the vulnerability database. Trivy also includes embedded checks as a fallback.', 'Embedded checks reflect the executable release. A successful scan with fallback rules does not establish that the newest checks were used.', 'The checks repository flag is separate from database repository flags. Read the installed release documentation before configuring mirrors or offline rules.']),
      section('operator-rules', 'Why the Operator documentation uses other names', ['The Operator documentation also refers to trivy-policies and a trivy-operator-policies-config ConfigMap. A ConfigMap stores configuration as a Kubernetes object.', 'A source repository name, a published bundle name, and a ConfigMap name describe different things. They are not three separate advisory databases.', 'Policy delivery changes across releases. Inspect your installed chart and its configuration before applying examples from another release.']),
      section('try', 'Evaluate a local manifest', ['Use the supplied fixture from [[config-lab|the configuration lab]]. The fixture deliberately permits privileged execution.', 'Run a configuration scan on the local file. Compare the finding with the exact field that triggered it.'], { code: code('trivy config ./labs/privileged-pod.yaml') }),
    ], sources: ['checks', 'misconfiguration', 'databases', 'operatorPolicies'], repo: 'https://github.com/aquasecurity/trivy-checks',
    quiz: quiz('Does every misconfiguration finding need a CVE identifier?', ['Yes, checks come from the CVE database', 'No, rules can report unsafe configuration directly', 'Only Kubernetes findings need a CVE'], 1, 'Configuration rules describe undesirable settings. They are distinct from known package vulnerabilities.'),
  },
  {
    id: 'custom-checks', title: 'Add a rule for your environment', short: 'Custom checks', minutes: 6, level: 'Scan data',
    description: 'Understand custom policy inputs, metadata, evaluation, and testing before writing a production rule.',
    takeaway: 'A useful custom rule needs a precise input contract, positive and negative examples, and an actionable result.',
    diagram: ['Local requirement', 'Input schema', 'Custom Rego check', 'Fixtures & results'],
    sections: [
      section('requirement', 'Start with an observable requirement', ['A policy is a rule that expresses an expected condition. For example, a team can require specific labels on Kubernetes workloads.', 'Describe the exact resource kinds and fields that the rule covers. Decide what happens when the field is absent.', 'Separate your local requirement from the built-in rules. A team-specific label requirement is not a universal vulnerability.']),
      section('input', 'Use the input that Trivy actually supplies', ['Custom checks use documented metadata and input schemas. A rule written for raw YAML can fail if the scanner supplies a different structured representation.', 'Use the custom-check documentation for your installed Trivy release. Rego syntax and integration metadata can evolve.', 'The --config-check flag selects a directory of custom checks. Namespace and selector controls determine which checks run.']),
      section('tests', 'Prove the rule with contrasting fixtures', ['Create one fixture that violates the requirement and one that satisfies it. Include an unrelated resource that the rule must ignore.', 'Assert the rule identifier and message as well as the overall result. A scan with no results can mean a selector mistake.', 'Keep the rule, its examples, and the expected behavior together. Run them again when the Trivy version changes.'], { bullets: ['Violation fixture: the selected resource lacks the required field.', 'Passing fixture: the selected resource supplies the required value.', 'Unrelated fixture: another resource kind remains unaffected.'] }),
    ], sources: ['custom', 'checks', 'misconfiguration'],
    quiz: quiz('A custom rule reports nothing. What establishes that it works?', ['Only the process exit code', 'A violating fixture that produces the expected finding', 'The rule file exists'], 1, 'A negative fixture proves the rule is selected and can detect the intended condition.'),
  },
  {
    id: 'secret-license', title: 'Secrets and licenses use different evidence', short: 'Secrets & licenses', minutes: 5, level: 'Scan data',
    description: 'Complete the picture without inventing a separate database for every scanner.',
    takeaway: 'Secret detection uses patterns. License scanning uses package metadata and license evidence. Neither is the advisory database.',
    sections: [
      section('secret', 'Secret scanning finds candidate credentials', ['A secret is a credential or other sensitive value. Trivy uses built-in and configurable detection rules to find candidate secrets.', 'A match needs investigation. Pattern matching can find false positives and can miss formats outside its coverage.', 'If a real credential appears in a report, protect the report and rotate the credential through its issuer. Removing a file alone does not revoke access.'], { code: code('trivy fs --scanners secret .') }),
      section('license', 'License scanning identifies usage conditions', ['A software license describes permissions and conditions for use. Trivy extracts license information from package metadata and supported file evidence.', 'A license result is not a vulnerability severity judgment. Your organization decides which license conditions apply to its use and distribution.', 'Enable the license scanner explicitly for this exercise. Inspect the scanner documentation before enabling broader file classification.'], { code: code('trivy image --scanners license alpine:3.20') }),
      section('assets', 'Do not assume another downloadable database', ['Trivy documents the vulnerability database, Java database, and checks bundle as separate scan assets.', 'Secret rules and license detection follow their own implementation and configuration paths. Do not treat them as extra vulnerability database feeds.', 'When troubleshooting, start with the scanner that generated the result. Its evidence and configuration determine the next step.']),
    ], sources: ['secrets', 'licenses', 'databases'],
    quiz: quiz('Does a license finding prove that the package is vulnerable?', ['Yes, all findings are CVEs', 'No, license conditions and vulnerabilities are different questions', 'Only for operating system packages'], 1, 'License scanning describes license evidence. Vulnerability scanning matches known security advisories.'),
  },
  {
    id: 'first-scan', title: 'Lab 01: inspect your first image', short: 'First image scan', minutes: 10, level: 'Hands-on lab',
    description: 'Produce a report, read its evidence, and learn what the command exit code actually means.',
    takeaway: 'A finding is useful when you can connect it to a package, a source advisory, and a remediation decision.',
    sections: [
      section('setup', 'Prepare your terminal', ['Install Trivy using its official installation guide. This exercise needs network access and permission to write files in your current directory.', 'Use an empty learning directory so the output files are easy to find. The Alpine tag is a mutable reference. Save the resolved image identity from the report.', 'Record your Trivy version. Exact finding counts are intentionally not prescribed because advisory data changes.'], { code: code('mkdir -p trivy-image-lab\ncd trivy-image-lab\ntrivy --version') }),
      section('scan', 'Run one scanner and keep the report', ['Run the vulnerability scanner against the example image. The command writes report.json in your learning directory.', 'Open the file in your editor. Compare its package evidence with [[image-scan|the worked libcrypto3 example]]. Findings depend on the resolved image and database.'], { code: code('trivy image --scanners vuln --format json --output report.json alpine:3.20'), note: 'Expected observation: a JSON report with target metadata and Results. Vulnerability counts depend on the image contents and database snapshot.' }),
      section('gate', 'Make the exit behavior explicit', ['Run the next command in the same terminal. It returns code 1 when the filtered findings meet the configured failure condition.', 'Immediately print the status to distinguish that result from the default success exit code. Operational errors also need investigation.'], { code: code('trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 alpine:3.20\nprintf "Exit status: %s\\n" "$?"') }),
      section('reflect', 'Explain one result in your own words', ['Identify the package, installed version, advisory, and available fix. State whether a fix is available before proposing an upgrade.', 'If there are no findings, state the selected scanner and observed coverage. Do not conclude that every type of risk is absent.', 'Continue to [[triage|the triage lesson]] to separate evidence, filtering, and exceptions.']),
    ], sources: ['image', 'reporting', 'exit', 'vulnerability'],
    quiz: quiz('Trivy exits with 0 using its default exit behavior. What can you conclude?', ['No vulnerabilities exist', 'The command can succeed even with findings', 'Every package was analyzed'], 1, 'Findings do not fail the command by default. Set an explicit exit-code policy for a pipeline.'),
  },
  {
    id: 'config-lab', title: 'Lab 02: change one field, compare the result', short: 'Configuration lab', minutes: 10, level: 'Hands-on lab',
    description: 'Scan a deliberately insecure Kubernetes manifest locally, then remove its privileged setting.',
    takeaway: 'Configuration findings connect a rule to a concrete field. Fixing that field does not imply all other rules pass.',
    sections: [
      section('fixture', 'Prepare the local fixture', ['Download the sample manifest below into a local labs directory. From the repository, copy site/labs/privileged-pod.yaml into that directory.', 'Do not apply this fixture to a cluster. The exercise scans the local file and needs no running Kubernetes cluster.'], { download: 'labs/privileged-pod.yaml', code: code('apiVersion: v1\nkind: Pod\nmetadata:\n  name: trivy-learning-fixture\nspec:\n  containers:\n    - name: demo\n      image: nginx:1.27\n      securityContext:\n        privileged: true', 'privileged-pod.yaml', 'yaml') }),
      section('before', 'Inspect the finding before the change', ['Run Trivy against the file. Locate the finding related to privileged containers and read its field location and remediation.', 'Other findings are expected because this minimal example omits several hardening controls. Focus on the single field for this comparison.'], { code: code('trivy config ./labs/privileged-pod.yaml'), note: 'Expected observation: the scan reports the privileged container setting. Rule identifiers and additional findings depend on the checks version.' }),
      section('after', 'Change the field and scan again', ['Set privileged to false in your local manifest. Run the same command again.', 'Make sure that the privileged-container finding disappears. Compare the remaining findings with the unchanged fields.', 'This exercise changes a local file. Kubernetes admission and node configuration remain separate assessment paths.']),
      section('reflect', 'Trace the source of the result', ['The input is a Kubernetes manifest. The rule comes from the checks used by your installed Trivy version.', 'The vulnerability database does not need an advisory about this Pod. The rule evaluates configuration directly.', 'Continue to [[custom-checks|custom checks]] to learn how to add an environment-specific requirement.']),
    ], sources: ['misconfiguration', 'checks', 'custom'],
    quiz: quiz('After setting privileged to false, several findings remain. Is that unexpected?', ['Yes, one fix must clear the report', 'No, other rules evaluate other fields', 'Yes, the database is broken'], 1, 'Each rule assesses its own condition. The change only addresses the privileged setting.'),
  },
  {
    id: 'operator-lab', title: 'Lab 03: watch the Operator reconcile', short: 'Operator lab', minutes: 20, level: 'Hands-on lab',
    description: 'Install into a disposable cluster, create one workload, and inspect its reports.',
    takeaway: 'Use Jobs, events, logs, and report metadata together to explain what the Operator did.',
    sections: [
      section('setup', 'Use a disposable local cluster', ['Prepare a local Kubernetes cluster and install kubectl and Helm. The commands below assume that the cluster context is already selected.', 'Run the context command before installing anything. The Operator creates cluster-wide resources and can arrange access to host evidence.', 'Use this exercise only in the disposable cluster that you prepared.'], { code: code('kubectl config current-context\nkubectl cluster-info\nhelm repo add aqua https://aquasecurity.github.io/helm-charts/\nhelm repo update\nhelm search repo aqua/trivy-operator --versions') }),
      section('install', 'Choose a chart version and install', ['Select a chart version from the search output. Enter that exact value when the command below prompts you.', 'The command below requires that variable and fails early if it is unset. The chart version and Trivy executable version are separate values.'], { code: code('printf \'Chart version from the search output: \'\nread -r CHART_VERSION\nhelm install trivy-operator aqua/trivy-operator \\\n  --namespace trivy-system --create-namespace \\\n  --version "${CHART_VERSION:?Set CHART_VERSION to a chart version from the search output}"\nkubectl rollout status deployment/trivy-operator -n trivy-system --timeout=180s') }),
      section('observe', 'Create a workload and observe the reports', ['Create the learning namespace in your disposable cluster. Apply the two-container fixture below from the repository root.', 'The fixture runs api and sidecar containers in the payments Deployment. Expect separate vulnerability reports for those container names after successful assessment.', 'Inspect Jobs and reports after the Operator starts. Image downloads and initial database preparation can take time.'], { download: 'labs/operator/payments.yaml', code: code('kubectl create namespace trivy-learning\nkubectl apply -f site/labs/operator/payments.yaml\nkubectl get jobs -n trivy-system\nkubectl get vulnerabilityreports,configauditreports -n trivy-learning'), note: 'Expected observation, not recorded cluster output: reports for api and sidecar have the current payments ReplicaSet as their owner.' }),
      section('diagnose', 'Explain a missing report', ['If reports do not appear, inspect Operator logs, scan Job events, and registry access. Make sure that the learning namespace is in scope.', 'Read the installed report definitions with API discovery. Enabled features and resource kinds vary by chart release.'], { code: code('kubectl logs deployment/trivy-operator -n trivy-system --tail=100\nkubectl get events -n trivy-system --sort-by=.lastTimestamp\nkubectl api-resources --api-group=aquasecurity.github.io') }),
      section('cleanup', 'Remove the exercise resources', ['Run these commands only in the disposable cluster used for this lab. They delete the learning workload and uninstall the Operator release.', 'Helm can retain CRDs and their report objects after uninstall. Discard the disposable cluster through its cluster tool to remove all exercise state.'], { code: code('kubectl delete namespace trivy-learning\nhelm uninstall trivy-operator -n trivy-system') }),
    ], sources: ['operatorInstall', 'operator', 'operatorConfig', 'operatorFaq'],
    quiz: quiz('Which observation proves the vulnerability scan finished successfully?', ['The application Deployment exists', 'A corresponding successful scan and report exist', 'The Helm repository was added'], 1, 'Installing the controller and creating a workload are prerequisites, not proof of a completed assessment.'),
  },
  {
    id: 'sbom', title: 'Lab 04: inventory now, scan again later', short: 'SBOM & VEX', minutes: 10, level: 'Hands-on lab',
    description: 'Separate a software inventory from the advisory knowledge used to assess it.',
    takeaway: 'An SBOM records software components. A vulnerability report evaluates known risk using the available evidence and advisory data.',
    diagram: ['Image', 'SBOM inventory', 'Current advisories', 'New assessment'],
    sections: [
      section('generate', 'Generate a software inventory', ['An SBOM is a software bill of materials. It lists software components and their identifying information.', 'Install Trivy and use a directory where you can write output files. Generate a CycloneDX inventory for the example image.'], { code: code('trivy image --format cyclonedx --output sbom.cdx.json alpine:3.20') }),
      section('scan', 'Evaluate the inventory', ['Use the generated file as the target. Trivy uses the recorded package evidence to assess known vulnerabilities.', 'The result depends on inventory quality and supported identifiers. An incomplete SBOM cannot describe packages that it omitted.'], { code: code('trivy sbom --format json --output sbom-report.json sbom.cdx.json'), note: 'Expected observation: the inventory is the scan input. Updating advisory data can change the assessment without regenerating unchanged inventory.' }),
      section('vex', 'Separate inventory from affected-status claims', ['VEX is a statement about whether a vulnerability affects a product. It adds context that a package inventory alone does not provide.', 'Trivy can use supported VEX sources to filter findings. Evaluate the source, identity match, and justification before trusting a status claim.', 'VEX support and formats depend on the Trivy release. Read the current feature documentation before adding VEX to a production gate.']),
      section('reflect', 'Ask what the inventory can establish', ['An SBOM helps separate discovery from later assessment. It does not prove that every component was discovered or that the product is secure.', 'Keep the image identity and inventory provenance with the file. A stale inventory can describe an earlier artifact.', 'Continue to [[triage|triage]] to see how inventory evidence, advisory details, and exceptions work together.']),
    ], sources: ['sbom', 'vex', 'reporting'],
    quiz: quiz('Can an unchanged SBOM produce different vulnerability results later?', ['Yes, the advisory data can change', 'No, inventory freezes all future risk', 'Only if its filename changes'], 0, 'Inventory and advisory knowledge have separate lifecycles.'),
  },
  {
    id: 'air-gap', title: 'Scanning without external network access', short: 'Cache & offline scans', minutes: 8, level: 'Operations',
    description: 'Prepare the image and scan assets, then disable the download paths deliberately.',
    takeaway: 'Skipping an update does not create a missing database. Offline scanning starts with explicit preparation.',
    sections: [
      section('prepare', 'Prepare on a connected machine', ['An air-gapped environment has no external network access. It still needs an input artifact and compatible scan assets.', 'Use the same Trivy release on the preparation and offline machines. Download the databases into a dedicated cache directory.', 'Export the example image through Docker so the offline scan does not depend on a registry. These commands require Trivy and Docker.'], { code: code('trivy image --cache-dir ./trivy-cache --download-db-only\ntrivy image --cache-dir ./trivy-cache --download-java-db-only\ndocker pull alpine:3.20\ndocker save --output alpine.tar alpine:3.20\ntar -czf trivy-cache.tar.gz trivy-cache') }),
      section('scan', 'Transfer the files and scan the archive', ['Transfer alpine.tar and trivy-cache.tar.gz to the offline machine using your approved transfer process. Install the matching Trivy release there.', 'Extract the prepared cache in your working directory. Run the vulnerability-only scan against the local archive.'], { code: code('tar -xzf trivy-cache.tar.gz\ntrivy image --cache-dir ./trivy-cache \\\n  --input ./alpine.tar --scanners vuln \\\n  --skip-db-update --skip-java-db-update --offline-scan'), note: 'This recipe covers vulnerability scanning of a local image archive. It does not claim to prepare every scanner or integration.' }),
      section('checks', 'Prepare rule-based scans separately', ['For an offline configuration exercise, use the checks embedded in the installed executable with --skip-check-update. These are release-time rules.', 'There is no checks-only download flag. To prepare downloaded rules, run a configuration scan on the connected machine and transfer its populated cache.', 'The --skip-check-update flag prevents an update attempt. It does not populate a missing downloaded bundle.', 'Other targets can need additional resolution data or remote inputs. Test your exact command in the offline environment before relying on it.']),
      section('freshness', 'Make the data age visible', ['Record the Trivy version, database metadata, transfer date, and artifact digest. Refresh the prepared assets on a defined schedule.', 'The analysis cache and advisory database serve different purposes. A warm analysis cache does not establish current advisory knowledge.', 'Treat an update failure as an operational signal. Do not silently label old results as current.']),
    ], sources: ['offline', 'databases', 'cache', 'java', 'checks'],
    quiz: quiz('What happens if you skip database updates without providing a usable database?', ['Trivy learns advisories from the image', 'The required database is still missing', 'All packages are considered safe'], 1, 'Skip flags prevent downloads. They do not supply the required local data.'),
  },
  {
    id: 'triage', title: 'Turn a finding into a decision', short: 'Triage & CI gates', minutes: 7, level: 'Operations',
    description: 'Connect evidence to action without hiding uncertainty behind a severity filter.',
    takeaway: 'Filtering changes what a report shows. It does not change the software or remove the underlying risk.',
    sections: [
      section('evidence', 'Establish the identity and affected status', ['Triage means examining a finding to decide the next action. Start with the exact artifact, package, installed version, and advisory.', 'Read the relevant vendor status and fixed version. Distribution-specific fixes can differ from upstream version numbering.', 'Record the scan time and available data. A result without provenance is difficult to reproduce or dispute.']),
      section('gate', 'Use explicit pipeline behavior', ['A CI gate is a rule that decides pipeline success. Trivy normally permits findings without a nonzero exit status.', 'Choose scanners, severity filters, and exit behavior explicitly. Keep the unfiltered evidence when you need to audit the decision.'], { code: code('trivy image --scanners vuln --severity HIGH,CRITICAL --exit-code 1 alpine:3.20') }),
      section('exceptions', 'Give exceptions a reason and an expiry', ['The --ignore-unfixed flag hides findings without known fixes. It does not establish that those findings are harmless.', 'Use documented ignore mechanisms or VEX when justified. Record the responsible owner, scope, reason, and review date outside a bare suppression identifier.', 'Use --show-suppressed where supported to inspect suppressed findings. Revisit exceptions when package versions or affected-status evidence changes.']),
      section('coverage', 'State what the scan did not observe', ['Zero findings means none were reported under the selected scope and filters. It does not establish that the input has no unknown vulnerabilities.', 'Unsupported ecosystems, missing metadata, and old operating systems can reduce coverage. Make those limits visible beside the result.', 'A defensible decision names the evidence, the action, and the remaining uncertainty.']),
    ], sources: ['filtering', 'exit', 'vulnerability', 'vex'],
    quiz: quiz('What does --ignore-unfixed do?', ['Repairs vulnerable packages', 'Filters findings without a known fix', 'Proves the remaining image is safe'], 1, 'It changes report visibility. It does not patch the image or eliminate risk.'),
  },
];

export const glossary = [
  ['Advisory', 'A published description of a software security issue, including affected versions and available remediation.', 'vulnerability-db'],
  ['Analyzer', 'Code that recognizes evidence such as package databases or archive metadata in a target.', 'scanner'],
  ['Artifact', 'A concrete input such as a container image, filesystem, or software inventory.', 'image-scan'],
  ['Check', 'A rule that evaluates configuration evidence and reports whether a condition is satisfied.', 'checks-bundle'],
  ['Checks bundle', 'A distributable collection of built-in misconfiguration rules.', 'checks-bundle'],
  ['CRD', 'Custom Resource Definition: a Kubernetes extension that defines a resource type.', 'reports'],
  ['CVE', 'Common Vulnerabilities and Exposures: a system of identifiers for publicly disclosed vulnerabilities.', 'vulnerability-db'],
  ['Digest', 'A content-derived identifier for an artifact. It distinguishes exact content from a mutable tag.', 'image-scan'],
  ['IaC', 'Infrastructure as code: files that describe infrastructure configuration.', 'config-lab'],
  ['Java coordinates', 'Identifiers for a Java artifact, typically including its group, artifact name, and version.', 'java-db'],
  ['Job', 'A Kubernetes resource that arranges Pods to perform work toward completion.', 'operator-flow'],
  ['Misconfiguration', 'A setting or omission that violates an assessed configuration rule.', 'checks-bundle'],
  ['OCI artifact', 'Content distributed through a container registry using Open Container Initiative formats.', 'database-flow'],
  ['Owner reference', 'Kubernetes metadata that relates an object to its owner and supports lifecycle management.', 'reports'],
  ['RBAC', 'Role-based access control: permissions granted through roles and bindings.', 'reports'],
  ['Reconciliation', 'A controller process that brings observed state toward desired state.', 'operator'],
  ['Rego', 'A declarative language used to express policy rules.', 'custom-checks'],
  ['SBOM', 'Software bill of materials: an inventory of software components and identifying information.', 'sbom'],
  ['Scan cache', 'Reusable analysis data. It is distinct from the advisory database used to judge known vulnerabilities.', 'air-gap'],
  ['Scanner', 'The assessment that asks a question about evidence, such as whether a package has known vulnerabilities.', 'scanner'],
  ['Schema', 'The structure that a data reader expects from its input.', 'vulnerability-db'],
  ['TTL', 'Time to live: a duration that controls expiry or cleanup for a particular resource.', 'operator-flow'],
  ['VEX', 'Vulnerability Exploitability eXchange: statements about whether vulnerabilities affect a product.', 'sbom'],
];

export const components = {
  scanner: { title: 'Trivy scanner', type: 'ENGINE', icon: 'scan', text: 'Analyzes images and files, then runs the selected security scanners.', role: 'Analyze & assess', link: 'scanner', color: 'lime' },
  operator: { title: 'Trivy Operator', type: 'CONTROLLER', icon: 'layers', text: 'Watches Kubernetes state, coordinates scans, and maintains report resources.', role: 'Observe & reconcile', link: 'operator', color: 'blue' },
  'node-collector': { title: 'node-collector', type: 'COLLECTOR', icon: 'server', text: 'Reads node evidence for infrastructure assessment. Host evidence is different from image contents.', role: 'Collect host evidence', link: 'node-collector', color: 'blue' },
  'vulnerability-db': { title: 'trivy-db', type: 'ADVISORY DATA', icon: 'database', text: 'Known vulnerability information used to match detected package versions to advisories.', role: 'What is vulnerable?', link: 'vulnerability-db', color: 'amber' },
  'java-db': { title: 'trivy-java-db', type: 'IDENTIFICATION DATA', icon: 'database', text: 'Helps identify Java archives. The vulnerability database provides the later advisory match.', role: 'Which Java package?', link: 'java-db', color: 'amber' },
  'checks-bundle': { title: 'trivy-checks', type: 'RULE BUNDLE', icon: 'file', text: 'Built-in rules that evaluate supported configuration. These rules are distinct from CVE advisories.', role: 'Is it configured safely?', link: 'checks-bundle', color: 'amber' },
  reports: { title: 'Security reports', type: 'OUTPUT', icon: 'file', text: 'Findings become readable reports. The Operator stores supported report types as Kubernetes resources.', role: 'Inspect & act', link: 'reports', color: 'blue' },
};

export const paths = [
  { id: 'essentials', title: 'Understand the ecosystem', description: 'Build the mental model, then follow an image through a scan.', icon: 'compass', ids: ['topology', 'scanner', 'image-scan', 'vulnerability-db', 'java-db', 'checks-bundle'] },
  { id: 'kubernetes', title: 'Take it into Kubernetes', description: 'Connect workloads, scan Jobs, host evidence, and reports.', icon: 'layers', ids: ['operator', 'operator-flow', 'node-collector', 'node-flow', 'reports', 'operator-lab'] },
  { id: 'practice', title: 'Get your hands on it', description: 'Run four labs and turn the results into decisions.', icon: 'terminal', ids: ['first-scan', 'config-lab', 'sbom', 'operator-lab', 'triage', 'air-gap'] },
];

lessons.splice(lessons.findIndex(lesson => lesson.id === 'scanner'), 0, ...architectureLessons);
Object.assign(sources, deepSources, architectureSources);
for (const lesson of lessons) {
  const expansion = deepDives[lesson.id];
  if (!expansion) continue;
  const { addSections = [], addBefore, ...replacement } = expansion;
  Object.assign(lesson, replacement);
  const insertion = addBefore ? lesson.sections.findIndex(s => s.id === addBefore) : -1;
  if (insertion >= 0) lesson.sections.splice(insertion, 0, ...addSections);
  else lesson.sections.push(...addSections);
  lesson.sources = [...new Set([...lesson.sources, ...lesson.sections.flatMap(s => s.evidence || [])])];
}

export const byId = Object.assign(Object.create(null), Object.fromEntries(lessons.map(lesson => [lesson.id, lesson])));
