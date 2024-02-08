import React, { useEffect, useRef, useState } from "react";
import styles from "./modal.module.css";
import arabicStyles from "./arabicModal.module.css";
import { useTranslation } from "react-i18next";
import CloseIcon from "@material-ui/icons/Close";
import { Checkbox, MenuItem } from "@material-ui/core";
import emptyStatePic from "../../../../../../../assets/ProcessView/EmptyState.svg";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import {
  STATE_ADDED,
  REQ_RES_TYPE_OPTIONS,
  VARIABLE_TYPE_OPTIONS,
  Y_FLAG,
  COMPLEX_VARTYPE,
  STATE_EDITED,
  N_FLAG,
  ERROR_INCORRECT_FORMAT,
  RTL_DIRECTION,
  SERVER_URL,
  ENDPOINT_PROCESS_ASSOCIATION,
  GLOBAL_SCOPE,
  DEFAULT_GLOBAL_ID,
  VAR_TYPE,
  COMPLEX,
  STATE_CREATED,
} from "../../../../../../../Constants/appConstants";
import { getVariableType } from "../../../../../../../utility/ProcessSettings/Triggers/getVariableType";
import TextInput from "../../../../../../../UI/Components_With_ErrrorHandling/InputField";
import {
  REGEX,
  validateRegex,
} from "../../../../../../../validators/validator";
import Toast from "../../../../../../../UI/ErrorToast";
import DefaultModal from "../../../../../../../UI/Modal/Modal";
import ObjectDependencies from "../../../../../../../UI/ObjectDependencyModal";
import axios from "axios";
import { store, useGlobalState } from "state-pool";
import CustomizedDropdown from "../../../../../../../UI/Components_With_ErrrorHandling/Dropdown";
import { getDataStructFromList } from "../../../../../../../utility/ServiceCatalog/Webservice";

