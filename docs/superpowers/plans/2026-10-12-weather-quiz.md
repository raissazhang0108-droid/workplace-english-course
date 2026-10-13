# Weather & Environment Quiz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a game-inspired, two-stage vocabulary and translation assessment for the Weather & Environment lesson, with transparent feedback and local score history.

**Architecture:** Keep question definitions, exact normalized grading, mastery thresholds, and local history operations in focused `src/lib` modules. Render the learner flow in a focused `WeatherQuiz` view and integrate it through the existing `Home` card and `Training` view switch without changing existing lesson-completion semantics.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, CSS, browser `localStorage`.

---

## File Map

- Modify `src/Home.tsx`: add a quiz action to the Weather & Environment lesson card and widen its navigation callback type.
- Modify `src/Training.tsx`: add the `quiz` view, render `WeatherQuiz`, and ensure return navigation and breadcrumbs remain correct.
- Create `src/WeatherQuiz.tsx`: quiz intro, sequential question/feedback stages, results, and recent-attempt history UI.
- Create `src/weather-quiz.css`: scoped responsive game-inspired presentation and visible keyboard focus states.
- Create `src/lib/weatherQuiz.ts`: typed question bank, normalization, exact answer matching, section scoring, and mastery levels.
- Create `src/lib/weatherQuizStorage.ts`: versioned local-history parsing and retention of ten completed attempts, with explicit storage-error results.
- Create `tests/weatherQuiz.test.ts`: unit tests for quiz data, answer normalization/matching, scoring, mastery thresholds, and persistence.
- Create `tests/WeatherQuiz.test.tsx`: learner-flow, accessibility, results, and storage-warning tests.
- Modify `tests/Training.test.tsx`: verify the home card opens the quiz and navigation back to the home/course works without disturbing other views.
- Create `src/test/setup.ts` only as a test-runner prerequisite: `vite.config.ts` already references it, but it is absent in the current workspace; import `@testing-library/jest-dom/vitest` so existing DOM matchers are available.

## Workspace Preconditions

- Execute this plan from the complete Vite app root containing `package.json`, `index.html`, and `src/main.tsx`; do not use a data-only or partial copy.
- Before feature work, confirm `npm run dev` serves the current app and `npm run test -- tests/Training.test.tsx` can start. The current `vite.config.ts` names `src/test/setup.ts`, which is missing; add the minimal setup file above before relying on Vitest.
- The current workspace has no Git metadata, so do not run Git commit commands here. If implementation is moved to the original Git repository, make the usual focused commits there.

### Task 1: Implement and test quiz definitions and grading

**Files:**
- Create: `src/lib/weatherQuiz.ts`
- Create: `tests/weatherQuiz.test.ts`
- Create: `src/test/setup.ts` (test-runner prerequisite)

- [ ] **Step 1: Add focused unit tests for normalization and exact matching**

Test that `normalizeAnswer` lowercases, trims, collapses whitespace, and removes punctuation; test exact normalized matching for a curated variant; ensure a wrong sentence containing a shared keyword does not pass, and a valid but unlisted paraphrase is transparently unmatched.

- [ ] **Step 2: Add tests for the question-bank shape and section scoring**

Assert five vocabulary questions and five translation questions are present, each has a stable ID, prompt, reference answer, explanation, and at least one accepted answer. Test section scores at 0, 1, 2, 3, 4, and 5 and verify the three mastery labels at their exact boundaries.

- [ ] **Step 3: Run the targeted tests and confirm the expected initial failure**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: FAIL because the weather quiz module and its exported helpers do not yet exist. If test startup fails first due to the configured missing setup file, create the minimal `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`, then rerun.

- [ ] **Step 4: Define the typed question bank and grading helpers**

Create five vocabulary fill-ins from the lesson's `gloom`, `forecast`, `stay dry`, `take it for granted`, and `for a change` vocabulary entries. Create five Chinese prompts covering weather greetings, rainy/sunny-day responses, and returning to work; list reference answers and curated common variants explicitly. Implement normalization as lowercase + trimmed/collapsed whitespace + punctuation removal, then whole-answer equality only. Implement independent 0–5 section scores and the agreed mastery labels.

- [ ] **Step 5: Run the unit tests and confirm they pass**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: PASS for all question-bank, matching, score, and mastery cases.

### Task 2: Add versioned attempt-history storage

**Files:**
- Create: `src/lib/weatherQuizStorage.ts`
- Modify: `tests/weatherQuiz.test.ts`

- [ ] **Step 1: Add failing tests for history serialization and schema validation**

Cover empty history, valid stored records, malformed JSON, unsupported schema, and attempts containing per-question answers and correctness.

- [ ] **Step 2: Add failing tests for the ten-attempt retention rule and storage errors**

Verify a new completed attempt appends to history and only the latest ten remain. Verify unavailable storage and a write exception produce explicit failure results without throwing into the UI or silently reporting success.

- [ ] **Step 3: Run the targeted tests and confirm storage tests fail**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: FAIL because the versioned storage API is not implemented.

