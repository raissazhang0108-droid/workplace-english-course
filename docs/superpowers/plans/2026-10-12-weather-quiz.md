# Rainy-Day Dialogue Cloze Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the learner's exact rainy-day dialogue cloze as a readable, game-inspired activity with 20 inline blanks, unified grading, answer review, and local attempt history.

**Architecture:** Store the supplied bilingual dialogue as speaker-labeled rows with typed text/blank segments; keep answer normalization, exact grading, and versioned local history separate from the React UI. Integrate the whole-table exercise as its own `Training` view and a separate action on the Weather & Environment card.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, CSS, browser `localStorage`.

---

## File Map

- Modify `src/Home.tsx`: add a distinct rainy-day exercise action to the Weather & Environment card.
- Modify `src/Training.tsx`: add the cloze activity view, return path, and activity navigation while preserving course and listening views.
- Create `src/WeatherQuiz.tsx`: supplied bilingual table, inline inputs, unified submission, results/retry, and recent-attempt display.
- Create `src/weather-quiz.css`: responsive, game-inspired activity and feedback styles.
- Replace/refactor `src/lib/weatherQuiz.ts`: authoritative supplied dialogue rows, exactly 20 individual gray-field answers, normalization, and whole-answer grading.
- Create `src/lib/weatherQuizStorage.ts`: versioned, validated history load/save with ten-attempt retention and explicit error states.
- Modify `tests/weatherQuiz.test.ts`: original-source positions, answer keys, normalized exact grading, and history operations.
- Create `tests/WeatherQuiz.test.tsx`: full-table rendering, all-at-once checking, score/answer review, history, and storage-warning behavior.
- Modify `tests/Training.test.tsx`: separate home-card entry and return navigation coverage.
- Create `src/test/setup.ts`: import `@testing-library/jest-dom/vitest`; this configured setup file is missing and currently prevents all Vitest suites from starting.

## Workspace

Work only in `/Users/tingtingtao/.config/superpowers/worktrees/workplace-english-course/weather-quiz`, on branch `feature/weather-quiz`. The root project repository and initial baseline commit were created with user authorization; do not move implementation into the source directory outside the worktree.

## Source Blanks in Order

The first gray-blank question image is authoritative. The 20 independent inputs and accepted reference answers, in order, are:

`How's`, `weather`, `looking`, `usual`, `weather`, `all morning`, `feel like`, `miss`, `the`, `sun`, `Classic`, `At`, `this`, `point`, `accepted`, `don't`, `even`, `bother`, `sounds`, `staying`.

Keep `Same here`, `checking`, `Anyway`, `dive into`, and the rest of the last row visible because they are not gray blanks in the original question. Do not use the later answer-key image to add blanks or change source wording. Use the source table's bilingual text and labels: Sarah asks about the weather; David describes the rain/gloom and missing the sun; Sarah says Classic Seattle; David accepts the rainy weather; Jenny says Same here and describes not checking the forecast; David says “That sounds about right” and hopes everyone is staying dry; Sarah moves to release updates.

## Task 1: Replace quiz definitions with the supplied 20-blank dialogue

**Files:**
- Modify: `src/lib/weatherQuiz.ts`
- Modify: `tests/weatherQuiz.test.ts`
- Create: `src/test/setup.ts`; preserve the existing `vite.config.ts` `setupFiles` entry, which already points to this path.

- [ ] **Step 1: Write failing tests for the exact source structure**

Assert the speaker-labeled bilingual row content/order matches the supplied original question, and exactly 20 blank segments appear in order with the answer list above. Assert visible phrases (`Same here`, `checking`, and the final transition text) are not replaced by blank markers.

- [ ] **Step 2: Add failing tests for exact grading**

Test case/whitespace/punctuation normalization on individual blanks, reject partial/keyword matches, and verify blank fields are graded independently, including repeated tokens such as `weather`.

- [ ] **Step 3: Run the focused unit test to observe the intended failure**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: FAIL because the current five-plus-five hypothetical question bank does not model the supplied dialogue. If startup first fails because `src/test/setup.ts` is missing, create that setup file importing `@testing-library/jest-dom/vitest` and rerun.

- [ ] **Step 4: Implement the typed dialogue/blank model**

Represent each row with speaker, Chinese translation, and ordered English text/blank segments. Use the 20 source answers exactly; keep multiword gray fields `all morning` and `feel like` in one input, and `At`, `this`, `point` in three inputs. Implement lowercase/trim/collapse-whitespace/remove-punctuation normalization followed by exact whole-answer comparison.

- [ ] **Step 5: Run the focused unit tests**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: PASS for exact rows, blank count/order, and exact normalized grading.

## Task 2: Implement versioned attempt history

**Files:**
- Create: `src/lib/weatherQuizStorage.ts`
- Modify: `tests/weatherQuiz.test.ts`

- [ ] **Step 1: Add failing history tests**

