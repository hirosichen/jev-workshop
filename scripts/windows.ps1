# Jev 實作二（Windows PowerShell）：先把下一行換成你的金鑰，整段貼上後按 Enter
$env:TYPESAFE_API_KEY = "貼上你的金鑰"
$body = @'
{ "model": "jev-latest",
  "state": { "message": "你們的 App 一直閃退，我已經重灌三次了！" },
  "questions": { "angry": { "type": "noul", "instructions": "`message` 的作者是否很生氣？" } } }
'@
Invoke-RestMethod -Uri "https://api.typesafe.ai/v1/systemone" -Method Post `
  -Headers @{ Authorization = "Bearer $env:TYPESAFE_API_KEY" } `
  -ContentType "application/json; charset=utf-8" `
  -Body ([Text.Encoding]::UTF8.GetBytes($body)) | ConvertTo-Json -Depth 6
