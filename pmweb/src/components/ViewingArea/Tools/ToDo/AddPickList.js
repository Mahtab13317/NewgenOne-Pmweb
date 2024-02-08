import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "../Interfaces.css";
import DeleteForeverOutlinedIcon from "@material-ui/icons/DeleteForeverOutlined";
import DragIndicatorOutlinedIcon from "@material-ui/icons/DragIndicatorOutlined";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { setToastDataFunc } from "../../../../redux-store/slices/ToastDataHandlerSlice";
import { Button, IconButton } from "@material-ui/core";
import styles from "../DocTypes/index.module.css";
import { FieldValidations } from "../../../../utility/FieldValidations/fieldValidations";

function AddPickList(props) {
  let { t } = useTranslation();
  const dispatch = useDispatch();
  // code edited on 9 Nov 2022 for BugId 118803
  let [pickList, setPickList] = useState([
    { picklistId: 1, name: "", orderId: 1 },
  ]);

  const pickListRef = useRef();

  const handleInputOnchange = (event, list) => {
    props.setDisableAddBtn(null); //Changes made to solve Bug 141670
    //code added for bug 139497 on 13-10
    const { value } = event.target;
    if (value?.length > 50) {
      dispatch(
        setToastDataFunc({
          message: t("pickListNameLimit"),
          severity: "error",
          open: true,
        })
      );
      return;
    }
    //till here
    let tempList = [...pickList];
    // tempList.map((el) => {
    tempList?.forEach((el) => {
      if (el.picklistId === list.picklistId) {
        el.name = event.target.value.trimStart(); //Changes made to solve Bug 139414
      }
    });
    setPickList(tempList);
  };

  // code edited on 05 Dec 2022 for BugId 120106
  const deletePickList = (index) => {
    let temp = [...pickList];

    /*  if (pickList.length == 1) {
      temp?.forEach((el, i) => {
        el.name = "";
      });
    } else {
      temp.splice(index, 1);
      // code added on 9 Nov 2022 for BugId 118803

      temp = temp?.map((el, idx) => {
        el.orderId = idx + 1;
        return el;
      });
    } */
    temp.splice(index, 1);
    // code added on 9 Nov 2022 for BugId 118803
    // code updatd  on  03 Jan 2023 for BugId 121486

    temp = temp?.map((el, idx) => {
      el.orderId = idx + 1;
      el.picklistId = idx + 1;
      return el;
    });

    setPickList(temp);
    // added on 08/01/24 for BugId 141670
    props.setDisableAddBtn(null);
    // till here BugId 141670
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    let pickListArray = [...pickList];
    const [reOrderedPickListItem] = pickListArray.splice(source.index, 1);
    pickListArray.splice(destination.index, 0, reOrderedPickListItem);
    // code added on 9 Nov 2022 for BugId 118803
    pickListArray = pickListArray?.map((el, idx) => {
      el.orderId = idx + 1;
      return el;
    });
    setPickList(pickListArray);
    // added on 08/01/24 for BugId 141670
    props.setDisableAddBtn(null);
    // till here BugId 141670
  };

  useEffect(() => {
    props.addPickList(pickList);
  }, [pickList]);

  // code added on 9 Nov 2022 for BugId 118803
  useEffect(() => {
    if (props.toDoPicklistToModify && props.toDoPicklistToModify.length > 0) {
      let temp = [...props.toDoPicklistToModify];
      let newList = temp?.map((el) => {
        //Modified  on 17/08/2023, bug_id:134353
        /* return {
          picklistId: el.PickListId,
          name: el.PickItemName,
          orderId: el.OrderId,
        }; */
        return {
          picklistId: el?.PickListId ? el?.PickListId : el?.picklistId,
          name: el?.PickItemName ? el?.PickItemName : el?.name,
          orderId: el?.OrderId ? el.OrderId : el.orderId,
        };
      });
      setPickList(newList);
    }
  }, [props.toDoPicklistToModify]);

  const addPickList = () => {
    props.setDisableAddBtn(null); //Changes made to solve Bug 141670
    let tempList = [...pickList];
    const listObj = {
      name: "",
      orderId: 1,
      picklistId: 1,
    };

    if (tempList.length == 0) {
      tempList.push(listObj);
    } else {
      tempList.push({
        name: "",
        orderId: pickList.length + 1,
        picklistId: pickList.length + 1,
      });
    }
    setPickList(tempList);
    props.addPickList(tempList);
  };

  return (
    <div>
      {
        /*code added on 23 Nov 2022 for BugId 119560 */
        // code edited on 09 Dec 2022 for BugId 120106
      }
      {/*   {pickList.length == 0 ? (
        <Button onClick={addPickList} className={styles.okButton}>
          Add Picklist
        </Button>
      ) : null} */}
      <Button
        onClick={addPickList}
        className={styles.okButton}
        id="pmweb_toDo_AddPick_AddBtn"
      >
        {`${t("add")} ${t("picklist")}`}
      </Button>
      <div className={styles.scrollBar}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="pickListInputs">
            {(provided) => (
              <div
                className="inputs"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {pickList.map((list, index) => {
                  return (
                    <Draggable
                      draggableId={`${index}`}
                      key={`${index}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className="pickListInputDiv"
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <div {...provided.dragHandleProps}>
                            <DragIndicatorOutlinedIcon
                              style={{ width: "1.5rem", height: "1.5rem" }}
                            />
                          </div>
                          <input
                            id={`pmweb_toDo_AddPick_triggerInput_todo_${list.picklistId}`}
                            //WCAG-Missing Form Label
                            aria-label="Pick List Input"
                            key={list}
                            //code added on 06-10-23 for bugId 138919

                            onFocus={() =>
                              (pickListRef.current = document.getElementById(
                                `pmweb_toDo_AddPick_triggerInput_todo_${list.picklistId}`
                              ))
                            }
                            //till here
                            className="triggerInput_todo"
                            value={list.name}
                            onChange={(e) => handleInputOnchange(e, list)}
                            onKeyDown={(e) => {
                              if (e.code === "Enter") {
                                let pickListExists = false;
                                let temp = global.structuredClone(pickList);
                                temp.forEach((el) => {
                                  if (
                                    el.name == e.target.value &&
                                    el.picklistId !== list.picklistId &&
                                    e.target.value !== "" //Changes made to solve Bug 127658
                                  ) {
                                    pickListExists = true;
                                    dispatch(
                                      setToastDataFunc({
                                        message: t("pickListPresent"),
                                        severity: "error",
                                        open: true,
                                      })
                                    );
                                    temp.forEach((el) => {
                                      if (el.picklistId === list.picklistId) {
                                        el.name = "";
                                      }
                                    });
                                  }
                                });
                                setPickList(temp);
                                if (!pickListExists) {
                                  let maxPicklistId = 1;
                                  setPickList((prev) => {
                                    // code edited on 9 Nov 2022 for BugId 118803
                                    prev.forEach((picklist) => {
                                      if (
                                        +picklist.picklistId > +maxPicklistId
                                      ) {
                                        maxPicklistId = picklist.picklistId;
                                      }
                                    });
                                    return [
                                      ...prev,
                                      {
                                        picklistId: +maxPicklistId + 1,
                                        name: "",
                                        orderId: pickList.length + 1,
                                      },
                                    ];
                                  });
                                  const timeout = setTimeout(() => {
                                    //code edited on 19 Sep 2022 for BugId 115547
                                    let picklistInput = document.getElementById(
                                      `triggerInput_todo_${+maxPicklistId + 1}`
                                    );
                                    if (picklistInput) {
                                      picklistInput.focus();
                                    }
                                  }, 200);
                                  return () => clearTimeout(timeout);
                                }
                              } else {
                                FieldValidations(
                                  e,
                                  10,
                                  pickListRef.current,
                                  50
                                );
                              }
                            }}
                            ref={pickListRef}
                            /*  onKeyPress={(e) =>
                              FieldValidations(e, 10, pickListRef.current, 255)
                            }*/
                          />
                          <IconButton
                            onClick={() => deletePickList(index)}
                            id="pmweb_toDo_AddPick_DeleteForeverICon"
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === "Enter" && deletePickList(index)
                            }
                            className={styles.iconButton}
                            aria-label={`${list.name} Delete`}
                            disableTouchRipple
                            disableFocusRipple
                          >
                            {pickList?.length > 1 && (
                              <DeleteForeverOutlinedIcon
                                style={{
                                  color: "rgb(181,42,42)",
                                  cursor: "pointer",
                                  width: "1.5rem",
                                  height: "1.5rem",
                                  //marginRight: "0.5rem",
                                }}
                              />
                            )}
                          </IconButton>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default AddPickList;
