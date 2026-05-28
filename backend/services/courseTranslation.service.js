import { translateText } from "./awsTranslate.service.js";
import Quiz from "../models/Quiz.js";

/**
 * Translates localized objects (en, hi, mr) by detecting the source language.
 * @param {Object} localizedObj - Object with { en, hi, mr }
 * @param {boolean} force - Whether to re-translate existing fields
 */
export const translateLocalizedField = async (localizedObj, force = false) => {
  if (!localizedObj) return;

  const languages = ["en", "hi", "mr"];
  
  // 1. Detect source (first non-empty field)
  const sourceLang = languages.find(l => localizedObj[l] && String(localizedObj[l]).trim());
  if (!sourceLang) return;

  const sourceText = String(localizedObj[sourceLang]);

  // 2. Translate to all other languages
  for (const targetLang of languages) {
    if (targetLang === sourceLang) continue;
    
    // Only translate if empty OR if forced
    if (force || !localizedObj[targetLang] || !String(localizedObj[targetLang]).trim()) {
      localizedObj[targetLang] = await translateText(sourceText, targetLang, sourceLang);
    }
  }
};

const preserveExistingTranslations = (localizedObj, oldLocalizedObj, changed) => {
  if (!localizedObj || !oldLocalizedObj || changed) return;

  for (const lang of ["en", "hi", "mr"]) {
    if (!localizedObj[lang] && oldLocalizedObj[lang]) {
      localizedObj[lang] = oldLocalizedObj[lang];
    }
  }
};

const sourceText = (localizedObj = {}) => {
  const sourceLang = ["en", "hi", "mr"].find((lang) => localizedObj?.[lang] && String(localizedObj[lang]).trim());
  return sourceLang ? String(localizedObj[sourceLang]) : "";
};

const localizedSourceChanged = (localizedObj, oldLocalizedObj) =>
  !oldLocalizedObj || sourceText(localizedObj) !== sourceText(oldLocalizedObj);

/**
 * Translates a full course structure into missing languages.
 * @param {Object} courseData - The course document or payload
 * @param {Object} oldData - The previous state of the course (for change detection)
 */
export const translateCourseContent = async (courseData, oldData = null) => {
  // 1. Basic Info
  // We force re-translation if the content changed significantly
  const titleChanged = localizedSourceChanged(courseData.title, oldData?.title);
  const descChanged = localizedSourceChanged(courseData.description, oldData?.description);
  const shortDescChanged = localizedSourceChanged(courseData.shortDescription, oldData?.shortDescription);

  preserveExistingTranslations(courseData.title, oldData?.title, titleChanged);
  preserveExistingTranslations(courseData.description, oldData?.description, descChanged);
  preserveExistingTranslations(courseData.shortDescription, oldData?.shortDescription, shortDescChanged);

  await translateLocalizedField(courseData.title, titleChanged);
  await translateLocalizedField(courseData.description, descChanged);
  await translateLocalizedField(courseData.shortDescription, shortDescChanged);

  // 2. Tags
  const languages = ["en", "hi", "mr"];
  const sourceTagsLang = languages.find(l => courseData.tags?.[l]?.length > 0);
  
  if (sourceTagsLang) {
    const sourceTags = courseData.tags[sourceTagsLang];
    const tagsChanged = !oldData || JSON.stringify(sourceTags) !== JSON.stringify(oldData.tags?.[sourceTagsLang]);

    for (const lang of languages) {
      if (lang === sourceTagsLang) continue;
      if (tagsChanged || !courseData.tags[lang] || !courseData.tags[lang].length) {
        courseData.tags[lang] = await Promise.all(
          sourceTags.map((tag) => translateText(tag, lang, sourceTagsLang))
        );
      }
    }
  }

  // 3. Modules, Submodules, and Blocks
  if (courseData.modules?.length) {
    for (let m = 0; m < courseData.modules.length; m++) {
      const mod = courseData.modules[m];
      const oldMod = oldData?.modules?.find(om => String(om.moduleId) === String(mod.moduleId));

      const modTitleChanged = localizedSourceChanged(mod.moduleTitle, oldMod?.moduleTitle);
      const modDescChanged = localizedSourceChanged(mod.moduleDescription, oldMod?.moduleDescription);

      preserveExistingTranslations(mod.moduleTitle, oldMod?.moduleTitle, modTitleChanged);
      preserveExistingTranslations(mod.moduleDescription, oldMod?.moduleDescription, modDescChanged);

      await translateLocalizedField(mod.moduleTitle, modTitleChanged);
      await translateLocalizedField(mod.moduleDescription, modDescChanged);

      if (mod.submodules?.length) {
        for (let s = 0; s < mod.submodules.length; s++) {
          const sub = mod.submodules[s];
          const oldSub = oldMod?.submodules?.find(os => String(os.submoduleId) === String(sub.submoduleId));

          const subTitleChanged = localizedSourceChanged(sub.submoduleTitle, oldSub?.submoduleTitle);
          const subDescChanged = localizedSourceChanged(sub.submoduleDescription, oldSub?.submoduleDescription);

          preserveExistingTranslations(sub.submoduleTitle, oldSub?.submoduleTitle, subTitleChanged);
          preserveExistingTranslations(sub.submoduleDescription, oldSub?.submoduleDescription, subDescChanged);

          await translateLocalizedField(sub.submoduleTitle, subTitleChanged);
          await translateLocalizedField(sub.submoduleDescription, subDescChanged);

          if (sub.contentBlocks?.length) {
            for (let b = 0; b < sub.contentBlocks.length; b++) {
              const block = sub.contentBlocks[b];
              const oldBlock = oldSub?.contentBlocks?.find(ob => String(ob.blockId) === String(block.blockId));

              const blockTitleChanged = localizedSourceChanged(block.title, oldBlock?.title);
              preserveExistingTranslations(block.title, oldBlock?.title, blockTitleChanged);
              await translateLocalizedField(block.title, blockTitleChanged);

              if (block.type === "TEXT") {
                const blockTextChanged = localizedSourceChanged(block.textContent, oldBlock?.textContent);
                preserveExistingTranslations(block.textContent, oldBlock?.textContent, blockTextChanged);
                await translateLocalizedField(block.textContent, blockTextChanged);
              }

              if (block.type === "QUIZ" && block.quizId) {
                const quiz = await Quiz.findById(block.quizId);
                if (quiz) {
                  await translateFullQuiz(quiz);
                  await quiz.save();
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
    en: "COMPLETED",
    hi: "COMPLETED",
    mr: "COMPLETED",
  };

  return courseData;
};

/**
 * Translates a quiz structure completely by detecting source.
 */
export const translateFullQuiz = async (quiz) => {
  await translateLocalizedField(quiz.title);

  if (quiz.questions?.length) {
    for (let q = 0; q < quiz.questions.length; q++) {
      const question = quiz.questions[q];
      await translateLocalizedField(question.questionText);

      if (question.options?.length) {
        for (let o = 0; o < question.options.length; o++) {
          await translateLocalizedField(question.options[o].text);
        }
      }

      if (question.explanation) {
        await translateLocalizedField(question.explanation);
      }
    }
  }
};
