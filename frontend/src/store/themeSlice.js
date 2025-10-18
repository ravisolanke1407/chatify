import { createSlice } from "@reduxjs/toolkit";

const initialTheme =
  typeof window !== "undefined"
    ? localStorage.getItem("chatify-theme") || "coffee"
    : "coffee";

const themeSlice = createSlice({
  name: "theme",
  initialState: { theme: initialTheme },
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload;
      localStorage.setItem("chatify-theme", action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;