Cover empty and valid versioned history, malformed JSON, unsupported schema, completed records with timestamp/20 submitted answers/20 correctness flags/score, and most-recent-ten retention.

- [ ] **Step 2: Add failing storage-error tests**

Verify unavailable storage and read/write exceptions are returned as explicit states, without preventing an in-memory attempt or falsely reporting a save.

- [ ] **Step 3: Run tests and verify the storage cases fail**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: FAIL because no history API exists.

- [ ] **Step 4: Implement typed storage helpers**

Use a versioned history key and schema validation. Version 1 attempt records contain `{ completedAt: ISO timestamp, answers: string[20], correctness: boolean[20], score: integer 0..20 }`. Make storage injectable for tests. Append only completed submissions; write the newest ten in chronological order. Return explicit loaded, unavailable, corrupt/unsupported, and saved/failure results.

- [ ] **Step 5: Rerun unit tests**

Run: `npm run test -- tests/weatherQuiz.test.ts`

Expected: PASS for valid records, invalid history, retention, and storage failures.

## Task 3: Build the whole-dialogue activity

**Files:**
- Create: `src/WeatherQuiz.tsx`
- Create: `src/weather-quiz.css`
- Create: `tests/WeatherQuiz.test.tsx`

- [ ] **Step 1: Write failing tests for full bilingual table and inputs**

Assert all source rows/speakers/translations render; all 20 inputs have accessible names; exactly the original gray fields are editable; input order matches the source; the final row remains visible text.

- [ ] **Step 2: Write failing tests for unified submission and review**

Fill a mix of correct, incorrect, and empty answers; submit once; assert `X / 20`, every blank's text-labeled correctness, and reference answers for wrong/unanswered fields. Verify no mastery tier or translation stage is shown.

- [ ] **Step 3: Write failing tests for retry, history, and storage errors**

Assert retry starts blank, completed attempts appear in recent history and load after rerender, storage failures show a visible notice without disabling the activity, and corrupt history is not silently treated as valid empty history.

- [ ] **Step 4: Run the focused component tests and observe expected failure**

Run: `npm run test -- tests/WeatherQuiz.test.tsx`

Expected: FAIL because `WeatherQuiz` is not implemented.

- [ ] **Step 5: Implement the bilingual table and unified grading**

Render each English row by mapping its text/blank segments into inline text inputs. Store answers by stable blank ID. Allow partially completed submission; unanswered fields count incorrect. On submission show a live-announced total and correct/incorrect text plus reference for each miss. Persist only completed submissions; offer retry and return actions.

- [ ] **Step 6: Apply responsive game-inspired styles**

Style stage heading, progress/XP decoration (cosmetic only), source-like speaker/EN/中文 table, inline inputs, and results. Preserve readable table behavior on narrow screens (stack or horizontal scrolling without hiding answers), visible focus, and non-color correctness cues.

- [ ] **Step 7: Run the focused component tests**

Run: `npm run test -- tests/WeatherQuiz.test.tsx`

Expected: PASS for source rendering, 20 fields, unified score/feedback, history, mobile/keyboard semantics, and error notices.

## Task 4: Integrate the course entry and app navigation

**Files:**
- Modify: `src/Home.tsx`
- Modify: `src/Training.tsx`
- Modify: `tests/Training.test.tsx`

- [ ] **Step 1: Add a failing test for the distinct cloze entry**

Show the daily-communication course cards and assert Weather & Environment offers a separate “挖词填空” action without replacing its existing lesson action.

- [ ] **Step 2: Add a failing test for view navigation**

Click the cloze entry and assert the exercise table renders; return to the learning home and assert existing home content is restored. Ensure the standard Weather lesson and listening player still open normally.

- [ ] **Step 3: Run focused integration tests and confirm expected failure**

Run: `npm run test -- tests/Training.test.tsx`

Expected: FAIL because no cloze entry/view is wired.

- [ ] **Step 4: Wire `Home` and `Training`**

Add a dedicated callback/action for the weather cloze. Add a `weatherQuiz` view branch before the lesson-document fallback, include an accessible return control and activity-specific title/breadcrumb, and preserve all existing view transitions and lesson-completion state.

- [ ] **Step 5: Run integration tests**

Run: `npm run test -- tests/Training.test.tsx`

Expected: PASS, including existing lesson/player flows.

## Task 5: Verify full feature

- [ ] **Step 1: Run all tests**

Run: `npm test`

Expected: PASS for existing and new tests.

- [ ] **Step 2: Run production build**

Run: `npx vite build`

Expected: Vite production build succeeds. Also run `npm run build` if `tsconfig.json` is present in the actual app root.

- [ ] **Step 3: Manually verify the preview**

Run: `npm run dev`; open the local URL and check all 20 gray fields against the original screenshot, partial submission, `X / 20` result/review, retry, saved history, narrow viewport, keyboard focus, and return navigation.

- [ ] **Step 4: Confirm no sunny-day or translation stage was added**

Verify the deliverable contains only this rainy-day cloze, as requested for the review-first iteration.