- [ ] **Step 4: Implement versioned load/save helpers**

Use a versioned key and validated record shape. Keep storage access injectable for unit tests. Catch storage access/serialization failures only at this boundary and return a typed result that distinguishes unavailable, corrupt/unsupported, and saved history. Save a completed result before trimming and writing the latest ten records.

- [ ] **Step 5: Run the unit tests and confirm persistence behavior**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: PASS for valid history, corrupt history, retention, and storage failures.

### Task 3: Build the staged quiz and history interface

**Files:**
- Create: `src/WeatherQuiz.tsx`
- Create: `src/weather-quiz.css`
- Create: `tests/WeatherQuiz.test.tsx`

- [ ] **Step 1: Add failing rendering tests for quiz start and question stages**

Verify the intro explains curated-variant grading, the vocabulary stage starts first, exactly one question is shown at a time, and stage/question progress is accurate.

- [ ] **Step 2: Add failing tests for feedback, stage transition, and results**

Verify answer submission reveals correct/incorrect text and explanation; completing five vocabulary items opens the translation stage; completing ten items shows both scores, mastery guidance, answer review, reference answers, and explanations.

- [ ] **Step 3: Add failing tests for history and accessible interaction**

Verify a completed attempt appears in recent history, a second render can load it from local storage, storage failures show a visible warning while the quiz still works, and labels/status text support keyboard and screen-reader use.

- [ ] **Step 4: Run the focused component tests and confirm the expected failure**

Run: `npm run test -- tests/WeatherQuiz.test.tsx`

Expected: FAIL because `WeatherQuiz` is not implemented.

- [ ] **Step 5: Implement the quiz state flow**

Implement intro → question → feedback → next question → stage transition → result/history states. Disable empty submissions, keep XP/streak decorative only, present unmatched translation answers as “not in the accepted-answer list; compare with the reference answer,” and persist only completed attempts.

- [ ] **Step 6: Add the responsive game-inspired styles**

Use a clear stage progress indicator, question counter, XP/streak feedback, readable answer input, and distinct but text-labeled feedback. Keep the question and result content primary; ensure keyboard focus is visible and narrow layouts do not overflow.

- [ ] **Step 7: Run focused component tests and confirm they pass**

Run: `npm run test -- tests/WeatherQuiz.test.tsx`

Expected: PASS for stage flow, scoring display, history, warnings, and accessibility labels.

### Task 4: Integrate course entry and app navigation

**Files:**
- Modify: `src/Home.tsx`
- Modify: `src/Training.tsx`
- Modify: `tests/Training.test.tsx`

- [ ] **Step 1: Add a failing test for the Weather lesson's quiz entry**

Filter to daily communication, confirm the Weather & Environment card still opens its lesson, and assert a separate quiz action is available.

- [ ] **Step 2: Add a failing test for app navigation**

Click the quiz action and assert the quiz intro is shown rather than course dialogue; use the quiz return control and assert home is restored. Verify the existing lesson, listening-player, and alternate-home navigation tests remain valid.

- [ ] **Step 3: Run the targeted integration test and confirm it fails**

Run: `npm run test -- tests/Training.test.tsx`

Expected: FAIL because no quiz entry/view is wired.

- [ ] **Step 4: Wire the home card and `Training` view**

Add a separate “开始检测” action to the existing Weather & Environment card. Extend `Training`'s view union and navigation callback type with `quiz`; render `WeatherQuiz` explicitly so it does not fall through to the lesson-document branch. Provide a clear return-to-home action and quiz-specific breadcrumb/title while preserving existing lesson selection, completion, and listening behavior.

- [ ] **Step 5: Run the integration tests and confirm they pass**

Run: `npm run test -- tests/Training.test.tsx`

Expected: PASS for quiz entry, return navigation, and existing training flows.

### Task 5: Verify the complete behavior

**Files:**
- Verify: `src/WeatherQuiz.tsx`
- Verify: `src/weather-quiz.css`
- Verify: `src/lib/weatherQuiz.ts`
- Verify: `src/lib/weatherQuizStorage.ts`
- Verify: `tests/weatherQuiz.test.ts`
- Verify: `tests/WeatherQuiz.test.tsx`
- Verify: `tests/Training.test.tsx`

- [ ] **Step 1: Run all Vitest tests**

Run: `npm test`

Expected: PASS for the full test suite, including pre-existing caption/player tests.

- [ ] **Step 2: Run the production bundler**

Run: `npx vite build`

Expected: Vite creates a production build without missing-module or CSS errors. `npm run build` additionally requires the TypeScript project configuration to be present in the actual app root.

- [ ] **Step 3: Manually verify desktop and mobile browser layouts**

Run: `npm run dev`, open the Vite Local URL, start the weather quiz, complete both stages, inspect results and history, then verify at a narrow viewport and by keyboard. Confirm the browser displays a storage warning when storage is blocked and that existing lesson/listening navigation still works.

- [ ] **Step 4: Remove any temporary test data**

Clear only the quiz's test history key from the test browser context; do not clear unrelated course-completion records.
