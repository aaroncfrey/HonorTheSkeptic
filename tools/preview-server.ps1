# Serves the preview/ folder at http://localhost:8000 so YouTube embeds behave as on the live site.
$root = (Resolve-Path (Join-Path $PSScriptRoot "..\preview")).Path
$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Start() } catch { Write-Host "Port $port is busy. Is the preview already running?"; Read-Host "Press Enter to close"; exit }
$types = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css"; ".js"="application/javascript"; ".svg"="image/svg+xml";
  ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".webp"="image/webp"; ".ico"="image/x-icon";
  ".pdf"="application/pdf"; ".json"="application/json"; ".woff2"="font/woff2";
  ".docx"="application/vnd.openxmlformats-officedocument.wordprocessingml.document" }
Write-Host "Preview running at http://localhost:$port/  (close this window to stop it)"
Start-Process "http://localhost:$port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext(); $res = $ctx.Response
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimStart('/') -replace '/', '\'
    $path = Join-Path $root $rel
    if (Test-Path $path -PathType Container) { $path = Join-Path $path "index.html" }
    $full = [IO.Path]::GetFullPath($path)
    if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $res.ContentType = $(if ($types[$ext]) { $types[$ext] } else { "application/octet-stream" })
      $res.Headers.Add("Cache-Control", "no-store")
      $res.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $res.StatusCode = 404 }
  } catch { $res.StatusCode = 500 } finally { $res.Close() }
}
