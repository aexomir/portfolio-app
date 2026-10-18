// Same content as aexomir.me.
export type Project = {
  slug: string;
  name: string;
  type: 'Apps' | 'Research';
  yr: string;
  sub: string;
  repo: string | null;
  facts: [string, string][];
};

export const PROJECTS: Project[] = [
  { slug: 'chrona', name: 'Chrona', type: 'Apps', yr: '2026', sub: 'Automatic time tracking for Mac and iPhone, with on-device model inference and cross-device activity sync. In TestFlight.', repo: 'https://github.com/aexomir/Chrona', facts: [['Platforms', 'macOS · iOS'], ['Inference', 'On-device'], ['Sync', 'Cross-device activity'], ['Status', 'TestFlight']] },
  { slug: 'semantic-correspondence', name: 'Semantic Correspondence with ViTs', type: 'Research', yr: '2026', sub: 'Frozen vs fine-tuned DINOv2, DINOv3 and SAM backbones on SPair-71k. 76.4% PCK@0.1 with DINOv3, up from 53.6% frozen.', repo: 'https://github.com/aexomir/semantic-correspondence', facts: [['Backbones', 'DINOv2 · DINOv3 · SAM'], ['Dataset', 'SPair-71k'], ['Result', '76.4% PCK@0.1, fine-tuned DINOv3'], ['Baseline', '53.6% frozen']] },
  { slug: 'heart-disease', name: 'Heart Disease Risk Prediction', type: 'Research', yr: '2026', sub: 'Logistic Regression, XGBoost and MLP with cross-site external validation, calibration and SHAP. ROC-AUC 0.949 on Cleveland.', repo: 'https://github.com/aexomir/heart-disease-prediction', facts: [['Models', 'Logistic Regression · XGBoost · MLP'], ['Validation', 'Cross-site, external'], ['Analysis', 'Calibration · SHAP'], ['Result', 'ROC-AUC 0.949 on Cleveland']] },
  { slug: 'llm-test-generation', name: 'Multi-Agent LLM Test Generation', type: 'Research', yr: '2026', sub: 'Single, collaborative and competitive LLM agents for unit-test generation on HumanEval, with an ACL-format paper.', repo: 'https://github.com/aexomir/LLM-Agents-for-Collaborative-Test-Case-Generations', facts: [['Setups', 'Single · Collaborative · Competitive'], ['Benchmark', 'HumanEval'], ['Output', 'ACL-format paper']] },
  { slug: 'drone-reliability', name: 'Drone Navigation Reliability', type: 'Research', yr: '2025', sub: 'Hardware-in-the-loop fault injection for a deep RL drone policy on Jetson Nano, via ONNX and TensorRT. With Prof. Sonza Reorda, PoliTo.', repo: 'https://github.com/aexomir/drone-navigation-reliability', facts: [['Method', 'Hardware-in-the-loop fault injection'], ['Policy', 'Deep RL'], ['Hardware', 'Jetson Nano'], ['Runtime', 'ONNX · TensorRT'], ['With', 'Prof. Sonza Reorda, PoliTo']] },
  { slug: 'gold-routing', name: 'Gold Collection Routing', type: 'Research', yr: '2025', sub: 'Genetic, ant colony and simulated annealing vs a custom 2-opt heuristic on a Traveling Thief variant. The heuristic won by 88% on average.', repo: 'https://github.com/aexomir/Gold-Collection-Routing-Optimization', facts: [['Problem', 'Traveling Thief variant'], ['Compared', 'Genetic · Ant colony · Simulated annealing'], ['Winner', 'Custom 2-opt heuristic, 88% better on average']] },
  { slug: 'iot-security', name: 'IoT Security (BSc thesis)', type: 'Research', yr: '2022', sub: 'Common MQTT attacks in IoT deployments, and tooling to protect embedded devices against them.', repo: null, facts: [['Protocol', 'MQTT'], ['Focus', 'Attacks on IoT deployments'], ['Output', 'Tooling for embedded devices']] },
];

export const EXPERIENCE: [yr: string, role: string, company: string][] = [
  ['2025 — Now', 'Machine Learning Engineer (Part-Time)', 'BitPolito'],
  ['2023 — 2024', 'Mobile Team Lead (Contract)', 'MyMCI'],
  ['2022 — 2025', 'Senior Software Engineer', 'Digikala'],
  ['2022', 'IoT Engineer (Internship)', 'Ganje'],
  ['2021 — 2022', 'Mobile Application Developer', 'Agileful'],
  ['2019 — 2021', 'React Native Developer', 'EasyMotionSkin'],
];

export const CERTS: [name: string, issuer: string, yr: string, repo: string | null][] = [
  ['MLOps Specialization', 'Duke University · Coursera', 'In progress', null],
  ['MCP: Build Rich Context AI Apps with Anthropic', 'DeepLearning.AI', '2026', 'https://github.com/aexomir/mcp-engineering'],
  ['LLM Engineering: Master AI, LLMs & Agents', 'Udemy', '2025', null],
  ['LangChain: Develop LLM Powered Applications', 'Udemy', '2025', null],
  ['OWASP Web Application Security', 'Voorivex Academy', '2022', null],
  ['Neural Networks and Deep Learning', 'DeepLearning.AI', '2022', null],
];

export const LINKS: { label: string; value: string; href: string }[] = [
  { label: 'Email', value: 'aexomir@gmail.com', href: 'mailto:aexomir@gmail.com' },
  { label: 'GitHub', value: 'github.com/aexomir', href: 'https://github.com/aexomir' },
  { label: 'LinkedIn', value: 'linkedin.com/in/aexomir', href: 'https://www.linkedin.com/in/aexomir/' },
];

export const kicker = (p: Project) => `${p.type === 'Apps' ? 'App' : 'Research'} · ${p.yr}`;
