window.TEAM = {
  "project": "sparky",
  "updated": "2026-11-13T15:13:36Z",
  "plans": [
    {
      "id": "PLAN-001",
      "title": "UX review follow-ups and open pipeline issues",
      "status": "done",
      "created": "2026-11-10T23:53:21Z",
      "approved": "2026-11-11T16:12:29Z",
      "screens": [
        "plans/PLAN-001/screens/home-light.png",
        "plans/PLAN-001/screens/home-dark.png",
        "plans/PLAN-001/screens/home-phone.png",
        "plans/PLAN-001/screens/archive-light.png",
        "plans/PLAN-001/screens/archive-dark.png",
        "plans/PLAN-001/screens/archive-phone.png",
        "plans/PLAN-001/screens/archive-2026-11-09-light.png",
        "plans/PLAN-001/screens/archive-2026-11-09-dark.png",
        "plans/PLAN-001/screens/archive-2026-11-09-phone.png"
      ]
    }
  ],
  "mrs": [
    {
      "id": "MR-001",
      "plan": "PLAN-001",
      "title": "Constants file, page headings and wordmark",
      "branch": "mr/001-headings-constants",
      "size": "standard",
      "complexity": "medium",
      "author": "principal",
      "reviewer": "sr-engineer",
      "second_reviewer": null,
      "sets_pattern": true,
      "stage": "done",
      "second_round": 0,
      "routing": null,
      "status": "merged",
      "round": 2,
      "gate_attempts": 2,
      "blocking": 0,
      "nits": 0,
      "findings": {
        "AC25": 1,
        "S14": 1,
        "S17": 1,
        "S8": 1,
        "UI": 1,
        "S15": 1
      },
      "screens": [
        "mrs/MR-001/screens/home-light.png",
        "mrs/MR-001/screens/home-dark.png",
        "mrs/MR-001/screens/home-phone.png",
        "mrs/MR-001/screens/archive-light.png",
        "mrs/MR-001/screens/archive-dark.png",
        "mrs/MR-001/screens/archive-phone.png",
        "mrs/MR-001/screens/archive-2026-11-09-light.png",
        "mrs/MR-001/screens/archive-2026-11-09-dark.png",
        "mrs/MR-001/screens/archive-2026-11-09-phone.png"
      ],
      "needs_user": true,
      "opened": "2026-11-11T16:12:29Z",
      "updated": "2026-11-11T16:22:41Z"
    },
    {
      "id": "MR-002",
      "plan": "PLAN-001",
      "title": "Story card and metadata row",
      "branch": "mr/002-story-card-meta",
      "size": "standard",
      "complexity": "low",
      "author": "engineer",
      "reviewer": "sr-engineer",
      "second_reviewer": null,
      "sets_pattern": false,
      "stage": "done",
      "second_round": 0,
      "routing": null,
      "status": "merged",
      "round": 2,
      "gate_attempts": 2,
      "blocking": 0,
      "nits": 0,
      "findings": {
        "S17": 2,
        "UI": 1
      },
      "screens": [
        "mrs/MR-002/screens/home-light.png",
        "mrs/MR-002/screens/home-dark.png",
        "mrs/MR-002/screens/home-phone.png",
        "mrs/MR-002/screens/archive-2026-11-09-light.png",
        "mrs/MR-002/screens/archive-2026-11-09-dark.png",
        "mrs/MR-002/screens/archive-2026-11-09-phone.png"
      ],
      "needs_user": false,
      "opened": "2026-11-11T16:12:29Z",
      "updated": "2026-11-11T16:30:38Z"
    },
    {
      "id": "MR-003",
      "plan": "PLAN-001",
      "title": "Brief navigation and grouped archive list",
      "branch": "mr/003-nav-archive",
      "size": "standard",
      "complexity": "medium",
      "author": "engineer",
      "reviewer": "sr-engineer",
      "second_reviewer": "principal",
      "sets_pattern": false,
      "stage": "done",
      "second_round": 1,
      "routing": null,
      "status": "merged",
      "round": 2,
      "gate_attempts": 2,
      "blocking": 0,
      "nits": 3,
      "findings": {
        "S14": 1,
        "S17": 2,
        "UI": 1,
        "ARCH": 3
      },
      "screens": [
        "mrs/MR-003/screens/home-light.png",
        "mrs/MR-003/screens/home-dark.png",
        "mrs/MR-003/screens/home-phone.png",
        "mrs/MR-003/screens/archive-light.png",
        "mrs/MR-003/screens/archive-dark.png",
        "mrs/MR-003/screens/archive-phone.png",
        "mrs/MR-003/screens/archive-2026-11-09-light.png",
        "mrs/MR-003/screens/archive-2026-11-09-dark.png",
        "mrs/MR-003/screens/archive-2026-11-09-phone.png"
      ],
      "needs_user": false,
      "opened": "2026-11-11T16:12:29Z",
      "updated": "2026-11-12T21:38:34Z"
    },
    {
      "id": "MR-004",
      "plan": "PLAN-001",
      "title": "Rank: unique percentile table and version-aware title merge",
      "branch": "mr/004-rank-fixes",
      "size": "standard",
      "complexity": "medium",
      "author": "sr-engineer",
      "reviewer": "principal",
      "second_reviewer": null,
      "sets_pattern": false,
      "stage": "done",
      "second_round": 0,
      "routing": null,
      "status": "merged",
      "round": 3,
      "gate_attempts": 3,
      "blocking": 0,
      "nits": 0,
      "findings": {
        "TEST": 2,
        "S17": 2,
        "S16": 1
      },
      "screens": [],
      "needs_user": false,
      "opened": "2026-11-11T16:12:29Z",
      "updated": "2026-11-13T04:45:34Z"
    },
    {
      "id": "MR-005",
      "plan": "PLAN-001",
      "title": "Pure lineup merge and empty-brief guard",
      "branch": "mr/005-lineup-merge",
      "size": "standard",
      "complexity": "medium",
      "author": "engineer",
      "reviewer": "sr-engineer",
      "second_reviewer": "principal",
      "sets_pattern": false,
      "stage": "done",
      "second_round": 1,
      "routing": null,
      "status": "merged",
      "round": 2,
      "gate_attempts": 2,
      "blocking": 0,
      "nits": 2,
      "findings": {
        "S17": 1,
        "ARCH": 1,
        "MISSED": 1
      },
      "screens": [],
      "needs_user": false,
      "opened": "2026-11-11T16:12:29Z",
      "updated": "2026-11-13T04:52:57Z"
    }
  ],
  "events": [
    {
      "at": "2026-11-10T23:53:21Z",
      "mr": null,
      "actor": "principal",
      "type": "plan-drafted",
      "note": "PLAN-001: 5 tasks, 25 acceptance criteria"
    },
    {
      "at": "2026-11-11T16:12:29Z",
      "mr": null,
      "actor": "user",
      "type": "plan-approved",
      "note": "PLAN-001 approved as drafted"
    },
    {
      "at": "2026-11-11T16:15:20Z",
      "mr": "MR-001",
      "actor": "qa",
      "type": "tests-written",
      "note": "26 new tests in 7 files (54dd505)"
    },
    {
      "at": "2026-11-11T16:15:20Z",
      "mr": "MR-001",
      "actor": "orchestrator",
      "type": "red-confirmed",
      "note": "npm test: 26 failed, 53 passed"
    },
    {
      "at": "2026-11-11T16:17:44Z",
      "mr": "MR-001",
      "actor": "principal",
      "type": "implemented",
      "note": "001313f: constants file, one h1 per page"
    },
    {
      "at": "2026-11-11T16:17:44Z",
      "mr": "MR-001",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "79 tests, check clean; 9 screenshots"
    },
    {
      "at": "2026-11-11T16:19:09Z",
      "mr": "MR-001",
      "actor": "sr-engineer",
      "type": "review",
      "note": "changes requested: 4 blocking, 2 nits"
    },
    {
      "at": "2026-11-11T16:22:08Z",
      "mr": "MR-001",
      "actor": "qa",
      "type": "response",
      "note": "B4: removed constants test; pinned page tests to empty store (df32838, f1e1858)"
    },
    {
      "at": "2026-11-11T16:22:08Z",
      "mr": "MR-001",
      "actor": "principal",
      "type": "response",
      "note": "B2, B3, N1, N2 addressed (c507e44)"
    },
    {
      "at": "2026-11-11T16:22:08Z",
      "mr": "MR-001",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 2: 75 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-11T16:22:41Z",
      "mr": "MR-001",
      "actor": "sr-engineer",
      "type": "approved",
      "note": "round 2: approved, 0 blocking"
    },
    {
      "at": "2026-11-11T16:22:41Z",
      "mr": "MR-001",
      "actor": "orchestrator",
      "type": "merged",
      "note": "merged into team/PLAN-001"
    },
    {
      "at": "2026-11-11T16:25:24Z",
      "mr": "MR-002",
      "actor": "qa",
      "type": "tests-written",
      "note": "25 new tests in 3 files (a5781fb)"
    },
    {
      "at": "2026-11-11T16:25:24Z",
      "mr": "MR-002",
      "actor": "orchestrator",
      "type": "red-confirmed",
      "note": "npm test: 25 failed, 79 passed"
    },
    {
      "at": "2026-11-11T16:27:32Z",
      "mr": "MR-002",
      "actor": "engineer",
      "type": "implemented",
      "note": "fc37c75: bottom-aligned meta, legible badges, title links"
    },
    {
      "at": "2026-11-11T16:27:32Z",
      "mr": "MR-002",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "104 tests, check clean, build 84 pages; 6 screenshots"
    },
    {
      "at": "2026-11-11T16:28:56Z",
      "mr": "MR-002",
      "actor": "sr-engineer",
      "type": "review",
      "note": "changes requested: 2 blocking (both in test code), 1 nit"
    },
    {
      "at": "2026-11-11T16:30:07Z",
      "mr": "MR-002",
      "actor": "qa",
      "type": "response",
      "note": "B1, B2: shared html helpers and StoryCard fixture (2043659)"
    },
    {
      "at": "2026-11-11T16:30:07Z",
      "mr": "MR-002",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 2: 104 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-11T16:30:38Z",
      "mr": "MR-002",
      "actor": "sr-engineer",
      "type": "approved",
      "note": "round 2: approved, 0 blocking"
    },
    {
      "at": "2026-11-11T16:30:38Z",
      "mr": "MR-002",
      "actor": "orchestrator",
      "type": "merged",
      "note": "merged into team/PLAN-001"
    },
    {
      "at": "2026-11-12T21:31:02Z",
      "mr": "MR-003",
      "actor": "qa",
      "type": "tests-written",
      "note": "tests in 7 files (e872636); resumed after a rate-limit stop"
    },
    {
      "at": "2026-11-12T21:31:02Z",
      "mr": "MR-003",
      "actor": "orchestrator",
      "type": "red-confirmed",
      "note": "npm test: 31 failed, 107 passed; 2 files cannot load yet"
    },
    {
      "at": "2026-11-12T21:33:41Z",
      "mr": "MR-003",
      "actor": "engineer",
      "type": "implemented",
      "note": "9947a80: BriefNav, ArchiveList, date helpers"
    },
    {
      "at": "2026-11-12T21:33:41Z",
      "mr": "MR-003",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "184 tests, check clean, build 84 pages; 9 screenshots"
    },
    {
      "at": "2026-11-12T21:35:03Z",
      "mr": "MR-003",
      "actor": "sr-engineer",
      "type": "review",
      "note": "changes requested: 2 blocking, 2 nits"
    },
    {
      "at": "2026-11-12T21:37:15Z",
      "mr": "MR-003",
      "actor": "qa",
      "type": "response",
      "note": "B2: shared expectTapTargets helper (eed9cc1)"
    },
    {
      "at": "2026-11-12T21:37:15Z",
      "mr": "MR-003",
      "actor": "engineer",
      "type": "response",
      "note": "B1 fixed (162cf90); N1 centred nav grid (bef352b)"
    },
    {
      "at": "2026-11-12T21:37:15Z",
      "mr": "MR-003",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 2: 184 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-12T21:37:39Z",
      "mr": "MR-003",
      "actor": "sr-engineer",
      "type": "review",
      "note": "round 2: approved; Principal second pass next"
    },
    {
      "at": "2026-11-12T21:38:34Z",
      "mr": "MR-003",
      "actor": "principal",
      "type": "second-review",
      "note": "approved, 0 blocking, 3 nits on constants file shape"
    },
    {
      "at": "2026-11-12T21:38:34Z",
      "mr": "MR-003",
      "actor": "orchestrator",
      "type": "merged",
      "note": "merged into team/PLAN-001"
    },
    {
      "at": "2026-11-12T21:41:34Z",
      "mr": "MR-004",
      "actor": "qa",
      "type": "tests-written",
      "note": "20 tests in 2 files (07a369a): 15 failing, 5 guards"
    },
    {
      "at": "2026-11-12T21:41:34Z",
      "mr": "MR-004",
      "actor": "orchestrator",
      "type": "red-confirmed",
      "note": "npm test: 15 failed, 189 passed"
    },
    {
      "at": "2026-11-12T21:44:25Z",
      "mr": "MR-004",
      "actor": "sr-engineer",
      "type": "implemented",
      "note": "c3f0815: unique percentile table, version-aware merge"
    },
    {
      "at": "2026-11-12T21:44:25Z",
      "mr": "MR-004",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "204 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-12T21:46:18Z",
      "mr": "MR-004",
      "actor": "principal",
      "type": "review",
      "note": "changes requested: 2 blocking (both for QA), 2 nits"
    },
    {
      "at": "2026-11-13T04:41:46Z",
      "mr": "MR-004",
      "actor": "qa",
      "type": "response",
      "note": "B1 test added, B2 shared Lobsters fixture, N2 (42cf9a1)"
    },
    {
      "at": "2026-11-13T04:41:46Z",
      "mr": "MR-004",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 2: 205 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-13T04:42:45Z",
      "mr": "MR-004",
      "actor": "principal",
      "type": "review",
      "note": "round 2: changes requested, 1 blocking (QA test duplication), 1 nit"
    },
    {
      "at": "2026-11-13T04:44:59Z",
      "mr": "MR-004",
      "actor": "qa",
      "type": "response",
      "note": "round 2 B1 fixed plus four more duplicates removed (2cce170)"
    },
    {
      "at": "2026-11-13T04:44:59Z",
      "mr": "MR-004",
      "actor": "sr-engineer",
      "type": "response",
      "note": "N1 not changed: Prettier itself produces the four-line form"
    },
    {
      "at": "2026-11-13T04:44:59Z",
      "mr": "MR-004",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 3: 205 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-13T04:45:34Z",
      "mr": "MR-004",
      "actor": "principal",
      "type": "approved",
      "note": "round 3: approved, 0 blocking"
    },
    {
      "at": "2026-11-13T04:45:34Z",
      "mr": "MR-004",
      "actor": "orchestrator",
      "type": "merged",
      "note": "merged into team/PLAN-001"
    },
    {
      "at": "2026-11-13T04:47:38Z",
      "mr": "MR-005",
      "actor": "qa",
      "type": "tests-written",
      "note": "18 tests in lineup.test.ts (58d9a0e)"
    },
    {
      "at": "2026-11-13T04:47:38Z",
      "mr": "MR-005",
      "actor": "orchestrator",
      "type": "red-confirmed",
      "note": "lineup.test.ts cannot load (module missing); 205 existing pass"
    },
    {
      "at": "2026-11-13T04:49:30Z",
      "mr": "MR-005",
      "actor": "engineer",
      "type": "implemented",
      "note": "8e98c40: mergeLineup extracted, empty-brief refusal"
    },
    {
      "at": "2026-11-13T04:49:30Z",
      "mr": "MR-005",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "223 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-13T04:50:44Z",
      "mr": "MR-005",
      "actor": "sr-engineer",
      "type": "review",
      "note": "changes requested: 1 blocking (duplicate test constant, for QA)"
    },
    {
      "at": "2026-11-13T04:51:24Z",
      "mr": "MR-005",
      "actor": "qa",
      "type": "response",
      "note": "B1: HOUR_MS exported once from test support (8856d11)"
    },
    {
      "at": "2026-11-13T04:51:24Z",
      "mr": "MR-005",
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "round 2: 223 tests, check clean, build 84 pages"
    },
    {
      "at": "2026-11-13T04:51:56Z",
      "mr": "MR-005",
      "actor": "sr-engineer",
      "type": "review",
      "note": "round 2: approved; Principal second pass next"
    },
    {
      "at": "2026-11-13T04:52:57Z",
      "mr": "MR-005",
      "actor": "principal",
      "type": "second-review",
      "note": "approved, 0 blocking, 2 nits (follow-ups)"
    },
    {
      "at": "2026-11-13T04:52:57Z",
      "mr": "MR-005",
      "actor": "orchestrator",
      "type": "merged",
      "note": "merged into team/PLAN-001"
    },
    {
      "at": "2026-11-13T04:53:51Z",
      "mr": null,
      "actor": "orchestrator",
      "type": "gates-passed",
      "note": "final gates on team/PLAN-001: 223 tests, check clean, build 84 pages; awaiting user approval"
    },
    {
      "at": "2026-11-13T15:13:36Z",
      "mr": null,
      "actor": "user",
      "type": "plan-done",
      "note": "user approved final merge; PLAN-001 merged into session branch"
    }
  ]
};