function DefineRequestModal(props) {
  let { t } = useTranslation();
  const direction = `${t("HTML_DIR")}`;
  let {
    cancelFunc,
    selected,
    setChangedSelection,
    setSelected,
    maxDataId,
    setMaxDataId,
    reqBodyList,
    setReqBodyList,
    isScreenReadOnly,
  } = props;
  const [data, setData] = useState({
    variableName: "",
    variableType: "10",
    unbounded: false,
    isNested: false,
    memberName: "",
    memberType: "10",
    isMemberArr: false,
  });
  const [bShowInput, setShowInput] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [isEdited, setIsEdited] = useState(false);
  const [dataId, setDataId] = useState(0);
  const [commonError, setCommonError] = useState(null);
  const [error, setError] = useState({});
  const [taskAssociation, setTaskAssociation] = useState([]);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const loadedProcessData = store.getState("loadedProcessData");
  const [localLoadedProcessData] = useGlobalState(loadedProcessData);
  const CheckRef = useRef();
  const NestedRef = useRef();
  const MemberRef = useRef();

  useEffect(() => {
    if (reqBodyList) {
      setDataList(reqBodyList);
    }
    setDataId(maxDataId);
  }, [reqBodyList, maxDataId]);

  useEffect(() => {
    let tempTypeList = [];
    VARIABLE_TYPE_OPTIONS.forEach((opt1) => {
      tempTypeList.push({
        optType: VAR_TYPE,
        value: opt1,
      });
    });
    dataList
      ?.filter(
        (el) => el.IsNested === Y_FLAG && el.ParamType === COMPLEX_VARTYPE
      )
      .forEach((opt) => {
        tempTypeList.push({
          optType: COMPLEX,
          value: opt,
        });
      });
    setTypeList(tempTypeList);
  }, [dataList]);

  const onChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onChangeChecked = (e) => {
    setData({ ...data, [e.target.name]: e.target.checked });
  };

  const addMember = () => {
    let temp = [...dataList];
    let alreadyExistsIndex = null;
    let structAlreadyExist = false;
    let memAlreadyExist = false;
    temp.forEach((el, index) => {
      if (
        el.ParamName === data.variableName &&
        el.ParamType === COMPLEX_VARTYPE
      ) {
        alreadyExistsIndex = index;
      }
      if (
        el.ParamName === data.variableName &&
        el.ParamType !== COMPLEX_VARTYPE
      ) {
        structAlreadyExist = true;
      }
      el.Member?.forEach((mem) => {
        if (
          mem.ParamName === data.memberName &&
          el.ParamName === data.variableName
        ) {
          memAlreadyExist = true;
        }
      });
    });
    if (structAlreadyExist) {
      setCommonError({
        label: t("StructureAlreadyExists"),
        errorType: "error",
      });
    } else if (
      !validateRegex(data.variableName, REGEX.StartWithAlphaThenAlphaNumUsDash)
    ) {
      setError({
        variableName: {
          statement: null,
          severity: "error",
          errorType: ERROR_INCORRECT_FORMAT,
        },
      });
      setCommonError({
        label:
          t("streamErrorFirstLetter") + ". " + t("_and-SpecialCharAllowed"),
        errorType: "error",
      });
    } else if (memAlreadyExist) {
      setCommonError({
        label: t("FieldAlreadyExists"),
        errorType: "error",
      });
    } else if (
      data.memberName?.trim() !== "" &&
      !validateRegex(data.memberName, REGEX.StartWithAlphaThenAlphaNumUsDash)
    ) {
      setError({
        memberName: {
          statement: null,
          severity: "error",
          errorType: ERROR_INCORRECT_FORMAT,
        },
      });
      setCommonError({
        label:
          t("streamErrorFirstLetter") + ". " + t("_and-SpecialCharAllowed"),
        errorType: "error",
      });
    } else {
      let maxDS_Id = dataId + 1;
      let latestDS_Id;
      const getComplexVarMembers = (members, parentDS_Id) => {
        latestDS_Id = parentDS_Id;
        let newMembers = members?.map((el, index) => {
          latestDS_Id = latestDS_Id + 1;
          let newDS_id = latestDS_Id;
          let members =
            el.ParamType === COMPLEX_VARTYPE
              ? getComplexVarMembers(el.Member, latestDS_Id)
              : [];
          return {
            DataStructureId: newDS_id,
            ParamName: el.ParamName,
            ParamScope: el.ParamScope,
            ParamType: el.ParamType,
            ParentID: parentDS_Id,
            TypeId: el.TypeId,
            Member: members,
            Unbounded: el.Unbounded,
          };
        });
        maxDS_Id = maxDS_Id + (latestDS_Id - parentDS_Id);
        return newMembers;
      };

      if (alreadyExistsIndex !== null) {
        let newDataId = dataId + 1;
        temp[alreadyExistsIndex].Member.push({
          DataStructureId: newDataId,
          ParamName: data.memberName,
          ParamScope: "C",
          ParamType:
            data.memberType.optType === COMPLEX
              ? COMPLEX_VARTYPE
              : data.memberType.value,
          ParentID: temp[alreadyExistsIndex].DataStructureId,
          TypeId:
            data.memberType.optType === COMPLEX
              ? data.memberType.value.DataStructureId
              : 0,
          Member:
            data.memberType.optType === COMPLEX
              ? getComplexVarMembers(data?.memberType?.value?.Member, newDataId)
              : [],
          Unbounded: data.isMemberArr ? Y_FLAG : N_FLAG,
        });
        //---
        if (temp[alreadyExistsIndex].ParamType === COMPLEX_VARTYPE) {
          const checkMembers = (members, memberIndex) => {
            let newMembers = [...members];
            newMembers.forEach((el, index) => {
              if (
                el.ParamType === COMPLEX_VARTYPE &&
                el.DataStructureId !== newMembers[memberIndex].DataStructureId
              ) {
                el.Member?.forEach((mem, memIndex) => {
                  if (
                    +mem.TypeId === +newMembers[memberIndex].DataStructureId
                  ) {
                    maxDS_Id = maxDS_Id + 1;
                    newMembers[index].Member[memIndex].Member.push({
                      DataStructureId: maxDS_Id,
                      ParamName: data.memberName,
                      ParamScope: "C",
                      ParamType:
                        data.memberType.optType === COMPLEX
                          ? COMPLEX_VARTYPE
                          : data.memberType.value,
                      ParentID:
                        newMembers[index].Member[memIndex].DataStructureId,
                      TypeId:
                        data.memberType.optType === COMPLEX
                          ? data.memberType.value.DataStructureId
                          : 0,
                      Member:
                        data.memberType.optType === COMPLEX
                          ? getComplexVarMembers(
                              data?.memberType?.value?.Member,
                              maxDS_Id
                            )
                          : [],
                      Unbounded: data.isMemberArr ? Y_FLAG : N_FLAG,
                    });
                  } else if (
                    mem.ParamType === COMPLEX_VARTYPE &&
                    +mem.TypeId !== +newMembers[memberIndex].DataStructureId
                  ) {
                    newMembers[index].Member[memIndex].Member = checkMembers(
                      newMembers[index].Member[memIndex].Member,
                      memIndex
                    );
                  }
                });
              }
            });
            return newMembers;
          };
          temp = checkMembers(temp, alreadyExistsIndex);
        }
        //---
        setDataId(maxDS_Id);
      } else {
        let newDataId = dataId + 1;
        temp.push({
          DataStructureId: newDataId,
          IsNested: data.isNested ? Y_FLAG : N_FLAG,
          Member:
            data.variableType === COMPLEX_VARTYPE
              ? [
                  {
                    DataStructureId: newDataId + 1,
                    ParamName: data.memberName,
                    ParamScope: "C",
                    ParamType:
                      data.memberType.optType === COMPLEX
                        ? COMPLEX_VARTYPE
                        : data.memberType.value,
                    ParentID: newDataId,
                    TypeId:
                      data.memberType.optType === COMPLEX
                        ? data.memberType.value.DataStructureId
                        : 0,
                    Member:
                      data.memberType.optType === COMPLEX
                        ? getComplexVarMembers(
                            data?.memberType?.value?.Member,
                            newDataId + 1
                          )
                        : [],
                    Unbounded: data.isMemberArr ? Y_FLAG : N_FLAG,
                  },
                ]
              : [],
          ParamName: data.variableName,
          ParamScope: "C",
          ParamType: data.variableType,
          ParentID: 0,
          Unbounded: data.unbounded ? Y_FLAG : N_FLAG,
        });
        setDataId(
          data.variableType === COMPLEX_VARTYPE
            ? data.memberType.optType === COMPLEX
              ? maxDS_Id + 1
              : dataId + 2
            : dataId + 1
        );
      }
      setDataList(temp);
      setIsEdited(true);
      setShowInput(false);
      setData({
        variableName: "",
        variableType: "10",
        unbounded: false,
        isNested: false,
        memberName: "",
        memberType: "10",
        isMemberArr: false,
      });
      setError({});
    }
  };

  const removeMember = (index, memberIndex, data) => {
    let temp = JSON.parse(JSON.stringify(dataList));
    const deleteMemberMethod = () => {
      if (memberIndex === -1) {
        temp.splice(index, 1);
      } else {
        const deleteMember = (members) => {
          let newMembers = [...members];
          newMembers?.forEach((el, parIdx) => {
            if (
              +el.DataStructureId === +data.DataStructureId ||
              el.ParamName === data.ParamName
            ) {
              newMembers.splice(parIdx, 1);
            } else if (
              el.ParamType === COMPLEX_VARTYPE &&
              +el.DataStructureId !== +data.DataStructureId &&
              el.ParamName !== data.ParamName
            ) {
              newMembers[parIdx].Member = deleteMember(el.Member);
              if (newMembers[parIdx].Member?.length === 0) {
                newMembers.splice(parIdx, 1);
              }
            }
          });
          return newMembers;
        };
        temp = deleteMember(temp);
      }
      setDataList(temp);
    };
    if (selected?.status === STATE_CREATED) {
      deleteMemberMethod();
    } else {
      let payload = {
        processId:
          props?.scope === GLOBAL_SCOPE
            ? DEFAULT_GLOBAL_ID
            : localLoadedProcessData?.ProcessDefId,
        processType: "L",
        objectName: props?.selected?.MethodIndex,
        objectId: data?.DataStructureId,
        wsType: "RCX",
        deviceType: data?.ParamName,
      };
      axios
        .post(SERVER_URL + ENDPOINT_PROCESS_ASSOCIATION, payload)
        .then((res) => {
          if (res.data.Status === 0) {
            if (res?.data?.Validations?.length > 0) {
              setTaskAssociation(res?.data?.Validations);
              setShowDependencyModal(true);
            } else {
              deleteMemberMethod();
              setIsEdited(true);
            }
          }
        });
    }
  };

  const submitFunc = () => {
    if (isEdited) {
      setChangedSelection((prev) => {
        let temp = { ...prev };
        temp = {
          ...temp,
          ReqBodyParameters: dataList,
          maxDataStructId: dataId,
        };
        return temp;
      });
      setReqBodyList(dataList);
      if (selected?.status === STATE_ADDED) {
        setSelected((prev) => {
          let temp = { ...prev };
          temp.status = STATE_EDITED;
          return temp;
        });
      }
      setMaxDataId(dataId);
    }
    cancelFunc();
  };

  return (
    <div>
      <div className={styles.modalHeader}>
        <h3
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.modalHeading
              : styles.modalHeading
          }
        >
          {t("RequestBody") + " " + t("definition")}
        </h3>
        <CloseIcon
          onClick={cancelFunc}
          className={styles.closeIcon}
          id="pmweb_webS_reqBodyclose"
          tabIndex={0}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              cancelFunc();
              e.stopPropagation();
            }
          }}
        />
      </div>
      <div className={styles.modalBody}>
        {dataList?.length > 0 || bShowInput ? (
          <table>
            <thead className={styles.dataTableHead}>
              <tr className="w100">
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "15%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                  >
                    {t("variableName")}
                    <span
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.starIcon
                          : styles.starIcon
                      }
                    >
                      *
                    </span>
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "13%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                  >
                    {t("variableType")}
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "10%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                    style={{ textAlign: "center" }}
                  >
                    {t("IsAnArray")}
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "10%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                    style={{ textAlign: "center" }}
                  >
                    {t("IsNested")}
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "15%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                  >
                    {t("memberName")}
                    <span
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.starIcon
                          : styles.starIcon
                      }
                    >
                      *
                    </span>
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "13%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                  >
                    {t("memberType")}
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "10%" }}
                >
                  <p
                    className={
                      direction === RTL_DIRECTION
                        ? arabicStyles.dataTableHeadCellContent
                        : styles.dataTableHeadCellContent
                    }
                    style={{ textAlign: "center" }}
                  >
                    {t("IsAnArray")}
                  </p>
                </th>
                <th
                  className={styles.dataTableHeadCell}
                  style={{ width: "15%" }}
                >
                  <span style={{ display: "none" }}>CheckBox</span>
                  {bShowInput || isScreenReadOnly ? null : (
                    <p
                      className={styles.dataEntryAddBtnHeader}
                      onClick={() => {
                        setShowInput(true);
                      }}
                      tabIndex={0}
                      onkeyDown={(e) => {
                        if (e.key === "Enter") {
                          setShowInput(true);
                          e.stopPropagation();
                        }
                      }}
                      id={`pmweb_${props.id}_all`}
                    >
                      {t("+Variable")}
                    </p>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className={styles.dataTableBody}>
              {bShowInput ? (
                <tr
                  className={`${styles.dataTableRow} w100`}
                  style={{ background: "#0072C61A" }}
                >
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "15%" }}
                  >
                    <TextInput
                      inputValue={data.variableName}
                      classTag={
                        direction === RTL_DIRECTION
                          ? arabicStyles.inputField
                          : styles.inputField
                      }
                      onChangeEvent={onChange}
                      name="variableName"
                      idTag="pmweb_webS_reqBodyVarName"
                      regexStr={REGEX.StartWithAlphaThenAlphaNumUsDash}
                      errorStatement={error?.variableName?.statement}
                      errorSeverity={error?.variableName?.severity}
                      errorType={error?.variableName?.errorType}
                    />
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "13%" }}
                  >
                    <CustomizedDropdown
                      variant="outlined"
                      defaultValue={"defaultValue"}
                      isNotMandatory={true}
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.selectField
                          : styles.selectField
                      }
                      value={data.variableType}
                      name="variableType"
                      onChange={onChange}
                      id="pmweb_webS_reqBodyVarType"
                    >
                      {REQ_RES_TYPE_OPTIONS.map((opt) => {
                        return (
                          <MenuItem
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dropdownData
                                : styles.dropdownData
                            }
                            value={opt}
                            id={`pmweb_webS_reqBodyVarType_${opt}`}
                          >
                            {t(getVariableType(opt))}
                          </MenuItem>
                        );
                      })}
                    </CustomizedDropdown>
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "10%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                      style={{ textAlign: "center" }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor="pmweb_webS_reqBodyUnbounded"
                      >
                        Checkbox
                      </label>
                      <Checkbox
                        name="unbounded"
                        checked={data.unbounded}
                        onChange={onChangeChecked}
                        id="pmweb_webS_reqBodyUnbounded"
                        color="primary"
                        tabIndex={0}
                        ref={CheckRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            CheckRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                        aria-label="pmweb_webS_reqBodyUnbounded"
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataCheckbox
                            : styles.dataCheckbox
                        }
                      />
                    </p>
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "10%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                      style={{ textAlign: "center" }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor="pmweb_webS_reqBodyisNested"
                      >
                        Checkbox
                      </label>
                      <Checkbox
                        name="isNested"
                        checked={data.isNested}
                        onChange={onChangeChecked}
                        id="pmweb_webS_reqBodyisNested"
                        color="primary"
                        disabled={data.variableType !== COMPLEX_VARTYPE}
                        tabIndex={0}
                        ref={NestedRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            NestedRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataCheckbox
                            : styles.dataCheckbox
                        }
                      />
                    </p>
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "15%" }}
                  >
                    <TextInput
                      inputValue={data.memberName}
                      classTag={
                        data.variableType !== COMPLEX_VARTYPE
                          ? direction === RTL_DIRECTION
                            ? arabicStyles.disabledInputField
                            : direction === RTL_DIRECTION
                            ? arabicStyles.disabledInputField
                            : styles.disabledInputField
                          : direction === RTL_DIRECTION
                          ? arabicStyles.inputField
                          : styles.inputField
                      }
                      onChangeEvent={onChange}
                      name="memberName"
                      idTag="pmweb_webS_reqBodyMemName"
                      readOnlyCondition={data.variableType !== COMPLEX_VARTYPE}
                      regexStr={REGEX.StartWithAlphaThenAlphaNumUsDash}
                      errorStatement={error?.memberName?.statement}
                      errorSeverity={error?.memberName?.severity}
                      errorType={error?.memberName?.errorType}
                    />
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "13%" }}
                  >
                    <CustomizedDropdown
                      variant="outlined"
                      defaultValue={"defaultValue"}
                      className={
                        data.variableType !== COMPLEX_VARTYPE
                          ? direction === RTL_DIRECTION
                            ? arabicStyles.disabledSelectField
                            : styles.disabledSelectField
                          : direction === RTL_DIRECTION
                          ? arabicStyles.selectField
                          : styles.selectField
                      }
                      inputProps={{
                        readOnly: data.variableType !== COMPLEX_VARTYPE,
                      }}
                      value={
                        data.variableType !== COMPLEX_VARTYPE
                          ? ""
                          : data.memberType
                      }
                      name="memberType"
                      onChange={onChange}
                      id="pmweb_webS_reqBodyMemberType"
                    >
                      {typeList
                        ?.filter(
                          (el) =>
                            (el.optType === COMPLEX &&
                              el.value?.ParamName !== data.variableName) ||
                            el.optType === VAR_TYPE
                        )
                        ?.map((opt) => {
                          return (
                            <MenuItem
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dropdownData
                                  : styles.dropdownData
                              }
                              value={opt}
                              id={`pmweb_webS_reqBodyMemberType_${opt}`}
                            >
                              {opt.optType === VAR_TYPE
                                ? t(getVariableType(opt.value))
                                : opt.value.ParamName}
                            </MenuItem>
                          );
                        })}
                    </CustomizedDropdown>
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "10%" }}
                  >
                    <p
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.dataTableHeadCellContent
                          : styles.dataTableHeadCellContent
                      }
                      style={{ textAlign: "center" }}
                    >
                      <label
                        style={{ display: "none" }}
                        htmlFor="pmweb_webS_reqBodyisMemberArr"
                      >
                        Checkbox
                      </label>
                      <Checkbox
                        name="isMemberArr"
                        checked={data.isMemberArr}
                        onChange={onChangeChecked}
                        disabled={data.variableType !== COMPLEX_VARTYPE}
                        id="pmweb_webS_reqBodyisMemberArr"
                        color="primary"
                        tabIndex={0}
                        ref={MemberRef}
                        onKeyUp={(e) => {
                          if (e.key === "Enter") {
                            MemberRef.current.click();
                            e.stopPropagation();
                          }
                        }}
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataCheckbox
                            : styles.dataCheckbox
                        }
                      />
                    </p>
                  </td>
                  <td
                    className={styles.dataTableBodyCell}
                    style={{ width: "15%", textAlign: "center" }}
                  >
                    <button
                      className={
                        direction === RTL_DIRECTION
                          ? arabicStyles.closeButton
                          : styles.closeButton
                      }
                      style={{ width: "5rem" }}
                      onClick={() => {
                        setShowInput(false);
                        setData({
                          variableName: "",
                          variableType: "10",
                          unbounded: false,
                          isNested: false,
                          memberName: "",
                          memberType: "10",
                          isMemberArr: false,
                        });
                      }}
                      id="pmweb_webS_reqBodycancelInp"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      className={
                        data.variableName?.trim() === "" ||
                        (data.variableType === COMPLEX_VARTYPE &&
                          data.memberName?.trim() === "")
                          ? styles.dataEntryDisableBtnHeader
                          : styles.dataEntryAddBtnHeader
                      }
                      style={{ width: "5rem" }}
                      id="pmweb_webS_reqBodyAddInp"
                      onClick={addMember}
                      tabIndex={0}
                      onkeyDown={(e) => {
                        if (e.key === "Enter") {
                          addMember();
                          e.stopPropagation();
                        }
                      }}
                      disabled={
                        data.variableName?.trim() === "" ||
                        (data.variableType === COMPLEX_VARTYPE &&
                          data.memberName?.trim() === "")
                      }
                    >
                      {t("add")}
                    </button>
                  </td>
                </tr>
              ) : null}
              {dataList?.map((option, index) => {
                return option?.Member?.length > 0 ? (
                  option.Member.map((member, memberIndex) => {
                    return (
                      <tr className={`${styles.dataTableRow} w100`}>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "15%" }}
                        >
                          <span
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.normalSpan
                                : styles.normalSpan
                            }
                          >
                            {option.ParamName}
                          </span>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "13%" }}
                        >
                          <span
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.normalSpan
                                : styles.normalSpan
                            }
                          >
                            {t(getVariableType(option.ParamType))}
                          </span>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "10%" }}
                        >
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dataTableHeadCellContent
                                : styles.dataTableHeadCellContent
                            }
                            style={{ textAlign: "center" }}
                          >
                            <label
                              style={{ display: "none" }}
                              htmlFor="pmweb_webS_"
                            >
                              Checkbox
                            </label>
                            <Checkbox
                              checked={option.Unbounded === Y_FLAG}
                              disabled={true}
                              color="primary"
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dataCheckbox
                                  : styles.dataCheckbox
                              }
                              id="pmweb_webS"
                            />
                          </p>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "10%" }}
                        >
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dataTableHeadCellContent
                                : styles.dataTableHeadCellContent
                            }
                            style={{ textAlign: "center" }}
                          >
                            <label
                              style={{ display: "none" }}
                              htmlFor={`pmweb_reqModal_nested_12`}
                            >
                              checkbox
                            </label>
                            <Checkbox
                              checked={option.IsNested === Y_FLAG}
                              disabled={true}
                              color="primary"
                              id={`pmweb_reqModal_nested_12`}
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dataCheckbox
                                  : styles.dataCheckbox
                              }
                            />
                          </p>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "15%" }}
                        >
                          <span
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.normalSpan
                                : styles.normalSpan
                            }
                          >
                            {member.ParamName}
                          </span>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "13%" }}
                        >
                          <span
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.normalSpan
                                : styles.normalSpan
                            }
                          >
                            {`${member.TypeId}`?.trim() === "" ||
                            +member.TypeId === 0
                              ? t(getVariableType(member.ParamType))
                              : getDataStructFromList(member.TypeId, dataList)}
                          </span>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "10%" }}
                        >
                          <p
                            className={
                              direction === RTL_DIRECTION
                                ? arabicStyles.dataTableHeadCellContent
                                : styles.dataTableHeadCellContent
                            }
                            style={{ textAlign: "center" }}
                          >
                            <label
                              style={{ display: "none" }}
                              htmlFor={`pmweb_reqModa_YFlag_${index}`}
                            >
                              LAbel
                            </label>
                            <Checkbox
                              checked={member.Unbounded === Y_FLAG}
                              disabled={true}
                              color="primary"
                              className={
                                direction === RTL_DIRECTION
                                  ? arabicStyles.dataCheckbox
                                  : styles.dataCheckbox
                              }
                              id={`pmweb_reqModa_YFlag_${index}`}
                            />
                          </p>
                        </td>
                        <td
                          className={styles.dataTableBodyCell}
                          style={{ width: "15%" }}
                        >
                          {!isScreenReadOnly && (
                            <button
                              className={`${styles.dataEntryAddBtnBody}`}
                              id={`pmweb_${props.id}_mem${index}`}
                              onClick={() =>
                                removeMember(index, memberIndex, member)
                              }
                              tabIndex={0}
                              onkeyDown={(e) => {
                                if (e.key === "Enter") {
                                  removeMember(index, memberIndex, member);
                                  e.stopPropagation();
                                }
                              }}
                            >
                              <span style={{ display: "none" }}>Delete</span>
                              <DeleteOutlineIcon className={styles.moreBtn} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr className={`${styles.dataTableRow} w100`}>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "15%" }}
                    >
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.normalSpan
                            : styles.normalSpan
                        }
                      >
                        {option.ParamName}
                      </span>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "13%" }}
                    >
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.normalSpan
                            : styles.normalSpan
                        }
                      >
                        {t(getVariableType(option.ParamType))}
                      </span>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "10%" }}
                    >
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataTableHeadCellContent
                            : styles.dataTableHeadCellContent
                        }
                        style={{ textAlign: "center" }}
                      >
                        <label
                          style={{ display: "none" }}
                          htmlFor={`pmweb_regMod_yFlag_unbound_${index}`}
                        >
                          Check
                        </label>
                        <Checkbox
                          checked={option.Unbounded === Y_FLAG}
                          disabled={true}
                          color="primary"
                          id={`pmweb_regMod_yFlag_unbound_${index}`}
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.dataCheckbox
                              : styles.dataCheckbox
                          }
                        />
                      </p>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "10%" }}
                    >
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataTableHeadCellContent
                            : styles.dataTableHeadCellContent
                        }
                        style={{ textAlign: "center" }}
                      >
                        <label
                          style={{ display: "none" }}
                          htmlFor={`pmweb_regMod_yFlag_nested_${index}`}
                        >
                          check
                        </label>
                        <Checkbox
                          checked={option.IsNested === Y_FLAG}
                          disabled={true}
                          color="primary"
                          id={`pmweb_regMod_yFlag_nested_${index}`}
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.dataCheckbox
                              : styles.dataCheckbox
                          }
                        />
                      </p>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "15%" }}
                    >
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.normalSpan
                            : styles.normalSpan
                        }
                        style={{ marginLeft: "0.5vw" }}
                      >
                        -
                      </span>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "13%" }}
                    >
                      <span
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.normalSpan
                            : styles.normalSpan
                        }
                        style={{ marginLeft: "0.5vw" }}
                      >
                        -
                      </span>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "10%" }}
                    >
                      <p
                        className={
                          direction === RTL_DIRECTION
                            ? arabicStyles.dataTableHeadCellContent
                            : styles.dataTableHeadCellContent
                        }
                        style={{ textAlign: "center" }}
                      >
                        <label
                          style={{ display: "none" }}
                          htmlFor={`pmweb_regMod_yFlag_jcdc_${index}`}
                        >
                          check
                        </label>
                        <Checkbox
                          checked={false}
                          disabled={true}
                          color="primary"
                          id={`pmweb_regMod_yFlag_jcdc_${index}`}
                          className={
                            direction === RTL_DIRECTION
                              ? arabicStyles.dataCheckbox
                              : styles.dataCheckbox
                          }
                        />
                      </p>
                    </td>
                    <td
                      className={styles.dataTableBodyCell}
                      style={{ width: "15%" }}
                    >
                      {!isScreenReadOnly && (
                        <button
                          className={`${styles.dataEntryAddBtnBody}`}
                          id={`pmweb_${props.id}_item${index}`}
                          onClick={() => removeMember(index, -1, option)}
                          tabIndex={0}
                          onkeyDown={(e) => {
                            if (e.key === "Enter") {
                              removeMember(index, -1, option);
                              e.stopPropagation();
                            }
                          }}
                        >
                          <span style={{ display: "none" }}>delete</span>
                          <DeleteOutlineIcon className={styles.moreBtn} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.noDefinedParamScreen}>
            <div>
              <img src={emptyStatePic} alt={`${t("noDefinedParam")}`} />
              <p className={styles.noDefinedParamString}>
                {t("noDefinedParam")}
              </p>
            </div>
            {!isScreenReadOnly && (
              <button
                className={styles.primaryBtn}
                id="pmweb_noReqBody_btn"
                onClick={() => {
                  setShowInput(true);
                }}
              >
                {t("addVariable")}
              </button>
            )}
          </div>
        )}
      </div>
      <div
        className={
          direction === RTL_DIRECTION
            ? arabicStyles.modalFooter
            : styles.modalFooter
        }
      >
        <button
          className={
            direction === RTL_DIRECTION
              ? arabicStyles.cancelButton
              : styles.cancelButton
          }
          onClick={cancelFunc}
          id="pmweb_webS_reqBodycancel"
        >
          {t("cancel")}
        </button>
        <button
          className={styles.okButton}
          onClick={submitFunc}
          id="pmweb_webS_reqBodyOK"
        >
          {t("ok")}
        </button>
      </div>
      {commonError !== null ? (
        <Toast
          open={commonError !== null}
          closeToast={() => setCommonError(null)}
          message={commonError.label}
          severity={commonError.errorType}
        />
      ) : null}

      {showDependencyModal ? (
        <DefaultModal
          show={showDependencyModal}
          style={{
            width: "45vw",
            left: "28%",
            top: "21.5%",
            padding: "0",
          }}
          modalClosed={() => setShowDependencyModal(false)}
          children={
            <ObjectDependencies
              // {...props}
              processAssociation={taskAssociation}
              cancelFunc={() => setShowDependencyModal(false)}
            />
          }
        />
      ) : null}
    </div>
  );
}

export default DefineRequestModal;
