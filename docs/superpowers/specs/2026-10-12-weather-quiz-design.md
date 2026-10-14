# Rainy-Day Dialogue Cloze Design

## Goal

Let the learner try a faithful, interactive version of the supplied “7.1.1 天气不好” dialogue cloze and review its presentation before expanding the course assessment.

## Scope

- Add one separate in-app practice view to the existing React course.
- Add an entry point from the Weather & Environment course card.
- Reproduce the complete rainy-day conversation and bilingual table shown in the original “7.1.1 天气不好” gray-blank question image. Hide exactly the text in its 20 gray blank fields, keeping each field as its own inline answer input.
- Treat the original gray-blank question image as authoritative for blank positions and dialogue wording. The later answer-key image has some mismatches and is only a spelling/reference aid; do not blank any additional red phrase that was not a gray blank in the original question.
- Match the learner's supplied source, not substitute the existing course dialogue or invent a new quiz.
- Show the whole conversation at once and check all answers with one submission.
- Use the previously selected playful game-inspired visual style, while keeping the bilingual dialogue and answer fields easy to read.
- After submission, show only `X / 20` and per-blank correctness, entered answer, and supplied reference answer. Do not show mastery tiers or a translation stage in this preview.
- Save up to the latest ten completed attempts in the learner's browser; no accounts, teacher view, backend, AI grading, or answer upload.
- Implement only this rainy-day cloze now. Defer the sunny-day cloze and Chinese-to-English “7.2.1 天气不好” exercise until the learner reviews this first version.

## Supplied Conversation Content

Render the bilingual speaker / English / Chinese rows from the user-provided exercise images. Preserve their order and labels:

1. Sarah asks David about Seattle's weather.
2. David describes the usual winter weather, all-morning rain, gloom, the city relying on antidepressants, and missing the sun.
3. Sarah says “Classic Seattle.”
4. David says he has accepted that it will rain every day.
5. Jenny says “Same here” and that she does not bother checking the forecast unless she sees the sun.
6. David says “That sounds about right. Hope everyone is staying dry.”
7. Sarah transitions to release updates with “Anyway, let's dive into the release updates, shall we?” This last row has no blanks in the original question image.

Use the supplied Chinese translations as displayed. Do not rewrite or translate the supplied copy during implementation.

## Cloze Content and Grading

Create exactly 20 inline blanks matching the individual gray fields in the original question image, in order:

1. `How's`
2. `weather`
3. `looking`
4. `usual`
5. `weather`
6. `all morning`
7. `feel like`
8. `miss`
9. `the`
10. `sun`
11. `Classic`
12. `At`
13. `this`
14. `point`
15. `accepted`
16. `don't`
17. `even`
18. `bother`
19. `sounds`
20. `staying`

- Store each blank with a stable ID, accepted exact answer(s), and a concise learning note where the source or course content supports one. Treat multiword gray fields such as `all morning` and `feel like` as one answer; keep individually separated gray fields such as `At`, `this`, and `point` as separate answers.
- Normalize answers by lowercasing, trimming, collapsing whitespace, and removing punctuation; compare the entire normalized answer, never keyword substrings.
- Allow a learner to submit with some blanks unanswered; unanswered blanks count as incorrect and display the reference answer.
- Following submission, mark every field correct/incorrect in text, show the score out of 20 and the correct span for every incorrect or unanswered blank. Do not gate review on a pass threshold.
- Retrying starts a fresh attempt and does not change previous completed records.

## Learner Flow and History

1. From the Weather & Environment home card, the learner chooses a distinct rainy-day cloze action.
2. The cloze view identifies the exercise and explains that all blanks are checked together.
3. The learner completes inline blanks within the entire bilingual speaker table and submits once.
4. The submitted result is shown in place with the score, item-by-item feedback, and reference answers.
5. The learner may retry or return to the course/home.
6. A compact history area lists recent attempt dates and scores; each saved record contains the answers and correctness needed to review that attempt.

Save only completed submissions, retain at most the latest ten, and use a versioned key/schema. Schema version 1 is `{ schemaVersion: 1, attempts: [{ completedAt: ISO timestamp, answers: 20 strings, correctness: 20 booleans, score: integer 0..20 }] }`. If storage is unavailable, the current activity still works in memory and a visible notice explains that history cannot be saved. If stored history is corrupt or unsupported, show a clear notice without blocking the current attempt or silently claiming a valid empty history. Read/load results must distinguish valid history, unavailable storage, and corrupt/unsupported history; save results must distinguish saved from unavailable/failed storage.

## Accessibility and Visual Behavior

- Preserve semantic speaker, English, and Chinese columns while allowing inline answer inputs to wrap on narrow screens.
- Give every input an accessible name that references its sentence/blank.
- Support keyboard entry and submission; show visible keyboard focus.
- Announce submission score and per-answer feedback to assistive technology.
- Do not communicate correctness by color alone.
- XP/streak decoration, if present, is cosmetic only and must not imply a different score.

## Technical Shape

- Integrate through existing `Home` and `Training` navigation patterns; do not make a second app.
- Keep the supplied conversation/answer data, normalization/grading, and versioned history helpers independently testable from the React view.
- Preserve the existing Weather & Environment lesson, other courses, completion state, and listening player.

## Acceptance Criteria

- The Weather & Environment course card exposes a distinct entry to this cloze view.
- The practice reproduces all source rows, speaker labels, English, Chinese, and exactly 20 gray-field blanks in order.
- All 20 reference answers fit their original sentence context, and punctuation/case/spacing differences do not change a match.
- Submitting a mixture of correct, incorrect, and empty answers yields the correct `X / 20` score and useful per-blank feedback.
- A learner can retry and return without altering existing course behavior.
- Completed attempts survive reload in the same browser; saving an 11th attempt retains the newest ten.
- Storage unavailable/corrupt states show clear notices while leaving the current activity usable.
- Focused unit, UI, and existing course/player tests pass; production bundling succeeds where the project configuration permits it.
