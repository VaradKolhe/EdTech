import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../services/api";

export const fetchCourse = createAsyncThunk("course/fetch", async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data;
});

export const addModule = createAsyncThunk("course/addModule", async (payload) => {
  const { data } = await api.post("/modules", payload);
  return data;
});

export const updateModule = createAsyncThunk("course/updateModule", async ({ id, ...body }) => {
  const { data } = await api.put(`/modules/${id}`, body);
  return data;
});

export const deleteModule = createAsyncThunk("course/deleteModule", async (id) => {
  await api.delete(`/modules/${id}`);
  return id;
});

export const addSubmodule = createAsyncThunk("course/addSubmodule", async (payload) => {
  const { data } = await api.post("/submodules", payload);
  return data;
});

export const updateSubmodule = createAsyncThunk("course/updateSubmodule", async ({ id, ...body }) => {
  const { data } = await api.put(`/submodules/${id}`, body);
  return data;
});

export const deleteSubmodule = createAsyncThunk("course/deleteSubmodule", async ({ id, moduleId }) => {
  await api.delete(`/submodules/${id}`);
  return { id, moduleId };
});

export const fetchSubmoduleContent = createAsyncThunk("course/fetchContent", async (id) => {
  const { data } = await api.get(`/submodules/${id}/content`);
  return { id, ...data };
});

export const saveBlocks = createAsyncThunk("course/saveBlocks", async ({ id, blocks }) => {
  const { data } = await api.put(`/submodules/${id}/blocks`, { blocks });
  return data;
});

export const saveContent = createAsyncThunk("course/saveContent", async (payload) => {
  const { data } = await api.post("/submodules/content", payload);
  return data;
});

export const saveQuiz = createAsyncThunk("course/saveQuiz", async (payload) => {
  const { data } = await api.post("/submodules/quiz", payload);
  return data;
});

const courseSlice = createSlice({
  name: "course",
  initialState: {
    course: null,
    activeSubmoduleId: null,
    submoduleContents: {},
    loading: false,
    contentLoading: false,
    error: null,
  },
  reducers: {
    setActiveSubmodule: (state, action) => { state.activeSubmoduleId = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourse.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(fetchCourse.fulfilled, (s, a) => { s.loading = false; s.course = a.payload; })
      .addCase(fetchCourse.rejected, (s, a) => { s.loading = false; s.error = a.error.message; })

      .addCase(addModule.fulfilled, (s, a) => {
        s.course.modules.push({ ...a.payload, submodules: [] });
      })
      .addCase(updateModule.fulfilled, (s, a) => {
        const idx = s.course.modules.findIndex((m) => m._id === a.payload._id);
        if (idx !== -1) s.course.modules[idx] = { ...s.course.modules[idx], ...a.payload };
      })
      .addCase(deleteModule.fulfilled, (s, a) => {
        s.course.modules = s.course.modules.filter((m) => m._id !== a.payload);
      })

      .addCase(addSubmodule.fulfilled, (s, a) => {
        const mod = s.course.modules.find((m) => m._id === a.payload.moduleId);
        if (mod) mod.submodules.push(a.payload);
      })
      .addCase(updateSubmodule.fulfilled, (s, a) => {
        s.course.modules.forEach((m) => {
          const idx = m.submodules.findIndex((sm) => sm._id === a.payload._id);
          if (idx !== -1) m.submodules[idx] = { ...m.submodules[idx], ...a.payload };
        });
      })
      .addCase(deleteSubmodule.fulfilled, (s, a) => {
        const mod = s.course.modules.find((m) => m._id === a.payload.moduleId);
        if (mod) mod.submodules = mod.submodules.filter((sm) => sm._id !== a.payload.id);
        if (s.activeSubmoduleId === a.payload.id) s.activeSubmoduleId = null;
      })

      .addCase(fetchSubmoduleContent.pending, (s) => { s.contentLoading = true; })
      .addCase(fetchSubmoduleContent.fulfilled, (s, a) => {
        s.contentLoading = false;
        s.submoduleContents[a.payload.id] = {
          contents: a.payload.contents,
          quizzes: a.payload.quizzes,
          blocks: a.payload.blocks || [],
        };
      })
      .addCase(fetchSubmoduleContent.rejected, (s) => { s.contentLoading = false; })

      .addCase(saveContent.fulfilled, (s, a) => {
        s.submoduleContents[a.payload._id] = { contents: a.payload.contents, quizzes: a.payload.quizzes, blocks: a.payload.blocks || [] };
      })
      .addCase(saveQuiz.fulfilled, (s, a) => {
        s.submoduleContents[a.payload._id] = { contents: a.payload.contents, quizzes: a.payload.quizzes, blocks: a.payload.blocks || [] };
      })
      .addCase(saveBlocks.fulfilled, (s, a) => {
        s.submoduleContents[a.payload._id] = { contents: a.payload.contents, quizzes: a.payload.quizzes, blocks: a.payload.blocks || [] };
      });
  },
});

export const { setActiveSubmodule, clearError } = courseSlice.actions;
export default courseSlice.reducer;
