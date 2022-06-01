import { callWLAPI } from "./warcraftlogs.js";

const MAX_CALLS = 1; //20;

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

function compileQuery(queryList, logId) {
  let allEvents = ""
  queryList.map(o => {
    let translatedDataType = {"cast": "Casts"}[o.dataType]
    allEvents += `
          ${o.alias}: events(dataType: ${translatedDataType}, abilityID: ${o.abilityID}, startTime: ${o.startTime}, endTime: 99999999, useActorIDs: false) {
            data
            nextPageTimestamp
          }
`
  });

  const query = {
    query: `{
      reportData {
        report(code: "${logId}") {
          ${allEvents}
        }
      }
    }`
  }

  return query;
}

/*
let a = {
  "Felito": { 
    consumes: {
      123: {fights: {1: 5, 2: 4}, total: 10},
      456: {fights: {1: 5, 2: 4}, total: 10}
    } 
  },
  "Rymdlennart": { 
    consumes: {
      123: {fights: {1: 5, 2: 4}, total: 10},
      456: {fights: {1: 5, 2: 4}, total: 10}
    } 
  }
}
*/

// TODO a bug somewhere makes it accumulate
async function getConsumes(fullQueryList, logId) {
  const consumes = {};

  let queryList = fullQueryList;
  let i = 0;
  while (i < MAX_CALLS && queryList.length > 0) {
    i++;

    const query = compileQuery(queryList, logId);
    const res = await callWLAPI(query);
    if (res.status != 200) {
      throw new Error(`${res.status} - ${res.statusText}`);
    }

    queryList = []; // for next call
    const data = await res.json();
    const events = data.data.reportData.report
    Object.keys(events).map(key => {
      if (events[key]["nextPageTimestamp"] == null) {
        queryList.push({ dataType: events[key]["data"][0]["type"], startTime: events[key]["nextPageTimestamp"], abilityID: events[key]["data"][0]["abilityGameID"] });
      }

      events[key]["data"].map(ev => {
        if (!Object.keys(consumes).includes(ev.source.name)) {
          consumes[ev.source.name] = {consumes: {}}
        }

        if (!Object.keys(consumes[ev.source.name].consumes).includes(ev.abilityGameID)) {
          consumes[ev.source.name].consumes[ev.abilityGameID] = {fights: {}, total: 0};
        }

        consumes[ev.source.name].consumes[ev.abilityGameID].total++;
        if (!Object.keys(consumes[ev.source.name].consumes[ev.abilityGameID].fights).includes(ev.fight)) {
          consumes[ev.source.name].consumes[ev.abilityGameID].fights[ev.fight] = 1;
        } else {
          consumes[ev.source.name].consumes[ev.abilityGameID].fights[ev.fight]++;
        }
      });
    });
  }

  return consumes;
}




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


