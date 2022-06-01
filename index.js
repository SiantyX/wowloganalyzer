import { getConsumes } from "./parselogs.js"
import fs from "fs"
const consumeList = JSON.parse(fs.readFileSync("./big_pyll_consumables_list_in_ids.json"));

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

const logId = "gWkrGhyX7FJmvnVC";
const dataType = "cast"
Object.keys(consumeList[dataType]).map(category => {
  const ql = [];
  
  consumeList[dataType][category].map(id => {
    ql.push({ alias: `id${id.toString()}`, dataType: dataType, abilityID: id, startTime: 0 });
  });
  
  getConsumes(ql, logId).then(r => {
    fs.writeFileSync(`./test/${category}.json`, JSON.stringify(r, null, 2) , "utf-8");
  });
});

