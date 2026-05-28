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

export const addSubmodule = createAsyncThunk("course/addSubmodule", async (payload, { rejectWithValue }) => {
  try {
    const { courseId, moduleId, ...body } = payload;
    if (!courseId || !moduleId) throw new Error("courseId and moduleId are required");

    const endpoint = `/instructor/courses/${courseId}/modules/${moduleId}/submodules`;
    const { data } = await api.post(endpoint, body);
    
    return {
      submodule: data.submodule,
      moduleId: data.moduleId || moduleId,
      courseId: data.courseId || courseId
    };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || err.message || "Failed to add submodule");
  }
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

export const saveBlocks = createAsyncThunk("course/saveBlocks", async ({ id, blocks }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/submodules/${id}/blocks`, { blocks });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || "Could not save lesson content.");
  }
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
        const module = { ...a.payload, submodules: a.payload.submodules || [] };
        s.course.modules.push(module);
      })
      .addCase(updateModule.fulfilled, (s, a) => {
        const idx = s.course.modules.findIndex((m) => (m._id || m.moduleId) === (a.payload._id || a.payload.moduleId));
        if (idx !== -1) s.course.modules[idx] = { ...s.course.modules[idx], ...a.payload };
      })
      .addCase(deleteModule.fulfilled, (s, a) => {
        s.course.modules = s.course.modules.filter((m) => (m._id || m.moduleId) !== a.payload);
      })

      .addCase(addSubmodule.fulfilled, (s, a) => {
        const mod = s.course.modules.find((m) => String(m._id || m.moduleId) === String(a.payload.moduleId));
        if (mod) {
          if (!mod.submodules) mod.submodules = [];
          mod.submodules.push(a.payload.submodule);
        }
      })
      .addCase(updateSubmodule.fulfilled, (s, a) => {
        s.course.modules.forEach((m) => {
          const idx = m.submodules?.findIndex((sm) => (sm._id || sm.submoduleId) === (a.payload._id || a.payload.submoduleId));
          if (idx !== -1) m.submodules[idx] = { ...m.submodules[idx], ...a.payload };
        });
      })
      .addCase(deleteSubmodule.fulfilled, (s, a) => {
        const mod = s.course.modules.find((m) => (m._id || m.moduleId) === a.payload.moduleId);
        if (mod) mod.submodules = mod.submodules.filter((sm) => (sm._id || sm.submoduleId) !== a.payload.id);
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
