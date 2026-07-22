Felix Remote multi-computer synchronization fix

Replace these three files in the GitHub repository root:
- app.js
- styles.css
- service-worker.js

Changes:
1. A fresh browser/device creates its own new chat instead of automatically joining the newest chat created by another computer.
2. Adds HTTP polling fallback when WebSocket updates are blocked, interrupted, or unsupported.
3. Keeps a low-frequency reconciliation poll even when WebSockets work, so missed events are recovered.
4. Adds WebSocket keep-alive pings.
5. Shows queued prompts immediately in the conversation.
6. Prevents rapid duplicate submission while a POST is in progress.
7. Changes the service-worker cache name so browsers download the fix.

No backend replacement is required for this fix.
