import secureLocalStorage from "react-secure-storage";

export function getMenuNameFlag(menuList, menuName) {
  let show = false;
  menuList?.forEach((element) => {
    if (element.menuName === menuName) {
      show = element.show;
    }
  });
  return show;
}

export const getLocalProjectRights = (rightKey) => {
  return rightKey === "Y" ? true : false;
};

export const getProcessesByRights = (processList) => {
  let newProcessList = [];
  processList?.forEach((element) => {
    if (element.RIGHTS?.V === "Y") {
      newProcessList.push(element);
    }
  });
  return newProcessList;
};

export const getProjectsByRights = (projectList) => {
  let newProjectList = [];
  projectList?.forEach((element) => {
    if (element.RIGHTS?.V === "Y") {
      newProjectList.push(element);
    }
  });
  return newProjectList;
};

//For AI Rights Availability check
export const getAIRights = () => {
  let isGenAIEnabled = secureLocalStorage.getItem("genAIEnabled");
  return isGenAIEnabled;
};