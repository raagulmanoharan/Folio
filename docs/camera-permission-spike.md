# Camera permission timing and browser-copy spike

## Result

The standard `MediaDevices.getUserMedia()` request accepts media constraints, not a prompt message or custom website display name. Native permission copy and origin identification are controlled by the browser (and sometimes the operating system), across Chrome/Edge, Firefox and Safari. Locale, previous decisions, secure context, enterprise policy and OS permissions can affect what the visitor sees. A website cannot promise the same dialog on every browser or force a prompt after permission was already granted/blocked.

A page-authored explanation can precede the native request, e.g. “Let the chrome reflect your surroundings. Your camera feed is used locally for this effect.” That would be separate website UI, not customized native browser text. No extra modal or permission imitation was added in this change.

## Implemented

- Removed initialization-time camera request.
- Successful die roll enters hold with its face locked, then schedules camera access on the next animation frame, after the settled frame has rendered.
- One request attempt per page visit, including denial/pending request. Repeated rolls do not repeatedly ask.
- Cancelled rolls do not request camera access. Hidden pages skip the delayed attempt.
- Existing coarse-pointer/mobile studio reflection and tilt fallback remain; no newly enabled mobile camera capture.
- Unsupported camera API keeps studio reflections. Reduced motion does not initiate a roll/request.

## Evidence and limits

Reference: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia (retrieved for this spike). API is standard across browser families; no message option exists.

Available test browser is Chromium. Firefox/WebKit runtimes are not installed; no claim of native prompt visual testing in those browsers. Browser UI is outside page automation. Timing is exercised with getUserMedia stubbed and expensive rendering disabled in the test response; production render logic is untouched. Real browser/OS camera availability and prompts vary.
