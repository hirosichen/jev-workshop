# Jev 實作二（Mac 終端機）：先把下一行換成你的金鑰，整段貼上後按 Enter
export TYPESAFE_API_KEY="貼上你的金鑰"
curl -s https://api.typesafe.ai/v1/systemone -H "Authorization: Bearer $TYPESAFE_API_KEY" \
  -H "Content-Type: application/json" -d '{"model":"jev-latest","state":{"message":"你們的 App 一直閃退！"},
  "questions":{"angry":{"type":"noul","instructions":"`message` 的作者是否很生氣？"}}}'
