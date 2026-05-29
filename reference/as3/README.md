# AS3 Reference Source

This directory contains the decompiled AS3 reference used as the behavior source of truth for BWE parity work.

- Treat `BOE-O` as read-only reference material.
- Do not import these files into production React code.
- Parity guards should resolve AS3 files through `scripts/lib/as3Source.mjs`.
- `BWE_AS3_ROOT` can override this location for local experiments.
- If `BWE_AS3_ROOT` is not set, guards use `reference/as3/BOE-O` first and fall back to `../BOE-O`.

The copied directory keeps the original `BOE-O` structure so existing AS3 path references remain easy to compare.

