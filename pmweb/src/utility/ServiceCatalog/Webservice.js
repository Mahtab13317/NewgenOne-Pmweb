import {
  NO_AUTH,
  BASIC_AUTH,
  TOKEN_BASED_AUTH,
  COMPLEX_VARTYPE,
} from "../../Constants/appConstants";

export function getAuthenticationType(type) {
  switch (type) {
    case NO_AUTH:
      return "NA";
    case BASIC_AUTH:
      return "B";
    case TOKEN_BASED_AUTH:
      return "T";
    default:
      return null;
  }
}

export function getAuthenticationCode(code) {
  switch (code) {
    case "NA":
      return NO_AUTH;
    case "B":
      return BASIC_AUTH;
    case "T":
      return TOKEN_BASED_AUTH;
    default:
      return null;
  }
}

export function getResReqCode(code) {
  switch (code) {
    case "X":
      return "Application/XML";
    case "J":
      return "Application/JSON";
    case "P":
      return "Text/Plain";
    case "T":
      return "Text/XML";
    case "N":
      return "<None>";
  }
}

export function getScopeType(type) {
  switch (type) {
    case "H":
      return "Header";
    case "P":
      return "Path";
    case "M":
      return "Matrix";
    case "Q":
      return "Query";
    case "F":
      return "Form";
  }
}

export function getTokenType(type) {
  switch (type) {
    case "I":
      return "Input";
    case "O":
      return "Output";
    case "T":
      return "Target";
  }
}

export const getDataStructFromList = (memTypeId, dataList) => {
  let paramName = "";
  dataList?.forEach((el) => {
    if (+el.DataStructureId === +memTypeId) {
      paramName = el.ParamName;
    }
  });
  return paramName;
};

export const getMemberMap = (members) => {
  let tempMemberMap = {};
  members?.forEach((mem) => {
    tempMemberMap = {
      ...tempMemberMap,
      [mem.ParamName]: {
        m_iDataStructureId: mem.DataStructureId,
        m_iParentTypeId: mem.ParentID,
        sPramScope: mem.ParamScope,
        objVarDefInfo: {
          varName: mem.ParamName,
          type: mem.ParamType,
          complexTypeId: mem.TypeId,
          unbounded: mem.Unbounded,
        },
        memberMap:
          mem.ParamType === COMPLEX_VARTYPE ? getMemberMap(mem.Member) : {},
      },
    };
  });
  return tempMemberMap;
};

export const getMaxMemDS = (members, maxDataId) => {
  let tempMaxDataId = maxDataId;
  members?.forEach((mem) => {
    if (+mem.DataStructureId > +tempMaxDataId) {
      tempMaxDataId = +mem.DataStructureId;
    }
    if (
      mem.ParamType === COMPLEX_VARTYPE &&
      mem.Member &&
      mem.Member?.length > 0
    ) {
      tempMaxDataId = getMaxMemDS(mem.Member, tempMaxDataId);
    }
  });
  return tempMaxDataId;
};
