# Weather & Environment Quiz Design

## Goal

Add a focused self-assessment for the existing **Weather & Environment** workplace-English lesson. It should help a learner distinguish vocabulary recall from the ability to produce useful workplace English, and give practical review guidance.

## Scope

- Add the quiz to the existing React course application as a separate in-app view.
- Provide an entry point from the Weather & Environment course card on the learning home.
- Cover only the existing Weather & Environment lesson in the first version.
- Include two sequential stages:
  1. Five vocabulary fill-in questions.
  2. Five Chinese-to-English situational translation questions.
- Present the quiz in a playful, game-inspired visual style with progress, XP, and streak feedback. Keep learning content and answer feedback visually primary.
- Show results to the learner only. Do not add accounts, teacher dashboards, server storage, AI grading, or answer uploads.

## Learner Flow

1. The learner opens the Weather & Environment quiz from its course card.
2. An introduction explains the two stages, estimated effort, scoring, and that translations are graded against curated answers and accepted variants.
3. The learner answers one question at a time. The interface shows stage and question progress.
4. After the learner submits an answer, the quiz shows whether it matched, a short explanation, and the next action.
5. When the five vocabulary questions are complete, the learner continues to the translation stage.
6. After all ten questions, the results view presents the two section scores, mastery guidance, and item-by-item review with the learner's answer, reference answer, and explanation.
7. The learner can retry the quiz or review the latest ten attempts saved in the current browser.

The flow must remain usable on narrow/mobile screens and by keyboard. Inputs have visible labels; correct/incorrect feedback is conveyed in text and not by color alone.

## Question Content and Grading

- Derive the five vocabulary items from the existing lesson's `gloom`, `forecast`, `stay dry`, `take it for granted`, and `for a change` entries in `src/data/extraLessons.ts`. Translation prompts should assess existing weather greetings, rainy/sunny-day responses, and the transition back to work (including `Anyway, shall we get started with today's updates?`). Avoid introducing unrelated vocabulary.
- Vocabulary answers are graded against their expected answer(s). Translation answers use curated reference sentences and explicitly listed common variants. Compare whole normalized answers, not partial keyword matches: lowercase, trim and collapse whitespace, and remove punctuation before exact comparison.
- Store accepted variants alongside each question so they are explicit, reviewable, and covered by tests. Do not claim to accept arbitrary paraphrases.
- Do not attempt semantic or AI grading. Explain this limitation before the quiz and on an unmatched translation result. A valid expression not included in the answer variants may be marked unmatched; show the reference answer and invite self-comparison rather than claiming that it is definitively ungrammatical.
- Each section is scored independently from 0 to 5. Per-section guidance:
  - 4–5: “掌握不错”
  - 2–3: “建议复习”
  - 0–1: “回到课程巩固”
- Show the overall result as an overview, while keeping vocabulary and expression mastery separate. No pass/fail certificate or ranking is included.
- XP and streak are motivational UI feedback only; they do not change scores or mastery guidance.

## Progress and Local Persistence

- Store up to the latest ten completed attempts in the learner's browser using `localStorage`; remove the oldest attempt only after successfully saving a newer completed attempt.
- Each record includes a completion timestamp, per-question answers and grading result, and the two section scores so the learner can review prior mistakes.
- Keep quiz definitions and scoring logic separate from view markup, and version the stored-history key/schema so future changes can be handled deliberately.
- Do not persist an incomplete attempt in the first version.
- If browser storage is unavailable, allow the current attempt and results to work in memory and show a clear notice that history cannot be saved.
- If stored history cannot be parsed or does not match the supported schema, surface a clear notice and keep the current quiz usable. Do not silently represent an unreadable history as a valid empty history.

## Technical Shape

- Integrate with the existing `Training` view/navigation patterns rather than creating another app or adding a backend.
- Add an explicit quiz entry from the Weather & Environment course card in `Home`.
- Keep the quiz content/model, grading helpers, and history handling independently testable from the screen component.
- Use the course's existing styling conventions where possible, with the approved game-inspired treatment for this quiz.
- Preserve the existing lesson flow, course completion tracking, and listening player behavior.

## Verification and Acceptance Criteria

- Existing course and listening-player tests continue to pass.
- A learner can enter the quiz from the Weather & Environment course card and return to the course/home navigation.
- Exactly five vocabulary questions precede exactly five translation questions; stage progress and question progress remain accurate.
- Answer feedback, stage transition, and final results are correct for right and wrong answers.
- Translation matching accepts curated variants and punctuation/case/whitespace differences, and reports unmatched answers transparently.
- Matching tests cover an accepted variant, punctuation/case/whitespace normalization, an incorrect answer that shares a keyword, and a valid-but-unlisted paraphrase that is transparently marked unmatched.
- Each section's score and mastery guidance match the stated thresholds.
- Results show all submitted answers with reference answers and explanations.
- A completed attempt is available in history after a page reload; saving a new attempt retains only the most recent ten.
- Storage failure or unreadable history produces a visible warning without preventing an in-memory attempt.
- Keyboard interaction and narrow-screen layout are verified.
