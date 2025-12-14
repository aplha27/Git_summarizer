import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export interface FileNode {
  path: string;
  type: "blob" | "tree";
  size?: number;
  sha: string;
}

export interface RepoContext {
  owner: string;
  repo: string;
  metadata: any;
  fileTree: string[];
  packageFile: string | null;
  readme: string | null;
  mainFile: string | null; // e.g., index.js, App.tsx
  dependencies: Record<string, string>;
  commits: any[];
  hasTests: boolean;
  hasCI: boolean;
  hasDockerfile: boolean;
  languages: Record<string, number>;
}

// Critical files to look for
const CRITICAL_FILES = [
  "package.json",
  "requirements.txt",
  "go.mod",
  "Cargo.toml",
  "pyproject.toml",
];

const README_FILES = ["README.md", "readme.md", "README.txt", "readme.txt"];

export async function fetchRepoData(url: string): Promise<RepoContext> {
  // 1. Parse URL
  const { owner, repo } = parseGitHubUrl(url);

  // 2. Fetch Metadata
  const { data: metadata } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  // 3. Fetch File Tree (Recursive)
  // Limit to 1 depth for massive repos, but aim for recursive if standard size
  // For safety, we rely on the default tree endpoint which might truncate.
  // Ideally, use the git database API for recursive trees.
  let tree: FileNode[] = [];
  try {
     const { data } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: metadata.default_branch,
      recursive: "1",
    });
    tree = data.tree as FileNode[];
  } catch (e) {
    console.warn("Failed to fetch full tree, falling back to non-recursive", e);
    const { data } = await octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: metadata.default_branch,
      });
      tree = data.tree as FileNode[];
  }

  // Filter tree to a readable string list for the LLM
  // Limit to top 200 files to save context
  const fileTreeString = tree
    .filter((node) => node.type === "blob")
    .map((node) => node.path)
    .slice(0, 300); // 300 file paths max

  // 4. Content Fetching Heuristics
  let packageFileContent: string | null = null;
  let readmeContent: string | null = null;
  let mainFileContent: string | null = null;
  let dependencies: Record<string, string> = {};

  // A. Find Package/Dependency File
  const packagePath = tree.find((node) =>
    CRITICAL_FILES.includes(node.path.split("/").pop() || "")
  )?.path;

  if (packagePath) {
    const content = await fetchFileContent(owner, repo, packagePath);
    packageFileContent = content;
    // Attempt to parse if JSON
    if (packagePath.endsWith("json")) {
        try {
            const json = JSON.parse(content);
            dependencies = { ...json.dependencies, ...json.devDependencies };
        } catch (e) { /* ignore */ }
    }
  }

  // B. Find README
  const readmePath = tree.find((node) =>
    README_FILES.includes(node.path.split("/").pop() || "")
  )?.path;

  if (readmePath) {
    readmeContent = await fetchFileContent(owner, repo, readmePath);
    // Truncate README if too long (e.g., 5000 chars)
    if (readmeContent.length > 5000) {
        readmeContent = readmeContent.substring(0, 5000) + "...(truncated)";
    }
  }

  // C. Find Main Entry Point (Simple Heuristic for now)
  // Look for index.js, main.py, src/index.tsx, etc.
  const commonEntryPoints = [
      "src/index.tsx", "src/main.tsx", "src/App.tsx",
      "src/index.js", "src/main.js", "src/App.js",
      "index.js", "main.py", "app.py", "main.go"
  ];
  
  const mainPath = tree.find(node => commonEntryPoints.includes(node.path))?.path 
      || tree.find(node => node.path.startsWith("src/") && (node.path.endsWith(".tsx") || node.path.endsWith(".js")))?.path;

  if (mainPath) {
    mainFileContent = await fetchFileContent(owner, repo, mainPath);
     if (mainFileContent.length > 5000) {
        mainFileContent = mainFileContent.substring(0, 5000) + "...(truncated)";
    }
  }

  // D. Fetch Recent Commits (for commit quality analysis)
  let commits: any[] = [];
  try {
    const { data: commitsData } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 10, // Last 10 commits
    });
    commits = commitsData.map(commit => ({
      message: commit.commit.message,
      author: commit.commit.author?.name,
      date: commit.commit.author?.date,
    }));
  } catch (e) {
    console.warn("Failed to fetch commits", e);
  }

  // E. Check for Tests
  const hasTests = tree.some(node => 
    node.path.includes('test') || 
    node.path.includes('spec') || 
    node.path.includes('__tests__') ||
    node.path.endsWith('.test.js') ||
    node.path.endsWith('.test.ts') ||
    node.path.endsWith('.spec.js') ||
    node.path.endsWith('.spec.ts')
  );

  // F. Check for CI/CD
  const hasCI = tree.some(node => 
    node.path.includes('.github/workflows') ||
    node.path.includes('.gitlab-ci.yml') ||
    node.path.includes('Jenkinsfile') ||
    node.path.includes('.travis.yml')
  );

  // G. Check for Docker
  const hasDockerfile = tree.some(node => 
    node.path.includes('Dockerfile') ||
    node.path.includes('docker-compose')
  );

  // H. Get Languages
  let languages: Record<string, number> = {};
  try {
    const { data: languagesData } = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });
    languages = languagesData;
  } catch (e) {
    console.warn("Failed to fetch languages", e);
  }

  return {
    owner,
    repo,
    metadata: {
        stars: metadata.stargazers_count,
        forks: metadata.forks_count,
        open_issues: metadata.open_issues_count,
        description: metadata.description,
        language: metadata.language,
        updated_at: metadata.updated_at,
        size: metadata.size,
        created_at: metadata.created_at,
    },
    fileTree: fileTreeString,
    packageFile: packageFileContent,
    readme: readmeContent,
    mainFile: mainFileContent,
    dependencies,
    commits,
    hasTests,
    hasCI,
    hasDockerfile,
    languages
  };
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
        });

        if ("content" in data && data.encoding === "base64") {
            return Buffer.from(data.content, "base64").toString("utf-8");
        }
        return "";
    } catch (e) {
        console.error(`Failed to fetch ${path}`, e);
        return "";
    }
}

function parseGitHubUrl(url: string) {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split("/").filter(Boolean);
        if (parts.length < 2) throw new Error("Invalid GitHub URL");
        return { owner: parts[0], repo: parts[1] };
    } catch (e) {
        throw new Error("Invalid URL provided");
    }
}
