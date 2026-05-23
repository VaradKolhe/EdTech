import { translateText } from "./awsTranslate.service.js";
import Quiz from "../models/Quiz.js";

/**
 * Translates localized objects (en, hi, mr) if English content is present and hi/mr are missing.
 * @param {Object} localizedObj - Object with { en, hi, mr }
 * @param {string} targetLang - "hi" or "mr"
 * @param {boolean} force - Whether to re-translate even if hi/mr exists
 */
const translateField = async (localizedObj, targetLang, force = false) => {
  if (!localizedObj || !localizedObj.en) return;
  if (!force && localizedObj[targetLang]) return;

  localizedObj[targetLang] = await translateText(localizedObj.en, targetLang);
};

/**
 * Translates a full course structure into Hindi and Marathi.
 * @param {Object} courseData - The course document or payload
 * @param {Object} oldData - The previous state of the course (for change detection)
 */
export const translateCourseContent = async (courseData, oldData = null) => {
  const languages = ["hi", "mr"];

  for (const lang of languages) {
    // 1. Basic Info
    // Only re-translate if English content changed OR if we are creating new
    const titleChanged = !oldData || courseData.title?.en !== oldData.title?.en;
    const descChanged = !oldData || courseData.description?.en !== oldData.description?.en;
    const shortDescChanged = !oldData || courseData.shortDescription?.en !== oldData.shortDescription?.en;

    if (titleChanged) await translateField(courseData.title, lang, true);
    else await translateField(courseData.title, lang, false);

    if (descChanged) await translateField(courseData.description, lang, true);
    else await translateField(courseData.description, lang, false);

    if (shortDescChanged) await translateField(courseData.shortDescription, lang, true);
    else await translateField(courseData.shortDescription, lang, false);

    // 2. Tags
    if (!oldData || JSON.stringify(courseData.tags?.en) !== JSON.stringify(oldData.tags?.en)) {
      if (courseData.tags?.en?.length) {
        courseData.tags[lang] = await Promise.all(
          courseData.tags.en.map((tag) => translateText(tag, lang))
        );
      }
    }

    // 3. Modules, Submodules, and Blocks
    if (courseData.modules?.length) {
      for (let m = 0; m < courseData.modules.length; m++) {
        const mod = courseData.modules[m];
        const oldMod = oldData?.modules?.find(om => String(om.moduleId) === String(mod.moduleId));

        // Module titles/desc
        const modTitleChanged = !oldMod || mod.moduleTitle?.en !== oldMod.moduleTitle?.en;
        await translateField(mod.moduleTitle, lang, modTitleChanged);
        await translateField(mod.moduleDescription, lang, !oldMod || mod.moduleDescription?.en !== oldMod.moduleDescription?.en);

        if (mod.submodules?.length) {
          for (let s = 0; s < mod.submodules.length; s++) {
            const sub = mod.submodules[s];
            const oldSub = oldMod?.submodules?.find(os => String(os.submoduleId) === String(sub.submoduleId));

            // Submodule titles/desc
            const subTitleChanged = !oldSub || sub.submoduleTitle?.en !== oldSub.submoduleTitle?.en;
            await translateField(sub.submoduleTitle, lang, subTitleChanged);
            await translateField(sub.submoduleDescription, lang, !oldSub || sub.submoduleDescription?.en !== oldSub.submoduleDescription?.en);

            if (sub.contentBlocks?.length) {
              for (let b = 0; b < sub.contentBlocks.length; b++) {
                const block = sub.contentBlocks[b];
                const oldBlock = oldSub?.contentBlocks?.find(ob => String(ob.blockId) === String(block.blockId));

                // Block titles/text (Only for TEXT and QUIZ placeholders)
                const blockTitleChanged = !oldBlock || block.title?.en !== oldBlock.title?.en;
                await translateField(block.title, lang, blockTitleChanged);

                if (block.type === "TEXT") {
                  const blockTextChanged = !oldBlock || block.textContent?.en !== oldBlock.textContent?.en;
                  await translateField(block.textContent, lang, blockTextChanged);
                }

                // Quiz content (If embedded in course data)
                if (block.type === "QUIZ" && block.quizId) {
                  const quiz = await Quiz.findById(block.quizId);
                  if (quiz) {
                    await translateQuizContent(quiz, lang);
                    await quiz.save();
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  // Update translation status
  courseData.translationStatus = {
    hi: "COMPLETED",
    mr: "COMPLETED",
  };

  return courseData;
};

/**
 * Translates a quiz structure.
 */
export const translateQuizContent = async (quiz, targetLang) => {
  // Quiz Title
  await translateField(quiz.title, targetLang);

  if (quiz.questions?.length) {
    for (let q = 0; q < quiz.questions.length; q++) {
      const question = quiz.questions[q];
      await translateField(question.questionText, targetLang);

      if (question.options?.length) {
        for (let o = 0; o < question.options.length; o++) {
          const option = question.options[o];
          await translateField(option.text, targetLang);
        }
      }

      if (question.explanation) {
        await translateField(question.explanation, targetLang);
      }
    }
  }
};
