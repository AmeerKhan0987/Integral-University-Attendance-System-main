import React, {
  createContext,
  useReducer,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { User, Attendance, Leave, Notification } from "../types";
import {
  USERS,
  MOCK_ATTENDANCE,
  MOCK_LEAVES,
  MOCK_NOTIFICATIONS,
} from "../constants";

// -------------------- STATE INTERFACE --------------------
interface State {
  users: User[];
  attendance: Attendance[];
  leaves: Leave[];
  notifications: Notification[];
  currentUser?: User | null;
}

// -------------------- ACTION TYPES --------------------
type Action =
  | { type: "ADD_USER"; payload: User }
  | { type: "UPDATE_USER"; payload: User }
  | { type: "DELETE_USER"; payload: number }
  | { type: "ADD_ATTENDANCE"; payload: Attendance }
  | { type: "UPDATE_ATTENDANCE"; payload: Attendance }
  | { type: "ADD_LEAVE"; payload: Leave }
  | {
      type: "UPDATE_LEAVE_STATUS";
      payload: { id: number; status: Leave["status"] };
    }
  | { type: "ADD_NOTIFICATION"; payload: Notification }
  | { type: "SET_CURRENT_USER"; payload: User | null }
  | {
      type: "UPDATE_PROFILE_IMAGE";
      payload: { userId: number; imageUrl: string };
    };

// -------------------- INITIAL STATE --------------------
const initialState: State = {
  users: USERS,
  attendance: MOCK_ATTENDANCE,
  leaves: MOCK_LEAVES,
  notifications: MOCK_NOTIFICATIONS,
  currentUser: null,
};

// -------------------- REDUCER --------------------
function dataReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        ),
      };

    case "DELETE_USER":
      return {
        ...state,
        users: state.users.filter((u) => u.id !== action.payload),
        attendance: state.attendance.filter(
          (a) => a.employeeId !== action.payload
        ),
        leaves: state.leaves.filter((l) => l.employeeId !== action.payload),
      };

    case "ADD_ATTENDANCE":
      return { ...state, attendance: [...state.attendance, action.payload] };

    case "UPDATE_ATTENDANCE":
      return {
        ...state,
        attendance: state.attendance.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
      };

    case "ADD_LEAVE":
      return { ...state, leaves: [...state.leaves, action.payload] };

    case "UPDATE_LEAVE_STATUS":
      return {
        ...state,
        leaves: state.leaves.map((l) =>
          l.id === action.payload.id
            ? { ...l, status: action.payload.status }
            : l
        ),
      };

    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    // ✅ Set Current User
    case "SET_CURRENT_USER":
      return { ...state, currentUser: action.payload };

    // ✅ Update Specific User Profile Image
    case "UPDATE_PROFILE_IMAGE": {
      const updatedUsers = state.users.map((u) =>
        u.id === action.payload.userId
          ? { ...u, profileImage: action.payload.imageUrl }
          : u
      );

      const updatedCurrentUser =
        state.currentUser?.id === action.payload.userId
          ? { ...state.currentUser, profileImage: action.payload.imageUrl }
          : state.currentUser;

      return {
        ...state,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }

    default:
      return state;
  }
}

// -------------------- CONTEXT --------------------
const DataContext = createContext<
  | {
      state: State;
      dispatch: React.Dispatch<Action>;
      updateUserProfileImage: (userId: number, newUrl: string) => void;
    }
  | undefined
>(undefined);

// -------------------- PROVIDER --------------------
export const DataProvider = ({ children }: { children?: ReactNode }) => {
  const initializer = (initial: State): State => {
    try {
      const storedState = window.localStorage.getItem("zaphira-app-state");
      if (storedState) return JSON.parse(storedState);
    } catch (e) {
      console.error("⚠️ Failed to parse localStorage", e);
    }
    return initial;
  };

  const [state, dispatch] = useReducer(dataReducer, initialState, initializer);

  // ✅ Helper: Update user image globally
  const updateUserProfileImage = (userId: number, newUrl: string) => {
    dispatch({
      type: "UPDATE_PROFILE_IMAGE",
      payload: { userId, imageUrl: newUrl },
    });

    const updatedUsers = state.users.map((u) =>
      u.id === userId ? { ...u, profileImage: newUrl } : u
    );

    const updatedState = {
      ...state,
      users: updatedUsers,
      currentUser:
        state.currentUser?.id === userId
          ? { ...state.currentUser, profileImage: newUrl }
          : state.currentUser,
    };

    try {
      localStorage.setItem("zaphira-app-state", JSON.stringify(updatedState));
    } catch (e) {
      console.error("⚠️ Failed to save state", e);
    }
  };

  // Auto-save every change
  useEffect(() => {
    try {
      window.localStorage.setItem("zaphira-app-state", JSON.stringify(state));
    } catch (e) {
      console.error("⚠️ Failed to persist state", e);
    }
  }, [state]);

  return (
    <DataContext.Provider value={{ state, dispatch, updateUserProfileImage }}>
      {children}
    </DataContext.Provider>
  );
};

// -------------------- HOOK EXPORT --------------------
export const useData = () => {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useData must be used within a DataProvider context");
  return context;
};
