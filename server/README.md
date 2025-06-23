





git add .
git commit -m "2025-06-23"
git push



get all files but not node modules
Get-ChildItem -Recurse -File -Exclude node_modules | Where-Object { -not ($_.FullName -match '\\node_modules\\') } | ForEach-Object { $_.FullName }



https://plus-server.onrender.com



https://plus-server.onrender.com/replace-participant/subscribe
https://plus-server.onrender.com/replace-participant/unsubscribe