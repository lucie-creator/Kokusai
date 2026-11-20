# Graph Report - kba-website  (2026-11-20)

## Corpus Check
- 4 files · ~208,717 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 2 file(s) not represented in the graph (top: (none) 1, .css 1)

## Summary
- 31 nodes · 38 edges · 5 communities (2 shown, 3 thin omitted)
- Extraction: 84% EXTRACTED · 16% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f5338ea1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- home.js
- nav.js
- draw

## God Nodes (most connected - your core abstractions)
1. `setup()` - 5 edges
2. `draw()` - 4 edges
3. `measure()` - 3 edges
4. `frame()` - 3 edges
5. `tick()` - 3 edges
6. `wipe()` - 3 edges
7. `closeAll()` - 3 edges
8. `place()` - 2 edges
9. `swap()` - 2 edges
10. `setMenu()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (5 total, 3 thin omitted)

### Community 1 - "home.js"
Cohesion: 0.54
Nodes (7): draw(), frame(), measure(), place(), setup(), tick(), wipe()

### Community 2 - "nav.js"
Cohesion: 0.32
Nodes (3): closeAll(), setMenu(), swap()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Are the 2 inferred relationships involving `setup()` (e.g. with `home.js` and `wipe()`) actually correct?**
  _`setup()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `tick()` (e.g. with `home.js` and `frame()`) actually correct?**
  _`tick()` has 2 INFERRED edges - model-reasoned connections that need verification._