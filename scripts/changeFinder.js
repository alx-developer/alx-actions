module.exports = async ({ github, context, core }) => {
  const { execSync } = require('child_process');
  const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
  try {
    const latestRelease = await github.rest.repos.getLatestRelease({
      owner,
      repo,
    });
    console.log(`latest release: ${JSON.stringify(latestRelease.data)}`);
  } catch (e) {
    console.log('fails get latest release');
  }
  try {
    execSync('git pull --tags');
    execSync(`git reset --hard ${latestRelease.data.tag_name}`);
  } catch (e) {
    console.log('fails remove last release tag');
  }
  const status = execSync(`git diff --name-only origin/staging`, {
    encoding: 'utf-8',
  });
  console.log('repo changes:', status);
  const changes = status.split('\n');
  let nodePaths = new Set();
  for (const change of changes) {
    if (change.startsWith('libs/')) {
      const library = change.split('/')[1];
      nodePaths.add(library);
    }
  }
  nodePaths = Array.from(nodePaths);
  console.log('paths result', nodePaths);
  return nodePaths;
};
