import {
  SET_USER_DETAILS_LOADING,
  SET_USER_DETAILS,
  SET_USER_ALREADY_LOGGED_IN,
  SET_USER_DETAILS_ERROR,
  SET_USER_ROLE,
  LOGOUT_LOADING,
  SET_IS_SESSION_EXPIRED,
  SET_CABINET_LIST,
  SET_IS_PASSWORD_EXPIRED,
  SET_IS_FIRST_TIME_LOGIN,
  SET_VISIBLE_LOGIN_COMPONENT,
  SET_PREVIOUS_AUTHCODE,
  SET_USERNAME,
  SET_USER_TOKEN_VALUE,
  SET_USER_PREVIOUS_PASSWORD,
} from "./actionTypes";

const initialState = {
  userTokenValue: null,
  userPreviousPassword: null,
  isAlreadyLoggedIn: false,
  isPasswordExpired: false,
  isFirstTimeLogin: false,

  userRole: 0,
  userDetailLoading: false,
  isLogoutLoading: false,
  userDetailError: null,

  isSessionExpired: false,
  cabinetList: [],
  visibleLoginComponent: "Login",
  previousAuthCode: null,
  username: null,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_USER_DETAILS_LOADING:
      return {
        ...state,
        userDetailLoading: action.payload,
      };
    case LOGOUT_LOADING:
      return {
        ...state,
        isLogoutLoading: action.payload,
      };
    case SET_USER_DETAILS_ERROR:
      return {
        ...state,
        userDetailError: action.payload,
      };
    case SET_USER_DETAILS:
      return {
        ...state,
        user: action.payload,
      };
    case SET_USER_ALREADY_LOGGED_IN:
      return {
        ...state,
        isAlreadyLoggedIn: action.payload,
      };
    case SET_IS_PASSWORD_EXPIRED:
      return {
        ...state,
        isPasswordExpired: action.payload,
      };
    case SET_CABINET_LIST:
      return {
        ...state,
        cabinetList: action.payload,
      };

    case SET_IS_FIRST_TIME_LOGIN:
      return {
        ...state,
        isFirstTimeLogin: action.payload,
      };
    case SET_VISIBLE_LOGIN_COMPONENT:
      return {
        ...state,
        visibleLoginComponent: action.payload,
      };
    case SET_PREVIOUS_AUTHCODE:
      return {
        ...state,
        previousAuthCode: action.payload,
      };
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload,
      };
    case SET_USER_PREVIOUS_PASSWORD:
      return {
        ...state,
        userPreviousPassword: action.payload,
      };
    case SET_USER_TOKEN_VALUE:
      return {
        ...state,
        userTokenValue: action.payload,
      };
    default:
      return state;
  }
}
