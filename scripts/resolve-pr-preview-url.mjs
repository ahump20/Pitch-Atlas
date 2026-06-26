import { appendFile } from 'node:fs/promises'

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
const repo = process.env.GITHUB_REPOSITORY
const sha = process.env.GITHUB_SHA
const apiOrigin = process.env.GITHUB_API_URL || 'https://api.github.com'
const hostSuffixes = (process.env.PREVIEW_URL_HOST_SUFFIXES || 'pages.dev')
  .split(',')
  .map((value) => value.trim().replace(/^\./, ''))
  .filter(Boolean)

if (!repo || !sha) {
  throw new Error('GITHUB_REPOSITORY and GITHUB_SHA are required.')
}
if (!token) {
  throw new Error('GITHUB_TOKEN or GH_TOKEN is required.')
}

const headers = {
  accept: 'application/vnd.github+json',
  authorization: `Bearer ${token}`,
  'x-github-api-version': '2022-11-28',
}

function apiUrl(path) {
  return path.startsWith('http') ? path : `${apiOrigin}${path}`
}

async function github(path) {
  const response = await fetch(apiUrl(path), { headers })
  if (!response.ok) {
    throw new Error(`GitHub API ${path} returned ${response.status}: ${await response.text()}`)
  }
  return response.json()
}

function isHostedPreviewUrl(value) {
  if (typeof value !== 'string' || value.length === 0) return false
  try {
    const url = new URL(value)
    return (
      url.protocol === 'https:' &&
      hostSuffixes.some((suffix) => url.hostname === suffix || url.hostname.endsWith(`.${suffix}`))
    )
  } catch {
    return false
  }
}

function pickUrl(...values) {
  return values.find(isHostedPreviewUrl)
}

function readyDeploymentStatus(status) {
  return status?.state === 'success'
}

function readyCommitStatus(status) {
  return status?.state === 'success'
}

function readyCheckRun(run) {
  return run?.status === 'completed' && run?.conclusion === 'success'
}

async function fromDeployments() {
  const deployments = await github(`/repos/${repo}/deployments?sha=${sha}&per_page=20`)
  for (const deployment of deployments) {
    const statuses = await github(deployment.statuses_url)
    for (const status of statuses) {
      if (!readyDeploymentStatus(status)) continue
      const url = pickUrl(status.environment_url, status.target_url, status.log_url)
      if (url) return url
    }
  }
  return undefined
}

async function fromCommitStatuses() {
  const statuses = await github(`/repos/${repo}/commits/${sha}/statuses?per_page=100`)
  for (const status of statuses) {
    if (!readyCommitStatus(status)) continue
    const url = pickUrl(status.target_url)
    if (url) return url
  }
  return undefined
}

async function fromCheckRuns() {
  const result = await github(`/repos/${repo}/commits/${sha}/check-runs?per_page=100`)
  for (const run of result.check_runs ?? []) {
    if (!readyCheckRun(run)) continue
    const summaryUrl =
      typeof run.output?.summary === 'string' ? run.output.summary.match(/https:\/\/[^\s<>)"]+/)?.[0] : undefined
    const url = pickUrl(run.details_url, summaryUrl)
    if (url) return url
  }
  return undefined
}

const url = (await fromDeployments()) ?? (await fromCommitStatuses()) ?? (await fromCheckRuns())

if (url) {
  console.log(`Hosted preview URL: ${url}`)
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT, `url=${url}\n`)
  }
} else {
  console.log(`::notice::No hosted preview URL exposed for ${repo}@${sha}; skipping hosted preview smoke.`)
}
