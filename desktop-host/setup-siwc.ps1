$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Vendor = Join-Path $Root "vendor"
$DevKit = Join-Path $Vendor "sign-in-with-chatgpt-devkit"
$RepoUrl = "https://github.com/openai/sign-in-with-chatgpt-devkit.git"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw "Git belum terpasang. Pasang Git for Windows terlebih dahulu."
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js belum terpasang. Gunakan Node.js 22.12 atau lebih baru."
}
$NodeVersion = (node -p "process.versions.node").Trim()
$Major = [int]($NodeVersion.Split('.')[0])
$Minor = [int]($NodeVersion.Split('.')[1])
if ($Major -lt 22 -or ($Major -eq 22 -and $Minor -lt 12)) {
  throw "Node.js 22.12 atau lebih baru diperlukan. Versi terdeteksi: $NodeVersion"
}

New-Item -ItemType Directory -Force -Path $Vendor | Out-Null
if (Test-Path (Join-Path $DevKit ".git")) {
  Write-Host "Memperbarui DevKit resmi..."
  git -C $DevKit pull --ff-only
  if ($LASTEXITCODE -ne 0) { throw "Gagal memperbarui DevKit." }
} else {
  if (Test-Path $DevKit) { Remove-Item -Recurse -Force $DevKit }
  Write-Host "Mengambil DevKit resmi OpenAI..."
  git clone --depth 1 $RepoUrl $DevKit
  if ($LASTEXITCODE -ne 0) { throw "Gagal mengambil DevKit resmi." }
}
Write-Host "Memasang dependency dan membangun SDK lokal..."
Push-Location $DevKit
try {
  npm ci
  if ($LASTEXITCODE -ne 0) { throw "npm ci gagal." }
  npm run build -w @siwc/local
  if ($LASTEXITCODE -ne 0) { throw "Build @siwc/local gagal." }
} finally { Pop-Location }
Write-Host ""
Write-Host "Setup SDK selesai. Jalankan 'npm start' di folder desktop-host."
Write-Host "Catatan: login dan penggunaan paket harus diuji pada perangkat ini; kelayakan paket akun tidak dijamin."
