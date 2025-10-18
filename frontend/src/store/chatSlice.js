import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchUsersAPI, getMessagesAPI, sendMessageAPI } from "./api/chat";
import { NEW_MESSAGE_RECEIVED } from "./socketActions";

const fetchUsers = createAsyncThunk("chat/fetchUsers", async (_, thunkAPI) => {
  try {
    const { data } = await fetchUsersAPI();
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async (reqbody, thunkAPI) => {
    try {
      const {
        chat: { selectedUser },
      } = thunkAPI.getState();

      const { data } = await sendMessageAPI(selectedUser._id, reqbody);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (_, thunkAPI) => {
    try {
      const {
        chat: { selectedUser },
      } = thunkAPI.getState();

      const { data } = await getMessagesAPI(selectedUser._id);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    socketConnected: false,
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase("socket/connected", (state) => {
        state.socketConnected = true;
      })
      .addCase("socket/disconnected", (state) => {
        state.socketConnected = false;
      })
      .addCase("socket/received", (state, action) => {
        state.messages.push(action.payload);
      });

    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isUsersLoading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isUsersLoading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state) => {
        state.isUsersLoading = false;
      });

    // Send Message
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.messages = [...state.messages, action.payload];
    });

    // Get Selected Users Messages
    builder.addCase(getMessages.fulfilled, (state, action) => {
      state.messages = action.payload;
    });

    // Socket -> New message received.
    builder.addCase(NEW_MESSAGE_RECEIVED, (state, action) => {
      const newMessage = action.payload;
      const isMessageSentFromSelectedUser =
        newMessage.senderId === state.selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      state.messages = [...state.messages, newMessage];
    });
  },
});

export const { setSelectedUser } = chatSlice.actions;

export { fetchUsers, sendMessage, getMessages };
export default chatSlice.reducer;
