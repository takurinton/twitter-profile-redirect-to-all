# X Profile Redirect to All

A Chrome extension that automatically redirects `https://x.com/{username}` to
`https://x.com/{username}/all`.

URLs with an additional path after the username, such as `/with_replies`,
`/media`, or `/likes`, are left unchanged. Query parameters and URL fragments
are preserved during redirects.

Navigation within X uses its client-side router, preserving timeline state and
scroll position when you return from a profile. After the profile renders, the
extension selects X's own `All` menu item. If that control cannot be found, it
leaves the normal profile visible. Direct visits from the address bar are
handled before the profile page loads.

## Installation

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select this directory.

## Testing

If Node.js is installed, run the following command to test the URL-matching
logic:

```sh
node redirect.test.js
```
