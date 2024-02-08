export const LatestVersionOfProcess = (versionList) => {
  let temp = [];
  versionList?.map((el) => {
    temp.push(+el.VersionNo);
  });
  return Math.max(...temp);
};
