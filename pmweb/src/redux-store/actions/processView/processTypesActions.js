export const setProcessTypeList = (listData) => {
    return {
        type : 'SET_PROCESS_TYPE_LIST',
        list : listData,
    }
}

export const setPinnedDataList = (listData) => {
    return {
        type: 'SET_PINNED_DATA_LIST',
        list : listData,
    }
}