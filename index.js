import { getConsumes } from "./parselogs.js"

/*
  const query = {
    query: `{
      reportData {
        report(code: "${logId}") {
          manapots: events(dataType: Casts, abilityID: 28499, startTime: 0, endTime: 99999999, useActorIDs: false) {
            data
            nextPageTimestamp
          }
          darkrunes: events(dataType: Casts, abilityID: 27869, startTime: 0, endTime: 99999999, useActorIDs: false) {
            data
            nextPageTimestamp
          }
        }
      }
    }`
  }
*/

import fs from "fs"
const ql = [
  { alias: "manapots", dataType: "cast", abilityID: 28499, startTime: 0 },
  { alias: "darkrunes", dataType: "cast", abilityID: 27869, startTime: 0 }
];
const logId = "pmxJZcQ1f37w94jd";
//getConsumes(ql, logId).then(r => console.log(r));

getConsumes(ql, logId).then(r => {
  fs.writeFileSync("./test.json", JSON.stringify(r, null, 2) , "utf-8");
});