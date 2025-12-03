import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/resume';

// Initial State
const initialState = {
    currentData: {
        personalInfo: {
            fullName: "",
            email: "",
            phone: "",
            linkedin: "",
            portfolio: "",
            address: "",
            summary: ""
        },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: []
    },
    versions: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    isDirty: false, // Tracks if there are unsaved changes
    lastSaved: null
};

// Async Thunks

export const fetchDraft = createAsyncThunk('resume/fetchDraft', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/draft`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || { message: error.message });
    }
});

export const saveDraft = createAsyncThunk('resume/saveDraft', async (resumeData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/draft`, { resumeData }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchVersions = createAsyncThunk('resume/fetchVersions', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/versions`, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const saveVersion = createAsyncThunk('resume/saveVersion', async ({ name, description, resumeData }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/version`, { name, description, resumeData }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteVersion = createAsyncThunk('resume/deleteVersion', async (versionId, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_URL}/version/${versionId}`, { withCredentials: true });
        return versionId;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const restoreVersion = createAsyncThunk('resume/restoreVersion', async (versionData, { dispatch, rejectWithValue }) => {
    // Save the restored version as the current draft
    const resultAction = await dispatch(saveDraft(versionData));
    if (saveDraft.rejected.match(resultAction)) {
        return rejectWithValue(resultAction.payload);
    }
    return versionData;
});

export const updateVersion = createAsyncThunk('resume/updateVersion', async ({ versionId, name, description }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${API_URL}/version/${versionId}`, { name, description }, { withCredentials: true });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Removed downloadResumePDF thunk to handle blob in component directly


const resumeSlice = createSlice({
    name: 'resume',
    initialState,
    reducers: {
        updateResumeData: (state, action) => {
            state.currentData = { ...state.currentData, ...action.payload };
            state.isDirty = true;
        },
        updateSectionData: (state, action) => {
            const { section, data } = action.payload;
            state.currentData[section] = data;
            state.isDirty = true;
        },
        resetResume: (state) => {
            state.currentData = initialState.currentData;
            state.isDirty = true;
        },
        setResumeData: (state, action) => {
            state.currentData = action.payload;
            state.isDirty = true; // Manual edits or setting data manually counts as a change
        },
        loadTemplate: (state, action) => {
            state.currentData = action.payload;
            state.isDirty = false; // Loading a template is a "clean" state
            // We don't reset lastSaved here because we want to keep the history of when the *previous* version was saved
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Draft
            .addCase(fetchDraft.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchDraft.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Handle potential nesting if backend returns the full document object with resumeData field
                const fetchedData = action.payload?.resumeData || action.payload;
                // Merge with initial state to ensure all fields exist (prevent crash on undefined)
                state.currentData = {
                    ...initialState.currentData,
                    ...fetchedData,
                    personalInfo: { ...initialState.currentData.personalInfo, ...fetchedData?.personalInfo },
                    experience: fetchedData?.experience || [],
                    education: fetchedData?.education || [],
                    skills: fetchedData?.skills || [],
                    projects: fetchedData?.projects || [],
                    certifications: fetchedData?.certifications || []
                };
                state.isDirty = false;
            })
            .addCase(fetchDraft.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // Save Draft
            .addCase(saveDraft.fulfilled, (state, action) => {
                state.isDirty = false;
                state.lastSaved = new Date().toISOString();
                state.status = 'succeeded'; // Optional, but good for tracking
            })
            .addCase(saveDraft.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                console.error("Save Draft Failed:", action.payload);
            })
            // Fetch Versions
            .addCase(fetchVersions.fulfilled, (state, action) => {
                state.versions = action.payload;
            })
            // Save Version
            .addCase(saveVersion.fulfilled, (state, action) => {
                state.versions.unshift(action.payload); // Add new version to top
            })
            // Delete Version
            .addCase(deleteVersion.fulfilled, (state, action) => {
                state.versions = state.versions.filter(v => v.versionId !== action.payload);
            })
            // Restore Version
            .addCase(restoreVersion.fulfilled, (state, action) => {
                state.currentData = action.payload;
                state.isDirty = false;
            })
            // Update Version
            .addCase(updateVersion.fulfilled, (state, action) => {
                const index = state.versions.findIndex(v => v.versionId === action.payload.versionId);
                if (index !== -1) {
                    state.versions[index] = action.payload;
                }
            });
    },
});

export const { updateResumeData, updateSectionData, resetResume, setResumeData, loadTemplate } = resumeSlice.actions;

export default resumeSlice.reducer;
